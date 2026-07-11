import { PageHead } from '@/components/PageHead';
import { NewsImage } from '@/components/ui/NewsImage';
import { Empty } from '@/components/ui/Empty';
import { getLang } from '@/lib/lang';
import { getNews } from '@/lib/queries';
import { fmt } from '@/lib/format';
import { t as translate } from '@/lib/i18n';

export const revalidate = 60;

export default async function NewsPage() {
  const lang = await getLang();
  const news = await getNews();

  return (
    <div className="section wrap">
      <PageHead kicker={translate('nav.news', lang)} title={lang === 0 ? 'Berita & Pengumuman' : 'News & Announcements'} />
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
        {news.map((nw) => (
          <article key={nw.news_id} className="card hover">
            <NewsImage src={nw.cover_image} style={{ height: 170 }} />
            <div className="pad">
              <div className="row center" style={{ gap: 10, marginBottom: 10 }}>
                <span className="badge" style={{ background: 'var(--field)', color: '#fff' }}>
                  {lang === 0 ? nw.category_bm : nw.category_en}
                </span>
                <span className="muted" style={{ fontSize: 13 }}>
                  {fmt.date(nw.published_date, lang)}
                </span>
              </div>
              <h3 style={{ fontWeight: 800, fontSize: 18, lineHeight: 1.2, marginBottom: 8 }}>{lang === 0 ? nw.title_bm : nw.title_en}</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.55 }}>
                {lang === 0 ? nw.body_bm : nw.body_en}
              </p>
            </div>
          </article>
        ))}
      </div>
      {news.length === 0 && <Empty>{lang === 0 ? 'Tiada berita.' : 'No news.'}</Empty>}
    </div>
  );
}
