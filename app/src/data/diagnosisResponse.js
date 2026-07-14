import { AGENTS } from './agents';

// Everything in this file simulates what the n8n workflow will eventually
// return. `buildDiagnosisResponse` is the single function to swap for a real
// webhook call once the endpoint exists — same input, same shape of output.
function shortName(agent) {
  return agent.name.replace(/^Agente \d+ - /i, '');
}

function randomSplit() {
  const tbPct = Math.floor(1 + Math.random() * 98);
  return { tbPct, normalPct: 100 - tbPct };
}

function conclusion(tbPct, normalPct) {
  const diagLabel = tbPct > normalPct ? 'Tuberculose' : 'Normal';
  const diag = tbPct > normalPct ? 'tb' : 'normal';
  const confidence = Math.max(tbPct, normalPct);
  return { diagLabel, diag, confidence };
}

function buildSingleAgentText(agent) {
  const { tbPct, normalPct } = randomSplit();
  const { diagLabel, diag, confidence } = conclusion(tbPct, normalPct);
  const name = shortName(agent);
  const text =
    `Olá, sou seu Especialista ${name}. Treinado para ter o melhor desempenho possível, atingi acurácia de ${agent.accuracy}%.\n\n` +
    `Analisei sua imagem e o Diagnóstico é: Tuberculose: ${tbPct}% Normal: ${normalPct}%\n\n` +
    `Conclusão Final: ${diagLabel} com confiança de ${confidence.toFixed(2)}%. Inferência realizada pelo modelo: ${name}`;
  return { text, diag, pct: confidence };
}

function buildConsensusText() {
  const { tbPct, normalPct } = randomSplit();
  const { diagLabel, diag, confidence } = conclusion(tbPct, normalPct);
  const names = AGENTS.map(shortName).join(', ');
  const text =
    `Olá, sou o Consenso Geral. Reuni os votos de ${names} sobre sua imagem.\n\n` +
    `Resultado agregado: Tuberculose: ${tbPct}% Normal: ${normalPct}%\n\n` +
    `Conclusão Final: ${diagLabel} com confiança de ${confidence.toFixed(2)}%. Inferência realizada por: Consenso Geral (5 modelos)`;
  return { text, diag, pct: confidence };
}

function buildComparisonText() {
  const perModel = AGENTS.map((agent) => {
    const { tbPct, normalPct } = randomSplit();
    return { agent, tbPct, normalPct };
  });
  const lines = perModel.map(
    ({ agent, tbPct, normalPct }) => `${shortName(agent)}: Tuberculose ${tbPct}% / Normal ${normalPct}%`,
  );
  const tbVotes = perModel.filter((m) => m.tbPct > m.normalPct).length;
  const diagLabel = tbVotes > perModel.length / 2 ? 'Tuberculose' : 'Normal';
  const diag = tbVotes > perModel.length / 2 ? 'tb' : 'normal';
  const avgConfidence = perModel.reduce((sum, m) => sum + Math.max(m.tbPct, m.normalPct), 0) / perModel.length;
  const text =
    `Comparação lado a lado dos modelos para sua imagem:\n\n${lines.join('\n')}\n\n` +
    `A maioria dos modelos aponta para ${diagLabel}. Use o Consenso Geral para uma decisão agregada única.`;
  return { text, diag, pct: avgConfidence };
}

// agentId may be null (no agent mentioned/selected) -> defaults to consensus.
export function buildDiagnosisResponse(agentId) {
  if (agentId === 'consenso') return buildConsensusText();
  if (agentId === 'comparacao') return buildComparisonText();
  const agent = AGENTS.find((a) => a.id === agentId);
  if (agent) return buildSingleAgentText(agent);
  return buildConsensusText();
}
