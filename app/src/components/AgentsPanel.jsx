import { ALL_AGENTS, TOP_AGENT_IDS, BOTTOM_AGENT_IDS } from '../data/agents';
import AgentCard from './AgentCard';
import './AgentsPanel.css';

export default function AgentsPanel({ selectedAgentId, onSelectAgent }) {
  const byId = Object.fromEntries(ALL_AGENTS.map((a) => [a.id, a]));
  const topAgents = TOP_AGENT_IDS.map((id) => byId[id]);
  const bottomAgents = BOTTOM_AGENT_IDS.map((id) => byId[id]);

  return (
    <div className="agents-panel">
      <div className="section-title agents-title">Agentes de diagnóstico</div>

      <div className="agents-scroll">
        <div className="agents-grid agents-grid--top">
          {topAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              variant="top"
              isSelected={agent.id === selectedAgentId}
              onSelect={onSelectAgent}
            />
          ))}
        </div>

        <div className="agents-grid agents-grid--bottom">
          {bottomAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              variant="bottom"
              isSelected={agent.id === selectedAgentId}
              onSelect={onSelectAgent}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
