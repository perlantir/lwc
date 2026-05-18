import { getPayload } from 'payload';
import config from '@payload-config';
import { PageBanner } from '@/components/PageBanner';
import { CtaStrip } from '@/components/CtaStrip';

export const revalidate = 600;
export const metadata = { title: 'About' };

const AboutPage = async () => {
  const payload = await getPayload({ config });
  const [page, coaches] = await Promise.all([
    payload.findGlobal({ slug: 'about-page' }),
    payload.find({ collection: 'coaches', sort: 'order', limit: 50 }),
  ]);
  const values = (page.values ?? []) as Array<{ title?: string; body?: string }>;

  return (
    <>
      <PageBanner
        eyebrow={page.bannerEyebrow ?? 'About'}
        title={page.bannerTitle ?? 'The Lions Wrestling Club'}
        body={page.bannerBody ?? undefined}
        crumbs={[{ label: 'Home', href: '/' }, { label: page.bannerEyebrow ?? 'About' }]}
      />

      <section className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-14">
        <div className="eyebrow">{page.missionEyebrow ?? 'Mission'}</div>
        <h2 className="text-3xl md:text-[34px] font-extrabold mt-2 leading-tight">
          {page.missionHeading ?? 'Wrestling forms more than wrestlers — it forms people.'}
        </h2>
        <p className="mt-4 max-w-[640px] text-text-navy/85 leading-7">
          {page.missionBody}
        </p>
      </section>

      <section className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 pb-14">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((v, i) => (
            <article key={i} className="rounded-2xl bg-white border border-border p-6 shadow-soft">
              <h3 className="font-extrabold text-navy text-lg">{v.title}</h3>
              <p className="text-text-navy/80 text-sm mt-2 leading-6">{v.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 pb-14">
        <div className="eyebrow">{page.staffEyebrow ?? 'Coaching Staff'}</div>
        <h2 className="text-3xl font-extrabold mt-2">{page.staffHeading ?? 'Meet the coaches'}</h2>
        {coaches.docs.length === 0 ? (
          <p className="mt-4 text-muted">{page.staffEmptyMessage}</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3 mt-6">
            {coaches.docs.map((c) => (
              <article key={c.id} className="rounded-2xl bg-white border border-border p-6 shadow-soft">
                <h3 className="font-extrabold text-navy text-lg">{c.name}</h3>
                {c.role && <div className="text-cyan text-xs font-semibold tracking-widest mt-1">{c.role}</div>}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="text-cyan text-sm mt-3 inline-block">
                    {c.email}
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <CtaStrip />
    </>
  );
};

export default AboutPage;
