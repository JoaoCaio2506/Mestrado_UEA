import { useCallback, useRef, useState } from 'react';

const PILL_STYLE = {
  display: 'inline-block',
  background: 'var(--accent-bg)',
  color: 'var(--accent)',
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '13px',
  fontWeight: '500',
  padding: '2px 10px',
  borderRadius: '9999px',
  margin: '0 2px',
  verticalAlign: 'middle',
};

// Ports the imperative contentEditable + inline "@mention pill" logic from
// the original design prototype (DCLogic Component class) into a plain hook.
export function useMentionChatInput({ onInteract }) {
  const inputRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [mention, setMention] = useState({ query: null, node: null, start: 0 });

  const makeMentionPill = useCallback((name) => {
    const span = document.createElement('span');
    span.contentEditable = 'false';
    span.textContent = name;
    Object.assign(span.style, PILL_STYLE);
    return span;
  }, []);

  const insertMentionAt = useCallback(
    (agent, range) => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      let useRange = range;
      if (!useRange) {
        const sel = window.getSelection();
        if (sel.rangeCount && el.contains(sel.anchorNode)) {
          useRange = sel.getRangeAt(0);
        } else {
          useRange = document.createRange();
          useRange.selectNodeContents(el);
          useRange.collapse(false);
        }
      } else {
        useRange.deleteContents();
      }
      const pill = makeMentionPill(agent.name);
      useRange.insertNode(pill);
      const space = document.createTextNode(' ');
      const afterPill = document.createRange();
      afterPill.setStartAfter(pill);
      afterPill.collapse(true);
      afterPill.insertNode(space);
      afterPill.setStartAfter(space);
      afterPill.collapse(true);
      const sel2 = window.getSelection();
      sel2.removeAllRanges();
      sel2.addRange(afterPill);
      setMention({ query: null, node: null, start: 0 });
      setIsEmpty(false);
      onInteract?.();
    },
    [makeMentionPill, onInteract],
  );

  const selectMentionFromDropdown = useCallback(
    (agent) => {
      const { node: mentionNode, start: mentionStart } = mention;
      if (mentionNode) {
        const sel = window.getSelection();
        const endOffset =
          sel.rangeCount && sel.anchorNode === mentionNode ? sel.anchorOffset : mentionNode.textContent.length;
        const range = document.createRange();
        range.setStart(mentionNode, Math.min(mentionStart, mentionNode.textContent.length));
        range.setEnd(mentionNode, Math.min(endOffset, mentionNode.textContent.length));
        insertMentionAt(agent, range);
      } else {
        insertMentionAt(agent, null);
      }
    },
    [mention, insertMentionAt],
  );

  const handleInput = useCallback(() => {
    const el = inputRef.current;
    const empty = !el || (el.textContent || '').trim().length === 0;
    const sel = window.getSelection();
    let query = null;
    let node = null;
    let start = 0;
    if (sel && sel.rangeCount) {
      const anchor = sel.anchorNode;
      if (anchor && anchor.nodeType === 3 && el && el.contains(anchor)) {
        const text = anchor.textContent || '';
        const caret = sel.anchorOffset;
        const upto = text.slice(0, caret);
        const m = upto.match(/@([^\s@]*)$/);
        if (m) {
          query = m[1];
          node = anchor;
          start = caret - m[0].length;
        }
      }
    }
    setIsEmpty(empty);
    setMention({ query, node, start });
    if (!empty) onInteract?.();
  }, [onInteract]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setMention((m) => ({ ...m, query: null }));
    }
  }, []);

  const getText = useCallback(() => (inputRef.current?.textContent || '').trim(), []);

  const clear = useCallback(() => {
    if (inputRef.current) inputRef.current.textContent = '';
    setIsEmpty(true);
    setMention({ query: null, node: null, start: 0 });
  }, []);

  return {
    inputRef,
    isEmpty,
    mentionQuery: mention.query,
    showMentionDropdown: mention.query !== null,
    selectAgent: (agent) => insertMentionAt(agent, null),
    selectMentionFromDropdown,
    handleInput,
    handleKeyDown,
    getText,
    clear,
  };
}
