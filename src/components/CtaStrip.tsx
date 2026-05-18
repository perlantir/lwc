import { ButtonLink } from './Button';

interface Props {
  heading?: string;
  accent?: string;
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export const CtaStrip = ({
  heading = 'Ready to wrestle?',
  accent = "Let's get on the mat.",
  body = 'Registration is open year-round for all grade levels. Coaches reach out within 3 business days.',
  buttonLabel = 'Register Now',
  buttonHref = '/register',
}: Props) => (
  <section
    className="relative text-white px-5 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-6 md:py-6 flex flex-col gap-5 md:grid md:items-center md:gap-7"
    style={{
      background:
        "linear-gradient(90deg, rgba(6,27,58,.92), rgba(6,27,58,.75)), url('/images/cta-bg.jpg') center/cover no-repeat, #061B3A",
    }}
  >
    <div
      className="hidden md:grid md:items-center md:gap-7 md:col-span-full"
      style={{ gridTemplateColumns: 'minmax(0,260px) 1px 1fr auto' }}
    >
      <h3 className="text-[26px] leading-[32px] font-extrabold">
        {heading}
        <span className="text-cyan block">{accent}</span>
      </h3>
      <div className="w-px h-[60px] bg-white/20" />
      <p className="text-sm leading-5 text-white/85 max-w-[340px]">{body}</p>
      <ButtonLink href={buttonHref} variant="cyan">
        {buttonLabel} →
      </ButtonLink>
    </div>
    <div className="md:hidden">
      <h3 className="text-[22px] leading-[28px] font-extrabold">
        {heading}
        <span className="text-cyan block">{accent}</span>
      </h3>
      <p className="text-sm leading-5 text-white/85 mt-3">{body}</p>
      <div className="mt-4">
        <ButtonLink href={buttonHref} variant="cyan">
          {buttonLabel} →
        </ButtonLink>
      </div>
    </div>
  </section>
);
