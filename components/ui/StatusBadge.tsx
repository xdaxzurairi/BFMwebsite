export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className="dot" />
      {label || status}
    </span>
  );
}
