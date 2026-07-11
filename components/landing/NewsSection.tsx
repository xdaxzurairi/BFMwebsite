import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';
import { NewsImage } from '@/components/ui/NewsImage';
import { I } from '@/components/ui/icons';
import { fmt } from '@/lib/format';
import { t as translate, type Lang } from '@/lib/i18n';
import type { News } from '@/lib/types';

export function NewsSection({ lang, news }: { lang: Lang; news: News[] }) {
  const top = news.slice(0, 3);
  return (
    <section className="section">
      <div className="wrap">
        <div className="row between center" style={{ marginBottom: 36 }}>
          <div>
            <div className="kicker" style={{ marginBottom: 14 }}>
              {translate('sec.news', lang)}
            </div>
            <h2 className="h-lg">{lang === 0 ? 'Apa yang terkini' : "What's happening"}</h2>
          </div>
          <Link href="/news" className="btn btn-ghost btn-sm">
            {translate('cta.viewall', lang)} <I.arrow />
          </Link>
        </div>
        <div className="grid news-grid">
          {top.map((nw, i) => (
            <Reveal key={nw.news_id} delay={i + 1}>
              <Link href="/news" className="card hover" style={{ height: '100%', display: 'block' }}>
                <NewsImage src={nw.cover_image} style={{ height: i === 0 ? 220 : 150 }} />
                <div className="pad">
                  <div className="row center" style={{ gap: 10, marginBottom: 10 }}>
                    <span className="badge" style={{ background: 'var(--field)', color: '#fff' }}>
                      {lang === 0 ? nw.category_bm : nw.category_en}
                    </span>
                    <span className="muted" style={{ fontSize: 13 }}>
                      {fmt.date(nw.published_date, lang)}
                    </span>
                  </div>
                  <h3 className={i === 0 ? 'h-md' : ''} style={{ fontWeight: 800, fontSize: i === 0 ? 22 : 17, lineHeight: 1.2, marginBottom: 8 }}>
                    {lang === 0 ? nw.title_bm : nw.title_en}
                  </h3>
                  <p className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>
                    {lang === 0 ? nw.body_bm : nw.body_en}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        {top.length === 0 && <p className="muted">{lang === 0 ? 'Tiada berita lagi.' : 'No news yet.'}</p>}
      </div>
    </section>
  );
}
