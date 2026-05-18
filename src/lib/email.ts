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
  // Minimal SMTP send for dev (MailHog). Use native net to avoid extra deps.
  // For simplicity, use nodemailer-compatible approach via fetch to MailHog HTTP API if configured.
  // MailHog listens on 1025 for SMTP and 8025 for HTTP. We'll just POST a "raw" message there is not standard;
  // instead, use a tiny SMTP write.
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
    const body = [
      `From: ${env.EMAIL_FROM}`,
      `To: ${Array.isArray(opts.to) ? opts.to.join(', ') : opts.to}`,
      `Subject: ${opts.subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      '',
      opts.html,
      '.',
      '',
    ].join('\r\n');
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

export const renderRegistrationConfirmation = (input: {
  wrestlerFirstName: string;
  parentName: string;
}): { subject: string; html: string } => {
  const subject = `Welcome to the Lions, ${input.wrestlerFirstName}!`;
  const html = `
<!doctype html>
<html><body style="font-family:Inter,-apple-system,sans-serif;color:#071C3D;line-height:1.5;margin:0;padding:24px;background:#ECEEF1;">
  <div style="max-width:560px;margin:0 auto;background:#F8FBFF;border-radius:12px;padding:32px;">
    <h1 style="color:#061B3A;font-size:24px;font-weight:800;">Welcome to the Lions, ${input.wrestlerFirstName}!</h1>
    <p>Hi ${input.parentName},</p>
    <p>We've received ${input.wrestlerFirstName}'s registration with the DMC Lions Wrestling Club. A coach will follow up within 3 business days with practice times, gear info, and what to bring on day one.</p>
    <p>Questions in the meantime? Reply to this email or call <a href="tel:5158443947">515-844-3947</a>.</p>
    <p style="margin-top:32px;color:#6E7C8E;font-size:13px;">DMC Lions Wrestling Club · 9730 Woodland, Cumming, IA 50061</p>
  </div>
</body></html>`;
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
  const subject = `[Lions Wrestling] New registration — ${input.wrestlerFirstName} ${input.wrestlerLastName}`;
  const html = `
<!doctype html>
<html><body style="font-family:Inter,sans-serif;color:#071C3D;line-height:1.5;margin:0;padding:24px;">
  <h2>New wrestler registration</h2>
  <ul>
    <li><strong>Wrestler:</strong> ${input.wrestlerFirstName} ${input.wrestlerLastName}</li>
    <li><strong>Grade:</strong> ${input.grade}</li>
    <li><strong>Parent:</strong> ${input.parentName}</li>
    <li><strong>Parent email:</strong> <a href="mailto:${input.parentEmail}">${input.parentEmail}</a></li>
    <li><strong>Parent phone:</strong> ${input.parentPhone}</li>
  </ul>
  <p>Open the admin to view details and update status.</p>
</body></html>`;
  return { subject, html };
};

export const renderContactNotification = (input: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}): { subject: string; html: string } => {
  const subject = `[Lions Wrestling] Contact from ${input.firstName} ${input.lastName}`;
  const html = `
<!doctype html>
<html><body style="font-family:Inter,sans-serif;color:#071C3D;line-height:1.5;margin:0;padding:24px;">
  <h2>New contact submission</h2>
  <p><strong>From:</strong> ${input.firstName} ${input.lastName} &lt;${input.email}&gt;</p>
  <p><strong>Message:</strong></p>
  <pre style="white-space:pre-wrap;font-family:inherit;background:#F8FBFF;padding:12px;border-radius:8px;">${escapeHtml(
    input.message,
  )}</pre>
</body></html>`;
  return { subject, html };
};

export const renderContactAutoReply = (input: {
  firstName: string;
  body?: string;
}): { subject: string; html: string } => {
  const subject = `We got your message — Lions Wrestling`;
  const html = `
<!doctype html>
<html><body style="font-family:Inter,sans-serif;color:#071C3D;line-height:1.5;margin:0;padding:24px;">
  <p>Hi ${input.firstName},</p>
  <p>Thanks for reaching out to the DMC Lions Wrestling Club. We've received your note and a coach will get back to you within a few days.</p>
  <p>— Lions Wrestling</p>
</body></html>`;
  return { subject, html };
};

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
