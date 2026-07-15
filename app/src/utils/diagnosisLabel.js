export function badgeStyle(diag) {
  return diag === 'tb'
    ? { background: 'var(--danger-bg)', color: 'var(--danger)' }
    : { background: 'var(--success-bg)', color: 'var(--success)' };
}

export function labelFor(img) {
  const base = img.diag === 'tb' ? `${img.pct}% TB` : `${img.pct}% normal`;
  return img.agentName ? `${base} - ${img.agentName}` : base;
}
