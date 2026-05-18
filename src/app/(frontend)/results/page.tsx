import { getPayload } from 'payload';
import config from '@payload-config';
import Link from 'next/link';
import { CtaStrip } from '@/components/CtaStrip';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { parseDate, shortMo, pad } from '@/lib/calendar';

export const revalidate = 600;
export const metadata = { title: 'Results' };

const ResultsPage = async () => {
  const payload = await getPayload({ config });
  const [page, result] = await Promise.all([
    payload.findGlobal({ slug: 'results-page' }),
    payload.find({
      collection: 'recaps',
      where: { status: { equals: 'published' } },
      sort: '-date',
      limit: 30,
    }),
  ]);
  const latest = result.docs[0];

  return (
    <>
      <section
        className="relative text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,27,58,.6) 0%, rgba(6,27,58,.85) 100%), url('/images/hero-bg.jpg') center/cover no-repeat, #061B3A",
        }}
      >
        <div className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-12 sm:py-14 max-w-[820px]">
          <div className="text-[12px] text-white/55 mb-4 tracking-wide">
            <Link href="/" className="text-cyan">Home</Link> <span className="text-white/30 mx-1.5">/</span> {page.bannerEyebrow ?? 'Results'}
          </div>
          <h1 className="text-[34px] sm:text-[44px] md:text-[52px] font-extrabold leading-[1.05] tracking-tight" style={{ textShadow: '0 4px 24px rgba(0,0,0,.4)' }}>
            {page.bannerTitle ?? 'Recent Results'}
          </h1>
          {page.bannerBody && (
            <p className="mt-4 max-w-[660px] text-white/80 text-[15px] sm:text-base leading-relaxed">
              {page.bannerBody}
            </p>
          )}
          {latest && (
            <div className="mt-6 inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-[12px] text-white/85">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cyan"><path d="M5 12l5 5L20 7" /></svg>
              Last updated {parseDate(latest.date.slice(0, 10)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          )}
        </div>
      </section>

      <section className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-12">
        <div className="max-w-[900px] mx-auto">
          <div className="mb-6">
            <div className="eyebrow">Coach&apos;s Recap</div>
            <h2 className="text-[26px] sm:text-[30px] font-extrabold mt-2 tracking-tight">The latest from the mat</h2>
          </div>
        {result.docs.length === 0 ? (
          <p className="text-muted">{page.emptyMessage}</p>
        ) : (
          <div className="space-y-4">
            {result.docs.map((r) => {
              const d = parseDate(r.date.slice(0, 10));
              return (
                <article key={r.id} className="bg-white border border-border rounded-xl p-5 shadow-soft grid gap-5 md:grid-cols-[72px_1fr]">
                  <div className="text-center bg-cyan/10 text-cyan rounded-lg py-2 self-start">
                    <div className="text-[10px] uppercase font-bold tracking-widest">{shortMo(d.getMonth())}</div>
                    <div className="text-[24px] font-extrabold leading-tight">{pad(d.getDate())}</div>
                    <div className="text-[10px] text-cyan/70">{d.getFullYear()}</div>
                  </div>
                  <div>
                    {r.kicker && <div className="eyebrow">{r.kicker}</div>}
                    <h2 className="text-xl md:text-2xl font-extrabold text-navy mt-1">{r.title}</h2>
                    {r.body && (
                      <div className="mt-3 text-text-navy/85 leading-7 prose prose-sm max-w-none">
                        <RichText data={r.body} />
                      </div>
                    )}
                    {r.tags && r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {(r.tags as Array<{ label?: string }>).map((t, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-pill bg-cyan/10 text-cyan text-xs font-semibold">
                            {t.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        </div>
      </section>

      <CtaStrip />
    </>
  );
};

export default ResultsPage;
