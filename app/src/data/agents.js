export const AGENTS = [
  {
    id: 'convnext',
    icon: 'cpu',
    name: 'ConvNext',
    desc: 'Esta CNN modernizada incorpora lições de Vision Transformers, utilizando kernels de 7x7 e ativação GELU através de fine-tuning. O modelo atingiu 97,86% de acurácia e um excelente índice AUC-ROC de 0,9980, destacando-se pela precisão de 99% na identificação da classe de Tuberculose.',
    accuracy: 97.86,
  },
  {
    id: 'resnet50',
    icon: 'network',
    name: 'ResNet50',
    desc: 'Arquitetura clássica e consolidada que utiliza conexões de salto (skip connections) para otimizar o fluxo de aprendizado em redes profundas. Com foco na estabilidade do gradiente, este modelo apresentou 74,76% de acurácia, consolidando-se como um pilar fundamental e estável no aprendizado de arquiteturas residuais.',
    accuracy: 74.76,
  },
  {
    id: 'efficientnet',
    icon: 'atom-2',
    name: 'EfficientNet',
    desc: 'Arquitetura focada em eficiência com escalonamento composto, este modelo foi treinado para otimizar o balanço entre velocidade e precisão de imagem. Com uma execução robusta, obteve 99,64% de acurácia de validação, registrando apenas 3 erros em todo o conjunto de 840 casos testados.',
    accuracy: 99.64,
  },
  {
    id: 'unet',
    icon: 'brain',
    name: 'UNet',
    desc: 'Esta arquitetura customizada de segmentação médica, adaptada para classificação profunda, foi validada em um dataset balanceado de 4.200 imagens. O modelo demonstrou performance de excelência com 99,6% de acurácia, atingindo sensibilidade e precisão máximas sem erros no conjunto de validação.',
    accuracy: 99.6,
  },
  {
    id: 'yolo26',
    icon: 'scan-eye',
    name: 'Yolo26',
    desc: 'Focado em inferência em tempo real, este modelo ultra-leve possui 1,5 milhão de parâmetros e utiliza blocos de atenção espacial. Treinado com otimizador AdamW e precisão mista, alcançou 99,88% de acurácia, treino de 3,3 minutos e latência de apenas 0,3ms.',
    accuracy: 99.88,
  },
];

export const WIDE_AGENTS = [
  {
    id: 'consenso',
    icon: 'users-group',
    name: 'Consenso Geral',
    desc: 'Esta função apresenta uma visão unificada sobre o desempenho dos agentes do nosso sitema. Ela resume como os modelos se comportam em conjunto, destacando a evolução técnica das arquiteturas e como elas combinam alta precisão diagnóstica com eficiência computacional para apoiar a decisão médica.',
  },
  {
    id: 'comparacao',
    icon: 'arrows-diff',
    name: 'Comparação',
    desc: 'Esta função permite que você analise modelos lado a lado de forma personalizada. Basta selecionar e digitar quais arquiteturas deseja comparar para visualizar um confronto direto focado em acurácia, velocidade de inferência e eficiência de hardware, ajudando a escolher a melhor solução para o seu cenário.',
  },
];

export const ALL_AGENTS = [...AGENTS, ...WIDE_AGENTS];

// Top row: 4 cards, bottom row: 3 (slightly wider) cards.
export const TOP_AGENT_IDS = ALL_AGENTS.slice(0, 4).map((a) => a.id);
export const BOTTOM_AGENT_IDS = ALL_AGENTS.slice(4, 7).map((a) => a.id);
