import type { CSSProperties } from 'react';
import { Photo } from './ClubLogo';

export function NewsImage({ src, style, className }: { src?: string | null; style?: CSSProperties; className?: string }) {
  if (!src) return <Photo label="NEWS IMAGE" style={style} className={className} />;
  // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URLs, no remotePatterns config needed
  return <img src={src} alt="" style={{ ...style, objectFit: 'cover', width: '100%', display: 'block' }} className={className} />;
}
