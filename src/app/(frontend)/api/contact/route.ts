import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { contactSchema, MIN_FORM_DURATION_MS, verifyMathChallenge } from '@/lib/schemas';
import { limitContact } from '@/lib/rate-limit';
import { verifyTurnstile } from '@/lib/turnstile';
import { hashIp, ipFromHeaders } from '@/lib/ip';
import { sendEmail, renderContactAutoReply, renderContactNotification, TOPHER_REPLY_TO } from '@/lib/email';

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const json = (await req.json().catch(() => null)) as unknown;
  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid form data', issues: parsed.error.issues.map((i) => ({ path: i.path, msg: i.message })) },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Honeypot
  if (data.website && data.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 }); // silent accept for spammers
  }
  // Time-trap
  if (Date.now() - data.startedAt < MIN_FORM_DURATION_MS) {
    return NextResponse.json({ error: 'Submission too fast' }, { status: 429 });
  }
  // Math captcha
  if (!verifyMathChallenge(data.mathA, data.mathB, data.mathAnswer)) {
    return NextResponse.json({ error: 'Math answer incorrect — please try again.' }, { status: 400 });
  }

  const ip = ipFromHeaders(req.headers);
  const ipHash = hashIp(ip);
  const ua = req.headers.get('user-agent') ?? '';

  const payload = await getPayload({ config });
  const cfg = await payload.findGlobal({ slug: 'contact-config' });

  // Rate limit
  const rl = await limitContact(ipHash, cfg.rateLimitPerHour ?? 5);
  if (!rl.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Turnstile
  if (cfg.turnstileEnabled) {
    const ok = await verifyTurnstile(data.turnstileToken, ip);
    if (!ok) return NextResponse.json({ error: 'Bot check failed' }, { status: 400 });
  }

  await payload.create({
    collection: 'contact-submissions',
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || undefined,
      grade: data.grade || undefined,
      experience: data.experience || undefined,
      message: data.message,
      marketingOptIn: Boolean(data.marketingOptIn),
      status: 'new',
      submittedAt: new Date().toISOString(),
      ipHash,
      userAgent: ua.slice(0, 500),
    },
  });

  const recipients = ((cfg.recipientEmails ?? []) as Array<{ email?: string | null }>)
    .map((r) => r.email)
    .filter((e): e is string => Boolean(e));
  if (recipients.length > 0) {
    const { subject, html } = renderContactNotification({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      message: data.message,
    });
    await sendEmail({
      to: recipients,
      subject: `${cfg.subjectPrefix ?? ''} ${subject}`.trim(),
      html,
      replyTo: data.email,
    });
  }

  if (cfg.autoReplyEnabled) {
    const { subject, html } = renderContactAutoReply({ firstName: data.firstName });
    await sendEmail({ to: data.email, subject, html, replyTo: TOPHER_REPLY_TO });
  }

  return NextResponse.json({ ok: true });
};
