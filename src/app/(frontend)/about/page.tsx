import { getPayload } from 'payload';
import config from '@payload-config';
import { PageBanner } from '@/components/PageBanner';
import { CtaStrip } from '@/components/CtaStrip';

export const revalidate = 600;
export const metadata = { title: 'About' };

const AboutPage = async () => {
  const payload = await getPayload({ config });
  const coaches = await payload.find({
    collection: 'coaches',
    sort: 'order',
    limit: 50,
  });
  return (
    <>
      <PageBanner
        eyebrow="About"
        title="The Lions Wrestling Club"
        body="Christ-centered wrestling at Des Moines Christian — building strong bodies, sharp minds, and faithful young men and women."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />

      <section className="px-6 md:px-14 py-14">
        <div className="eyebrow">Mission</div>
        <h2 className="text-3xl md:text-[34px] font-extrabold mt-2 leading-tight">
          Wrestling forms more than wrestlers — it forms people.
        </h2>
        <p className="mt-4 max-w-[640px] text-text-navy/85 leading-7">
          We pursue technical excellence and competitive success — and we believe the deeper win is
          who an athlete becomes through the sport: humble, disciplined, courageous, faithful.
        </p>
      </section>

      <section className="px-6 md:px-14 pb-14">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { t: 'Faith', d: 'Christ-centered coaching, character formation that lasts past the season.' },
            { t: 'Discipline', d: 'Show up. Do the work. Repeat. The mat rewards consistency.' },
            { t: 'Excellence', d: 'World-class technique, every age, every weight, every drill.' },
          ].map((v) => (
            <article key={v.t} className="rounded-2xl bg-white border border-border p-6 shadow-soft">
              <h3 className="font-extrabold text-navy text-lg">{v.t}</h3>
              <p className="text-text-navy/80 text-sm mt-2 leading-6">{v.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-14 pb-14">
        <div className="eyebrow">Coaching Staff</div>
        <h2 className="text-3xl font-extrabold mt-2">Meet the coaches</h2>
        {coaches.docs.length === 0 ? (
          <p className="mt-4 text-muted">Coach bios coming soon — populated via the admin.</p>
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
