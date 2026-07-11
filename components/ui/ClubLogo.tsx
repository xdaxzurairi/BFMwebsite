type Club = { club_name: string; color?: string | null };

export function ClubLogo({ club, size = 44 }: { club: Club; size?: number }) {
  const initials = (club.club_name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const ring = size >= 44 ? 3 : 2;
  return (
    <div
      className="logo-badge"
      style={{
        width: size,
        height: size,
        background: club.color || 'var(--field)',
        fontSize: size * 0.4,
        border: `${ring}px solid #fff`,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {initials}
    </div>
  );
}

export function Avatar({ a, b, size = 40, color }: { a?: string | null; b?: string | null; size?: number; color?: string }) {
  const initials = `${(a || '?')[0]}${(b || '')[0] || ''}`.toUpperCase();
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: color || 'var(--field)' }}>
      {initials}
    </div>
  );
}

export function Photo({ label, style, className = '' }: { label: string; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={`ph ${className}`} style={style}>
      {label}
    </div>
  );
}
