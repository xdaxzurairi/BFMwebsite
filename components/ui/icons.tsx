/* Ported from design/app/ui.jsx's icon set. */
import type { SVGProps } from 'react';

function mkIcon(paths: string[]) {
  return function Icon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    );
  };
}

function Baseball(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx={12} cy={12} r={9} />
      <path d="M6 4.5C8 7 9 9.5 9 12s-1 5-3 7.5" />
      <path d="M18 4.5C16 7 15 9.5 15 12s1 5 3 7.5" />
    </svg>
  );
}

export const I = {
  home: mkIcon(['M3 11l9-8 9 8', 'M5 9.5V21h14V9.5']),
  users: mkIcon(['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13A4 4 0 0 1 16 11']),
  user: mkIcon(['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8']),
  trophy: mkIcon(['M8 21h8', 'M12 17v4', 'M7 4h10v5a5 5 0 0 1-10 0V4z', 'M7 4H4v2a3 3 0 0 0 3 3', 'M17 4h3v2a3 3 0 0 1-3 3']),
  shield: mkIcon(['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z']),
  calendar: mkIcon(['M8 2v4', 'M16 2v4', 'M3 9h18', 'M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z']),
  chart: mkIcon(['M3 3v18h18', 'M7 15l4-5 3 3 5-7']),
  news: mkIcon(['M4 4h13a1 1 0 0 1 1 1v14a2 2 0 0 0 2 2H5a1 1 0 0 1-1-1V4z', 'M8 8h6', 'M8 12h6', 'M8 16h4']),
  grid: mkIcon(['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z']),
  plus: mkIcon(['M12 5v14', 'M5 12h14']),
  edit: mkIcon(['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z']),
  trash: mkIcon(['M3 6h18', 'M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2', 'M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6']),
  check: mkIcon(['M20 6L9 17l-5-5']),
  x: mkIcon(['M18 6L6 18', 'M6 6l12 12']),
  search: mkIcon(['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.3-4.3']),
  arrow: mkIcon(['M5 12h14', 'M13 5l7 7-7 7']),
  arrowL: mkIcon(['M19 12H5', 'M11 5l-7 7 7 7']),
  pin: mkIcon(['M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z', 'M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z']),
  money: mkIcon(['M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z']),
  clock: mkIcon(['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 7v5l3 2']),
  logout: mkIcon(['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9']),
  menu: mkIcon(['M4 7h16', 'M4 12h16', 'M4 17h16']),
  baseball: Baseball,
};

export function Diamond({ cls = '', style }: { cls?: string; style?: React.CSSProperties }) {
  return <span className={`diamond ${cls}`} style={style} />;
}
