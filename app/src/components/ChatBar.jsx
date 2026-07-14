import { forwardRef, useImperativeHandle, useState } from 'react';
import { ALL_AGENTS } from '../data/agents';
import { useMentionChatInput } from '../hooks/useMentionChatInput';
import ChatHistory from './ChatHistory';
import './ChatBar.css';

const ChatBar = forwardRef(function ChatBar(
  {
    hasInteracted,
    onInteract,
    loadingPhase,
    progressWidth,
    progressDurationMs,
    progressLabel,
    canSend,
    onSend,
    messages,
    onClearChat,
  },
  ref,
) {
  const chat = useMentionChatInput({ onInteract });
  const [isMinimized, setIsMinimized] = useState(false);

  useImperativeHandle(ref, () => ({
    mentionAgent: (agent) => chat.selectAgent(agent),
    clear: () => chat.clear(),
  }));

  const isIdle = loadingPhase === 'idle';
  const q = (chat.mentionQuery || '').toLowerCase();
  const candidates = ALL_AGENTS.filter((a) => a.name.toLowerCase().includes(q));

  const handleSend = () => {
    if (!isIdle) return;
    const text = chat.getText();
    if (!text || !canSend) return;
    onSend(text);
  };

  return (
    <div className="chatbar-wrap">
      <div className="chatbar-inner">
        {isMinimized ? (
          <button
            className="chatbar-collapsed"
            style={{ animation: hasInteracted ? 'none' : 'glowPulse 2.4s ease-in-out infinite' }}
            onClick={() => setIsMinimized(false)}
            title="Expandir chat"
          >
            <div className="chatbar-avatar">
              <i className="ti ti-sparkles" />
            </div>

            <div className="chatbar-collapsed-body">
              {!isIdle ? (
                <>
                  <div className="chatbar-collapsed-track">
                    <div
                      className="chatbar-progress-fill"
                      style={{ width: progressWidth, transitionDuration: `${progressDurationMs}ms` }}
                    />
                  </div>
                  <div className="mono chatbar-collapsed-progress-label">{progressLabel}</div>
                </>
              ) : (
                <div className="chatbar-collapsed-text">
                  Assistente de diagnóstico
                  {messages.length > 0 && <span className="chatbar-collapsed-badge">{messages.length}</span>}
                </div>
              )}
            </div>

            <i className="ti ti-chevron-up chatbar-toggle-chevron" />
          </button>
        ) : (
          <>
            <div className="chatbar-collapse-row">
              {messages.length > 0 && (
                <button
                  className="chatbar-icon-btn chatbar-icon-btn-danger"
                  onClick={onClearChat}
                  title="Limpar conversa"
                >
                  <i className="ti ti-trash" />
                </button>
              )}
              <button
                className="chatbar-icon-btn chatbar-icon-btn-end"
                onClick={() => setIsMinimized(true)}
                title="Minimizar chat"
              >
                <i className="ti ti-chevron-down" />
              </button>
            </div>

            <ChatHistory messages={messages} />

            {chat.showMentionDropdown && (
              <div className="mention-dropdown">
                <div className="mention-dropdown-title mono">Mencionar agente</div>
                {candidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="mention-candidate"
                    onClick={() => chat.selectMentionFromDropdown(cand)}
                  >
                    <div className="mention-candidate-icon">
                      <i className={`ti ti-${cand.icon}`} />
                    </div>
                    <div className="mention-candidate-name">{cand.name}</div>
                  </div>
                ))}
                {candidates.length === 0 && (
                  <div className="mention-empty mono">nenhum agente encontrado</div>
                )}
              </div>
            )}

            <div
              className="chatbar"
              style={{ animation: hasInteracted ? 'none' : 'glowPulse 2.4s ease-in-out infinite' }}
            >
              <div className="chatbar-avatar">
                <i className="ti ti-sparkles" />
              </div>

              {isIdle ? (
                <>
                  <div className="chatbar-input-wrap">
                    {chat.isEmpty && (
                      <div className="chatbar-placeholder">
                        Pergunte sobre o diagnóstico… digite <span className="at-pulse">@</span> para
                        mencionar um agente
                      </div>
                    )}
                    <div
                      ref={chat.inputRef}
                      contentEditable
                      onInput={chat.handleInput}
                      onKeyDown={(e) => {
                        chat.handleKeyDown(e);
                        if (e.key === 'Enter') handleSend();
                      }}
                      className="chatbar-input"
                    />
                  </div>
                  <button
                    className="chatbar-send"
                    onClick={handleSend}
                    disabled={chat.isEmpty || !canSend}
                    title={!canSend ? 'Envie uma imagem antes de perguntar' : undefined}
                  >
                    <i className="ti ti-arrow-up" />
                  </button>
                </>
              ) : (
                <div className="chatbar-progress-wrap">
                  <div className="chatbar-progress-track">
                    <div
                      className="chatbar-progress-fill"
                      style={{ width: progressWidth, transitionDuration: `${progressDurationMs}ms` }}
                    />
                  </div>
                  <div className="chatbar-progress-label mono">{progressLabel}</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default ChatBar;
