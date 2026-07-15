import NeuralActivation from './NeuralActivation';
import './FeaturedImage.css';

function resultLabel(result) {
  const base = result.diag === 'tb' ? `${result.pct}% TB` : `${result.pct}% normal`;
  return result.agentName ? `${base} - ${result.agentName}` : base;
}

export default function FeaturedImage({ image, isAnalyzing }) {
  const result = image?.result;
  const statusClass = !image ? 'empty' : result ? (result.diag === 'tb' ? 'diag-tb' : 'diag-normal') : 'analyzing';

  return (
    <div className={`featured-image ${statusClass}`}>
      {image ? (
        image.previewable ? (
          <img className="featured-image-img" src={image.url} alt="Radiografia em análise" />
        ) : (
          <div className="featured-image-placeholder">
            <div className="featured-image-hint mono">{image.name}</div>
            <div className="featured-image-hint mono muted">arquivo DICOM</div>
          </div>
        )
      ) : (
        <div className="featured-image-placeholder">
          <div className="featured-image-hint mono">raio-x · tórax</div>
          <div className="featured-image-hint mono muted">envie uma imagem para começar</div>
        </div>
      )}

      {image && !result && <div className="featured-image-badge mono badge-analyzing">Em análise</div>}
      {image && result && (
        <div className={`featured-image-badge mono ${result.diag === 'tb' ? 'badge-tb' : 'badge-normal'}`}>
          {resultLabel(result)}
        </div>
      )}

      {isAnalyzing && (
        <div className="analyzing-overlay">
          <NeuralActivation />
          <div className="analyzing-caption mono">Agentes de IA analisando a imagem…</div>
        </div>
      )}
    </div>
  );
}
