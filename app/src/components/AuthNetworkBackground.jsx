import './NeuralActivation.css';

// A larger, full-viewport neural network used as the login screen's
// background — same pulsing animation as NeuralActivation (the loading
// state), but with more layers/nodes spread across the whole area instead
// of a small diagram stretched up via CSS transform.
const LAYERS = [
  { x: 60, nodes: [150, 450, 750] },
  { x: 280, nodes: [70, 260, 450, 640, 830] },
  { x: 500, nodes: [90, 310, 530, 750] },
  { x: 720, nodes: [80, 270, 460, 650, 840] },
  { x: 940, nodes: [100, 320, 540, 760] },
  { x: 1160, nodes: [60, 250, 440, 630, 820] },
  { x: 1380, nodes: [170, 470, 770] },
];

const LAYER_DELAYS = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2];
const EDGE_DELAYS = [0.1, 0.3, 0.5, 0.7, 0.9, 1.1];

function buildEdges() {
  const edges = [];
  for (let i = 0; i < LAYERS.length - 1; i++) {
    const from = LAYERS[i];
    const to = LAYERS[i + 1];
    from.nodes.forEach((y1) => {
      to.nodes.forEach((y2) => {
        edges.push({ x1: from.x, y1, x2: to.x, y2, delay: EDGE_DELAYS[i] });
      });
    });
  }
  return edges;
}

const EDGES = buildEdges();

export default function AuthNetworkBackground() {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%' }}
      fill="none"
    >
      {EDGES.map((edge, i) => (
        <line
          key={i}
          className="nn-edge"
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
          style={{ animationDelay: `${edge.delay}s` }}
        />
      ))}
      {LAYERS.map((layer, layerIdx) =>
        layer.nodes.map((y, i) => (
          <circle
            key={`${layerIdx}-${i}`}
            className="nn-node"
            cx={layer.x}
            cy={y}
            r={5}
            style={{ animationDelay: `${LAYER_DELAYS[layerIdx]}s` }}
          />
        )),
      )}
    </svg>
  );
}
