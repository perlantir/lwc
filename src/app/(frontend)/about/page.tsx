import { getPayload } from 'payload';
import config from '@payload-config';
import Link from 'next/link';
import { CtaStrip } from '@/components/CtaStrip';

export const revalidate = 600;
export const metadata = { title: 'About' };

const ICONS = {
  Faith: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8v7M9 11h6" />
    </svg>
  ),
  Discipline: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26" aria-hidden>
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  Excellence: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26" aria-hidden>
      <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2" />
    </svg>
  ),
};

const AboutPage = async () => {
  const payload = await getPayload({ config });
  const [page, coaches] = await Promise.all([
    payload.findGlobal({ slug: 'about-page' }),
    payload.find({ collection: 'coaches', sort: 'order', limit: 50 }),
  ]);

  const stats = (page.stats ?? []) as Array<{ value?: string; label?: string }>;
  const storyParas = (page.storyParagraphs ?? []) as Array<{ text?: string }>;
  const values = (page.values ?? []) as Array<{ title?: string; verse?: string; body?: string }>;

  return (
    <>
      {/* HERO */}
      <section
        className="relative text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,27,58,.6) 0%, rgba(6,27,58,.85) 100%), url('/images/hero-bg.jpg') center/cover no-repeat, #061B3A",
        }}
      >
        <div className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-12 sm:py-16 md:py-20 max-w-[820px]">
          <div className="text-[12px] text-white/55 mb-4 tracking-wide">
            <Link href="/" className="text-cyan">Home</Link> <span className="text-white/30 mx-1.5">/</span> {page.bannerEyebrow ?? 'About'}
          </div>
          <h1 className="text-[34px] sm:text-[44px] md:text-[52px] font-extrabold leading-[1.1] tracking-tight" style={{ textShadow: '0 4px 24px rgba(0,0,0,.4)' }}>
            {(page.bannerTitle ?? '').split(/(?<=\.)\s/).map((line: string, i: number, arr: string[]) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h1>
          {page.bannerBody && (
            <p className="mt-4 max-w-[660px] text-white/80 text-[15px] sm:text-base leading-relaxed">
              {page.bannerBody}
            </p>
          )}
        </div>
      </section>

      {/* STATS STRIP */}
      {stats.length > 0 && (
        <section className="bg-navy text-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-8 border-t border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-[1100px] mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-cyan text-[34px] sm:text-[44px] font-extrabold leading-none">{s.value}</div>
                <div className="text-white/70 text-[12px] sm:text-[13px] font-medium mt-2 tracking-wide uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* STORY */}
      <section className="bg-off-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-12 sm:py-16 grid gap-8 md:gap-12 md:grid-cols-[1fr_360px] items-start">
        <div>
          <div className="eyebrow">{page.storyEyebrow ?? 'Our Story'}</div>
          <h2 className="text-[26px] sm:text-[30px] md:text-[34px] font-extrabold mt-2 leading-tight tracking-tight">
            {page.storyHeading}
          </h2>
          {storyParas.map((p, i) => (
            <p key={i} className="mt-4 text-text-navy/85 text-[15px] leading-7 max-w-[620px]">
              {p.text}
            </p>
          ))}
        </div>
        <div className="relative">
          <div
            className="rounded-xl bg-cover bg-center w-full aspect-[360/280] shadow-card"
            style={{ backgroundImage: "url('/images/mission-photo.jpg')" }}
          />
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur px-4 py-3 rounded-lg shadow-soft">
            <div className="text-navy text-[18px] font-extrabold leading-tight">{page.storyBadgeBig ?? 'Est. 2002'}</div>
            <div className="text-muted text-[11px] tracking-wide">{page.storyBadgeSmall ?? 'Des Moines Christian'}</div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-off-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 pb-14">
        <div className="text-center">
          <div className="eyebrow">{page.valuesEyebrow ?? 'Three Pillars'}</div>
          <h2 className="text-[26px] sm:text-[30px] font-extrabold mt-2 tracking-tight">{page.valuesHeading ?? 'What we stand for'}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3 mt-8 max-w-[1100px] mx-auto">
          {values.map((v, i) => (
            <article
              key={i}
              className="bg-white border border-border rounded-xl p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="w-12 h-12 rounded-full bg-cyan/10 text-cyan flex items-center justify-center">
                {ICONS[v.title as keyof typeof ICONS] ?? ICONS.Faith}
              </div>
              <h3 className="font-extrabold text-navy text-lg mt-4">{v.title}</h3>
              {v.verse && <div className="text-cyan text-[12px] font-semibold tracking-widest uppercase mt-1">{v.verse}</div>}
              <p className="text-text-navy/75 text-sm mt-3 leading-6">{v.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* COACHING STAFF — dark navy */}
      <section className="bg-navy text-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-14">
        <div className="text-center">
          <div className="eyebrow">{page.staffEyebrow ?? 'Coaching Staff'}</div>
          <h2 className="text-[26px] sm:text-[30px] font-extrabold mt-2 tracking-tight">{page.staffHeading ?? 'The men in the corner'}</h2>
        </div>
        {coaches.docs.length === 0 ? (
          <p className="mt-8 text-white/65 text-center">{page.staffEmptyMessage}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-8 max-w-[1100px] mx-auto">
            {coaches.docs.map((c) => (
              <article key={c.id} className="rounded-xl overflow-hidden bg-white/[.04] border border-white/[.08]">
                <div className="aspect-[3/2] bg-deep-navy bg-cover bg-center" style={{ backgroundImage: "url('/images/mission-photo.jpg')" }} />
                <div className="p-5">
                  {c.role && <div className="text-cyan text-[11px] font-bold tracking-widest uppercase">{c.role}</div>}
                  <h3 className="font-extrabold text-white text-[17px] mt-1">{c.name}</h3>
                  {c.bio && <p className="text-white/70 text-[13px] mt-2 leading-5">{String(c.bio).slice(0, 200)}</p>}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="text-cyan text-[13px] mt-3 inline-block">
                      {c.email}
                    </a>
                  )}
                </div>
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
