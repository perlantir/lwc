'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactInput } from '@/lib/schemas';

const STARTED_AT = Date.now();

export const ContactForm = () => {
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { startedAt: STARTED_AT, website: '' },
  });

  const onSubmit = async (data: ContactInput) => {
    setSubmitError(null);
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setDone(true);
      return;
    }
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    setSubmitError(j.error ?? 'Something went wrong. Please try again or call us.');
  };

  if (done) {
    return (
      <div className="bg-white border border-border rounded-2xl p-8 shadow-soft text-center">
        <h3 className="text-xl font-extrabold text-navy">Message received — thanks!</h3>
        <p className="mt-2 text-text-navy/80">
          A coach will follow up within a few days. For urgent matters, call 515-844-3947.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <input type="hidden" {...register('startedAt', { valueAsNumber: true })} />
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        {...register('website')}
        className="hidden"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="First name" error={errors.firstName?.message}>
          <input
            {...register('firstName')}
            className="form-input"
            autoComplete="given-name"
            aria-invalid={Boolean(errors.firstName)}
          />
        </Field>
        <Field label="Last name" error={errors.lastName?.message}>
          <input {...register('lastName')} className="form-input" autoComplete="family-name" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email" error={errors.email?.message}>
          <input type="email" {...register('email')} className="form-input" autoComplete="email" />
        </Field>
        <Field label="Phone (optional)" error={errors.phone?.message}>
          <input type="tel" {...register('phone')} className="form-input" autoComplete="tel" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Grade range">
          <select {...register('grade')} className="form-input">
            <option value="">Select…</option>
            <option>K – 2 (Mini Lions)</option>
            <option>3 – 6 (Youth)</option>
            <option>7 – 8 (Middle)</option>
            <option>9 – 12 (High School)</option>
          </select>
        </Field>
        <Field label="Wrestling experience">
          <select {...register('experience')} className="form-input">
            <option value="">Select…</option>
            <option>Brand new</option>
            <option>1 – 2 seasons</option>
            <option>3+ seasons</option>
          </select>
        </Field>
      </div>

      <Field label="Message" error={errors.message?.message}>
        <textarea rows={5} {...register('message')} className="form-input" />
      </Field>

      <label className="flex items-start gap-2 text-sm text-text-navy/80">
        <input type="checkbox" {...register('marketingOptIn')} className="mt-1" />
        Send me occasional news about the Lions Wrestling Club.
      </label>

      {submitError && <div className="text-red-600 text-sm">{submitError}</div>}

      <button type="submit" disabled={isSubmitting} className="btn btn-cyan btn-lg">
        {isSubmitting ? 'Sending…' : 'Send message'}
      </button>

      <style>{`.form-input{width:100%;border:1px solid var(--border);border-radius:8px;padding:10px 12px;background:#fff;font-size:14px;color:var(--text-navy);}.form-input:focus{outline:2px solid var(--cyan);outline-offset:1px;border-color:var(--cyan);}`}</style>
    </form>
  );
};

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <label className="block text-sm">
    <span className="font-semibold text-navy">{label}</span>
    <div className="mt-1">{children}</div>
    {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
  </label>
);
