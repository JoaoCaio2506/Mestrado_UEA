import './NeuralActivation.css';

// A tiny fully-connected 3-2-4-2 style network diagram whose nodes/edges
// light up layer by layer, looping, to read as "the network is thinking".
const LAYERS = [
  { x: 30, nodes: [30, 75, 120] },
  { x: 110, nodes: [15, 55, 95, 135] },
  { x: 190, nodes: [50, 100] },
];

const LAYER_DELAYS = [0, 0.4, 0.8]; // seconds, stagger across the loop
const EDGE_DELAYS = [0.2, 0.6]; // between layer 0-1 and layer 1-2

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

export default function NeuralActivation() {
  return (
    <div className="neural-activation">
      <svg className="neural-svg" viewBox="0 0 220 150" fill="none">
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
              r={6}
              style={{ animationDelay: `${LAYER_DELAYS[layerIdx]}s` }}
            />
          )),
        )}
      </svg>
    </div>
  );
}
