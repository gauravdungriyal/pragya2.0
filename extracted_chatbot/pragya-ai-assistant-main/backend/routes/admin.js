/**
 * Admin Routes
 * POST /api/admin/login          — log in with email + password → session token
 * GET  /api/admin/me             — who am I (validate token)
 * POST /api/admin/change-password — change the logged-in admin's password
 * POST /api/admin/forgot-password — email a one-time reset link (via Brevo)
 * POST /api/admin/reset-password  — set a new password using a reset token
 * GET  /api/admin/audit          — recent admin activity log
 * GET /api/admin/stats           — dashboard overview statistics
 * GET /api/admin/analytics       — user analytics (activity, top topics)
 * GET /api/admin/conversations   — recent chat logs
 * GET /api/admin/leads           — all leads
 * GET    /api/admin/faqs         — FAQ manager list
 * POST   /api/admin/faqs         — add a new FAQ
 * PUT    /api/admin/faqs/:id     — edit an existing FAQ
 * DELETE /api/admin/faqs/:id     — delete a FAQ
 * GET /api/admin/feedback        — feedback and ratings
 *
 * Auth: send `Authorization: Bearer <token>` from login. The legacy
 * `x-admin-key` header is still accepted for backward compatibility.
 */

const express = require("express");
const router = express.Router();
const dataService = require("../services/data-service");
const auth = require("../services/admin-auth");
const { sendPasswordResetEmail } = require("../services/email-service");

// How long a password-reset link stays valid. Kept short: the token grants a
// password change, so a stale link found in an inbox or a proxy log is a
// takeover primitive. 15 minutes is the upper bound recommended for reset links.
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Build the reset link the user clicks. Prefers APP_URL, else derives it
// from the incoming request (works in local dev without extra config).
function buildResetLink(req, token) {
  const base = (process.env.APP_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
  return `${base}/admin?reset=${token}`;
}

// Ensure the ADMIN_EMAIL account from .env exists (created on first use).
// Only creates missing accounts — it never overwrites an existing account's
// password, so dashboard password changes are always preserved.
let defaultAdminEnsured = false;
let seedWarningLogged = false;

async function ensureDefaultAdmin() {
  if (defaultAdminEnsured) return;

  // Both values must be configured explicitly. Seeding from a hardcoded default
  // would create a real account whose credentials are readable in the repo.
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || !password) {
    if (!seedWarningLogged) {
      console.warn(
        "⚠️  ADMIN_EMAIL / ADMIN_PASSWORD are not both set — no admin account will be " +
          "seeded, so the dashboard cannot be logged into. Set them in your environment."
      );
      seedWarningLogged = true;
    }
    return;
  }

  try {
    const existing = await dataService.getAdminByEmail(email);
    if (!existing) {
      // The account seeded from the environment is the super admin — the owner
      // who can then create staff logins from the dashboard.
      await dataService.createAdmin({ email, passwordHash: auth.hashPassword(password), role: "super_admin" });
      console.log(`ℹ️  Seeded super-admin account from environment: ${email}`);
    }
    defaultAdminEnsured = true;
  } catch (e) {
    // Don't cache failure — retry on the next request.
    console.error("ensureDefaultAdmin error:", e.message);
  }
}

// Shared auth middleware (Bearer session token or legacy x-admin-key).
const adminAuth = auth.adminAuthMiddleware;

// ─── LOGIN BRUTE-FORCE PROTECTION ──────────────────────────────────────────
// Track failed attempts per email+IP; lock for 15 minutes after 5 failures.
// (In-memory: resets on serverless cold start, but still throttles bursts,
// and the global express-rate-limit adds a second layer.)
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const loginAttempts = new Map(); // key → { count, lockedUntil }

function attemptKey(req, email) {
  return `${String(email).toLowerCase().trim()}|${req.ip}`;
}

function isLockedOut(req, email) {
  const rec = loginAttempts.get(attemptKey(req, email));
  if (!rec) return 0;
  if (rec.lockedUntil && rec.lockedUntil > Date.now()) {
    return Math.ceil((rec.lockedUntil - Date.now()) / 60000); // minutes left
  }
  return 0;
}

function recordFailure(req, email) {
  const key = attemptKey(req, email);
  const rec = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  rec.count += 1;
  if (rec.count >= MAX_LOGIN_ATTEMPTS) {
    rec.lockedUntil = Date.now() + LOCKOUT_MS;
    rec.count = 0;
  }
  loginAttempts.set(key, rec);
  // Keep the map from growing unbounded.
  if (loginAttempts.size > 1000) loginAttempts.clear();
  return rec.lockedUntil > Date.now();
}

function clearFailures(req, email) {
  loginAttempts.delete(attemptKey(req, email));
}

// ─── AUTH ROUTES ────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  await ensureDefaultAdmin();
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const minutesLeft = isLockedOut(req, email);
  if (minutesLeft) {
    return res.status(429).json({
      error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`,
    });
  }

  try {
    const admin = await dataService.getAdminByEmail(email);
    if (!admin || !auth.verifyPassword(password, admin.passwordHash)) {
      const nowLocked = recordFailure(req, email);
      dataService.logAudit({
        email: String(email).toLowerCase().trim(),
        action: "login-failed",
        detail: nowLocked ? "Failed login — account temporarily locked (15 min)" : "Failed login attempt",
      });
      if (nowLocked) {
        return res.status(429).json({ error: "Too many failed attempts. Try again in 15 minutes." });
      }
      return res.status(401).json({ error: "Invalid email or password." });
    }
    clearFailures(req, email);
    const token = auth.signToken({ email: admin.email, role: admin.role || "super_admin", pv: auth.passwordVersion(admin.passwordHash) });
    dataService.logAudit({ email: admin.email, action: "login", detail: "Logged in" });
    // The token goes back in an httpOnly cookie, not in the body — the
    // dashboard never holds it in JS, so XSS cannot read it.
    auth.setSessionCookie(res, token);
    res.json({ email: admin.email, role: admin.role || "super_admin" });
  } catch (e) {
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

router.post("/logout", (req, res) => {
  auth.clearSessionCookie(res);
  res.json({ success: true });
});

router.get("/me", adminAuth, (req, res) => {
  res.json({ email: req.admin.email, role: req.admin.role || "super_admin" });
});

router.post("/change-password", adminAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password are required." });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters." });
  }
  // The legacy admin-key session has no real account to update.
  if (req.admin.email === "admin-key") {
    return res.status(403).json({ error: "Log in with an email account to change its password." });
  }
  try {
    const admin = await dataService.getAdminByEmail(req.admin.email);
    if (!admin || !auth.verifyPassword(currentPassword, admin.passwordHash)) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }
    await dataService.updateAdminPassword(req.admin.email, auth.hashPassword(newPassword));
    dataService.logAudit({ email: req.admin.email, action: "change-password", detail: "Password changed" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Could not change password." });
  }
});

router.post("/forgot-password", async (req, res) => {
  await ensureDefaultAdmin();
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email is required." });

  // Always return the same generic response so we never reveal whether an
  // email is registered (prevents account enumeration).
  const generic = { message: "If that email is registered, a reset link has been sent." };
  try {
    const admin = await dataService.getAdminByEmail(email);
    if (!admin) return res.json(generic);

    const { token, hash } = auth.generateResetToken();
    await dataService.setAdminResetToken(admin.email, hash, new Date(Date.now() + RESET_TOKEN_TTL_MS));

    const link = buildResetLink(req, token);
    try {
      await sendPasswordResetEmail(admin.email, link);
    } catch (mailErr) {
      console.error("Password reset email failed:", mailErr.message);
      // Don't leak provider errors to the client; the token is still valid.
    }
    dataService.logAudit({ email: admin.email, action: "forgot-password", detail: "Reset link requested" });
    res.json(generic);
  } catch (e) {
    res.status(500).json({ error: "Could not process the request." });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required." });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters." });
  }
  try {
    const admin = await dataService.getAdminByResetTokenHash(auth.sha256(token));
    if (!admin || !admin.resetTokenExpires || new Date(admin.resetTokenExpires).getTime() < Date.now()) {
      return res.status(400).json({ error: "This reset link is invalid or has expired." });
    }
    // updateAdminPassword also clears the reset token so it can't be reused.
    await dataService.updateAdminPassword(admin.email, auth.hashPassword(newPassword));
    dataService.logAudit({ email: admin.email, action: "reset-password", detail: "Password reset via email link" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Could not reset the password." });
  }
});

router.get("/audit", adminAuth, async (req, res) => {
  try { res.json({ logs: await dataService.getAuditLog(100) }); }
  catch (e) { res.status(500).json({ error: "Could not load activity log." }); }
});

router.get("/stats", adminAuth, async (req, res) => {
  try { res.json(await dataService.getStats()); }
  catch (e) { res.status(500).json({ error: "Could not load stats." }); }
});

router.get("/analytics", adminAuth, async (req, res) => {
  try { res.json(await dataService.getAnalytics()); }
  catch (e) { res.status(500).json({ error: "Could not load analytics." }); }
});

router.get("/conversations", adminAuth, async (req, res) => {
  try { res.json({ conversations: await dataService.getAllConversations() }); }
  catch (e) { res.status(500).json({ error: "Could not load conversations." }); }
});

router.get("/leads", adminAuth, async (req, res) => {
  try { res.json({ leads: await dataService.getAllLeads() }); }
  catch (e) { res.status(500).json({ error: "Could not load leads." }); }
});

router.patch("/leads/:id", adminAuth, async (req, res) => {
  const { status } = req.body || {};
  if (!["new", "contacted", "converted"].includes(status)) {
    return res.status(400).json({ error: "Status must be new, contacted, or converted." });
  }
  try {
    const lead = await dataService.updateLeadStatus(req.params.id, status);
    if (!lead) return res.status(404).json({ error: "Lead not found." });
    // Reference the lead by id, not by name: the audit log outlives the lead,
    // so a name here would survive that person's erasure.
    dataService.logAudit({ email: req.admin.email, action: "lead-status", detail: `Lead ${req.params.id} → ${status}` });
    res.json({ lead });
  } catch (e) { res.status(500).json({ error: "Could not update lead." }); }
});

// ─── DATA ERASURE ───────────────────────────────────────────────────────────
// DELETE /api/admin/leads/:id — remove a single lead record.
router.delete("/leads/:id", adminAuth, async (req, res) => {
  try {
    const ok = await dataService.deleteLead(req.params.id);
    if (!ok) return res.status(404).json({ error: "Lead not found." });
    // The audit trail deliberately records only the id, never the person's
    // details — an erasure must not leave their data behind in the log.
    dataService.logAudit({ email: req.admin.email, action: "lead-delete", detail: `Lead ${req.params.id} deleted` });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Could not delete lead." }); }
});

// POST /api/admin/erase { email } — handle a "delete my data" request: removes
// the person's lead record(s) and the chat transcript(s) they came from.
router.post("/erase", adminAuth, auth.requireSuperAdmin, async (req, res) => {
  const { email } = req.body || {};
  if (!email || !String(email).includes("@")) {
    return res.status(400).json({ error: "A valid email is required." });
  }
  try {
    const result = await dataService.deleteByEmail(email);
    dataService.logAudit({
      email: req.admin.email,
      action: "data-erasure",
      detail: `Erased ${result.leads} lead(s) and ${result.conversations} conversation(s)`,
    });
    res.json({ success: true, ...result });
  } catch (e) { res.status(500).json({ error: "Could not complete the erasure." }); }
});

router.get("/faqs", adminAuth, async (req, res) => {
  try { res.json({ faqs: await dataService.getAllFaqs() }); }
  catch (e) { res.status(500).json({ error: "Could not load FAQs." }); }
});

router.post("/faqs", adminAuth, async (req, res) => {
  const { category, question, answer } = req.body || {};
  if (!question || !question.trim() || !answer || !answer.trim()) {
    return res.status(400).json({ error: "Question and answer are required." });
  }
  try {
    const faq = await dataService.addFaq({
      category: (category || "General").trim(),
      question: question.trim(),
      answer: answer.trim(),
    });
    dataService.logAudit({ email: req.admin.email, action: "faq-add", detail: `Added FAQ: ${faq.question}` });
    res.status(201).json({ faq });
  } catch (e) { res.status(500).json({ error: "Could not add FAQ." }); }
});

// Bulk import — the admin panel parses Excel/CSV in the browser and sends
// clean rows here. Duplicate questions (case-insensitive) are skipped so the
// same file can be re-uploaded safely after edits.
router.post("/faqs/import", adminAuth, async (req, res) => {
  const { faqs } = req.body || {};
  if (!Array.isArray(faqs) || !faqs.length) {
    return res.status(400).json({ error: "No FAQ rows received. Upload a file with Question and Answer columns." });
  }
  if (faqs.length > 500) {
    return res.status(400).json({ error: "Too many rows in one import (max 500). Split the file and try again." });
  }
  try {
    const existing = await dataService.getAllFaqs();
    const seen = new Set(existing.map((f) => (f.question || "").trim().toLowerCase()));
    let added = 0, skippedDuplicate = 0, skippedInvalid = 0;
    for (const row of faqs) {
      const question = typeof row.question === "string" ? row.question.trim() : "";
      const answer = typeof row.answer === "string" ? row.answer.trim() : "";
      if (!question || !answer) { skippedInvalid++; continue; }
      const key = question.toLowerCase();
      if (seen.has(key)) { skippedDuplicate++; continue; }
      const category = (typeof row.category === "string" && row.category.trim()) || "General";
      await dataService.addFaq({ category: category.slice(0, 60), question: question.slice(0, 500), answer: answer.slice(0, 4000) });
      seen.add(key);
      added++;
    }
    dataService.logAudit({
      email: req.admin.email,
      action: "faq-import",
      detail: `Imported ${added} FAQs (${skippedDuplicate} duplicates, ${skippedInvalid} invalid rows skipped)`,
    });
    res.json({ added, skippedDuplicate, skippedInvalid, total: faqs.length });
  } catch (e) { res.status(500).json({ error: "Import failed partway. Refresh the FAQ list to see what was added, then re-upload — duplicates are skipped automatically." }); }
});

router.put("/faqs/:id", adminAuth, async (req, res) => {
  const { category, question, answer } = req.body || {};
  if ((question != null && !question.trim()) || (answer != null && !answer.trim())) {
    return res.status(400).json({ error: "Question and answer cannot be empty." });
  }
  try {
    const updates = {};
    if (category != null) updates.category = category.trim() || "General";
    if (question != null) updates.question = question.trim();
    if (answer != null) updates.answer = answer.trim();
    const faq = await dataService.updateFaq(req.params.id, updates);
    if (!faq) return res.status(404).json({ error: "FAQ not found." });
    dataService.logAudit({ email: req.admin.email, action: "faq-edit", detail: `Edited FAQ: ${faq.question}` });
    res.json({ faq });
  } catch (e) { res.status(500).json({ error: "Could not update FAQ." }); }
});

router.delete("/faqs/:id", adminAuth, async (req, res) => {
  try {
    const ok = await dataService.deleteFaq(req.params.id);
    if (!ok) return res.status(404).json({ error: "FAQ not found." });
    dataService.logAudit({ email: req.admin.email, action: "faq-delete", detail: `Deleted FAQ id ${req.params.id}` });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Could not delete FAQ." }); }
});

// ─── KNOWLEDGE BASE ──────────────────────────────────────────────────────────
router.get("/knowledge", adminAuth, async (req, res) => {
  try { res.json({ knowledge: await dataService.getAllKnowledge() }); }
  catch (e) { res.status(500).json({ error: "Could not load knowledge base." }); }
});

router.post("/knowledge", adminAuth, async (req, res) => {
  const { title, content, order } = req.body || {};
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "A section title is required." });
  }
  try {
    const entry = await dataService.addKnowledge({
      title: title.trim(),
      content: (content || "").trim(),
      order: Number.isFinite(order) ? order : undefined,
    });
    dataService.logAudit({ email: req.admin.email, action: "kb-add", detail: `Added section: ${entry.title}` });
    res.status(201).json({ entry });
  } catch (e) { res.status(500).json({ error: "Could not add section." }); }
});

router.put("/knowledge/:id", adminAuth, async (req, res) => {
  const { title, content, order } = req.body || {};
  if (title != null && !title.trim()) {
    return res.status(400).json({ error: "Section title cannot be empty." });
  }
  try {
    const updates = {};
    if (title != null) updates.title = title.trim();
    if (content != null) updates.content = content.trim();
    if (order != null && Number.isFinite(order)) updates.order = order;
    const entry = await dataService.updateKnowledge(req.params.id, updates);
    if (!entry) return res.status(404).json({ error: "Section not found." });
    dataService.logAudit({ email: req.admin.email, action: "kb-edit", detail: `Edited section: ${entry.title}` });
    res.json({ entry });
  } catch (e) { res.status(500).json({ error: "Could not update section." }); }
});

router.delete("/knowledge/:id", adminAuth, async (req, res) => {
  try {
    const ok = await dataService.deleteKnowledge(req.params.id);
    if (!ok) return res.status(404).json({ error: "Section not found." });
    dataService.logAudit({ email: req.admin.email, action: "kb-delete", detail: `Deleted section id ${req.params.id}` });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Could not delete section." }); }
});

// ─── WIDGET QUICK-ACTION CARDS ──────────────────────────────────────────────
router.put("/quick-actions", adminAuth, async (req, res) => {
  const { quickActions } = req.body || {};
  if (!Array.isArray(quickActions)) {
    return res.status(400).json({ error: "quickActions must be a list of cards." });
  }
  const clean = [];
  for (const c of quickActions.slice(0, 6)) {
    const icon = String((c && c.icon) || "✨").trim().slice(0, 8);
    const title = String((c && c.title) || "").trim().slice(0, 30);
    const subtitle = String((c && c.subtitle) || "").trim().slice(0, 40);
    const type = c && c.type === "link" ? "link" : "message";
    const value = String((c && c.value) || "").trim().slice(0, 300);
    if (!title || !value) continue;
    if (type === "link" && !/^https?:\/\//i.test(value)) continue;
    clean.push({ icon, title, subtitle, type, value });
  }
  if (clean.length < 2) {
    return res.status(400).json({ error: "At least 2 complete cards are required (title + message/URL; links must start with http)." });
  }
  try {
    await dataService.setSetting("quickActions", clean);
    dataService.logAudit({ email: req.admin.email, action: "quick-actions-edit", detail: `Saved ${clean.length} welcome card(s)` });
    res.json({ quickActions: clean });
  } catch (e) { res.status(500).json({ error: "Could not save cards." }); }
});

// ─── SUGGESTED QUESTIONS ────────────────────────────────────────────────────
router.put("/suggestions", adminAuth, async (req, res) => {
  const { suggestions } = req.body || {};
  if (!Array.isArray(suggestions)) {
    return res.status(400).json({ error: "Suggestions must be a list of questions." });
  }
  const clean = suggestions.map((s) => String(s).trim().slice(0, 60)).filter(Boolean).slice(0, 8);
  if (!clean.length) {
    return res.status(400).json({ error: "Add at least one suggested question." });
  }
  try {
    await dataService.setSetting("suggestions", clean);
    dataService.logAudit({ email: req.admin.email, action: "suggestions-edit", detail: `Saved ${clean.length} suggested question(s)` });
    res.json({ suggestions: clean });
  } catch (e) { res.status(500).json({ error: "Could not save suggestions." }); }
});

// ─── WIDGET TEASERS ──────────────────────────────────────────────────────────
router.put("/teasers", adminAuth, async (req, res) => {
  const { teasers } = req.body || {};
  if (!Array.isArray(teasers)) {
    return res.status(400).json({ error: "Teasers must be a list of messages." });
  }
  const clean = teasers.map((t) => String(t).trim()).filter(Boolean).slice(0, 10);
  if (!clean.length) {
    return res.status(400).json({ error: "Add at least one teaser message." });
  }
  try {
    await dataService.setSetting("teasers", clean);
    dataService.logAudit({ email: req.admin.email, action: "teasers-edit", detail: `Saved ${clean.length} teaser message(s)` });
    res.json({ teasers: clean });
  } catch (e) { res.status(500).json({ error: "Could not save teasers." }); }
});

router.get("/feedback", adminAuth, async (req, res) => {
  try { res.json({ feedback: await dataService.getAllFeedback() }); }
  catch (e) { res.status(500).json({ error: "Could not load feedback." }); }
});

// ─── APPEARANCE / THEME ──────────────────────────────────────────────────────
// Colors, bot name, mascot and logo images — all editable from the dashboard so
// staff can rebrand the chatbot with no code change. Images are stored as data
// URIs in settings and sent one at a time (each large) to stay under the 1 MB
// request cap. The widget reads all of this from /api/chat/config.
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
// voiceA / voiceB are the two ends of the live-voice button's gradient.
const THEME_COLOR_KEYS = ["gold", "headerA", "headerB", "headerC", "userBubble", "voiceA", "voiceB"];
const IMG_DATA_RE = /^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,[a-z0-9+/=\s]+$/i;
const MAX_IMG_CHARS = 900000; // ~660 KB after base64 — keeps each PUT under the JSON cap
// Only these Google Fonts may be selected — an allowlist so a value can never
// smuggle arbitrary markup into the font <link> the widget builds.
const ALLOWED_FONTS = ["Roboto", "Poppins", "Inter", "Lato", "Open Sans", "Nunito", "Montserrat", "Playfair Display", "Merriweather", "Noto Sans"];

function sanitizeTheme(input) {
  const out = {};
  if (input && typeof input === "object") {
    if (input.colors && typeof input.colors === "object") {
      const colors = {};
      for (const k of THEME_COLOR_KEYS) {
        const v = input.colors[k];
        if (typeof v === "string" && HEX_RE.test(v.trim())) colors[k] = v.trim();
      }
      if (Object.keys(colors).length) out.colors = colors;
    }
    if (typeof input.botName === "string") out.botName = input.botName.trim().slice(0, 40); // "" clears to default
    if (typeof input.font === "string") { const f = input.font.trim(); out.font = ALLOWED_FONTS.includes(f) ? f : ""; }
    if (typeof input.welcomeText === "string") out.welcomeText = input.welcomeText.trim().slice(0, 300);
    if (typeof input.whatsapp === "string") out.whatsapp = input.whatsapp.replace(/[^\d]/g, "").slice(0, 20);
    if (typeof input.headerStatus === "string") out.headerStatus = input.headerStatus.trim().slice(0, 60);
    if (Array.isArray(input.taglines)) {
      out.taglines = input.taglines.map((x) => String(x).trim().slice(0, 80)).filter(Boolean).slice(0, 6);
    }
  }
  return out;
}

router.get("/theme", adminAuth, async (req, res) => {
  try { res.json({ theme: (await dataService.getSetting("theme")) || {} }); }
  catch (e) { res.status(500).json({ error: "Could not load appearance settings." }); }
});

router.put("/theme", adminAuth, async (req, res) => {
  try {
    const current = (await dataService.getSetting("theme")) || {};
    const clean = sanitizeTheme(req.body || {});
    const next = { ...current };
    if (clean.colors) next.colors = { ...(current.colors || {}), ...clean.colors };
    // For each text field: a non-empty value sets it; an empty value clears it
    // back to the built-in default.
    for (const f of ["botName", "font", "welcomeText", "whatsapp", "headerStatus"]) {
      if (clean[f] != null) { if (clean[f]) next[f] = clean[f]; else delete next[f]; }
    }
    if (clean.taglines != null) { if (clean.taglines.length) next.taglines = clean.taglines; else delete next.taglines; }

    // Mascot / logo images arrive one at a time. An explicit null/"" resets to
    // the built-in default.
    for (const kind of ["mascot", "logo"]) {
      if (req.body && kind in req.body) {
        const val = req.body[kind];
        if (val === null || val === "") { delete next[kind]; continue; }
        if (typeof val !== "string" || !IMG_DATA_RE.test(val.trim())) {
          return res.status(400).json({ error: `The ${kind} must be a PNG, JPG, WebP, or SVG image.` });
        }
        if (val.length > MAX_IMG_CHARS) {
          return res.status(400).json({ error: `That ${kind} image is too large — please use one under ~600 KB.` });
        }
        next[kind] = val.trim();
      }
    }

    await dataService.setSetting("theme", next);
    dataService.logAudit({ email: req.admin.email, action: "theme-edit", detail: "Updated chatbot appearance" });
    res.json({ theme: next });
  } catch (e) { res.status(500).json({ error: "Could not save appearance settings." }); }
});

// ─── GENERAL SETTINGS (contact, hours, greeting, offer, toggles, courses) ────
function sanitizeGeneral(input) {
  const out = {};
  if (!input || typeof input !== "object") return out;
  const str = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : undefined);
  const fields = { contactPhone: 40, contactEmail: 120, contactUrl: 120, businessHours: 120, greeting: 40, offerBanner: 160 };
  for (const [k, n] of Object.entries(fields)) { const v = str(input[k], n); if (v !== undefined) out[k] = v; }
  if (Array.isArray(input.courses)) out.courses = input.courses.map((c) => String(c).trim().slice(0, 60)).filter(Boolean).slice(0, 20);
  if (input.features && typeof input.features === "object") {
    out.features = {
      voice: input.features.voice !== false,
      languages: input.features.languages !== false,
      breathing: input.features.breathing !== false,
    };
  }
  if (input.teaserSeconds != null) { const n = Math.round(Number(input.teaserSeconds)); if (Number.isFinite(n)) out.teaserSeconds = Math.min(60, Math.max(3, n)); }
  if (typeof input.showBadge === "boolean") out.showBadge = input.showBadge;
  return out;
}

router.get("/general", adminAuth, async (req, res) => {
  try { res.json({ general: (await dataService.getSetting("general")) || {} }); }
  catch (e) { res.status(500).json({ error: "Could not load general settings." }); }
});

router.put("/general", adminAuth, async (req, res) => {
  try {
    const current = (await dataService.getSetting("general")) || {};
    const next = { ...current, ...sanitizeGeneral(req.body || {}) };
    await dataService.setSetting("general", next);
    dataService.logAudit({ email: req.admin.email, action: "general-edit", detail: "Updated general settings" });
    res.json({ general: next });
  } catch (e) { res.status(500).json({ error: "Could not save general settings." }); }
});

// ─── LEAD ROUTING (auto-notify staff of new leads) ──────────────────────────
router.get("/lead-routing", adminAuth, async (req, res) => {
  try {
    const cfg = (await dataService.getSetting("leadRouting")) || { mode: "all", staff: [] };
    res.json({ leadRouting: cfg });
  } catch (e) { res.status(500).json({ error: "Could not load lead routing." }); }
});

router.put("/lead-routing", adminAuth, async (req, res) => {
  const { mode, staff } = req.body || {};
  const cleanMode = ["off", "all", "course"].includes(mode) ? mode : "all";
  const cleanStaff = [];
  if (Array.isArray(staff)) {
    for (const s of staff.slice(0, 30)) {
      const name = String((s && s.name) || "").trim().slice(0, 60);
      const email = String((s && s.email) || "").trim().slice(0, 120);
      const courses = String((s && s.courses) || "").trim().slice(0, 200);
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) continue;
      cleanStaff.push({ name, email, courses });
    }
  }
  try {
    const cfg = { mode: cleanMode, staff: cleanStaff };
    await dataService.setSetting("leadRouting", cfg);
    dataService.logAudit({ email: req.admin.email, action: "lead-routing-edit", detail: `Routing ${cleanMode}, ${cleanStaff.length} staff` });
    res.json({ leadRouting: cfg });
  } catch (e) { res.status(500).json({ error: "Could not save lead routing." }); }
});

// ─── TEAM / ADMIN ACCOUNTS (super admin only) ───────────────────────────────
router.get("/team", adminAuth, auth.requireSuperAdmin, async (req, res) => {
  try { res.json({ team: await dataService.getAllAdmins(), me: req.admin.email }); }
  catch (e) { res.status(500).json({ error: "Could not load the team." }); }
});

router.post("/team", adminAuth, auth.requireSuperAdmin, async (req, res) => {
  const { email, password, role } = req.body || {};
  const e = String(email || "").toLowerCase().trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return res.status(400).json({ error: "A valid email is required." });
  if (!password || String(password).length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });
  const cleanRole = role === "super_admin" ? "super_admin" : "staff";
  try {
    if (await dataService.getAdminByEmail(e)) return res.status(409).json({ error: "An account with that email already exists." });
    await dataService.createAdmin({ email: e, passwordHash: auth.hashPassword(password), role: cleanRole });
    dataService.logAudit({ email: req.admin.email, action: "team-add", detail: `Added ${cleanRole}: ${e}` });
    res.status(201).json({ success: true, member: { email: e, role: cleanRole } });
  } catch (err) { res.status(500).json({ error: "Could not add the team member." }); }
});

router.patch("/team/:email", adminAuth, auth.requireSuperAdmin, async (req, res) => {
  const e = String(req.params.email || "").toLowerCase().trim();
  const { role } = req.body || {};
  if (role !== "super_admin" && role !== "staff") return res.status(400).json({ error: "Role must be super_admin or staff." });
  if (e === String(req.admin.email).toLowerCase().trim() && role !== "super_admin") {
    return res.status(400).json({ error: "You can't remove your own super-admin access." });
  }
  try {
    // Never leave the team with zero super admins.
    if (role === "staff") {
      const supers = (await dataService.getAllAdmins()).filter((m) => (m.role || "super_admin") === "super_admin");
      if (supers.length <= 1 && supers.some((m) => m.email === e)) {
        return res.status(400).json({ error: "There must be at least one super admin." });
      }
    }
    const updated = await dataService.updateAdminRole(e, role);
    if (!updated) return res.status(404).json({ error: "Team member not found." });
    dataService.logAudit({ email: req.admin.email, action: "team-role", detail: `${e} → ${role}` });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Could not update the role." }); }
});

router.delete("/team/:email", adminAuth, auth.requireSuperAdmin, async (req, res) => {
  const e = String(req.params.email || "").toLowerCase().trim();
  if (e === String(req.admin.email).toLowerCase().trim()) {
    return res.status(400).json({ error: "You can't delete your own account while signed in." });
  }
  try {
    const team = await dataService.getAllAdmins();
    const target = team.find((m) => m.email === e);
    if (!target) return res.status(404).json({ error: "Team member not found." });
    const supers = team.filter((m) => (m.role || "super_admin") === "super_admin");
    if ((target.role || "super_admin") === "super_admin" && supers.length <= 1) {
      return res.status(400).json({ error: "There must be at least one super admin." });
    }
    await dataService.deleteAdmin(e);
    dataService.logAudit({ email: req.admin.email, action: "team-remove", detail: `Removed ${e}` });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Could not remove the team member." }); }
});

module.exports = router;
