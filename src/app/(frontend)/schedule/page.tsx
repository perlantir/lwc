import { getPayload } from 'payload';
import config from '@payload-config';
import { CtaStrip } from '@/components/CtaStrip';
import { mediaUrl, type MediaRef } from '@/lib/media';
import { EditableText } from '@/components/inline/EditableText';
import { EditableImage } from '@/components/inline/EditableImage';

export const revalidate = 300;
export const metadata = { title: 'Schedule' };

const SchedulePage = async () => {
  const payload = await getPayload({ config });
  const page = await payload.findGlobal({ slug: 'schedule-page' });

  return (
    <>
      {/* HERO */}
      <EditableImage globalSlug="schedule-page" fieldPath="bannerImage" className="block">
        <section
          className="relative text-white overflow-hidden"
          style={{
            background: `linear-gradient(180deg, rgba(6,27,58,.6) 0%, rgba(6,27,58,.85) 100%), url('${mediaUrl(page.bannerImage as MediaRef, '/images/hero-bg.jpg', 'feature')}') center/cover no-repeat, #061B3A`,
          }}
        >
          <div className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-12 sm:py-14 max-w-[820px]">
            <div className="text-[12px] text-white/55 mb-4 tracking-wide">
              <a href="/" className="text-cyan">Home</a>{' '}
              <span className="text-white/30 mx-1.5">/</span>{' '}
              {page.bannerEyebrow ?? 'Schedule'}
            </div>
            <EditableText
              as="h1"
              globalSlug="schedule-page"
              fieldPath="bannerTitle"
              value={page.bannerTitle ?? '2026–27 Season Schedule'}
              className="text-[34px] sm:text-[44px] md:text-[52px] font-extrabold leading-[1.05] tracking-tight block"
              style={{ textShadow: '0 4px 24px rgba(0,0,0,.4)' }}
            />
            {page.bannerBody && (
              <EditableText
                as="p"
                globalSlug="schedule-page"
                fieldPath="bannerBody"
                value={page.bannerBody}
                multiline
                className="mt-4 max-w-[660px] text-white/80 text-[15px] sm:text-base leading-relaxed block"
              />
            )}
          </div>
        </section>
      </EditableImage>

      {/* PRACTICE TIME BAR */}
      <div className="bg-navy text-white border-b border-white/10">
        <div className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-3 max-w-[1100px] mx-auto flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan shrink-0">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
            Practice Days: <span className="text-cyan ml-1">Monday &amp; Thursday · 6:00 – 7:30 PM</span>
          </span>
          <a
            href="/LWC-2026-27-Season-Calendar.pdf"
            download
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-cyan text-sm font-semibold transition-colors ml-auto"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </a>
        </div>
      </div>

      {/* PDF CALENDAR */}
      <section className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-10">
        <div className="max-w-[1100px] mx-auto">
          <div className="w-full rounded-xl overflow-hidden border border-border shadow-soft bg-white">
            <iframe
              src="/LWC-2026-27-Season-Calendar.pdf"
              title="2026–27 Season Calendar"
              className="w-full"
              style={{ height: '82vh', minHeight: '640px' }}
            />
          </div>
          <p className="mt-3 text-sm text-muted text-center">
            Calendar not loading?{' '}
            <a href="/LWC-2026-27-Season-Calendar.pdf" download className="text-cyan font-semibold">
              Download the PDF directly
            </a>
          </p>
        </div>
      </section>

      <CtaStrip />
    </>
  );
};

export default SchedulePage;
