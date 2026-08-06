/**
 * Email Service (Bonus Feature)
 * Sends lead notifications and admin password-reset emails.
 * Delivery order of preference:
 *   1. Brevo transactional API  (set BREVO_API_KEY)
 *   2. SMTP via nodemailer      (set SMTP_HOST / SMTP_USER / SMTP_PASS)
 *   3. Console log fallback      (so the app never breaks in dev/demo)
 */

const nodemailer = require("nodemailer");

let transporter = null;

// ─── BREVO TRANSACTIONAL EMAIL API ──────────────────────────────────────────
function brevoConfigured() {
  return !!process.env.BREVO_API_KEY;
}

/**
 * Send an email through Brevo's HTTP API (https://api.brevo.com/v3/smtp/email).
 * Uses the global fetch available in Node 18+. Throws on failure so callers
 * can decide how to handle it.
 */
async function sendViaBrevo({ to, subject, html, text }) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.NOTIFY_EMAIL || "info@pyshk.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Pragya Yog School";

  // `to` may be a single address or a list (lead notifications can fan out to
  // several staff members).
  const toList = (Array.isArray(to) ? to : [to]).filter(Boolean).map((email) => ({ email }));

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: toList,
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }
}

// Set up the email transporter if SMTP credentials are provided
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Logs are retained by the host and widely readable, so an address that reaches
// them is masked: "someone@example.com" → "s*****@example.com".
function maskEmail(addr) {
  const s = String(addr || "");
  const at = s.indexOf("@");
  if (at < 1) return "[REDACTED]";
  return `${s[0]}*****${s.slice(at)}`;
}

// Escape HTML so attacker-controlled lead fields can't inject markup into the
// notification email rendered in the staff's mail client.
function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Send a notification email to the school when a new lead arrives.
 * `extraRecipients` are staff addresses the admin configured under Lead Routing;
 * they receive the same notification alongside the main inbox.
 */
async function sendLeadNotification(lead, extraRecipients = []) {
  const notifyEmail = process.env.NOTIFY_EMAIL || "info@pyshk.com";
  const recipients = [
    ...new Set(
      [notifyEmail, ...(Array.isArray(extraRecipients) ? extraRecipients : [])]
        .map((e) => String(e || "").trim().toLowerCase())
        .filter(Boolean)
    ),
  ];

  const emailBody = `
New lead captured from the Pragya AI Assistant chatbot:

Name:     ${lead.name}
Email:    ${lead.email}
Phone:    ${lead.phone || "—"}
Country:  ${lead.country || "—"}
Interest: ${lead.course}
Time:     ${new Date(lead.createdAt).toLocaleString()}

Please follow up within 24 hours.

— Pragya AI Assistant
`;

  // The lead fields are attacker-controlled (anyone can submit the form). For
  // the HTML email they must be escaped, or a name like
  // "</pre><a href=…>click</a>" injects markup into the staff's inbox.
  const htmlBody = escapeHtml(emailBody);

  const subject = `🧘 New Lead: ${lead.name} — ${lead.course}`;

  // 1. Brevo API (preferred)
  if (brevoConfigured()) {
    await sendViaBrevo({
      to: recipients,
      subject,
      html: `<pre style="font-family:Segoe UI,Arial,sans-serif;font-size:14px;">${htmlBody}</pre>`,
      text: emailBody,
    });
    console.log(`📧 Lead notification sent to ${recipients.length} recipient(s) via Brevo.`);
    return;
  }

  // 2. SMTP
  if (transporter) {
    await transporter.sendMail({
      from: `"Pragya AI Assistant" <${process.env.SMTP_USER}>`,
      to: recipients.join(", "),
      subject,
      text: emailBody,
    });
    console.log(`📧 Lead notification sent to ${recipients.length} recipient(s) via SMTP.`);
    return;
  }

  // 3. No email provider configured. The lead is already saved; log only that
  // fact. The body carries the lead's name, email and phone, and logs on a
  // hosted platform are retained and widely readable.
  console.log(
    "📧 [Lead notification not sent — no email provider configured. " +
      "Lead is saved; view it in the dashboard. Set BREVO_API_KEY or SMTP_* to enable email.]"
  );
}

/**
 * Send an admin password-reset email containing a one-time reset link.
 * Prefers Brevo, then SMTP, then console log (dev fallback).
 * @returns {Promise<boolean>} true if actually emailed, false if only logged.
 */
async function sendPasswordResetEmail(toEmail, resetLink) {
  const subject = "Reset your Pragya Admin password";
  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:480px;margin:0 auto;color:#1a1a2e;">
      <h2 style="color:#C49A2A;">🧘 Pragya Admin — Password Reset</h2>
      <p>We received a request to reset your admin dashboard password.</p>
      <p>Click the button below to choose a new password. This link expires in <strong>15 minutes</strong>.</p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${resetLink}" style="background:#0D6E4F;color:#fff;text-decoration:none;padding:12px 26px;border-radius:8px;font-weight:600;display:inline-block;">Reset Password</a>
      </p>
      <p style="font-size:12px;color:#666;">Or paste this link into your browser:<br><span style="word-break:break-all;">${resetLink}</span></p>
      <p style="font-size:12px;color:#999;margin-top:22px;">If you did not request this, you can safely ignore this email — your password will not change.</p>
    </div>`;
  const text = `Pragya Admin — Password Reset\n\nReset your password using this link (expires in 15 minutes):\n${resetLink}\n\nIf you did not request this, ignore this email.`;

  // 1. Brevo API
  if (brevoConfigured()) {
    await sendViaBrevo({ to: toEmail, subject, html, text });
    console.log(`📧 Password reset email sent to ${maskEmail(toEmail)} via Brevo.`);
    return true;
  }

  // 2. SMTP
  if (transporter) {
    await transporter.sendMail({
      from: `"Pragya Yog School" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject,
      html,
      text,
    });
    console.log(`📧 Password reset email sent to ${maskEmail(toEmail)} via SMTP.`);
    return true;
  }

  // 3. No email provider configured. The reset link carries a live one-time
  // token, so it is only ever printed in local development — logs on a hosted
  // platform are retained and would hand over the admin account.
  console.log("📧 [Password reset — no email provider configured]");
  console.log(`   To: ${maskEmail(toEmail)}`);
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    console.log(`   Reset link: ${resetLink}`);
  } else {
    console.log("   Reset link withheld from logs. Configure BREVO_API_KEY or SMTP to deliver it.");
  }
  return false;
}

module.exports = { sendLeadNotification, sendPasswordResetEmail };
