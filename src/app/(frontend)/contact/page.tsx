import { getPayload } from 'payload';
import config from '@payload-config';
import { PageBanner } from '@/components/PageBanner';
import { CtaStrip } from '@/components/CtaStrip';
import { ContactForm } from '@/components/ContactForm';

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
      <PageBanner
        eyebrow={page.bannerEyebrow ?? 'Contact'}
        title={page.bannerTitle ?? 'Get in touch with the Lions'}
        body={page.bannerBody ?? undefined}
        crumbs={[{ label: 'Home', href: '/' }, { label: page.bannerEyebrow ?? 'Contact' }]}
      />

      <section className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-10 grid gap-10 md:grid-cols-[1fr_300px]">
        <div>
          <h2 className="text-2xl font-extrabold text-navy">{page.formHeading ?? 'Send us a message'}</h2>
          <p className="text-muted text-sm mt-1">Fields marked are required. We don&apos;t share your info.</p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
        <aside className="space-y-6">
          <div className="bg-white border border-border rounded-2xl p-5 shadow-soft">
            <h3 className="font-extrabold text-navy">Lions Wrestling HQ</h3>
            <ul className="text-sm text-text-navy/80 mt-3 space-y-1">
              {footerCfg.address && <li>{footerCfg.address}</li>}
              {footerCfg.phone && (
                <li>
                  <a href={`tel:${footerCfg.phone.replace(/[^0-9+]/g, '')}`} className="text-cyan">
                    {footerCfg.phone}
                  </a>
                </li>
              )}
              {footerCfg.email && (
                <li>
                  <a href={`mailto:${footerCfg.email}`} className="text-cyan">
                    {footerCfg.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="bg-white border border-border rounded-2xl p-5 shadow-soft">
            <h3 className="font-extrabold text-navy">Faster answers</h3>
            <p className="text-sm text-muted mt-2">
              For practice times and the season calendar, see the{' '}
              <a href="/schedule" className="text-cyan">Schedule</a> page or subscribe to our public ICS feed.
            </p>
          </div>
        </aside>
      </section>

      {faqs.length > 0 && (
        <section className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 pb-12">
          <h2 className="text-2xl font-extrabold text-navy">{page.faqHeading ?? 'Frequently asked questions'}</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="bg-white border border-border rounded-xl p-4">
                <summary className="cursor-pointer font-semibold text-navy">{f.question}</summary>
                <p className="text-sm text-text-navy/80 mt-2">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <CtaStrip />
    </>
  );
};

export default ContactPage;
