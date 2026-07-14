import './FeaturedImage.css';

export default function FeaturedImage({ image, isAnalyzing }) {
  return (
    <div className={`featured-image ${image ? 'has-image' : 'empty'}`}>
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

      {image && <div className="featured-image-badge mono">Em análise</div>}

      {isAnalyzing && (
        <div className="analyzing-overlay">
          <div className="analyzing-rings">
            <div className="ping" />
            <div className="ping" style={{ animationDelay: '0.8s' }} />
            <div className="ping" style={{ animationDelay: '1.6s' }} />

            <div className="analyzing-core-wrap">
              <div className="analyzing-core">
                <i className="ti ti-brain" />
              </div>
            </div>

            <div className="orbit orbit-a">
              <div className="orbit-node orbit-node-a">
                <i className="ti ti-cpu" />
              </div>
            </div>
            <div className="orbit orbit-b">
              <div className="orbit-node orbit-node-b">
                <i className="ti ti-network" />
              </div>
            </div>
            <div className="orbit orbit-c">
              <div className="orbit-node orbit-node-c">
                <i className="ti ti-atom-2" />
              </div>
            </div>
          </div>
          <div className="analyzing-caption mono">Agentes de IA analisando a imagem…</div>
        </div>
      )}
    </div>
  );
}
