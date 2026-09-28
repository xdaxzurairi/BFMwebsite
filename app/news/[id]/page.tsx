import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NewsImage } from '@/components/ui/NewsImage';
import { I } from '@/components/ui/icons';
import { getLang } from '@/lib/lang';
import { getNewsItem, getNews } from '@/lib/queries';
import { fmt } from '@/lib/format';
import { t as translate } from '@/lib/i18n';

export const revalidate = 60;

export default async function NewsArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await getLang();
  const [item, all] = await Promise.all([getNewsItem(Number(id)), getNews()]);
  if (!item) notFound();

  const title = lang === 0 ? item.title_bm : item.title_en;
  const body = lang === 0 ? item.body_bm : item.body_en;
  const more = all.filter((n) => n.news_id !== item.news_id).slice(0, 3);

  return (
    <div className="section wrap">
      <Link href="/news" className="btn btn-ghost btn-sm" style={{ marginBottom: 22 }}>
        <I.arrowL />
        {translate('nav.news', lang)}
      </Link>
      <article style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="row center" style={{ gap: 10, marginBottom: 16 }}>
          <span className="badge" style={{ background: 'var(--field)', color: '#fff' }}>
            {lang === 0 ? item.category_bm : item.category_en}
          </span>
          <span className="muted" style={{ fontSize: 14 }}>
            {fmt.date(item.published_date, lang)}
          </span>
        </div>
        <h1 className="h-lg" style={{ marginBottom: 24 }}>
          {title}
        </h1>
        {item.cover_image && <NewsImage src={item.cover_image} style={{ height: 380, borderRadius: 'var(--r-lg)', marginBottom: 28 }} />}
        <div style={{ fontSize: 17, lineHeight: 1.75, whiteSpace: 'pre-line' }}>{body}</div>
      </article>

      {more.length > 0 && (
        <div style={{ marginTop: 64 }}>
          <h2 className="h-md" style={{ marginBottom: 18 }}>
            {translate('news.more', lang)}
          </h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>
            {more.map((nw) => (
              <Link key={nw.news_id} href={`/news/${nw.news_id}`} className="card hover" style={{ display: 'block' }}>
                <NewsImage src={nw.cover_image} style={{ height: 140 }} />
                <div className="pad">
                  <span className="muted" style={{ fontSize: 13 }}>
                    {fmt.date(nw.published_date, lang)}
                  </span>
                  <h3 style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.25, marginTop: 6 }}>{lang === 0 ? nw.title_bm : nw.title_en}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
