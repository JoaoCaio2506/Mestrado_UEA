import { useEffect, useRef } from 'react';
import './ChatHistory.css';

export default function ChatHistory({ messages }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <div className="chat-history" ref={scrollRef}>
      {messages.map((msg) => (
        <div key={msg.id} className={`chat-msg chat-msg-${msg.role}`}>
          {msg.role === 'error' && <i className="ti ti-alert-triangle chat-msg-error-icon" />}
          {msg.text}
        </div>
      ))}
    </div>
  );
}
