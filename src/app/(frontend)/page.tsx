import Link from 'next/link';
import { getPayload } from 'payload';
import config from '@payload-config';
import { CtaStrip } from '@/components/CtaStrip';
import { ButtonLink } from '@/components/Button';
import { mediaUrl, type MediaRef } from '@/lib/media';
import { EditableText } from '@/components/inline/EditableText';
import { EditableImage } from '@/components/inline/EditableImage';

export const revalidate = 600;

const HomePage = async () => {
  const payload = await getPayload({ config });
  const homepage = await payload.findGlobal({ slug: 'homepage' });
  const heroBgUrl = mediaUrl(homepage.heroBackgroundImage as MediaRef, '/images/hero-bg.jpg', 'feature');
  const missionPhotoUrl = mediaUrl(homepage.missionPhoto as MediaRef, '/images/mission-photo.jpg', 'feature');

  return (
    <>
      {/* HERO */}
      <EditableImage globalSlug="homepage" fieldPath="heroBackgroundImage" className="block">
        <section
          className="relative text-white overflow-hidden min-h-[520px] md:min-h-[560px]"
          style={{
            background: `linear-gradient(180deg, rgba(6,27,58,.35) 0%, rgba(6,27,58,.35) 50%, rgba(6,27,58,.75) 100%), url('${heroBgUrl}') center/cover no-repeat, #061B3A`,
          }}
        >
          <div
            aria-hidden="true"
            className="absolute -right-12 top-6 w-[240px] h-[240px] sm:-right-16 sm:top-10 sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] opacity-20 pointer-events-none"
            style={{ background: "url('/logos/lion-head-blue-transparent.png') center/contain no-repeat" }}
          />
          <div className="relative z-10 pt-16 sm:pt-20 md:pt-[78px] pb-28 text-center px-5">
            <EditableText
              as="h1"
              globalSlug="homepage"
              fieldPath="heroHeading"
              value={homepage.heroHeading ?? 'Lions Wrestling Club'}
              multiline
              className="font-extrabold tracking-tight whitespace-pre-line"
              style={{
                fontSize: 'clamp(36px, 7vw, 60px)',
                lineHeight: 'clamp(42px, 7.5vw, 70px)',
                textShadow: '0 4px 24px rgba(0,0,0,.4)',
              }}
            />
            {(homepage as { heroAttribution?: string }).heroAttribution && (
              <EditableText
                as="p"
                globalSlug="homepage"
                fieldPath="heroAttribution"
                value={(homepage as { heroAttribution?: string }).heroAttribution ?? ''}
                className="mt-1 text-white/85 italic text-[14px] sm:text-[16px] block"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,.5)' }}
              />
            )}
            {homepage.heroSubheading && (
              <EditableText
                as="p"
                globalSlug="homepage"
                fieldPath="heroSubheading"
                value={homepage.heroSubheading}
                multiline
                className="mt-2 font-medium max-w-[720px] mx-auto"
                style={{
                  fontSize: 'clamp(15px, 1.6vw, 22px)',
                  textShadow: '0 2px 12px rgba(0,0,0,.5)',
                  color: 'rgba(255,255,255,.92)',
                }}
              />
            )}
          {homepage.heroPrimaryCtaLabel && (
            <div className="mt-6">
              <ButtonLink href={homepage.heroPrimaryCtaHref ?? 'https://www.dmcsevents.com'} variant="cyan" size="lg">
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

        </section>
      </EditableImage>

      {/* MISSION */}
      <section className="bg-off-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-10 sm:py-14 grid gap-8 md:gap-12 md:grid-cols-2 items-center">
        <div>
          <div className="eyebrow">Our Mission</div>
          <EditableText
            as="h2"
            globalSlug="homepage"
            fieldPath="missionHeading"
            value={homepage.missionHeading ?? 'Building Champions On and Off the Mat'}
            className="text-[28px] md:text-[30px] leading-[1.15] font-extrabold mt-3 tracking-tight block"
          />
          <EditableText
            as="p"
            globalSlug="homepage"
            fieldPath="missionBody"
            value={homepage.missionBody ?? 'We develop student-athletes who strive for excellence in wrestling and in life. Through faith, discipline, and dedication, we prepare our athletes to lead with integrity.'}
            multiline
            className="mt-4 text-[14px] leading-[22px] text-[#3F4E62] max-w-[420px] block"
          />
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
        <EditableImage globalSlug="homepage" fieldPath="missionPhoto" className="block">
          <div
            aria-label="Coach with wrestlers"
            className="rounded-xl bg-cover bg-center w-full shadow-card aspect-[380/270]"
            style={{ backgroundImage: `url('${missionPhotoUrl}')` }}
          />
        </EditableImage>
      </section>

      {/* PROGRAM — dark navy */}
      <section className="relative bg-navy text-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 pt-12 pb-16 overflow-hidden">
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
        <div
          className={`mt-7 grid gap-4 relative justify-center ${
            ((homepage.programCards as unknown[]) ?? []).length === 1
              ? 'sm:grid-cols-1 max-w-[420px] mx-auto'
              : ((homepage.programCards as unknown[]) ?? []).length === 2
                ? 'sm:grid-cols-2 max-w-[820px] mx-auto'
                : 'sm:grid-cols-2 md:grid-cols-3'
          }`}
        >
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
              <EditableText
                as="h3"
                globalSlug="homepage"
                fieldPath={`programCards.${i}.title`}
                value={c.title}
                className="font-bold text-[17px] text-white block"
              />
              {c.ageRange && (
                <EditableText
                  as="div"
                  globalSlug="homepage"
                  fieldPath={`programCards.${i}.ageRange`}
                  value={c.ageRange}
                  className="text-cyan/90 text-[11px] font-bold tracking-widest mt-1 uppercase block"
                />
              )}
              <EditableText
                as="p"
                globalSlug="homepage"
                fieldPath={`programCards.${i}.body`}
                value={c.body}
                multiline
                className="text-white/75 text-[13px] leading-[19px] mt-2 block"
              />
              {c.ctaHref && (
                <Link href={c.ctaHref} className="inline-flex items-center gap-1 mt-4 text-cyan text-[13px] font-semibold hover:text-cyan-dark">
                  {c.ctaLabel ?? 'Learn More'} <span aria-hidden>→</span>
                </Link>
              )}
            </article>
          ))}
        </div>

        <div className="relative z-10 flex justify-center mt-9">
          <ButtonLink href="/schedule" variant="cyan">View Full Schedule →</ButtonLink>
        </div>
      </section>

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
            <div className="text-[18px] sm:text-[22px] leading-[1.4] font-medium text-text-navy mt-2">
              <span aria-hidden>&ldquo;</span>
              <EditableText as="span" globalSlug="homepage" fieldPath="testimonialQuote" value={homepage.testimonialQuote} multiline />
              <span aria-hidden>&rdquo;</span>
            </div>
            <div className="mt-4 text-cyan text-[14px] font-semibold flex flex-wrap gap-1">
              <span>—</span>
              <EditableText as="span" globalSlug="homepage" fieldPath="testimonialAuthor" value={homepage.testimonialAuthor ?? ''} />
              {homepage.testimonialRole && <>
                <span>·</span>
                <EditableText as="span" globalSlug="homepage" fieldPath="testimonialRole" value={homepage.testimonialRole} />
              </>}
            </div>
          </div>
        </section>
      )}

      <CtaStrip heading="Join the Legacy." accent="Become a Lion." buttonLabel="Register Here" />
    </>
  );
};

export default HomePage;
