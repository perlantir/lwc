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
        className="relative text-white overflow-hidden min-h-[520px] md:min-h-[560px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,27,58,.35) 0%, rgba(6,27,58,.35) 50%, rgba(6,27,58,.75) 100%), url('/images/hero-bg.jpg') center/cover no-repeat, #061B3A",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute -right-12 top-6 w-[240px] h-[240px] sm:-right-16 sm:top-10 sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] opacity-20 pointer-events-none"
          style={{ background: "url('/logos/lion-head-blue-transparent.png') center/contain no-repeat" }}
        />
        <div className="relative z-10 pt-16 sm:pt-20 md:pt-[78px] pb-28 text-center px-5">
          <h1
            className="font-extrabold tracking-tight"
            style={{
              fontSize: 'clamp(36px, 7vw, 60px)',
              lineHeight: 'clamp(42px, 7.5vw, 70px)',
              textShadow: '0 4px 24px rgba(0,0,0,.4)',
            }}
          >
            {homepage.heroHeading ?? 'Lions Wrestling Club'}
          </h1>
          {homepage.heroSubheading && (
            <p
              className="mt-2 font-medium max-w-[720px] mx-auto"
              style={{
                fontSize: 'clamp(15px, 1.6vw, 22px)',
                textShadow: '0 2px 12px rgba(0,0,0,.5)',
                color: 'rgba(255,255,255,.92)',
              }}
            >
              {homepage.heroSubheading}
            </p>
          )}
          {homepage.heroPrimaryCtaLabel && (
            <div className="mt-6">
              <ButtonLink href={homepage.heroPrimaryCtaHref ?? '/register'} variant="cyan" size="lg">
                {homepage.heroPrimaryCtaLabel} <span aria-hidden>→</span>
              </ButtonLink>
            </div>
          )}
        </div>

        {/* Pillars row */}
        <div
          className="absolute left-0 right-0 bottom-12 sm:bottom-14 z-10 hidden sm:flex justify-center gap-6 md:gap-10 px-4 text-white whitespace-nowrap"
        >
          {[
            { top: 'FAITH', sub: 'Reverence • Christ' },
            { top: 'DISCIPLINE', sub: 'Habits • Grit' },
            { top: 'EXCELLENCE', sub: 'Pursuing Mastery' },
          ].map((p) => (
            <div key={p.top} className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan shrink-0" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <div className="leading-tight">
                <div className="text-[12px] md:text-[13px] font-bold tracking-widest">{p.top}</div>
                <div className="text-[11px] md:text-[12px] text-white/75 mt-0.5">{p.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="absolute left-0 right-0 bottom-5 z-10 flex justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </div>
      </section>

      {/* MISSION */}
      <section className="bg-off-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-10 sm:py-14 grid gap-8 md:gap-12 md:grid-cols-2 items-center">
        <div>
          <div className="eyebrow">Our Mission</div>
          <h2 className="text-[28px] md:text-[30px] leading-[1.15] font-extrabold mt-3 tracking-tight">
            {homepage.missionHeading ?? 'Building Champions On and Off the Mat'}
          </h2>
          <p className="mt-4 text-[14px] leading-[22px] text-[#3F4E62] max-w-[420px]">
            {homepage.missionBody ??
              'We develop student-athletes who strive for excellence in wrestling and in life. Through faith, discipline, and dedication, we prepare our athletes to lead with integrity.'}
          </p>
          <div className="flex gap-2.5 flex-wrap mt-6">
            {['Faith', 'Discipline', 'Excellence'].map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-pill text-[13px] font-medium text-text-navy"
                style={{ background: '#E8F1FB', border: '1px solid #D6E5F4' }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" className="text-cyan" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12l5 5L20 7" />
                </svg>
                {p}
              </span>
            ))}
          </div>
        </div>
        <div
          aria-label="Coach with wrestlers"
          className="rounded-xl bg-cover bg-center w-full shadow-card aspect-[380/270]"
          style={{ backgroundImage: "url('/images/mission-photo.jpg')" }}
        />
      </section>

      {/* PROGRAM — dark navy */}
      <section className="relative bg-navy text-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 pt-12 pb-24 sm:pb-28 overflow-hidden">
        <div
          aria-hidden
          className="absolute left-[-60px] top-1/2 -translate-y-1/2 w-[220px] h-[280px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 30% 50%, rgba(18,174,234,.18), transparent 60%)' }}
        />
        <div
          aria-hidden
          className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-[220px] h-[280px] pointer-events-none scale-x-[-1]"
          style={{ background: 'radial-gradient(circle at 30% 50%, rgba(18,174,234,.18), transparent 60%)' }}
        />
        <div className="text-center relative">
          <div className="eyebrow">Our Program</div>
          <h2 className="mt-2 text-[26px] md:text-[30px] leading-tight font-extrabold tracking-tight">
            Developing Complete Wrestlers
          </h2>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 md:grid-cols-3 relative">
          {((homepage.programCards ?? []) as Array<{ title?: string; ageRange?: string; body?: string; ctaLabel?: string; ctaHref?: string }>).map((c, i) => (
            <article
              key={i}
              className="rounded-xl p-5 sm:p-[22px] backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}
            >
              <div className="w-11 h-11 rounded-full bg-cyan/[.14] text-cyan flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  {i === 0 && <><path d="M12 2l2.5 7H22l-6 4.5L18.5 21 12 16.5 5.5 21 8 13.5 2 9h7.5z" /></>}
                  {i === 1 && <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></>}
                  {i === 2 && <><path d="M12 2v6" /><path d="M5 9l7-7 7 7" /><circle cx="12" cy="15" r="6" /></>}
                </svg>
              </div>
              <h3 className="font-bold text-[17px] text-white">{c.title}</h3>
              {c.ageRange && <div className="text-cyan/90 text-[11px] font-bold tracking-widest mt-1 uppercase">{c.ageRange}</div>}
              <p className="text-white/75 text-[13px] leading-[19px] mt-2">{c.body}</p>
              {c.ctaHref && (
                <Link href={c.ctaHref} className="inline-flex items-center gap-1 mt-4 text-cyan text-[13px] font-semibold hover:text-cyan-dark">
                  {c.ctaLabel ?? 'Learn More'} <span aria-hidden>→</span>
                </Link>
              )}
            </article>
          ))}
        </div>

        {/* SCHEDULE CARD — overlaps program/gallery */}
        <div className="relative z-10 mx-auto mt-9 max-w-[600px] -mb-12 sm:-mb-14">
          <div className="bg-white rounded-xl shadow-card p-5 sm:p-[22px_26px]">
            <div className="eyebrow mb-3 block">Upcoming Schedule</div>
            {events.docs.length === 0 ? (
              <p className="text-muted text-sm">No upcoming matches scheduled yet. Check back soon.</p>
            ) : (
              <ul>
                {events.docs.map((e, idx) => {
                  const d = parseDate(e.date.slice(0, 10));
                  return (
                    <li
                      key={e.id}
                      className={`grid grid-cols-[32px_auto_1fr_auto] sm:grid-cols-[32px_60px_1fr_auto_auto] items-center gap-3 sm:gap-3.5 py-2.5 text-text-navy ${idx > 0 ? 'border-t border-[#EEF2F7]' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-cyan text-white flex items-center justify-center">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" />
                        </svg>
                      </div>
                      <div className="text-[15px] font-bold">{shortMo(d.getMonth())} {pad(d.getDate())}</div>
                      <div className="min-w-0">
                        <div className="text-[14px] truncate">{e.title}</div>
                        {e.location && (
                          <div className="text-[12px] text-muted inline-flex items-center gap-1.5 mt-0.5">
                            <svg viewBox="0 0 24 24" width="11" height="11" className="text-cyan shrink-0" fill="currentColor"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>
                            <span className="truncate">{e.location}</span>
                          </div>
                        )}
                      </div>
                      <span className="hidden sm:inline text-[13px] text-text-navy font-medium text-right">{e.time}</span>
                      <span className="hidden sm:inline text-[#B7C2D2] text-base text-center">›</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex justify-center mt-5">
              <ButtonLink href="/schedule" variant="cyan">View Full Schedule →</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY STRIP */}
      {photos.docs.length > 0 && (
        <section className="bg-off-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 pt-20 sm:pt-24 pb-10">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="eyebrow whitespace-nowrap">Match Highlights</div>
            <Link href="/gallery" className="text-cyan text-[13px] font-bold tracking-widest uppercase inline-flex items-center gap-1.5 whitespace-nowrap">
              View Gallery <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {photos.docs.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="rounded-[10px] bg-cover bg-center aspect-[132/92] shadow-soft"
                style={{ backgroundImage: typeof p.url === 'string' ? `url(${p.url})` : undefined }}
                role="img"
                aria-label={p.alt ?? p.caption ?? ''}
              />
            ))}
          </div>
        </section>
      )}

      {/* TESTIMONIAL */}
      {homepage.testimonialQuote && (
        <section
          className="relative px-5 sm:px-12 md:px-14 py-10 sm:py-12 overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #E6EEF8 0%, #DDE7F4 100%)' }}
        >
          <div
            aria-hidden
            className="absolute right-0 top-0 bottom-0 w-[280px] sm:w-[380px] opacity-[.18] pointer-events-none"
            style={{ background: "url('/images/quote-ghost.png') right center/contain no-repeat" }}
          />
          <div className="relative max-w-[680px] pl-2 sm:pl-20">
            <div className="text-cyan font-serif text-[64px] sm:text-[88px] leading-[.6] font-bold">&ldquo;</div>
            <p className="text-[18px] sm:text-[22px] leading-[1.4] font-medium text-text-navy mt-2">
              {homepage.testimonialQuote}
            </p>
            <div className="mt-4 text-cyan text-[14px] font-semibold">
              — {homepage.testimonialAuthor}{homepage.testimonialRole ? ` · ${homepage.testimonialRole}` : ''}
            </div>
          </div>
        </section>
      )}

      <CtaStrip heading="Join the Legacy." accent="Become a Lion." buttonLabel="Join the Lions" />
    </>
  );
};

export default HomePage;
