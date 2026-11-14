import { PRIORITY_COLORS } from '../utils/priority';

export function PriorityDot({ priority, className = '' }) {
  if (!priority) return null;
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-2 shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: PRIORITY_COLORS[priority] }}
    />
  );
}
