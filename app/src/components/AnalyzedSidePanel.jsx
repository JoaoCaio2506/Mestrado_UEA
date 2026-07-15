import './AnalyzedSidePanel.css';

function badgeStyle(diag) {
  return diag === 'tb'
    ? { background: 'var(--danger-bg)', color: 'var(--danger)' }
    : { background: 'var(--success-bg)', color: 'var(--success)' };
}

function labelFor(img) {
  const base = img.diag === 'tb' ? `${img.pct}% TB` : `${img.pct}% normal`;
  return img.agentName ? `${base} - ${img.agentName}` : base;
}

export default function AnalyzedSidePanel({ images }) {
  return (
    <div className="analyzed-panel">
      <div className="analyzed-panel-title mono">Já analisadas</div>
      {images.length > 0 ? (
        <div className="analyzed-thumbs-scroll">
          {images.map((img) => (
            <div
              key={img.id}
              className="analyzed-thumb"
              style={img.src ? { backgroundImage: `url("${img.src}")` } : undefined}
            >
              {!img.src && <div className="analyzed-thumb-filename mono">{img.name}</div>}
              <div className="analyzed-thumb-badge mono" style={badgeStyle(img.diag)}>
                {labelFor(img)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="analyzed-empty">
          <div className="analyzed-empty-text">
            As imagens já analisadas aparecerão aqui após a primeira inferência
          </div>
        </div>
      )}
    </div>
  );
}
