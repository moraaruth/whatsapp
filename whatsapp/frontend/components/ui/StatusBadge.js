import { getStatusConfig } from '../../lib/utils';

export default function StatusBadge({ status }) {
  const config = getStatusConfig(status);
  return (
    <span className={config.className}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
}
