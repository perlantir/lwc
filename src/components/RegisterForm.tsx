'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/schemas';

const STARTED_AT = Date.now();
const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export const RegisterForm = () => {
  const [doneFor, setDoneFor] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { startedAt: STARTED_AT, website: '', updates: true },
  });

  const selectedGrade = watch('grade');
  const selectedGender = watch('gender');

  const onSubmit = async (data: RegisterInput) => {
    setSubmitError(null);
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setDoneFor(data.wFirst);
      return;
    }
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    setSubmitError(j.error ?? 'Could not submit. Please try again.');
  };

  if (doneFor) {
    return (
      <div className="bg-white border border-border rounded-2xl p-8 shadow-card text-center">
        <h2 className="text-2xl font-extrabold text-navy">Thank you for registering, {doneFor}!</h2>
        <p className="mt-3 text-text-navy/80">
          We sent a confirmation email to the parent address. A coach will reach out within 3 business
          days with practice times, what to bring, and your welcome packet.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      <input type="hidden" {...register('startedAt', { valueAsNumber: true })} />
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        {...register('website')}
        className="hidden"
      />

      <Section title="Wrestler info">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="First name" error={errors.wFirst?.message}>
            <input {...register('wFirst')} className="form-input" />
          </Field>
          <Field label="Last name" error={errors.wLast?.message}>
            <input {...register('wLast')} className="form-input" />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <Field label="Date of birth" error={errors.dob?.message}>
            <input type="date" {...register('dob')} className="form-input" />
          </Field>
          <Field label="Current school" error={errors.school?.message}>
            <input {...register('school')} className="form-input" />
          </Field>
        </div>

        <div className="mt-5">
          <span className="block text-sm font-semibold text-navy mb-2">Grade</span>
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => {
              const active = selectedGrade === g;
              return (
                <button
                  type="button"
                  key={g}
                  onClick={() => setValue('grade', g, { shouldValidate: true })}
                  aria-pressed={active}
                  className={`px-3 py-2 rounded-pill text-sm font-semibold border ${
                    active ? 'bg-cyan text-white border-cyan' : 'bg-white text-navy border-navy/30 hover:border-cyan'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
          {errors.grade && <div className="mt-1 text-xs text-red-600">{errors.grade.message}</div>}
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-5">
          <Field label="Weight (lbs)" error={errors.weight?.message}>
            <input {...register('weight')} inputMode="numeric" className="form-input" />
          </Field>
          <div>
            <span className="block text-sm font-semibold text-navy mb-2">Gender</span>
            <div className="inline-flex rounded-full border border-navy/30 overflow-hidden">
              {(['boy', 'girl'] as const).map((g) => {
                const active = selectedGender === g;
                return (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setValue('gender', g, { shouldValidate: true })}
                    aria-pressed={active}
                    className={`px-5 py-2 text-sm font-semibold ${active ? 'bg-cyan text-white' : 'bg-white text-navy'}`}
                  >
                    {g === 'boy' ? 'Boy' : 'Girl'}
                  </button>
                );
              })}
            </div>
            {errors.gender && <div className="mt-1 text-xs text-red-600">{errors.gender.message}</div>}
          </div>
        </div>

        <div className="mt-4">
          <Field label="Address" error={errors.address?.message}>
            <textarea rows={2} {...register('address')} className="form-input" />
          </Field>
        </div>
      </Section>

      <Section title="Parent / guardian info">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Parent name" error={errors.parentName?.message}>
            <input {...register('parentName')} className="form-input" autoComplete="name" />
          </Field>
          <Field label="Relationship">
            <input {...register('relationship')} className="form-input" placeholder="Parent, guardian…" />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <Field label="Parent phone" error={errors.parentPhone?.message}>
            <input type="tel" {...register('parentPhone')} className="form-input" autoComplete="tel" />
          </Field>
          <Field label="Parent email" error={errors.parentEmail?.message}>
            <input type="email" {...register('parentEmail')} className="form-input" autoComplete="email" />
          </Field>
        </div>
      </Section>

      <Section title="Agreement">
        <label className="flex items-start gap-2 text-sm text-text-navy/85">
          <input type="checkbox" {...register('consent')} className="mt-1" />
          <span>
            I confirm that the information above is accurate and I authorize the wrestler to participate
            in Lions Wrestling Club activities. <span className="text-red-600">*</span>
          </span>
        </label>
        {errors.consent && <div className="mt-1 text-xs text-red-600">{errors.consent.message}</div>}
        <label className="flex items-start gap-2 text-sm text-text-navy/85 mt-2">
          <input type="checkbox" {...register('updates')} className="mt-1" />
          Send me season updates and announcements.
        </label>
      </Section>

      {submitError && <div className="text-red-600 text-sm">{submitError}</div>}

      <button type="submit" disabled={isSubmitting} className="btn btn-cyan btn-lg">
        {isSubmitting ? 'Submitting…' : 'Submit registration'}
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

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <fieldset className="bg-white border border-border rounded-2xl p-5 md:p-6 shadow-soft">
    <legend className="px-2 text-sm font-extrabold text-cyan uppercase tracking-wider">{title}</legend>
    {children}
  </fieldset>
);
