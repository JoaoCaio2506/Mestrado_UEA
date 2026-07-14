import './AgentCard.css';

export default function AgentCard({ agent, isSelected, onSelect, variant }) {
  return (
    <div className={`agent-card agent-card--${variant}`}>
      {variant === 'top' ? (
        <>
          <div className={`agent-icon ${isSelected ? 'selected' : ''}`}>
            <i className={`ti ti-${agent.icon}`} />
          </div>
          <div className="agent-name">{agent.name}</div>
        </>
      ) : (
        <div className="agent-header-row">
          <div className={`agent-icon ${isSelected ? 'selected' : ''}`}>
            <i className={`ti ti-${agent.icon}`} />
          </div>
          <div className="agent-name">{agent.name}</div>
        </div>
      )}

      <div className="agent-desc">{agent.desc}</div>

      <button
        className={`agent-select-btn ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect(agent)}
      >
        {isSelected ? 'Selecionado' : 'Selecionar'}
      </button>
    </div>
  );
}
