import { getPayload } from 'payload';
import config from '@payload-config';
import Link from 'next/link';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { CtaStrip } from '@/components/CtaStrip';
import { mediaUrl, type MediaRef } from '@/lib/media';
import { EditableText } from '@/components/inline/EditableText';
import { EditableImage } from '@/components/inline/EditableImage';

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
  const heroBg = mediaUrl(page.bannerImage as MediaRef, '/images/hero-bg.jpg', 'feature');
  const storyImg = mediaUrl(page.storyImage as MediaRef, '/images/mission-photo.jpg', 'feature');

  return (
    <>
      {/* HERO */}
      <EditableImage globalSlug="about-page" fieldPath="bannerImage" className="block"><section
        className="relative text-white overflow-hidden"
        style={{
          background: `linear-gradient(180deg, rgba(6,27,58,.6) 0%, rgba(6,27,58,.85) 100%), url('${heroBg}') center/cover no-repeat, #061B3A`,
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
            <EditableText as="p" globalSlug="about-page" fieldPath="bannerBody" value={page.bannerBody ?? ''} multiline className="mt-4 max-w-[660px] text-white/80 text-[15px] sm:text-base leading-relaxed block" />
          )}
        </div>
      </section></EditableImage>

      {/* STATS STRIP */}
      {/* MISSION STATEMENT */}
      {(page as { missionBody?: string }).missionBody && (
        <section className="bg-off-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-12 sm:py-16 text-center">
          <div className="max-w-[780px] mx-auto">
            <EditableText
              as="div"
              globalSlug="about-page"
              fieldPath="missionEyebrow"
              value={(page as { missionEyebrow?: string }).missionEyebrow ?? 'Our Mission'}
              className="eyebrow"
            />
            {(page as { missionHeading?: string }).missionHeading && (
              <EditableText
                as="h2"
                globalSlug="about-page"
                fieldPath="missionHeading"
                value={(page as { missionHeading?: string }).missionHeading ?? ''}
                className="text-[26px] sm:text-[30px] font-extrabold mt-2 tracking-tight block"
              />
            )}
            <EditableText
              as="p"
              globalSlug="about-page"
              fieldPath="missionBody"
              value={(page as { missionBody?: string }).missionBody ?? ''}
              multiline
              className="mt-4 text-[20px] sm:text-[24px] leading-[1.4] font-medium text-text-navy block"
            />
          </div>
        </section>
      )}

      {stats.length > 0 && (
        <section className="bg-navy text-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-8 border-t border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-[1100px] mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <EditableText
                  as="div"
                  globalSlug="about-page"
                  fieldPath={`stats.${i}.value`}
                  value={s.value}
                  className="text-cyan text-[34px] sm:text-[44px] font-extrabold leading-none block"
                />
                <EditableText
                  as="div"
                  globalSlug="about-page"
                  fieldPath={`stats.${i}.label`}
                  value={s.label}
                  className="text-white/70 text-[12px] sm:text-[13px] font-medium mt-2 tracking-wide uppercase block"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* STORY */}
      <section className="bg-off-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-12 sm:py-16 grid gap-8 md:gap-12 md:grid-cols-[1fr_360px] items-start">
        <div>
          <EditableText as="div" globalSlug="about-page" fieldPath="storyEyebrow" value={page.storyEyebrow ?? 'Our Story'} className="eyebrow" />
          <EditableText as="h2" globalSlug="about-page" fieldPath="storyHeading" value={page.storyHeading} className="text-[26px] sm:text-[30px] md:text-[34px] font-extrabold mt-2 leading-tight tracking-tight block" />
          {storyParas.map((p, i) => (
            <EditableText
              key={i}
              as="p"
              globalSlug="about-page"
              fieldPath={`storyParagraphs.${i}.text`}
              value={p.text}
              multiline
              className="mt-4 text-text-navy/85 text-[15px] leading-7 max-w-[620px] block"
            />
          ))}
        </div>
        <div className="relative">
          <EditableImage globalSlug="about-page" fieldPath="storyImage" className="block">
            <div
              className="rounded-xl bg-cover bg-center w-full aspect-[360/280] shadow-card"
              style={{ backgroundImage: `url('${storyImg}')` }}
            />
          </EditableImage>
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur px-4 py-3 rounded-lg shadow-soft">
            <EditableText as="div" globalSlug="about-page" fieldPath="storyBadgeBig" value={page.storyBadgeBig ?? 'Est. 2002'} className="text-navy text-[18px] font-extrabold leading-tight block" />
            <EditableText as="div" globalSlug="about-page" fieldPath="storyBadgeSmall" value={page.storyBadgeSmall ?? 'Des Moines Christian'} className="text-muted text-[11px] tracking-wide block" />
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-off-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 pb-14">
        <div className="text-center">
          <EditableText as="div" globalSlug="about-page" fieldPath="valuesEyebrow" value={page.valuesEyebrow ?? 'Three Pillars'} className="eyebrow" />
          <EditableText as="h2" globalSlug="about-page" fieldPath="valuesHeading" value={page.valuesHeading ?? 'What we stand for'} className="text-[26px] sm:text-[30px] font-extrabold mt-2 tracking-tight block" />
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
              <EditableText as="h3" globalSlug="about-page" fieldPath={`values.${i}.title`} value={v.title} className="font-extrabold text-navy text-lg mt-4 block" />
              {v.verse && (
                <EditableText as="div" globalSlug="about-page" fieldPath={`values.${i}.verse`} value={v.verse} className="text-cyan text-[12px] font-semibold tracking-widest uppercase mt-1 block" />
              )}
              <EditableText as="p" globalSlug="about-page" fieldPath={`values.${i}.body`} value={v.body} multiline className="text-text-navy/75 text-sm mt-3 leading-6 block" />
            </article>
          ))}
        </div>
      </section>

      {/* COACHING STAFF — dark navy */}
      <section className="bg-navy text-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-14">
        <div className="text-center">
          <EditableText as="div" globalSlug="about-page" fieldPath="staffEyebrow" value={page.staffEyebrow ?? 'Coaching Staff'} className="eyebrow" />
          <EditableText as="h2" globalSlug="about-page" fieldPath="staffHeading" value={page.staffHeading ?? 'The men in the corner'} className="text-[26px] sm:text-[30px] font-extrabold mt-2 tracking-tight block" />
        </div>
        {coaches.docs.length === 0 ? (
          <p className="mt-8 text-white/65 text-center">{page.staffEmptyMessage}</p>
        ) : (
          <div
            className={`grid gap-5 mt-8 mx-auto ${
              coaches.docs.length === 1
                ? 'max-w-[420px]'
                : coaches.docs.length === 2
                  ? 'sm:grid-cols-2 max-w-[820px]'
                  : 'sm:grid-cols-2 lg:grid-cols-3 max-w-[1100px]'
            }`}
          >
            {coaches.docs.map((c) => {
              const photoUrl = mediaUrl(c.photo as MediaRef, '/images/mission-photo.jpg', 'feature');
              return (
              <article key={c.id} className="rounded-xl overflow-hidden bg-white/[.04] border border-white/[.08]">
                <div className="aspect-[3/2] bg-deep-navy bg-cover bg-center" style={{ backgroundImage: `url('${photoUrl}')` }} />
                <div className="p-5">
                  {c.role && <EditableText as="div" collectionSlug="coaches" docId={c.id} fieldPath="role" value={c.role} className="text-cyan text-[11px] font-bold tracking-widest uppercase block" />}
                  <EditableText as="h3" collectionSlug="coaches" docId={c.id} fieldPath="name" value={c.name} className="font-extrabold text-white text-[17px] mt-1 block" />
                  {c.bio && (
                    <div className="text-white/75 text-[13px] mt-2 leading-5 prose prose-sm prose-invert max-w-none">
                      <RichText data={c.bio as Parameters<typeof RichText>[0]['data']} />
                    </div>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="text-cyan text-[13px] mt-3 inline-block">
                      <EditableText as="span" collectionSlug="coaches" docId={c.id} fieldPath="email" value={c.email} />
                    </a>
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

export default AboutPage;
