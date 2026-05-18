import { getPayload } from 'payload';
import config from '@payload-config';
import { PageBanner } from '@/components/PageBanner';
import { CtaStrip } from '@/components/CtaStrip';

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
      <PageBanner
        eyebrow={page.bannerEyebrow ?? 'Gallery'}
        title={page.bannerTitle ?? 'Lions in action'}
        body={page.bannerBody ?? undefined}
        crumbs={[{ label: 'Home', href: '/' }, { label: page.bannerEyebrow ?? 'Gallery' }]}
      />

      {videoId && (
        <section className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 pt-10">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-soft border border-border">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title="Featured Lions video"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </section>
      )}

      <section className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-10">
        {photos.docs.length === 0 ? (
          <p className="text-muted">{page.emptyMessage}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.docs.map((p) => (
              <figure
                key={p.id}
                className="rounded-xl overflow-hidden bg-border aspect-[4/3] relative"
                style={{
                  backgroundImage: typeof p.url === 'string' ? `url(${p.url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                role="img"
                aria-label={p.alt ?? p.caption ?? ''}
              >
                {p.caption && (
                  <figcaption className="sr-only">{p.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <a
            href="mailto:lionswrestling@dmcschools.org?subject=Photo%20submission"
            className="btn btn-outline"
          >
            Submit Photos
          </a>
        </div>
      </section>

      <CtaStrip />
    </>
  );
};

export default GalleryPage;
