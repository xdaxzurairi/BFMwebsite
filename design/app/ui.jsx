/* ============================================================
   BFM — Shared UI primitives, context, hooks, icons
   ============================================================ */
const { createContext, useContext, useState, useEffect, useRef, useCallback } = React;

/* ---------- app context ---------- */
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

/* subscribe to store changes -> re-render */
function useStore() {
  const [, force] = useState(0);
  useEffect(() => BFM.subscribe(() => force((n) => n + 1)), []);
  return BFM;
}

/* ---------- formatting ---------- */
const fmt = {
  money: (n, cur = 'MYR') => (n || n === 0) ? `${cur === 'MYR' ? 'RM' : cur + ' '}${Number(n).toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : '—',
  avg: (n) => n.toFixed(3).replace(/^0/, ''),
  date: (s, lang) => { if (!s) return '—'; const d = new Date(s); return d.toLocaleDateString(lang === 0 ? 'ms-MY' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); },
  dateRange: (a, b, lang) => `${fmt.date(a, lang)} – ${fmt.date(b, lang)}`,
  time: (s) => { const d = new Date(s); return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); },
  initials: (a, b) => `${(a || '?')[0]}${(b || '')[0] || ''}`.toUpperCase(),
};

/* ---------- icons (simple line set) ---------- */
const I = {};
function mkIcon(paths) {
  return function Icon(props) {
    return React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
      paths.map((d, i) => React.createElement('path', { key: i, d })));
  };
}
function mkIconRaw(children) {
  return function Icon(props) {
    return React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, children);
  };
}
I.home = mkIcon(['M3 11l9-8 9 8', 'M5 9.5V21h14V9.5']);
I.users = mkIcon(['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13A4 4 0 0 1 16 11']);
I.user = mkIcon(['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8']);
I.trophy = mkIcon(['M8 21h8', 'M12 17v4', 'M7 4h10v5a5 5 0 0 1-10 0V4z', 'M7 4H4v2a3 3 0 0 0 3 3', 'M17 4h3v2a3 3 0 0 1-3 3']);
I.shield = mkIcon(['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z']);
I.calendar = mkIcon(['M8 2v4', 'M16 2v4', 'M3 9h18', 'M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z']);
I.chart = mkIcon(['M3 3v18h18', 'M7 15l4-5 3 3 5-7']);
I.news = mkIcon(['M4 4h13a1 1 0 0 1 1 1v14a2 2 0 0 0 2 2H5a1 1 0 0 1-1-1V4z', 'M8 8h6', 'M8 12h6', 'M8 16h4']);
I.grid = mkIcon(['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z']);
I.list = mkIcon(['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01']);
I.plus = mkIcon(['M12 5v14', 'M5 12h14']);
I.edit = mkIcon(['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z']);
I.trash = mkIcon(['M3 6h18', 'M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2', 'M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6']);
I.check = mkIcon(['M20 6L9 17l-5-5']);
I.x = mkIcon(['M18 6L6 18', 'M6 6l12 12']);
I.search = mkIcon(['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.3-4.3']);
I.arrow = mkIcon(['M5 12h14', 'M13 5l7 7-7 7']);
I.arrowL = mkIcon(['M19 12H5', 'M11 5l-7 7 7 7']);
I.pin = mkIcon(['M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z', 'M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z']);
I.money = mkIcon(['M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z']);
I.clock = mkIcon(['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 7v5l3 2']);
I.logout = mkIcon(['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9']);
I.bolt = mkIconRaw([React.createElement('path', { key: 0, d: 'M13 2L3 14h7l-1 8 10-12h-7l1-8z', fill: 'currentColor', stroke: 'none' })]);
I.baseball = mkIconRaw([
  React.createElement('circle', { key: 0, cx: 12, cy: 12, r: 9 }),
  React.createElement('path', { key: 1, d: 'M6 4.5C8 7 9 9.5 9 12s-1 5-3 7.5' }),
  React.createElement('path', { key: 2, d: 'M18 4.5C16 7 15 9.5 15 12s1 5 3 7.5' }),
]);
I.dollar = I.money;
I.dashboard = I.grid;

/* ---------- Diamond ---------- */
function Diamond({ cls = '', style }) { return <span className={`diamond ${cls}`} style={style} />; }

/* ---------- Button ---------- */
function Button({ variant = '', size = '', icon: Icon, iconRight, children, className = '', ...rest }) {
  return (
    <button className={`btn ${variant ? 'btn-' + variant : ''} ${size ? 'btn-' + size : ''} ${className}`} {...rest}>
      {Icon && !iconRight && <Icon />}
      {children}
      {Icon && iconRight && <Icon />}
    </button>
  );
}

/* ---------- Badge ---------- */
function StatusBadge({ status, label }) {
  return <span className={`badge badge-${status}`}><span className="dot" />{label || status}</span>;
}

/* ---------- Club logo / avatar ---------- */
function ClubLogo({ club, size = 44 }) {
  const initials = (club.club_name || '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const ring = size >= 44 ? 3 : 2;
  return (
    <div className="logo-badge" style={{ width: size, height: size, background: club.color || 'var(--field)', fontSize: size * 0.4, border: `${ring}px solid #fff`, boxShadow: 'var(--shadow-sm)' }}>
      {initials}
    </div>
  );
}
function Avatar({ a, b, size = 40, color }) {
  return <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: color || 'var(--field)' }}>{fmt.initials(a, b)}</div>;
}

/* ---------- Photo placeholder ---------- */
function Photo({ label, style, className = '' }) {
  return <div className={`ph ${className}`} style={style}>{label}</div>;
}

/* ---------- Field / inputs ---------- */
function Field({ label, hint, error, children }) {
  return (
    <div className={`field ${error ? 'invalid' : ''}`}>
      {label && <label>{label}</label>}
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="field-err">{error}</span>}
    </div>
  );
}
function Input(props) { return <input className="input" {...props} />; }
function Select({ children, ...props }) { return <select className="select" {...props}>{children}</select>; }
function Textarea(props) { return <textarea className="input" {...props} />; }

/* ---------- Tabs ---------- */
function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t.id} className={`tab ${value === t.id ? 'active' : ''}`} onClick={() => onChange(t.id)}>{t.label}</button>
      ))}
    </div>
  );
}

/* ---------- Modal ---------- */
function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="modal-back" onClick={onClose}>
      <div className={`modal ${wide ? 'wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="h-md">{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><I.x /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Empty state ---------- */
function Empty({ children }) {
  return <div className="empty"><Diamond cls="outline" /><div>{children}</div></div>;
}

/* ---------- Reveal on scroll ---------- */
function Reveal({ children, delay = 0, className = '', as = 'div', style }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { el.classList.add('in'); io.unobserve(el); } });
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const El = as;
  return <El ref={ref} className={`reveal ${delay ? 'd' + delay : ''} ${className}`} style={style}>{children}</El>;
}

/* ---------- Animated counter ---------- */
function Counter({ to, dur = 1400, decimals = 0, suffix = '', prefix = '' }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (t) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(to * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, dur]);
  return <span ref={ref} className="tnum">{prefix}{val.toFixed(decimals)}{suffix}</span>;
}

/* ---------- Countdown ---------- */
function Countdown({ target, lang, t }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const units = [[d, t('sec.days')], [h, t('sec.hours')], [m, t('sec.mins')], [s, t('sec.secs')]];
  return (
    <div className="row" style={{ gap: 14 }}>
      {units.map(([v, lbl], i) => (
        <div key={i} className="col" style={{ alignItems: 'center', minWidth: 76 }}>
          <span className="display tnum" style={{ fontSize: 52, color: '#fff', lineHeight: 1 }}>{String(v).padStart(2, '0')}</span>
          <span className="stat-label" style={{ color: 'var(--field-glow)', marginTop: 6 }}>{lbl}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- expose ---------- */
Object.assign(window, {
  // React hooks made global so every Babel file shares them
  useState, useEffect, useRef, useContext, useCallback, createContext,
  // app primitives
  AppCtx, useApp, useStore, fmt, I, Diamond, Button, StatusBadge,
  ClubLogo, Avatar, Photo, Field, Input, Select, Textarea, Tabs, Modal, Empty,
  Reveal, Counter, Countdown,
});
