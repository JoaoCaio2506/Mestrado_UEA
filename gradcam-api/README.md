# TB Grad-CAM API — deploy no VPS

API FastAPI que recebe uma imagem de raio-x de tórax e retorna a
visualização Grad-CAM (heatmap sobreposto) indicando a região de maior
atenção do modelo YOLO para a classe Tuberculose.

Stack isolada, própria — não compartilha rede, Dockerfile nem
`docker-compose.yml` com o restante do projeto (`n8n`, `traefik`,
`app_main`, `app_yolo`). Sobe na porta `8002`, exposta direto no host
(mesmo padrão de `app_main`/`app_yolo`).

## Deploy

1. Copie o peso do modelo (`best.pt`) pra `models/best.pt` nesta pasta
   (ele **não** está no Git — veja `.gitignore`):
   ```bash
   scp best.pt root@72.60.149.39:/root/gradcam-api/models/best.pt
   ```

2. Suba o serviço:
   ```bash
   cd /root/gradcam-api
   docker compose up -d --build
   ```

3. Confira:
   ```bash
   curl http://localhost:8002/health
   ```

## Endpoints

- `GET /health` — status da API e se o modelo foi carregado.
- `POST /gradcam` — recebe `multipart/form-data` (campo `file`), retorna
  PNG do Grad-CAM.
- Docs interativas: `http://<ip-do-servidor>:8002/docs`
