# Design System — Sistema Multiagentes (Tuberculose Pulmonar)

## Paleta de cores (tema escuro clínico)

| Token | Hex | Uso |
|---|---|---|
| `bg` | `#10151A` | Fundo geral da tela |
| `surface` | `#171D22` | Fundo dos cards |
| `border` | `#262E34` | Borda padrão dos cards |
| `border-soft` | `#2C363D` | Borda de botões/chips secundários |
| `accent` | `#2FD9B8` | Cor de destaque (verde-água) — usada em seleção, botão principal, badge "em análise" |
| `accent-ink` | `#0D1F1A` | Texto sobre fundo de destaque |
| `accent-bg` | `#0D2A25` | Fundo suave do destaque (chips, círculo de ícone selecionado) |
| `text-primary` | `#EDF1F3` | Texto principal (títulos, nomes) |
| `text-secondary` | `#93A3AB` | Texto secundário (ícones inativos, labels de botão) |
| `text-muted` | `#5F6E76` | Texto terciário (legendas, descrições, uppercase labels) |
| `danger` | `#F0918A` | Texto do badge "Tuberculose" |
| `danger-bg` | `#2A1414` | Fundo do badge "Tuberculose" |
| `success` | `#7FDCAE` | Texto do badge "Normal" |
| `success-bg` | `#132A1F` | Fundo do badge "Normal" |

## Tipografia

- **Títulos**: Space Grotesk, 500, ~19px, letter-spacing levemente negativo
- **Texto geral / UI**: IBM Plex Sans, regular/medium
- **Dados técnicos** (percentuais, nome de modelo no chip): IBM Plex Mono

## Componentes principais

### Painel de imagens
- Imagem "em análise": card maior (150×150px), borda de 1.5px na cor accent, badge "em análise" no canto superior esquerdo (pill, fundo accent-bg, texto accent)
- Imagens já analisadas: cards menores (92×150px), sem borda destacada, badge de diagnóstico no canto inferior direito (pill: fundo danger-bg/texto danger para Tuberculose, fundo success-bg/texto success para Normal)
- Botão de upload: mesmo tamanho dos cards de imagem analisada, borda tracejada (border-soft), ícone de upload + texto "JPG · PNG · DICOM" centralizados

### Cards de agente (modelo de IA)
- 5 cards em grid, ícone dentro de círculo (avatar), nome do agente, descrição curta em 1ª pessoa do agente (ex: "Agente que lê padrões visuais globais do pulmão"), botão "Selecionar" na base
- Estado selecionado: círculo do ícone e botão mudam para accent/accent-bg
- 2 cards largos abaixo (Consenso geral, Comparação): mesmo estilo, layout horizontal (ícone + texto + botão numa linha)

### Barra de chat
- Campo único na base da tela, com chip do agente selecionado (fundo accent-bg, texto accent, fonte mono) à esquerda do input de texto
- Botão de enviar: círculo accent com seta para cima

## Ícones (Tabler Icons)
- ConvNext → `robot-face`
- ResNet50 → `brain`
- EfficientNet → `bolt`
- U-Net → `focus-2`
- Yolo26 → `scan`
- Consenso geral → `users-group`
- Comparação → `arrows-diff`
- Upload → `upload`

## Border-radius
- Cards principais: 10-14px
- Badges/pills: totalmente arredondado (`border-radius: 9999px`)
- Botões pequenos: 6-8px
