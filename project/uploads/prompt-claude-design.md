# Prompt para colar no Claude Design (claude.ai/design)

Copie e cole o texto abaixo no Claude Design. Antes de enviar, anexe também o
arquivo `design-tokens.md` (está na mesma pasta deste arquivo) para que a
geração já nasça usando as cores e tipografia corretas.

---

Crie o dashboard de um sistema médico chamado "Sistema multiagentes de
modelos multimodais para a detecção automatizada da tuberculose pulmonar".
Use o design system anexado (cores, tipografia, componentes) como base
obrigatória — tema escuro clínico, acento verde-água.

Estrutura da tela, de cima para baixo:

1. Cabeçalho: título do sistema à esquerda (duas linhas: nome do sistema e
   subtítulo "Detecção automatizada de tuberculose pulmonar"), dois seletores
   dropdown à direita ("Modelos" e "Datasets").

2. Seção "Imagens do paciente": uma imagem em destaque à esquerda (maior que
   as outras, ~150x150px, com borda na cor de destaque e uma etiqueta "em
   análise" no canto superior esquerdo), seguida horizontalmente por cards
   menores das imagens já analisadas (cada uma com uma etiqueta no canto
   inferior direito mostrando o diagnóstico: "75% TB" em vermelho suave ou
   "75% normal" em verde suave), e por fim um card de upload com borda
   tracejada, ícone de upload e o texto "JPG · PNG · DICOM".

3. Seção "Agentes de diagnóstico": 5 cards em grade horizontal, cada um
   representando um modelo de IA como se fosse um agente com personalidade
   própria — ícone dentro de um círculo (estilo avatar), nome do modelo,
   uma frase curta descrevendo o que o agente faz, e um botão "Selecionar"
   na base. Os modelos são: ConvNext, ResNet50, EfficientNet, U-Net, Yolo26.

4. Logo abaixo, 2 cards mais largos lado a lado: "Consenso geral" (os
   agentes votam juntos) e "Comparação" (mostra o resultado de cada agente
   lado a lado) — mesmo estilo visual dos cards de agente, mas em formato
   horizontal.

5. Barra de chat fixa na parte inferior: campo de texto único, com um
   "chip" mostrando o nome do agente selecionado à esquerda do texto, e um
   botão circular de enviar (seta para cima) à direita.

O clique em qualquer card de agente deve destacar visualmente o card
selecionado (mudança de cor do ícone/botão para o acento) e preencher o
chip na barra de chat com o nome daquele agente.

Mantenha a estética clínica, minimalista, com bastante respiro entre as
seções e uso comedido do acento verde-água apenas para estados ativos e
ações principais.
