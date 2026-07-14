export const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

function fileToBase64DataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// The n8n specialist agents are prompted to always emit this exact shape:
//   Tuberculose: NN%
//   Normal: NN%
//   Conclusão Final: **Classe** com confiança de **NN%**.
// This pulls diag/pct out of that free-text response for the thumbnail badge.
function parseDiagnosisFromText(text) {
  const tbMatch = text.match(/Tuberculose:\s*([\d]+(?:[.,]\d+)?)%/i);
  const normalMatch = text.match(/Normal:\s*([\d]+(?:[.,]\d+)?)%/i);
  const conclusionMatch = text.match(/Conclusão Final:\s*\*{0,2}([^*\n(]+?)\*{0,2}\s*(?:com|\(|$)/i);

  const tbPct = tbMatch ? parseFloat(tbMatch[1].replace(',', '.')) : null;
  const normalPct = normalMatch ? parseFloat(normalMatch[1].replace(',', '.')) : null;

  let diag = null;
  if (conclusionMatch) {
    diag = /tuberculose/i.test(conclusionMatch[1]) ? 'tb' : 'normal';
  } else if (tbPct !== null && normalPct !== null) {
    diag = tbPct > normalPct ? 'tb' : 'normal';
  }

  const pct = diag === 'tb' ? tbPct : normalPct;

  return {
    diag: diag ?? 'normal',
    pct: pct != null ? Math.round(pct) : 0,
  };
}

// Calls the n8n Chat Trigger webhook and returns { text, diag, pct } — the
// same shape data/diagnosisResponse.js's buildDiagnosisResponse returns, so
// App.jsx can use either one interchangeably.
export async function callN8n({ text, imageFile, sessionId, signal }) {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('VITE_N8N_WEBHOOK_URL não configurada.');
  }

  const imageBase64 = imageFile ? await fileToBase64DataUrl(imageFile) : null;

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatInput: text,
      sessionId,
      imageBase64,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`n8n respondeu ${response.status}: ${await response.text().catch(() => '')}`);
  }

  const data = await response.json();
  const responseText =
    typeof data === 'string'
      ? data
      : data.output ?? data.text ?? data.chatOutput ?? JSON.stringify(data);

  return { text: responseText, ...parseDiagnosisFromText(responseText) };
}
