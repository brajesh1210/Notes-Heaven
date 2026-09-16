import nodemailer from 'nodemailer';
import { env, features } from '../config/env.js';
import logger from '../utils/logger.js';

let transporter = null;

const getTransporter = () => {
  if (!features.mail) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      secure: env.mail.port === 465,
      auth: { user: env.mail.user, pass: env.mail.pass },
    });
  }
  return transporter;
};

const shell = (title, bodyHtml) => `
<div style="font-family:Inter,Segoe UI,Roboto,sans-serif;background:#F1F5F9;padding:32px 12px">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden">
    <div style="padding:24px 28px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;gap:10px">
      <span style="display:inline-block;width:28px;height:28px;border-radius:8px;background:#1D4ED8;color:#ffffff;font-size:15px;font-weight:700;text-align:center;line-height:28px">N</span>
      <strong style="font-size:18px;color:#0F172A">Notes Heaven</strong>
    </div>
    <div style="padding:28px">
      <h2 style="margin:0 0 12px;color:#0F172A;font-size:20px">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="padding:18px 28px;border-top:1px solid #E2E8F0;color:#64748B;font-size:12px">
      This email was sent in relation to your Notes Heaven account.
    </div>
  </div>
</div>`;

const button = (href, label) =>
  `<a href="${href}" style="display:inline-block;background:#1D4ED8;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">${label}</a>`;

/** Send an email. Without SMTP configured, links are printed to the console (dev friendly). */
export const sendMail = async ({ to, subject, html, text }) => {
  const tx = getTransporter();
  if (!tx) {
    logger.warn('SMTP not configured - email skipped. (Set SMTP_* in backend/.env)');
    return { skipped: true };
  }
  const info = await tx.sendMail({ from: env.mail.from, to, subject, html, text });
  logger.success(`Mail sent to ${to} (${info.messageId})`);
  return info;
};

export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const html = shell(
    'Reset your password',
    `<p style="color:#334155;line-height:1.6">Hi ${name || 'there'}, we received a password reset request for your account. Use the button below to set a new password.</p>
     <p style="margin:24px 0">${button(resetUrl, 'Reset Password')}</p>
     <p style="color:#64748B;font-size:13px;line-height:1.6">This link expires in 30 minutes. If you did not request it, you can safely ignore this email - your password remains unchanged.</p>
     <p style="color:#94A3B8;font-size:12px;word-break:break-all">${resetUrl}</p>`
  );
  return sendMail({ to, subject: 'Notes Heaven - Reset your password', html });
};

export const sendWelcomeEmail = async ({ to, name }) => {
  const html = shell(
    `Welcome aboard, ${name || 'friend'}!`,
    `<p style="color:#334155;line-height:1.6">Your Notes Heaven account is ready. Create notes, organize them into folders and never lose them again.</p>
     <p style="margin:24px 0">${button(`${env.clientUrl}/dashboard`, 'Open Dashboard')}</p>`
  );
  return sendMail({ to, subject: 'Welcome to Notes Heaven', html });
};

export default sendMail;
