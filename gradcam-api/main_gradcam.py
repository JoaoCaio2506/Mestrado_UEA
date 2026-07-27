"""
API FastAPI para geração de Grad-CAM a partir de raio-x de tórax,
usando um modelo de classificação YOLO (Ultralytics) treinado para
detecção de Tuberculose.

Configuração fixa do Grad-CAM (escolhida após comparação visual):
    threshold=0.5, blur_sigma=4, intensidade=0.8, usar_mascara_pulmonar=True
"""

import io
import numpy as np
import cv2
import torch
from PIL import Image
from scipy.ndimage import gaussian_filter
import matplotlib

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from ultralytics import YOLO

# ============================================================
# CONFIGURAÇÃO FIXA DO GRAD-CAM
# ============================================================
GRADCAM_CONFIG = {
    "threshold": 0.5,
    "blur_sigma": 4,
    "intensidade": 0.8,
    "usar_mascara_pulmonar": True,
}

MODEL_PATH = "/app/models/best.pt"

# ============================================================
# INICIALIZAÇÃO DO MODELO (carregado uma única vez no startup)
# ============================================================
app = FastAPI(
    title="TB Grad-CAM API",
    description="Recebe uma imagem de raio-x e retorna a visualização Grad-CAM "
                 "indicando a região de maior atenção do modelo para Tuberculose.",
    version="1.0.0",
)

# Estado global do modelo — populado no evento de startup
state = {}


def encontrar_ultima_conv(torch_model):
    last_name, last_module = None, None
    for name, module in torch_model.named_modules():
        if isinstance(module, torch.nn.Conv2d):
            last_name, last_module = name, module
    if last_module is None:
        raise ValueError("Nenhuma camada Conv2d encontrada no modelo.")
    return last_name, last_module


def mascara_pulmonar(size=224, feather=15, offset_x_frac=0.24,
                      largura_frac=0.28, altura_frac=0.42, cy_frac=0.52):
    mask = np.zeros((size, size), dtype=np.float32)
    cx, cy = size / 2, size * cy_frac
    largura = size * largura_frac
    altura = size * altura_frac
    offset_x = size * offset_x_frac
    for sinal in [-1, 1]:
        centro_x = cx + sinal * offset_x
        y, x = np.ogrid[:size, :size]
        elipse = ((x - centro_x) / largura) ** 2 + ((y - cy) / altura) ** 2
        mask = np.maximum(mask, (elipse <= 1).astype(np.float32))
    mask = gaussian_filter(mask, sigma=feather)
    return mask / (mask.max() + 1e-8)


@app.on_event("startup")
def carregar_modelo():
    yolo = YOLO(MODEL_PATH)
    torch_model = yolo.model.eval()
    device = next(torch_model.parameters()).device
    class_names = yolo.names

    img_size = yolo.overrides.get("imgsz", 224)
    if isinstance(img_size, (list, tuple)):
        img_size = img_size[0]

    idx_tb = next(
        (i for i, n in class_names.items() if "Tuberc" in n or "TB" in n.upper()),
        None,
    )
    if idx_tb is None:
        raise RuntimeError(
            "Não foi possível localizar a classe de Tuberculose nos nomes do modelo: "
            f"{class_names}"
        )

    _, last_conv_module = encontrar_ultima_conv(torch_model)

    activations, gradients = {}, {}
    last_conv_module.register_forward_hook(
        lambda m, i, o: activations.update(value=o)
    )
    last_conv_module.register_full_backward_hook(
        lambda m, gi, go: gradients.update(value=go[0])
    )

    state["yolo"] = yolo
    state["torch_model"] = torch_model
    state["device"] = device
    state["img_size"] = img_size
    state["idx_tb"] = idx_tb
    state["activations"] = activations
    state["gradients"] = gradients
    state["lung_mask"] = mascara_pulmonar(size=img_size)

    print(f"✅ Modelo carregado. imgsz={img_size}, idx_tb={idx_tb}")


# ============================================================
# LÓGICA DO GRAD-CAM
# ============================================================
def gerar_gradcam(img_original: Image.Image) -> Image.Image:
    torch_model = state["torch_model"]
    device = state["device"]
    img_size = state["img_size"]
    idx_tb = state["idx_tb"]
    activations = state["activations"]
    gradients = state["gradients"]
    lung_mask = state["lung_mask"]

    # --- Pré-processamento ---
    img_resized = img_original.resize((img_size, img_size))
    img_array = np.array(img_resized).astype(np.float32) / 255.0
    tensor = torch.from_numpy(img_array).permute(2, 0, 1).unsqueeze(0).to(device)
    tensor.requires_grad_(True)

    # --- Forward + backward ---
    torch_model.zero_grad()
    output = torch_model(tensor)
    if isinstance(output, (list, tuple)):
        output = output[0]
    output[0, idx_tb].backward()

    # --- Constrói o heatmap bruto ---
    acts = activations["value"][0]
    grads = gradients["value"][0]
    pooled_grads = grads.mean(dim=(1, 2))

    weighted = acts.clone()
    for i in range(weighted.shape[0]):
        weighted[i, :, :] *= pooled_grads[i]

    heatmap = weighted.mean(dim=0).detach().cpu().numpy()
    heatmap = np.maximum(heatmap, 0)
    heatmap = heatmap / (heatmap.max() + 1e-8)

    # Remove artefato de borda (padding infla ativação nos cantos)
    heatmap[:1, :] = 0
    heatmap[-1:, :] = 0
    heatmap[:, :1] = 0
    heatmap[:, -1:] = 0
    if heatmap.max() > 0:
        heatmap = heatmap / heatmap.max()

    # --- Overlay com a configuração fixa ---
    hm = cv2.resize(heatmap, (img_size, img_size), interpolation=cv2.INTER_CUBIC)
    hm = np.clip(hm, 0, 1)
    hm = gaussian_filter(hm, sigma=GRADCAM_CONFIG["blur_sigma"])

    if GRADCAM_CONFIG["usar_mascara_pulmonar"]:
        hm = hm * lung_mask

    hm = hm / (hm.max() + 1e-8)

    threshold = GRADCAM_CONFIG["threshold"]
    hm = np.where(hm < threshold, 0, hm)
    if hm.max() > 0:
        hm = (hm - threshold) / (1 - threshold)
        hm = np.clip(hm, 0, 1)

    jet = matplotlib.colormaps["jet"]
    jet_colors = jet(hm)[:, :, :3]
    alpha_map = (hm * GRADCAM_CONFIG["intensidade"])[..., np.newaxis]

    img_base = np.array(img_resized).astype(np.float32) / 255.0
    overlay = jet_colors * alpha_map + img_base * (1 - alpha_map)
    overlay = np.clip(overlay, 0, 1)

    overlay_uint8 = (overlay * 255).astype(np.uint8)
    return Image.fromarray(overlay_uint8)


# ============================================================
# ENDPOINTS
# ============================================================
@app.get("/health")
def health_check():
    return {"status": "ok", "modelo_carregado": "torch_model" in state}


@app.post(
    "/gradcam",
    summary="Gera a imagem Grad-CAM a partir de um raio-x de tórax",
    response_description="Imagem PNG com o overlay do Grad-CAM",
)
async def gradcam_endpoint(file: UploadFile = File(...)):
    if "torch_model" not in state:
        raise HTTPException(status_code=503, detail="Modelo ainda não carregado.")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de arquivo inválido: {file.content_type}. Envie uma imagem.",
        )

    try:
        conteudo = await file.read()
        img_original = Image.open(io.BytesIO(conteudo)).convert("RGB")
    except Exception:
        raise HTTPException(
            status_code=400, detail="Não foi possível abrir o arquivo como imagem."
        )

    overlay_img = gerar_gradcam(img_original)

    buffer = io.BytesIO()
    overlay_img.save(buffer, format="PNG")
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="image/png")
