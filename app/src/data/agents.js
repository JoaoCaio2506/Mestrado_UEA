export const AGENTS = [
  {
    id: 'convnext',
    icon: 'cpu',
    name: 'ConvNeXt',
    desc: '97,86% de acurácia e AUC-ROC de 0,9980, com alta estabilidade no aprendizado de recursos.',
    accuracy: 97.86,
  },
  {
    id: 'densenet121',
    icon: 'network',
    name: 'DenseNet121',
    desc: '99,05% de acurácia, utilizando conexões densas consolidadas em radiologia médica para reaproveitar recursos e garantir alta estabilidade clínica.',
    accuracy: 99.05,
  },
  {
    id: 'efficientnet',
    icon: 'atom-2',
    name: 'EfficientNetV2',
    desc: '99,64% de acurácia, oferecendo o melhor equilíbrio entre precisão técnica e eficiência de hardware.',
    accuracy: 99.64,
  },
  {
    id: 'unet',
    icon: 'brain',
    name: 'UNet',
    desc: '99,5% de acurácia, com sensibilidade e precisão máximas no conjunto de testes.',
    accuracy: 99.5,
  },
  {
    id: 'yolo26',
    icon: 'scan-eye',
    name: 'YOLO26',
    desc: '99,88% de acurácia e inferência recorde de 0.3ms, focado em alta velocidade e baixo custo.',
    accuracy: 99.88,
  },
];

export const WIDE_AGENTS = [
  {
    id: 'consenso',
    icon: 'users-group',
    name: 'Consenso Geral',
    desc: 'Resume a performance conjunta dos modelos, mostrando como as diferentes arquiteturas se somam em precisão e eficiência.',
  },
  {
    id: 'comparacao',
    icon: 'arrows-diff',
    name: 'Comparação de Modelos',
    desc: 'Permite selecionar e comparar modelos lado a lado para avaliar acurácia, velocidade e uso de hardware de forma personalizada.',
  },
];

export const ALL_AGENTS = [...AGENTS, ...WIDE_AGENTS];

// Top row: 4 cards, bottom row: 3 (slightly wider) cards.
export const TOP_AGENT_IDS = ALL_AGENTS.slice(0, 4).map((a) => a.id);
export const BOTTOM_AGENT_IDS = ALL_AGENTS.slice(4, 7).map((a) => a.id);
