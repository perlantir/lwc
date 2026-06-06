import { Resend } from 'resend';
import { env } from '../env';

interface SendOpts {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const sendViaResend = async (opts: SendOpts): Promise<{ ok: boolean; id?: string; error?: string }> => {
  if (!resend) return { ok: false, error: 'Resend not configured' };
  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: opts.replyTo ?? env.EMAIL_REPLY_TO,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id };
};

const sendViaSmtp = async (opts: SendOpts): Promise<{ ok: boolean; error?: string }> => {
  if (!env.SMTP_URL) return { ok: false, error: 'SMTP_URL not set' };
  const url = new URL(env.SMTP_URL);
  const host = url.hostname;
  const port = Number(url.port || '25');
  const { createConnection } = await import('node:net');
  return new Promise((resolve) => {
    const sock = createConnection({ host, port });
    let step = 0;
    const cmds: string[] = [
      `EHLO localhost\r\n`,
      `MAIL FROM:<${env.EMAIL_FROM}>\r\n`,
      ...(Array.isArray(opts.to) ? opts.to : [opts.to]).map((to) => `RCPT TO:<${to}>\r\n`),
      `DATA\r\n`,
    ];
    const headers = [
      `From: ${env.EMAIL_FROM}`,
      `To: ${Array.isArray(opts.to) ? opts.to.join(', ') : opts.to}`,
      opts.replyTo ? `Reply-To: ${opts.replyTo}` : '',
      `Subject: ${opts.subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
    ].filter(Boolean);
    const body = [...headers, '', opts.html, '.', ''].join('\r\n');
    sock.on('data', () => {
      if (step < cmds.length) {
        sock.write(cmds[step]);
        step++;
      } else if (step === cmds.length) {
        sock.write(body);
        step++;
      } else {
        sock.write('QUIT\r\n');
        sock.end();
        resolve({ ok: true });
      }
    });
    sock.on('error', (e) => resolve({ ok: false, error: e.message }));
    sock.on('end', () => resolve({ ok: true }));
  });
};

export const sendEmail = async (opts: SendOpts): Promise<{ ok: boolean; id?: string; error?: string }> => {
  if (resend) return sendViaResend(opts);
  if (env.SMTP_URL) return sendViaSmtp(opts);
  return { ok: false, error: 'No email transport configured' };
};

// ---------- Shared branded layout ----------

export const TOPHER_REPLY_TO = 'Topher.ewing@dmcs.org';

const PROD_URL = env.SITE_URL && !env.SITE_URL.includes('localhost')
  ? env.SITE_URL.replace(/\/$/, '')
  : 'https://www.lionswrestling.org';

const COLORS = {
  navy: '#061B3A',
  deepNavy: '#040F25',
  cyan: '#12AEEA',
  cyanDark: '#0E8FBF',
  textNavy: '#071C3D',
  muted: '#6E7C8E',
  bg: '#ECEEF1',
  card: '#FFFFFF',
  border: '#E2E8F0',
};

const renderLayout = (input: {
  preheader: string;
  eyebrow?: string;
  heading: string;
  intro?: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  footerNote?: string;
}): string => {
  const eyebrow = input.eyebrow
    ? `<div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${COLORS.cyan};text-transform:uppercase;margin:0 0 12px;">${input.eyebrow}</div>`
    : '';
  const intro = input.intro
    ? `<p style="margin:0 0 16px;color:${COLORS.textNavy};font-size:15px;line-height:1.55;">${input.intro}</p>`
    : '';
  const cta = input.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;"><tr><td bgcolor="${COLORS.cyan}" style="border-radius:8px;"><a href="${input.cta.href}" style="display:inline-block;padding:12px 22px;color:#ffffff;font-weight:700;text-decoration:none;font-size:14px;letter-spacing:.2px;border-radius:8px;">${input.cta.label} →</a></td></tr></table>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(input.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${COLORS.textNavy};">
<div style="display:none;font-size:1px;color:${COLORS.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(input.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.bg};">
  <tr>
    <td align="center" style="padding:24px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
        <!-- Header bar -->
        <tr>
          <td style="background:${COLORS.navy};border-radius:12px 12px 0 0;padding:18px 24px;" align="left">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="middle" style="padding-right:12px;width:48px;">
                  <img src="${PROD_URL}/logos/lion-head-white-transparent.png" width="40" height="40" alt="Lions Wrestling Club" style="display:block;border:0;outline:none;text-decoration:none;width:40px;height:40px;" />
                </td>
                <td valign="middle">
                  <div style="color:#ffffff;font-size:14px;font-weight:800;letter-spacing:.3px;line-height:1.2;">DMCS LIONS WRESTLING CLUB</div>
                  <div style="color:${COLORS.cyan};font-size:11px;font-weight:600;letter-spacing:2px;line-height:1.2;margin-top:3px;text-transform:uppercase;">Faith · Discipline · Excellence</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Cyan accent stripe -->
        <tr><td style="background:${COLORS.cyan};height:4px;line-height:4px;font-size:4px;">&nbsp;</td></tr>
        <!-- Body card -->
        <tr>
          <td style="background:${COLORS.card};padding:32px 28px;">
            ${eyebrow}
            <h1 style="margin:0 0 14px;color:${COLORS.navy};font-size:24px;line-height:1.25;font-weight:800;letter-spacing:-.2px;">${escapeHtml(input.heading)}</h1>
            ${intro}
            ${input.bodyHtml}
            ${cta}
            ${input.footerNote ? `<p style="margin:24px 0 0;color:${COLORS.muted};font-size:13px;line-height:1.5;">${input.footerNote}</p>` : ''}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:${COLORS.deepNavy};border-radius:0 0 12px 12px;padding:20px 24px;" align="center">
            <div style="color:#ffffff;font-size:13px;font-weight:700;margin-bottom:6px;">DMCS Lions Wrestling Club</div>
            <div style="color:rgba(255,255,255,.65);font-size:12px;line-height:1.5;">13007 Douglas Pkwy, Urbandale, IA 50323</div>
            <div style="margin-top:12px;">
              <a href="https://www.instagram.com/lionswrestlingclub_" style="display:inline-block;padding:6px 12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:6px;color:#ffffff;font-size:12px;font-weight:600;text-decoration:none;">@lionswrestlingclub_</a>
              <a href="${PROD_URL}" style="display:inline-block;margin-left:6px;padding:6px 12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:6px;color:#ffffff;font-size:12px;font-weight:600;text-decoration:none;">Visit site</a>
            </div>
            <div style="margin-top:14px;color:rgba(255,255,255,.45);font-size:11px;">© ${new Date().getFullYear()} DMCS Lions Wrestling Club. All rights reserved.</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
};

const detailsTable = (rows: Array<{ label: string; value: string; href?: string }>): string => {
  const cells = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};color:${COLORS.muted};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;width:40%;vertical-align:top;">${escapeHtml(r.label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};color:${COLORS.textNavy};font-size:14px;font-weight:500;">${r.href ? `<a href="${r.href}" style="color:${COLORS.cyanDark};text-decoration:none;">${escapeHtml(r.value)}</a>` : escapeHtml(r.value)}</td>
      </tr>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;border-top:1px solid ${COLORS.border};">${cells}</table>`;
};

// ---------- Templates ----------

export const renderRegistrationConfirmation = (input: {
  wrestlerFirstName: string;
  parentName: string;
}): { subject: string; html: string } => {
  const subject = `Welcome to the Lions, ${input.wrestlerFirstName}!`;
  const html = renderLayout({
    preheader: `We received ${input.wrestlerFirstName}'s registration — a coach will be in touch within 48 hours.`,
    eyebrow: 'Registration Received',
    heading: `Welcome to the Lions, ${input.wrestlerFirstName}!`,
    intro: `Hi ${escapeHtml(input.parentName)}, thanks for registering ${escapeHtml(input.wrestlerFirstName)} with the DMCS Lions Wrestling Club.`,
    bodyHtml: `
      <p style="margin:0 0 12px;color:${COLORS.textNavy};font-size:15px;line-height:1.55;">
        A coach will follow up within <strong>48 hours</strong> with practice times, gear info, and what to bring on day one.
      </p>
      <p style="margin:0 0 12px;color:${COLORS.textNavy};font-size:15px;line-height:1.55;">
        Questions in the meantime? Email Coach Topher directly at
        <a href="mailto:${TOPHER_REPLY_TO}" style="color:${COLORS.cyanDark};text-decoration:none;font-weight:600;">${TOPHER_REPLY_TO}</a>.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;border-left:4px solid ${COLORS.cyan};background:#F4F8FC;border-radius:6px;">
        <tr><td style="padding:14px 16px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${COLORS.cyan};text-transform:uppercase;margin:0 0 6px;">Our Three Pillars</div>
          <div style="font-size:15px;font-weight:700;color:${COLORS.navy};">Faith · Discipline · Excellence</div>
        </td></tr>
      </table>
    `,
    cta: { label: 'Visit the Site', href: PROD_URL },
    footerNote: `Need to reach us directly? Email <a href="mailto:${TOPHER_REPLY_TO}" style="color:${COLORS.cyanDark};text-decoration:none;">${TOPHER_REPLY_TO}</a>.`,
  });
  return { subject, html };
};

export const renderRegistrationNotification = (input: {
  wrestlerFirstName: string;
  wrestlerLastName: string;
  grade: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
}): { subject: string; html: string } => {
  const subject = `New registration — ${input.wrestlerFirstName} ${input.wrestlerLastName}`;
  const html = renderLayout({
    preheader: `${input.wrestlerFirstName} ${input.wrestlerLastName} (${input.grade}) just registered. Parent: ${input.parentName}.`,
    eyebrow: 'New Registration',
    heading: `${input.wrestlerFirstName} ${input.wrestlerLastName}`,
    intro: `A new wrestler just registered through the site. Reply directly to this email to reach the parent.`,
    bodyHtml: detailsTable([
      { label: 'Wrestler', value: `${input.wrestlerFirstName} ${input.wrestlerLastName}` },
      { label: 'Grade', value: input.grade },
      { label: 'Parent', value: input.parentName },
      { label: 'Parent Email', value: input.parentEmail, href: `mailto:${input.parentEmail}` },
      { label: 'Parent Phone', value: input.parentPhone, href: `tel:${input.parentPhone.replace(/[^0-9+]/g, '')}` },
    ]),
    cta: { label: 'Open Admin', href: `${PROD_URL}/admin/collections/registrations` },
    footerNote: `Submitted via the registration form on ${PROD_URL.replace(/^https?:\/\//, '')}.`,
  });
  return { subject, html };
};

export const renderContactNotification = (input: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}): { subject: string; html: string } => {
  const subject = `Contact from ${input.firstName} ${input.lastName}`;
  const html = renderLayout({
    preheader: `${input.firstName} ${input.lastName} sent a message through the contact form.`,
    eyebrow: 'New Contact Message',
    heading: `${input.firstName} ${input.lastName}`,
    intro: `New contact form submission. Reply directly to this email to reach the sender.`,
    bodyHtml: `
      ${detailsTable([
        { label: 'From', value: `${input.firstName} ${input.lastName}` },
        { label: 'Email', value: input.email, href: `mailto:${input.email}` },
      ])}
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${COLORS.cyan};text-transform:uppercase;margin:22px 0 8px;">Message</div>
      <div style="background:#F4F8FC;border-left:4px solid ${COLORS.cyan};border-radius:6px;padding:14px 16px;color:${COLORS.textNavy};font-size:15px;line-height:1.55;white-space:pre-wrap;">${escapeHtml(input.message)}</div>
    `,
    cta: { label: 'Open Admin', href: `${PROD_URL}/admin/collections/contact-submissions` },
    footerNote: `Submitted via the contact form on ${PROD_URL.replace(/^https?:\/\//, '')}.`,
  });
  return { subject, html };
};

export const renderContactAutoReply = (input: {
  firstName: string;
  body?: string;
}): { subject: string; html: string } => {
  const subject = `We got your message — Lions Wrestling`;
  const html = renderLayout({
    preheader: `Thanks for reaching out — a coach will get back to you within 48 hours.`,
    eyebrow: 'Message Received',
    heading: `Thanks, ${input.firstName}!`,
    intro: `We've received your message and a coach will get back to you within <strong>48 hours</strong>. Need to reach us sooner? Email Coach Topher directly at <a href="mailto:${TOPHER_REPLY_TO}" style="color:${COLORS.cyanDark};text-decoration:none;font-weight:600;">${TOPHER_REPLY_TO}</a>.`,
    bodyHtml: input.body
      ? `<p style="margin:0 0 12px;color:${COLORS.textNavy};font-size:15px;line-height:1.55;">${escapeHtml(input.body)}</p>`
      : `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;border-left:4px solid ${COLORS.cyan};background:#F4F8FC;border-radius:6px;">
          <tr><td style="padding:14px 16px;">
            <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${COLORS.cyan};text-transform:uppercase;margin:0 0 6px;">What's Next</div>
            <div style="font-size:14px;color:${COLORS.textNavy};line-height:1.55;">A coach will review your message and respond directly within 48 hours.</div>
          </td></tr>
        </table>
      `,
    cta: { label: 'Explore the Program', href: `${PROD_URL}/about` },
    footerNote: `Want to register now? Visit <a href="${PROD_URL}/register" style="color:${COLORS.cyanDark};text-decoration:none;">${PROD_URL.replace(/^https?:\/\//, '')}/register</a>.`,
  });
  return { subject, html };
};

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
