import Link from 'next/link';
import { getPayload } from 'payload';
import config from '@payload-config';
import { CtaStrip } from '@/components/CtaStrip';
import { ButtonLink } from '@/components/Button';
import { parseDate, shortMo, pad } from '@/lib/calendar';

export const revalidate = 600;

const HomePage = async () => {
  const payload = await getPayload({ config });
  const homepage = await payload.findGlobal({ slug: 'homepage' });
  const today = new Date().toISOString().slice(0, 10);
  const events = await payload.find({
    collection: 'events',
    where: {
      and: [
        { date: { greater_than_equal: today } },
        { status: { equals: 'published' } },
        { kind: { not_equals: 'prac' } },
      ],
    },
    sort: 'date',
    limit: 3,
  });
  const photos = await payload.find({
    collection: 'photos',
    where: { featured: { equals: true } },
    sort: '-date',
    limit: 6,
  });

  return (
    <>
      {/* HERO */}
      <section
        className="relative text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,27,58,.35) 0%, rgba(6,27,58,.35) 50%, rgba(6,27,58,.75) 100%), url('/images/hero-bg.jpg') center/cover no-repeat, #061B3A",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute -right-12 top-6 w-[200px] h-[200px] sm:-right-16 sm:top-10 sm:w-[280px] sm:h-[280px] md:w-[380px] md:h-[380px] opacity-15 sm:opacity-20 pointer-events-none"
          style={{ background: "url('/logos/lion-head-blue-transparent.png') center/contain no-repeat" }}
        />
        <div className="relative z-10 px-5 sm:px-6 md:px-14 pt-12 sm:pt-16 md:pt-20 pb-10 sm:pb-12 max-w-[600px] min-h-[380px] sm:min-h-[438px]">
          <h1 className="text-[34px] sm:text-5xl md:text-[64px] leading-[1.1] sm:leading-[1.05] font-extrabold tracking-tight">
            {homepage.heroHeading ?? 'Lions Wrestling Club'}
          </h1>
          <p className="mt-3 sm:mt-4 text-white/80 text-sm sm:text-base md:text-lg max-w-[520px]">
            {homepage.heroSubheading}
          </p>
          <div className="mt-6 sm:mt-7 flex gap-3 flex-wrap">
            {homepage.heroPrimaryCtaLabel && (
              <ButtonLink href={homepage.heroPrimaryCtaHref ?? '/register'} variant="cyan" size="lg">
                {homepage.heroPrimaryCtaLabel} →
              </ButtonLink>
            )}
            {homepage.heroSecondaryCtaLabel && (
              <ButtonLink href={homepage.heroSecondaryCtaHref ?? '/schedule'} variant="outline" size="lg">
                {homepage.heroSecondaryCtaLabel}
              </ButtonLink>
            )}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="px-5 sm:px-6 md:px-14 py-10 sm:py-14 grid gap-8 md:gap-10 md:grid-cols-[1fr_320px] items-center">
        <div>
          <div className="eyebrow">Our Mission</div>
          <h2 className="text-3xl md:text-[34px] leading-[1.1] font-extrabold mt-2">
            {homepage.missionHeading ?? 'Building Champions On and Off the Mat'}
          </h2>
          <p className="mt-4 text-base text-text-navy/85 leading-7 max-w-[520px]">
            {homepage.missionBody ??
              'We develop student-athletes who strive for excellence in wrestling and in life. Through faith, discipline, and dedication, we prepare our athletes to lead with integrity.'}
          </p>
          <div className="flex gap-3 flex-wrap mt-5">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-cyan/10 text-cyan text-sm font-semibold">Faith</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-cyan/10 text-cyan text-sm font-semibold">Discipline</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-cyan/10 text-cyan text-sm font-semibold">Excellence</span>
          </div>
        </div>
        <div
          aria-label="Coach with wrestlers"
          className="rounded-2xl bg-cover bg-center min-h-[280px] shadow-soft"
          style={{ backgroundImage: "url('/images/mission-photo.jpg')" }}
        />
      </section>

      {/* PROGRAM CARDS */}
      <section className="px-6 md:px-14 pb-14">
        <div className="eyebrow">Our Program</div>
        <h2 className="text-3xl font-extrabold mt-2">Developing Complete Wrestlers</h2>
        <div className="grid gap-5 mt-6 md:grid-cols-3">
          {((homepage.programCards ?? []) as Array<{ title?: string; ageRange?: string; body?: string; ctaLabel?: string; ctaHref?: string }>).map((c, i) => (
            <article
              key={i}
              className="bg-white rounded-2xl p-6 shadow-soft border border-border"
            >
              <h3 className="font-extrabold text-lg text-navy">{c.title}</h3>
              {c.ageRange && <div className="text-cyan text-xs font-semibold tracking-widest mt-1">{c.ageRange}</div>}
              <p className="text-text-navy/80 text-sm leading-6 mt-3">{c.body}</p>
              {c.ctaHref && (
                <Link href={c.ctaHref} className="text-cyan text-sm font-semibold inline-flex items-center gap-1 mt-4">
                  {c.ctaLabel ?? 'Learn More'} →
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* UPCOMING SCHEDULE */}
      <section className="px-4 sm:px-6 md:px-14 pb-14">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-soft border border-border">
          <div className="eyebrow">Upcoming Schedule</div>
          {events.docs.length === 0 ? (
            <p className="mt-4 text-muted">No upcoming matches scheduled yet. Check back soon.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {events.docs.map((e) => {
                const d = parseDate(e.date.slice(0, 10));
                return (
                  <li
                    key={e.id}
                    className="grid grid-cols-[50px_1fr] sm:grid-cols-[50px_1fr_auto_auto] items-center gap-x-3 sm:gap-4 gap-y-1 py-4"
                  >
                    <div className="text-center bg-cyan/10 rounded-lg py-1 text-cyan row-span-2 sm:row-span-1">
                      <div className="text-[11px] uppercase font-semibold tracking-wider">{shortMo(d.getMonth())}</div>
                      <div className="text-lg font-extrabold leading-tight">{pad(d.getDate())}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-navy truncate">{e.title}</div>
                      <div className="text-xs text-muted truncate">{e.location}</div>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-cyan col-start-2 sm:col-start-3">
                      {e.kind === 'home' ? 'Home' : e.kind === 'away' ? 'Away' : 'Tournament'}
                    </span>
                    <span className="text-sm text-muted col-start-2 sm:col-start-4">{e.time}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="text-right mt-5">
            <ButtonLink href="/schedule" variant="outline">
              View Full Schedule →
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* GALLERY STRIP */}
      {photos.docs.length > 0 && (
        <section className="px-6 md:px-14 pb-14">
          <div className="eyebrow">From the Mat</div>
          <h2 className="text-3xl font-extrabold mt-2">Lions in Action</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
            {photos.docs.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="rounded-xl overflow-hidden aspect-[4/3] bg-border"
                style={{ backgroundImage: typeof p.url === 'string' ? `url(${p.url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
                role="img"
                aria-label={p.alt ?? p.caption ?? ''}
              />
            ))}
          </div>
        </section>
      )}

      {/* TESTIMONIAL */}
      {homepage.testimonialQuote && (
        <section className="relative px-6 md:px-14 py-12">
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 bottom-0 w-[380px] opacity-15 pointer-events-none"
            style={{ background: "url('/images/quote-ghost.png') right center/contain no-repeat" }}
          />
          <div className="relative max-w-[600px]">
            <div className="text-cyan font-serif text-[88px] leading-none">"</div>
            <p className="text-xl md:text-[22px] leading-[30px] font-medium text-text-navy">
              {homepage.testimonialQuote}
            </p>
            <div className="mt-4 text-cyan text-sm font-semibold">
              — {homepage.testimonialAuthor}{homepage.testimonialRole ? ` · ${homepage.testimonialRole}` : ''}
            </div>
          </div>
        </section>
      )}

      <CtaStrip heading="Ready to wrestle?" accent="Let's get on the mat." />
    </>
  );
};

export default HomePage;
