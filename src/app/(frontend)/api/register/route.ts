import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { registerSchema, MIN_FORM_DURATION_MS, verifyMathChallenge } from '@/lib/schemas';
import { limitRegister } from '@/lib/rate-limit';
import { verifyTurnstile } from '@/lib/turnstile';
import { hashIp, ipFromHeaders } from '@/lib/ip';
import {
  renderRegistrationConfirmation,
  renderRegistrationNotification,
  sendEmail,
  TOPHER_REPLY_TO,
} from '@/lib/email';

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const json = (await req.json().catch(() => null)) as unknown;
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid registration data', issues: parsed.error.issues.map((i) => ({ path: i.path, msg: i.message })) },
      { status: 400 },
    );
  }
  const data = parsed.data;

  if (data.website && data.website.length > 0) {
    return NextResponse.json({ ok: true }); // honeypot silent
  }
  if (Date.now() - data.startedAt < MIN_FORM_DURATION_MS) {
    return NextResponse.json({ error: 'Submission too fast' }, { status: 429 });
  }
  if (!verifyMathChallenge(data.mathA, data.mathB, data.mathAnswer)) {
    return NextResponse.json({ error: 'Math answer incorrect — please try again.' }, { status: 400 });
  }

  const ip = ipFromHeaders(req.headers);
  const ipHash = hashIp(ip);
  const ua = req.headers.get('user-agent') ?? '';

  const payload = await getPayload({ config });
  const cfg = await payload.findGlobal({ slug: 'contact-config' });

  const rl = await limitRegister(ipHash, 3);
  if (!rl.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  if (cfg.turnstileEnabled) {
    const ok = await verifyTurnstile(data.turnstileToken, ip);
    if (!ok) return NextResponse.json({ error: 'Bot check failed' }, { status: 400 });
  }

  await payload.create({
    collection: 'registrations',
    data: {
      wrestlerFirstName: data.wFirst,
      wrestlerLastName: data.wLast,
      dob: data.dob,
      school: data.school,
      grade: data.grade,
      weight: data.weight,
      gender: data.gender,
      address: data.address,
      parentName: data.parentName,
      relationship: data.relationship || undefined,
      parentPhone: data.parentPhone,
      parentEmail: data.parentEmail,
      consent: true,
      marketingOptIn: Boolean(data.updates),
      status: 'new',
      submittedAt: new Date().toISOString(),
      ipHash,
      userAgent: ua.slice(0, 500),
    },
  });

  // Send confirmation to parent — replies route to Topher
  const confirm = renderRegistrationConfirmation({
    wrestlerFirstName: data.wFirst,
    parentName: data.parentName,
  });
  await sendEmail({
    to: data.parentEmail,
    subject: confirm.subject,
    html: confirm.html,
    replyTo: TOPHER_REPLY_TO,
  });

  // Notify coaches — replies route to the parent for direct response
  const recipients = ((cfg.recipientEmails ?? []) as Array<{ email?: string | null }>)
    .map((r) => r.email)
    .filter((e): e is string => Boolean(e));
  if (recipients.length > 0) {
    const notif = renderRegistrationNotification({
      wrestlerFirstName: data.wFirst,
      wrestlerLastName: data.wLast,
      grade: data.grade,
      parentName: data.parentName,
      parentEmail: data.parentEmail,
      parentPhone: data.parentPhone,
    });
    await sendEmail({
      to: recipients,
      subject: `${cfg.subjectPrefix ?? ''} ${notif.subject}`.trim(),
      html: notif.html,
      replyTo: data.parentEmail,
    });
  }

  return NextResponse.json({ ok: true });
};
