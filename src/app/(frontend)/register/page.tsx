import { getPayload } from 'payload';
import config from '@payload-config';
import Link from 'next/link';
import { RegisterForm } from '@/components/RegisterForm';

export const revalidate = 600;
export const metadata = { title: 'Register' };

const RegisterPage = async () => {
  const payload = await getPayload({ config });
  const page = await payload.findGlobal({ slug: 'register-page' });
  const requirements = (page.requirements ?? []) as Array<{ item?: string }>;

  return (
    <>
      <section
        className="relative text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,27,58,.6) 0%, rgba(6,27,58,.85) 100%), url('/images/hero-bg.jpg') center/cover no-repeat, #061B3A",
        }}
      >
        <div className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-12 sm:py-14 max-w-[820px]">
          <div className="text-[12px] text-white/55 mb-4 tracking-wide">
            <Link href="/" className="text-cyan">Home</Link> <span className="text-white/30 mx-1.5">/</span> {page.bannerEyebrow ?? 'Register'}
          </div>
          <h1 className="text-[34px] sm:text-[44px] md:text-[52px] font-extrabold leading-[1.05] tracking-tight" style={{ textShadow: '0 4px 24px rgba(0,0,0,.4)' }}>
            {page.bannerTitle ?? 'Join the Lions'}
          </h1>
          {page.bannerBody && (
            <p className="mt-4 max-w-[660px] text-white/80 text-[15px] sm:text-base leading-relaxed">
              {page.bannerBody}
            </p>
          )}
        </div>
      </section>

      <section className="bg-off-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-12 grid gap-8 md:gap-10 md:grid-cols-[1fr_320px] max-w-[1200px] mx-auto">
        <div>
          <div className="eyebrow">Step 1 of 1</div>
          <h2 className="text-[22px] sm:text-[26px] font-extrabold text-navy mt-1 tracking-tight">{page.formHeading ?? 'Wrestler Registration'}</h2>
          <p className="text-muted text-sm mt-1">Takes about 2 minutes. A coach replies within 3 business days.</p>
          <div className="mt-6 bg-white rounded-xl border border-border p-5 sm:p-6 shadow-soft">
            <RegisterForm />
          </div>
        </div>
        <aside className="space-y-5">
          {page.feesBody && (
            <div className="bg-navy text-white rounded-xl p-5 shadow-card">
              <h3 className="font-extrabold text-white text-[15px] inline-flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="14" height="14" className="text-cyan" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M9 9.5h6M9 14.5h6" /></svg>
                Fees
              </h3>
              <p className="text-[13px] text-white/85 mt-2 leading-6">{page.feesBody}</p>
            </div>
          )}
          {requirements.length > 0 && (
            <div className="bg-white border border-border rounded-xl p-5 shadow-soft">
              <h3 className="font-extrabold text-navy text-[15px] inline-flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="14" height="14" className="text-cyan" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>
                What to bring
              </h3>
              <ul className="text-[13px] text-text-navy/85 mt-3 space-y-1.5">
                {requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg viewBox="0 0 24 24" width="12" height="12" className="text-cyan mt-1 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>
                    <span>{r.item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>
    </>
  );
};

export default RegisterPage;
