import { getPayload } from 'payload';
import config from '@payload-config';
import Link from 'next/link';
import { CtaStrip } from '@/components/CtaStrip';
import { mediaUrl, type MediaRef } from '@/lib/media';
import { EditableText } from '@/components/inline/EditableText';
import { EditableImage } from '@/components/inline/EditableImage';

export const revalidate = 600;
export const metadata = { title: 'Gallery' };

const youtubeId = (url: string): string | null => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  return m?.[1] ?? null;
};

const GalleryPage = async () => {
  const payload = await getPayload({ config });
  const [page, settings, photos] = await Promise.all([
    payload.findGlobal({ slug: 'gallery-page' }),
    payload.findGlobal({ slug: 'site-settings' }),
    payload.find({ collection: 'photos', sort: '-date', limit: 60 }),
  ]);

  const videoUrl = page.featuredVideoUrl ?? settings.featuredVideoUrl;
  const videoId = videoUrl ? youtubeId(videoUrl) : null;

  return (
    <>
      <EditableImage globalSlug="gallery-page" fieldPath="bannerImage" className="block"><section
        className="relative text-white overflow-hidden"
        style={{
          background: `linear-gradient(180deg, rgba(6,27,58,.6) 0%, rgba(6,27,58,.85) 100%), url('${mediaUrl(page.bannerImage as MediaRef, '/images/hero-bg.jpg', 'feature')}') center/cover no-repeat, #061B3A`,
        }}
      >
        <div className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-12 sm:py-14 max-w-[820px]">
          <div className="text-[12px] text-white/55 mb-4 tracking-wide">
            <Link href="/" className="text-cyan">Home</Link> <span className="text-white/30 mx-1.5">/</span> {page.bannerEyebrow ?? 'Gallery'}
          </div>
          <EditableText as="h1" globalSlug="gallery-page" fieldPath="bannerTitle" value={page.bannerTitle ?? 'Mat Stories. Captured.'} className="text-[34px] sm:text-[44px] md:text-[52px] font-extrabold leading-[1.05] tracking-tight block" style={{ textShadow: '0 4px 24px rgba(0,0,0,.4)' }} />
          {page.bannerBody && (
            <EditableText as="p" globalSlug="gallery-page" fieldPath="bannerBody" value={page.bannerBody ?? ''} multiline className="mt-4 max-w-[660px] text-white/80 text-[15px] sm:text-base leading-relaxed block" />
          )}
        </div>
      </section></EditableImage>

      {videoId && (
        <section className="bg-off-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 pt-12">
          <div className="max-w-[1100px] mx-auto">
            <div className="eyebrow mb-3">Featured Video</div>
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-card border border-border bg-navy">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title="Featured Lions video"
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </section>
      )}

      <section className="bg-off-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-12">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
            <div>
              <EditableText as="div" globalSlug="gallery-page" fieldPath="bannerEyebrow" value={page.bannerEyebrow ?? 'From the Mat'} className="eyebrow" />
              <EditableText as="h2" globalSlug="gallery-page" fieldPath="bannerTitle" value={page.bannerTitle ?? 'Recent uploads'} className="text-[22px] sm:text-[26px] font-extrabold mt-1 tracking-tight block" />
            </div>
            <a
              href="mailto:lionswrestling@dmcschools.org?subject=Photo%20submission"
              className="text-cyan text-[13px] font-bold tracking-widest uppercase inline-flex items-center gap-1.5"
            >
              Submit a photo <span aria-hidden>→</span>
            </a>
          </div>
          {photos.docs.length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-12 text-center shadow-soft">
              <p className="text-muted">{page.emptyMessage}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {photos.docs.map((p) => (
                <figure
                  key={p.id}
                  className="rounded-xl overflow-hidden bg-border aspect-[4/3] relative shadow-soft"
                  style={{
                    backgroundImage: typeof p.url === 'string' ? `url(${p.url})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  role="img"
                  aria-label={p.alt ?? p.caption ?? ''}
                >
                  {p.caption && <figcaption className="sr-only">{p.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaStrip />
    </>
  );
};

export default GalleryPage;
