import { ALL_AGENTS } from '../data/agents';

export const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

// n8n's consensus/comparison agents identify themselves with longer,
// technical phrasing ("Sistema Multiagente de Consenso (...)") — map those
// back to the short names used everywhere else in the UI.
const AGENT_NAME_ALIASES = [
  { pattern: /consenso/i, name: 'Consenso Geral' },
  { pattern: /compara/i, name: 'Comparação' },
];

function normalizeAgentName(name) {
  if (!name) return name;
  const alias = AGENT_NAME_ALIASES.find((a) => a.pattern.test(name));
  return alias ? alias.name : name;
}

// The n8n specialist agents are prompted to always emit this exact shape:
//   Tuberculose: NN%
//   Normal: NN%
//   Conclusão Final: **Classe** com confiança de **NN%**.
//   Inferência realizada pelo modelo: NomeDoModelo
// This pulls diag/pct/agentName out of that free-text response for the badges.
function parseDiagnosisFromText(text) {
  const tbMatch = text.match(/Tuberculose:\s*([\d]+(?:[.,]\d+)?)%/i);
  const normalMatch = text.match(/Normal:\s*([\d]+(?:[.,]\d+)?)%/i);
  const conclusionMatch = text.match(/Conclusão Final:\s*\*{0,2}([^*\n(]+?)\*{0,2}\s*(?:com|\(|$)/i);
  const modelMatch = text.match(/Inferência realizada (?:pelo modelo|por):\s*\*{0,2}([^*\n(]+?)\*{0,2}\s*(?:\(|$)/i);

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
    agentName: modelMatch ? normalizeAgentName(modelMatch[1].trim()) : undefined,
  };
}

// Calls the n8n webhook and returns { text, diag, pct } — the same shape
// data/diagnosisResponse.js's buildDiagnosisResponse returns, so App.jsx can
// use either one interchangeably.
//
// Sent as multipart/form-data (not JSON+base64) so the image arrives as a
// real binary part — the same way the n8n workflow's own "API ConvNext" etc.
// nodes already call the model APIs, and the "Imagem" binary property the
// whole workflow expects can be set directly on the n8n Webhook node without
// any decoding step.
export async function callN8n({ text, imageFile, sessionId, agentId, signal }) {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('VITE_N8N_WEBHOOK_URL não configurada.');
  }

  const formData = new FormData();
  formData.append('chatInput', text);
  formData.append('sessionId', sessionId);
  // Field name must be exactly "Imagem" — the n8n Webhook node's "Field Name
  // for Binary Data" option matches the incoming multipart field name, not
  // just the resulting binary property name.
  if (imageFile) formData.append('Imagem', imageFile, imageFile.name);

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    body: formData,
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

  const parsed = parseDiagnosisFromText(responseText);
  // The Comparação/Consenso replies don't always include the "Inferência
  // realizada..." line the parser looks for — fall back to the agent that
  // was actually selected so the badge/table never show a blank model name.
  if (!parsed.agentName && agentId) {
    const agent = ALL_AGENTS.find((a) => a.id === agentId);
    if (agent) parsed.agentName = agent.id === 'comparacao' ? 'Comparação' : agent.name;
  }

  return { text: responseText, ...parsed };
}
