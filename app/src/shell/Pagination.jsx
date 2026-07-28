export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;
  return (
    <div className="shell-pagination">
      <button
        type="button"
        className="shell-icon-btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Página anterior"
      >
        <i className="ti ti-chevron-left" />
      </button>
      <span className="shell-pagination-label">
        Página {page} de {pageCount}
      </span>
      <button
        type="button"
        className="shell-icon-btn"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
        aria-label="Próxima página"
      >
        <i className="ti ti-chevron-right" />
      </button>
    </div>
  );
}
