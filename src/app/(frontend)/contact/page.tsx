import { getPayload } from 'payload';
import config from '@payload-config';
import Link from 'next/link';
import { CtaStrip } from '@/components/CtaStrip';
import { ContactForm } from '@/components/ContactForm';
import { mediaUrl, type MediaRef } from '@/lib/media';
import { EditableText } from '@/components/inline/EditableText';
import { EditableImage } from '@/components/inline/EditableImage';

export const revalidate = 600;
export const metadata = { title: 'Contact' };

const ContactPage = async () => {
  const payload = await getPayload({ config });
  const [page, footerCfg] = await Promise.all([
    payload.findGlobal({ slug: 'contact-page' }),
    payload.findGlobal({ slug: 'footer' }),
  ]);
  const faqs = (page.faqs ?? []) as Array<{ question?: string; answer?: string }>;

  return (
    <>
      <EditableImage globalSlug="contact-page" fieldPath="bannerImage" className="block"><section
        className="relative text-white overflow-hidden"
        style={{
          background: `linear-gradient(180deg, rgba(6,27,58,.6) 0%, rgba(6,27,58,.85) 100%), url('${mediaUrl(page.bannerImage as MediaRef, '/images/hero-bg.jpg', 'feature')}') center/cover no-repeat, #061B3A`,
        }}
      >
        <div className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-12 sm:py-14 max-w-[820px]">
          <div className="text-[12px] text-white/55 mb-4 tracking-wide">
            <Link href="/" className="text-cyan">Home</Link> <span className="text-white/30 mx-1.5">/</span> {page.bannerEyebrow ?? 'Contact'}
          </div>
          <h1 className="text-[34px] sm:text-[44px] md:text-[52px] font-extrabold leading-[1.05] tracking-tight" style={{ textShadow: '0 4px 24px rgba(0,0,0,.4)' }}>
            {page.bannerTitle ?? "Let's talk wrestling."}
          </h1>
          {page.bannerBody && (
            <EditableText as="p" globalSlug="contact-page" fieldPath="bannerBody" value={page.bannerBody ?? ''} multiline className="mt-4 max-w-[660px] text-white/80 text-[15px] sm:text-base leading-relaxed block" />
          )}
        </div>
      </section></EditableImage>

      <section className="bg-off-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-12 grid gap-8 md:gap-10 md:grid-cols-[1fr_320px] max-w-[1200px] mx-auto">
        <div>
          <div className="eyebrow">Direct Line</div>
          <h2 className="text-[22px] sm:text-[26px] font-extrabold text-navy mt-1 tracking-tight">{page.formHeading ?? 'Tell us about you'}</h2>
          <p className="text-muted text-sm mt-1">All fields marked required. We&apos;ll route your note to the right coach.</p>
          <div className="mt-6 bg-white rounded-xl border border-border p-5 sm:p-6 shadow-soft">
            <ContactForm />
          </div>
        </div>
        <aside className="space-y-5">
          <div className="bg-navy text-white rounded-xl p-5 shadow-card">
            <h3 className="font-extrabold text-white text-[15px]">Reach us directly</h3>
            <ul className="text-[13px] text-white/85 mt-3 space-y-2.5">
              {footerCfg.address && (
                <li className="flex items-start gap-2.5">
                  <svg viewBox="0 0 24 24" width="14" height="14" className="text-cyan shrink-0 mt-0.5" fill="currentColor"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>
                  <span>{footerCfg.address}</span>
                </li>
              )}
              {footerCfg.phone && (
                <li className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" width="14" height="14" className="text-cyan shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5c0-1 1-2 2-2h2l2 5-2 1c1 3 3 5 6 6l1-2 5 2v2c0 1-1 2-2 2-9 0-16-7-16-16z" /></svg>
                  <a href={`tel:${footerCfg.phone.replace(/[^0-9+]/g, '')}`}>{footerCfg.phone}</a>
                </li>
              )}
              {footerCfg.email && (
                <li className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" width="14" height="14" className="text-cyan shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
                  <a href={`mailto:${footerCfg.email}`} className="break-all">{footerCfg.email}</a>
                </li>
              )}
            </ul>
          </div>
          <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
            <h3 className="font-extrabold text-navy text-[15px]">Faster answers</h3>
            <p className="text-[13px] text-muted mt-2 leading-5">
              For practice times and season calendar, see the{' '}
              <Link href="/schedule" className="text-cyan font-semibold">Schedule</Link> page or subscribe to our ICS feed.
            </p>
          </div>
        </aside>
      </section>

      {faqs.length > 0 && (
        <section className="bg-off-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 pb-14">
          <div className="max-w-[820px] mx-auto">
            <div className="text-center">
              <div className="eyebrow">Quick Answers</div>
              <h2 className="text-[22px] sm:text-[26px] font-extrabold text-navy mt-1 tracking-tight">{page.faqHeading ?? 'Frequently asked'}</h2>
            </div>
            <div className="mt-6 space-y-2.5">
              {faqs.map((f, i) => (
                <details key={i} className="bg-white border border-border rounded-xl p-4 group">
                  <summary className="cursor-pointer font-semibold text-navy text-[14px] flex items-center justify-between list-none">
                    <span>{f.question}</span>
                    <span className="text-cyan transition group-open:rotate-45 text-xl leading-none">+</span>
                  </summary>
                  <p className="text-[14px] text-text-navy/80 mt-3 leading-6">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaStrip />
    </>
  );
};

export default ContactPage;
