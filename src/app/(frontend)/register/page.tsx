import { PageBanner } from '@/components/PageBanner';
import { RegisterForm } from '@/components/RegisterForm';

export const metadata = { title: 'Register' };

const RegisterPage = () => (
  <>
    <PageBanner
      eyebrow="Join the Lions"
      title="Register a wrestler"
      body="One form, one minute. We follow up within 3 business days with practice times, gear info, and your welcome packet."
      crumbs={[{ label: 'Home', href: '/' }, { label: 'Register' }]}
    />
    <section className="px-6 md:px-14 py-10">
      <RegisterForm />
    </section>
  </>
);

export default RegisterPage;
