/**
 * Chat Routes
 * POST /api/chat          — send a message, get an AI reply
 * GET  /api/chat/history  — get conversation history for a session
 * GET  /api/chat/suggestions — get suggested starter questions
 */

const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { getAIResponse, detectLeadIntent, getFallbackResponse } = require("../services/gemini-service");
const { SUGGESTED_QUESTIONS } = require("../data/system-prompt");
const dataService = require("../services/data-service");

// Longest message we accept — protects the AI context and the database.
const MAX_MESSAGE_LENGTH = 1500;

// When the visitor picks a specific language in the widget, force the reply
// into it. (The system prompt already auto-detects language for the default
// English/unset case; this pins Cantonese vs Mandarin, which written Chinese
// alone can't disambiguate.) Mapped from a short code server-side so the client
// can never inject arbitrary instruction text into the model.
// Only explicit picks force a language. "auto" (or missing/unknown) sends no
// directive, so the system prompt's auto-detect replies in whatever language
// the visitor wrote in.
const LANGUAGE_DIRECTIVES = {
  en: "English",
  yue: "Cantonese (廣東話), written in Traditional Chinese characters as used in Hong Kong",
  cmn: "Mandarin Chinese (普通话), written in Simplified Chinese characters",
};
function applyLanguageDirective(message, language) {
  const dir = typeof language === "string" ? LANGUAGE_DIRECTIVES[language] : null;
  if (!dir) return message;
  return `${message}\n\n[Reply ONLY in ${dir}. Keep "Pragya Yog School", any HK$ prices, the email and phone number exactly as written.]`;
}

/**
 * Topic-aware follow-up chips shown under the bot's reply.
 * Keyword-matched on the user's message so the next tap is always relevant.
 */
function getFollowUpSuggestions(userMessage) {
  const q = userMessage.toLowerCase();
  const has = (...words) => words.some((w) => q.includes(w));

  if (has("teacher training", "ttc", "200 hour", "200-hour", "certification", "certificate"))
    return ["TTC curriculum details", "TTC dates & fees", "Is there a scholarship?", "How do I apply?"];
  if (has("price", "cost", "fee", "membership", "how much", "package", "offer", "discount"))
    return ["Compare memberships", "Any current offers?", "Book a trial class", "Payment options"];
  if (has("schedule", "timing", "time", "book", "booking", "when", "calendar"))
    return ["Cancellation policy", "How do I book?", "Bad weather policy", "View class types"];
  if (has("teacher", "instructor", "founder", "guru", "who teaches"))
    return ["About the founder", "Master teachers", "Book a class", "Teacher Training info"];
  if (has("where", "location", "address", "contact", "phone", "email", "reach"))
    return ["Class schedule", "Book a trial class", "View courses", "Membership prices"];
  if (has("beginner", "new to yoga", "first time", "never done"))
    return ["Best classes for beginners", "3-Class Trial Pass", "What should I bring?", "Class schedule"];
  if (has("private", "1-on-1", "one on one", "personal"))
    return ["Private class prices", "Online private classes", "Book a private class", "Group classes instead"];
  if (has("cancel", "refund", "freeze", "suspend", "policy"))
    return ["Membership rules", "Contact the team", "Class schedule", "View courses"];

  return ["View Courses", "Membership Prices", "Book a Trial", "Contact Info"];
}

// POST /api/chat — main chat endpoint
// Designed to NEVER fail from the visitor's point of view: any internal
// error degrades to the offline fallback engine instead of an error page.
router.post("/", async (req, res) => {
  let message = "";
  let sessionId = "";
  try {
    let language = "";
    ({ message, sessionId, language } = req.body || {});

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }
    message = message.trim().slice(0, MAX_MESSAGE_LENGTH);

    // Create a session ID if none provided
    if (!sessionId) sessionId = uuidv4();

    // Get conversation history for context
    const convo = await dataService.getConversation(sessionId);
    const history = (convo.messages || []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Save the user's message (non-fatal if storage hiccups)
    await dataService.saveMessage(sessionId, "user", message).catch(() => {});

    // Load the admin-editable knowledge base + FAQs so the bot always
    // answers from the latest info staff have set in the dashboard.
    let faqs = [];
    let knowledge = [];
    try { faqs = await dataService.getAllFaqs(); } catch (e) { faqs = []; }
    try { knowledge = await dataService.getAllKnowledge(); } catch (e) { knowledge = []; }

    // Admin-editable business info (contact, hours, offer, greeting) so the bot
    // always answers with the school's current, staff-set details.
    let general = {};
    try { general = (await dataService.getSetting("general")) || {}; } catch (e) { general = {}; }
    const businessInfo = {
      contactPhone: general.contactPhone,
      contactEmail: general.contactEmail,
      contactUrl: general.contactUrl,
      businessHours: general.businessHours,
      offer: general.offerBanner,
      greeting: general.greeting,
    };

    // Get AI response (has its own timeout + retry + fallback inside).
    // The stored user message stays clean; only the copy sent to the model
    // carries the language directive.
    const reply = await getAIResponse(applyLanguageDirective(message, language), history, faqs, knowledge, businessInfo);

    // Save the assistant's reply (non-fatal if storage hiccups)
    await dataService.saveMessage(sessionId, "assistant", reply).catch(() => {});

    // Detect if we should show the lead form
    const showLeadForm = detectLeadIntent(message);

    res.json({
      reply,
      sessionId,
      showLeadForm,
      suggestions: showLeadForm ? [] : getFollowUpSuggestions(message),
    });
  } catch (error) {
    // Last line of defense: still answer the visitor via the offline engine.
    console.error("Chat error:", error.message);
    res.json({
      reply: getFallbackResponse(message || "hello"),
      sessionId: sessionId || uuidv4(),
      showLeadForm: false,
      suggestions: ["View Courses", "Membership Prices", "Book a Trial", "Contact Info"],
    });
  }
});

// GET /api/chat/history?sessionId=xxx
router.get("/history", async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ error: "sessionId required." });
    const convo = await dataService.getConversation(sessionId);
    res.json({ messages: convo.messages || [] });
  } catch (error) {
    res.status(500).json({ error: "Could not load history." });
  }
});

// DELETE /api/chat/session { sessionId } — a visitor erasing their own chat.
// The sessionId is an unguessable uuid held only by that visitor's browser, so
// possessing it is what authorises the delete.
router.delete("/session", async (req, res) => {
  try {
    const sessionId = (req.body && req.body.sessionId) || req.query.sessionId;
    if (!sessionId) return res.status(400).json({ error: "sessionId required." });
    await dataService.deleteConversation(sessionId);
    // Always report success: whether or not a transcript existed is not
    // something an unauthenticated caller should be able to probe for.
    res.json({ success: true, message: "Your chat history has been deleted." });
  } catch (error) {
    res.status(500).json({ error: "Could not delete the chat history." });
  }
});

// Default welcome quick-action cards — admins can replace them in the
// dashboard (Widget tab). type "message" sends text to the bot; type
// "link" opens a URL (e.g. the booking page) in a new tab.
const DEFAULT_QUICK_ACTIONS = [
  { icon: "🧘", title: "Book a Trial", subtitle: "3 classes · HK$450", type: "message", value: "I want to book a trial class" },
  { icon: "📅", title: "Class Schedule", subtitle: "View & book online", type: "link", value: "https://pyshk.com/schedule/" },
  { icon: "💰", title: "Memberships", subtitle: "Plans & pricing", type: "message", value: "How much is the membership? Show me the plans." },
  { icon: "🎓", title: "Teacher Training", subtitle: "200-Hr certified", type: "message", value: "Tell me about the 200-Hour Teacher Training" },
];

// GET /api/chat/suggestions — admin-editable, defaults as fallback
router.get("/suggestions", async (req, res) => {
  try {
    const saved = await dataService.getSetting("suggestions");
    res.json({ suggestions: Array.isArray(saved) && saved.length ? saved : SUGGESTED_QUESTIONS });
  } catch (e) {
    res.json({ suggestions: SUGGESTED_QUESTIONS });
  }
});

// GET /api/chat/config — everything the chat UI needs in one call
router.get("/config", async (req, res) => {
  let suggestions = SUGGESTED_QUESTIONS;
  let quickActions = DEFAULT_QUICK_ACTIONS;
  let theme = {};
  let general = {};
  try {
    const s = await dataService.getSetting("suggestions");
    if (Array.isArray(s) && s.length) suggestions = s;
    const q = await dataService.getSetting("quickActions");
    if (Array.isArray(q) && q.length) quickActions = q;
    // Admin-configured appearance (colors, bot name, mascot/logo images).
    const t = await dataService.getSetting("theme");
    if (t && typeof t === "object") theme = t;
    // Admin-configured general settings (greeting, offer, feature toggles,
    // lead-form courses, launcher options).
    const g = await dataService.getSetting("general");
    if (g && typeof g === "object") general = g;
  } catch (e) { /* fall back to defaults */ }
  res.json({ suggestions, quickActions, theme, general });
});

// GET /api/chat/mascot — the current chat mascot image. The website launcher
// bubble points here once and then always shows the admin's uploaded mascot,
// with no snippet edits when it's changed. Falls back to the bundled default.
router.get("/mascot", async (req, res) => {
  try {
    const theme = await dataService.getSetting("theme");
    const dataUri = theme && theme.mascot;
    const m = typeof dataUri === "string" && dataUri.match(/^data:(image\/[a-z.+-]+);base64,(.+)$/i);
    if (m) {
      res.set("Content-Type", m[1]);
      res.set("Cache-Control", "public, max-age=60");
      return res.send(Buffer.from(m[2], "base64"));
    }
  } catch (e) { /* fall through to the default file */ }
  res.set("Cache-Control", "public, max-age=60");
  res.sendFile(require("path").join(__dirname, "../../frontend/mascot.png"));
});

// ─── WIDGET TEASERS ─────────────────────────────────────────────────────────
// The rotating messages shown beside the chat bubble on the website.
// Admins edit them in the dashboard; these defaults are used until then.
const DEFAULT_TEASERS = [
  "Namaste 🙏 Questions? Chat with us!",
  "Try 3 classes for HK$450 — ask me how!",
  "🎉 Up to 25% OFF — ask about the offer!",
  "New to yoga? I'll suggest your first class 🧘",
  "Ask me in English, हिंदी or 中文!",
  "Curious about Teacher Training? Ask away 🎓",
];

// GET /api/chat/teasers — public, consumed by the widget snippet
router.get("/teasers", async (req, res) => {
  try {
    const saved = await dataService.getSetting("teasers");
    const teasers = Array.isArray(saved) && saved.length ? saved : DEFAULT_TEASERS;
    res.json({ teasers });
  } catch (e) {
    res.json({ teasers: DEFAULT_TEASERS });
  }
});

module.exports = router;
