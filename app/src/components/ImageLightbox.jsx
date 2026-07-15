import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { badgeStyle, labelFor } from '../utils/diagnosisLabel';
import './ImageLightbox.css';

export default function ImageLightbox({ image, onClose }) {
  useEffect(() => {
    if (!image) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [image, onClose]);

  if (!image) return null;

  return createPortal(
    <div className="lightbox-backdrop" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Fechar">
        <i className="ti ti-x" />
      </button>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        {image.src ? (
          <img className="lightbox-img" src={image.src} alt="Radiografia analisada" />
        ) : (
          <div className="lightbox-placeholder mono">{image.name}</div>
        )}
        {image.diag && (
          <div className="lightbox-badge mono" style={badgeStyle(image.diag)}>
            {labelFor(image)}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
