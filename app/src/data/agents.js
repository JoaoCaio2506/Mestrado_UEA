export const AGENTS = [
  {
    id: 'convnext',
    icon: 'cpu',
    name: 'ConvNext',
    desc: 'CNN modernizada inspirada em Vision Transformers, usando kernels 7x7 e GELU. Atingiu 97,86% de acurácia (AUC-ROC de 0,9980) e 99% de precisão na identificação de Tuberculose.',
    accuracy: 97.86,
  },
  {
    id: 'resnet50',
    icon: 'network',
    name: 'ResNet50',
    desc: 'Arquitetura clássica com conexões de salto (skip connections) que garante estabilidade no gradiente em redes profundas. Atingiu 74,76% de acurácia, sendo a base para modelos residuais.',
    accuracy: 74.76,
  },
  {
    id: 'efficientnet',
    icon: 'atom-2',
    name: 'EfficientNet',
    desc: 'Focada em otimizar a relação entre velocidade e precisão via escalonamento composto. Alcançou 99,64% de acurácia de validação, cometendo apenas 3 erros em 840 casos.',
    accuracy: 99.64,
  },
  {
    id: 'unet',
    icon: 'brain',
    name: 'UNet',
    desc: 'Arquitetura médica adaptada para classificação profunda, treinada em dataset de 4.200 imagens. Teve desempenho de excelência com 99,6% de acurácia, sem erros no conjunto de validação.',
    accuracy: 99.6,
  },
  {
    id: 'yolo26',
    icon: 'scan-eye',
    name: 'Yolo26',
    desc: 'Modelo ultra-leve (1,5M de parâmetros) voltado para tempo real com atenção espacial. Treinado com AdamW, atingiu 99,88% de acurácia, treino em 3,3 min e latência de 0,3ms.',
    accuracy: 99.88,
  },
];

export const WIDE_AGENTS = [
  {
    id: 'consenso',
    icon: 'users-group',
    name: 'Consenso Geral',
    desc: 'Apresenta uma visão unificada do desempenho dos modelos, combinando precisão diagnóstica e eficiência computacional para apoiar a decisão médica.',
  },
  {
    id: 'comparacao',
    icon: 'arrows-diff',
    name: 'Comparação',
    desc: 'Permite comparar modelos lado a lado de forma personalizada, confrontando acurácia, velocidade de inferência e uso de hardware para ajudar na escolha da melhor opção.',
  },
];

export const ALL_AGENTS = [...AGENTS, ...WIDE_AGENTS];

// Top row: 4 cards, bottom row: 3 (slightly wider) cards.
export const TOP_AGENT_IDS = ALL_AGENTS.slice(0, 4).map((a) => a.id);
export const BOTTOM_AGENT_IDS = ALL_AGENTS.slice(4, 7).map((a) => a.id);
