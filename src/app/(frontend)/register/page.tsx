import { getPayload } from 'payload';
import config from '@payload-config';
import Link from 'next/link';
import { mediaUrl, type MediaRef } from '@/lib/media';
import { EditableImage } from '@/components/inline/EditableImage';

export const revalidate = 600;
export const metadata = { title: 'Register' };

const RegisterPage = async () => {
  const payload = await getPayload({ config });
  const page = await payload.findGlobal({ slug: 'register-page' });

  return (
    <>
      <EditableImage globalSlug="register-page" fieldPath="bannerImage" className="block"><section
        className="relative text-white overflow-hidden"
        style={{
          background: `linear-gradient(180deg, rgba(6,27,58,.6) 0%, rgba(6,27,58,.85) 100%), url('${mediaUrl(page.bannerImage as MediaRef, '/images/hero-bg.jpg', 'feature')}') center/cover no-repeat, #061B3A`,
        }}
      >
        <div className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-10 sm:py-12 max-w-[820px]">
          <div className="text-[12px] text-white/55 tracking-wide">
            <Link href="/" className="text-cyan">Home</Link> <span className="text-white/30 mx-1.5">/</span> {page.bannerEyebrow ?? 'Register'}
          </div>
        </div>
      </section></EditableImage>

      <section className="bg-off-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-20 sm:py-28 md:py-32">
        <div className="max-w-[920px] mx-auto text-center">
          <div className="eyebrow">Coming Soon</div>
          <h1
            className="mt-4 font-extrabold tracking-tight text-navy"
            style={{
              fontSize: 'clamp(40px, 8vw, 88px)',
              lineHeight: 1.05,
            }}
          >
            Registrations begin <span className="text-cyan">July 1st</span>.
          </h1>
          <p
            className="mt-6 text-text-navy/80 font-medium"
            style={{ fontSize: 'clamp(18px, 2.4vw, 26px)', lineHeight: 1.4 }}
          >
            Please check back soon!
          </p>
        </div>
      </section>
    </>
  );
};

export default RegisterPage;
