import { getPayload } from 'payload';
import config from '@payload-config';
import { PageBanner } from '@/components/PageBanner';
import { CtaStrip } from '@/components/CtaStrip';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { parseDate, shortMo, pad } from '@/lib/calendar';

export const revalidate = 600;
export const metadata = { title: 'Results' };

const ResultsPage = async () => {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'recaps',
    where: { status: { equals: 'published' } },
    sort: '-date',
    limit: 30,
  });
  return (
    <>
      <PageBanner
        eyebrow="Results"
        title="Recent matches & recaps"
        body="Match recaps, tournament summaries, and notable performances — written by the coaching staff."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Results' }]}
      />

      <section className="px-6 md:px-14 py-10">
        {result.docs.length === 0 ? (
          <p className="text-muted">Recaps coming soon. Coaches post them after each event.</p>
        ) : (
          <div className="space-y-6">
            {result.docs.map((r) => {
              const d = parseDate(r.date.slice(0, 10));
              return (
                <article key={r.id} className="bg-white border border-border rounded-2xl p-6 shadow-soft grid gap-6 md:grid-cols-[80px_1fr]">
                  <div className="text-center bg-cyan/10 text-cyan rounded-lg py-2 self-start">
                    <div className="text-xs uppercase font-semibold tracking-wider">{shortMo(d.getMonth())}</div>
                    <div className="text-2xl font-extrabold leading-tight">{pad(d.getDate())}</div>
                    <div className="text-xs">{d.getFullYear()}</div>
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
      </section>

      <CtaStrip />
    </>
  );
};

export default ResultsPage;
