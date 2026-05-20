import { getS } from '../../lib/utils';
export default function SPill({ status }) {
  const s = getS(status);
  return (
    <span className={s.cls}>
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}
