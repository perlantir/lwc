import { getPayload } from 'payload';
import config from '@payload-config';
import { ButtonLink } from './Button';
import { EditableText } from './inline/EditableText';
import { EditableImage } from './inline/EditableImage';
import { mediaUrl, type MediaRef } from '@/lib/media';

interface Props {
  /** Override the heading text (still inline-editable; saves to the global). */
  heading?: string;
  accent?: string;
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export const CtaStrip = async ({ heading, accent, body, buttonLabel, buttonHref }: Props = {}) => {
  const payload = await getPayload({ config });
  const cfg = await payload.findGlobal({ slug: 'cta-strip' });

  const h = heading ?? cfg.heading ?? 'Ready to wrestle?';
  const a = accent ?? cfg.accent ?? "Let's get on the mat.";
  const b = body ?? cfg.body ?? 'Registration is open year-round for all grade levels. Coaches reach out within 3 business days.';
  const btnLabel = buttonLabel ?? cfg.buttonLabel ?? 'Register Now';
  const btnHref = buttonHref ?? cfg.buttonHref ?? 'https://www.dmcsevents.com';
  const bgUrl = mediaUrl((cfg as { backgroundImage?: MediaRef }).backgroundImage, '/images/cta-bg.jpg', 'feature');

  return (
    <EditableImage globalSlug="cta-strip" fieldPath="backgroundImage" className="block">
      <section
        className="relative text-white px-5 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-6 md:py-6 flex flex-col gap-5 md:grid md:items-center md:gap-7"
        style={{
          background: `linear-gradient(90deg, rgba(6,27,58,.92), rgba(6,27,58,.75)), url('${bgUrl}') center/cover no-repeat, #061B3A`,
        }}
      >
        <div
          className="hidden md:grid md:items-center md:gap-7 md:col-span-full"
          style={{ gridTemplateColumns: 'minmax(0,260px) 1px 1fr auto' }}
        >
          <h3 className="text-[26px] leading-[32px] font-extrabold">
            <EditableText as="span" globalSlug="cta-strip" fieldPath="heading" value={h} />
            <EditableText as="span" globalSlug="cta-strip" fieldPath="accent" value={a} className="text-cyan block" />
          </h3>
          <div className="w-px h-[60px] bg-white/20" />
          <EditableText as="p" globalSlug="cta-strip" fieldPath="body" value={b} multiline className="text-sm leading-5 text-white/85 max-w-[340px] block" />
          <ButtonLink href={btnHref} variant="cyan">
            <EditableText as="span" globalSlug="cta-strip" fieldPath="buttonLabel" value={btnLabel} /> →
          </ButtonLink>
        </div>
        <div className="md:hidden">
          <h3 className="text-[22px] leading-[28px] font-extrabold">
            <EditableText as="span" globalSlug="cta-strip" fieldPath="heading" value={h} />
            <EditableText as="span" globalSlug="cta-strip" fieldPath="accent" value={a} className="text-cyan block" />
          </h3>
          <EditableText as="p" globalSlug="cta-strip" fieldPath="body" value={b} multiline className="text-sm leading-5 text-white/85 mt-3 block" />
          <div className="mt-4">
            <ButtonLink href={btnHref} variant="cyan">
              <EditableText as="span" globalSlug="cta-strip" fieldPath="buttonLabel" value={btnLabel} /> →
            </ButtonLink>
          </div>
        </div>
      </section>
    </EditableImage>
  );
};
