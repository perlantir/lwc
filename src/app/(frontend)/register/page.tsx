import { getPayload } from 'payload';
import config from '@payload-config';
import { PageBanner } from '@/components/PageBanner';
import { RegisterForm } from '@/components/RegisterForm';

export const revalidate = 600;
export const metadata = { title: 'Register' };

const RegisterPage = async () => {
  const payload = await getPayload({ config });
  const page = await payload.findGlobal({ slug: 'register-page' });
  const requirements = (page.requirements ?? []) as Array<{ item?: string }>;

  return (
    <>
      <PageBanner
        eyebrow={page.bannerEyebrow ?? 'Join the Lions'}
        title={page.bannerTitle ?? 'Register a wrestler'}
        body={page.bannerBody ?? undefined}
        crumbs={[{ label: 'Home', href: '/' }, { label: page.bannerEyebrow ?? 'Register' }]}
      />
      <section className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-10 grid gap-10 md:grid-cols-[1fr_300px]">
        <div>
          <h2 className="text-2xl font-extrabold text-navy">{page.formHeading ?? 'Wrestler Registration'}</h2>
          <div className="mt-6">
            <RegisterForm />
          </div>
        </div>
        <aside className="space-y-6">
          {page.feesBody && (
            <div className="bg-white border border-border rounded-2xl p-5 shadow-soft">
              <h3 className="font-extrabold text-navy">Fees</h3>
              <p className="text-sm text-text-navy/80 mt-2 leading-6">{page.feesBody}</p>
            </div>
          )}
          {requirements.length > 0 && (
            <div className="bg-white border border-border rounded-2xl p-5 shadow-soft">
              <h3 className="font-extrabold text-navy">What to bring</h3>
              <ul className="text-sm text-text-navy/80 mt-3 space-y-1.5">
                {requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cyan mt-1 shrink-0" aria-hidden>
                      <path d="M5 12l5 5L20 7" />
                    </svg>
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
