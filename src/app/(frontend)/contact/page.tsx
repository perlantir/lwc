import { PageBanner } from '@/components/PageBanner';
import { CtaStrip } from '@/components/CtaStrip';
import { ContactForm } from '@/components/ContactForm';

export const metadata = { title: 'Contact' };

const faqs = [
  {
    q: 'When does the season start?',
    a: 'The Lions wrestling season runs late October through February. Off-season clinics happen in spring and summer.',
  },
  {
    q: 'Do you need experience to join?',
    a: 'Nope. Many of our wrestlers start brand new. Coaches teach safe technique from day one.',
  },
  {
    q: 'What gear do I need?',
    a: "A pair of wrestling shoes and athletic clothing to start. We loan singlets for matches and tournaments.",
  },
  {
    q: 'Are practices co-ed?',
    a: 'Yes — boys and girls train together. We also support girls competing in girls-only divisions.',
  },
];

const ContactPage = () => (
  <>
    <PageBanner
      eyebrow="Contact"
      title="Get in touch with the Lions"
      body="Questions about the program, the season, or how to join? Reach out — a coach replies within a few days."
      crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
    />

    <section className="px-6 md:px-14 py-10 grid gap-10 md:grid-cols-[1fr_300px]">
      <div>
        <h2 className="text-2xl font-extrabold text-navy">Send us a message</h2>
        <p className="text-muted text-sm mt-1">Fields marked are required. We don't share your info.</p>
        <div className="mt-6">
          <ContactForm />
        </div>
      </div>
      <aside className="space-y-6">
        <div className="bg-white border border-border rounded-2xl p-5 shadow-soft">
          <h3 className="font-extrabold text-navy">Lions Wrestling HQ</h3>
          <ul className="text-sm text-text-navy/80 mt-3 space-y-1">
            <li>9730 Woodland</li>
            <li>Cumming, IA 50061</li>
            <li><a href="tel:5158443947" className="text-cyan">515-844-3947</a></li>
            <li><a href="mailto:lionswrestling@dmcschools.org" className="text-cyan">lionswrestling@dmcschools.org</a></li>
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

    <section className="px-6 md:px-14 pb-12">
      <h2 className="text-2xl font-extrabold text-navy">Frequently asked questions</h2>
      <div className="mt-6 space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="bg-white border border-border rounded-xl p-4">
            <summary className="cursor-pointer font-semibold text-navy">{f.q}</summary>
            <p className="text-sm text-text-navy/80 mt-2">{f.a}</p>
          </details>
        ))}
      </div>
    </section>

    <CtaStrip />
  </>
);

export default ContactPage;
