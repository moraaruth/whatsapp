import { getStatus } from '../../lib/utils';

export default function StatusPill({ status }) {
  const s = getStatus(status);
  return (
    <span className={s.pill}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} opacity-80`} />
      {s.label}
    </span>
  );
}
