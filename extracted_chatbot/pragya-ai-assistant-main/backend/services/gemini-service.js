/**
 * Gemini AI Service
 * Handles all communication with the Google Gemini API.
 * The API key is read from environment variables (never hardcoded).
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildSystemInstruction } = require("../data/system-prompt");

// Initialize the Gemini client with the key from .env
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Format admin-managed FAQs into a knowledge block for the system prompt.
 */
function formatFaqKnowledge(faqs = []) {
  if (!Array.isArray(faqs) || !faqs.length) return "";
  const lines = faqs.map(
    (f) => `- [${f.category || "General"}] Q: ${f.question}\n  A: ${f.answer}`
  );
  return `## SUPPLEMENTARY FAQs\nExtra quick answers. The KNOWLEDGE BASE above is the authoritative source of truth — if anything here conflicts with it (e.g. a price), always follow the KNOWLEDGE BASE.\n${lines.join("\n")}`;
}

/**
 * Rebuild the markdown knowledge base from admin-editable sections.
 * Returns "" so the static KNOWLEDGE_BASE fallback is used when empty.
 */
function formatKnowledge(entries = []) {
  if (!Array.isArray(entries) || !entries.length) return "";
  return (
    "# PRAGYA YOG SCHOOL — OFFICIAL KNOWLEDGE BASE\n\n" +
    entries
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((e) => `## ${e.title}\n${e.content}`)
      .join("\n\n")
  );
}

// Cache one model per unique system instruction. Knowledge/FAQs change rarely,
// so a single-entry cache avoids rebuilding the model on every message.
let cachedKey = null;
let cachedModel = null;

function getModel(knowledgeText, faqText, businessInfo) {
  if (!genAI) return null;
  // Inject today's date (Hong Kong time) so the bot never presents a retreat,
  // intake, or offer whose date has already passed as if it were upcoming. The
  // date is part of the cache key, so the model rebuilds once a day when the
  // date changes (negligible cost).
  const currentDate = new Date().toLocaleDateString("en-GB", {
    timeZone: "Asia/Hong_Kong", weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const bizKey = businessInfo ? JSON.stringify(businessInfo) : "";
  const key = currentDate + "|" + bizKey + "|" + knowledgeText + " " + faqText;
  if (key === cachedKey && cachedModel) return cachedModel;
  cachedKey = key;
  cachedModel = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    systemInstruction: buildSystemInstruction(knowledgeText, faqText, currentDate, businessInfo),
  });
  return cachedModel;
}

/**
 * Get an AI response for a user message, with full conversation history.
 * @param {string} userMessage - the latest user message
 * @param {Array} history - array of {role, content} previous messages
 * @returns {Promise<string>} - the assistant's reply
 */
// Reject a hanging promise after `ms` so a slow upstream never stalls a request.
function withTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`AI timeout after ${ms}ms`)), ms);
    }),
  ]);
}

/**
 * Pick only the FAQs relevant to THIS question instead of stuffing all of
 * them into the prompt. With 100+ FAQs the full list makes the system prompt
 * huge — slow to process and quick to burn the free-tier quota. Sending the
 * ~10 best matches keeps answers fast while preserving quality.
 */
function selectRelevantFaqs(userMessage, faqs = [], limit = 10) {
  if (!Array.isArray(faqs) || faqs.length <= limit) return faqs;
  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const stop = new Set(["the", "a", "an", "is", "are", "do", "you", "i", "to", "of", "for", "in", "on", "how", "what", "can", "does", "your", "my", "and", "me", "with", "about", "tell", "any", "have", "there", "it"]);
  const qWords = [...new Set(norm(userMessage).filter((w) => !stop.has(w) && w.length > 2))];
  if (!qWords.length) return faqs.slice(0, limit);

  const scored = faqs.map((f) => {
    const qSet = new Set(norm(f.question).filter((w) => !stop.has(w)));
    const hay = `${f.question} ${f.answer}`.toLowerCase();
    let score = 0;
    for (const w of qWords) {
      if (qSet.has(w)) score += 2;      // a hit in the FAQ's question counts double
      else if (hay.includes(w)) score += 1; // a hit anywhere in the answer still counts
    }
    return { f, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const relevant = scored.filter((s) => s.score > 0).slice(0, limit).map((s) => s.f);
  // If nothing matched (e.g. a greeting), send a small default slice so common
  // follow-ups still have some FAQ backing.
  return relevant.length ? relevant : faqs.slice(0, 5);
}

async function getAIResponse(userMessage, history = [], faqs = [], knowledge = [], businessInfo = null) {
  const knowledgeText = formatKnowledge(knowledge);
  const relevantFaqs = selectRelevantFaqs(userMessage, faqs);
  const faqText = formatFaqKnowledge(relevantFaqs);
  const activeModel = getModel(knowledgeText, faqText, businessInfo);

  // If no API key is configured, use the offline fallback engine
  if (!activeModel) {
    return getFallbackResponse(userMessage, faqs, knowledge);
  }

  try {
    // Convert our history format to Gemini's format
    // Gemini uses "user" and "model" roles
    const geminiHistory = history.slice(-10).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Gemini requires the history to start with a "user" turn.
    // Trim any leading "model" messages just in case.
    while (geminiHistory.length && geminiHistory[0].role === "model") {
      geminiHistory.shift();
    }

    const ask = () => {
      const chat = activeModel.startChat({
        history: geminiHistory,
        generationConfig: {
          // 400 was too low — detailed price/course answers were cut off
          // mid-sentence ("half answers"). 900 gives headroom; the system
          // prompt still instructs the model to stay concise.
          maxOutputTokens: 900,
          temperature: 0.6,
        },
      });
      return chat.sendMessage(userMessage);
    };

    let result;
    try {
      result = await withTimeout(ask(), 12000);
    } catch (firstError) {
      const msg = String(firstError.message);
      // A timeout means Gemini is slow right now — retrying usually just times
      // out again and makes the visitor wait ~30s. Fall straight through to the
      // instant keyword fallback instead. Quota (429) also won't recover — skip.
      if (msg.includes("timeout") || msg.includes("429")) throw firstError;
      // Only retry genuinely transient failures (network blip, brief 5xx).
      console.warn("Gemini attempt 1 failed, retrying:", msg);
      await new Promise((r) => setTimeout(r, 600));
      result = await withTimeout(ask(), 10000);
    }

    const text = result.response.text().trim();
    if (!text) throw new Error("Empty response from model");
    return text;
  } catch (error) {
    console.error("Gemini API error:", error.message);
    // Graceful fallback if the API fails
    return getFallbackResponse(userMessage, faqs, knowledge);
  }
}

/**
 * Find the best-matching admin FAQ for a message using simple word overlap.
 * Returns the answer if a confident match is found, otherwise null.
 */
function matchFaq(userMessage, faqs = []) {
  if (!Array.isArray(faqs) || !faqs.length) return null;
  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const stop = new Set(["the", "a", "an", "is", "are", "do", "you", "i", "to", "of", "for", "in", "on", "how", "what", "can", "does", "your", "my", "and", "me"]);
  const qWords = norm(userMessage).filter((w) => !stop.has(w));
  if (!qWords.length) return null;

  let best = null;
  let bestScore = 0;
  for (const f of faqs) {
    const fWords = new Set(norm(f.question).filter((w) => !stop.has(w)));
    if (!fWords.size) continue;
    const overlap = qWords.filter((w) => fWords.has(w)).length;
    if (overlap < 2) continue; // need at least two shared keywords to be safe
    // Containment: how much of the smaller keyword set is shared.
    const score = overlap / Math.min(qWords.length, fWords.size);
    if (score > bestScore) { bestScore = score; best = f; }
  }
  // Require a reasonably strong overlap to avoid wrong answers.
  return bestScore >= 0.5 ? best.answer : null;
}

/**
 * Search the editable knowledge base for the section most relevant to the
 * question, so the offline engine can answer far more than the hardcoded
 * keyword branches (retreats, kids camps, workshops, consultations, etc.).
 */
function matchKnowledge(userMessage, knowledge = []) {
  if (!Array.isArray(knowledge) || !knowledge.length) return null;
  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const stop = new Set(["the", "a", "an", "is", "are", "do", "you", "i", "to", "of", "for", "in", "on", "how", "what", "can", "does", "your", "my", "and", "me", "with", "about", "tell", "any", "have", "there", "it"]);
  const qWords = [...new Set(norm(userMessage).filter((w) => !stop.has(w) && w.length > 2))];
  if (!qWords.length) return null;

  let best = null;
  let bestScore = 0;
  for (const k of knowledge) {
    const hay = `${k.title} ${k.content}`.toLowerCase();
    const titleWords = new Set(norm(k.title));
    let hits = 0;
    let titleHits = 0;
    for (const w of qWords) {
      if (hay.includes(w)) hits++;
      if (titleWords.has(w)) titleHits++;
    }
    const score = hits / qWords.length + titleHits * 0.4; // reward title matches
    if (score > bestScore) { bestScore = score; best = k; }
  }
  // Need at least half the keywords present to trust the match.
  if (!best || bestScore < 0.5) return null;

  let content = (best.content || "").trim();
  if (content.length > 700) content = content.slice(0, 700).replace(/\n[^\n]*$/, "") + "\n…";
  return `${content}\n\nFor full details, visit pyshk.com or call +852 6708 2503. 🙏`;
}

/**
 * Offline fallback — keyword-based responses.
 * Used when no API key is set or the API call fails.
 * Ensures the chatbot ALWAYS responds, even without Gemini.
 */
function getFallbackResponse(userMessage, faqs = [], knowledge = []) {
  // Admin-managed FAQs take priority in offline mode too.
  const faqAnswer = matchFaq(userMessage, faqs);
  if (faqAnswer) return faqAnswer;

  const q = userMessage.toLowerCase();
  const has = (...words) => words.some((w) => q.includes(w));

  if (has("hi", "hello", "hey", "namaste") && q.length < 20)
    return "Namaste! 🙏 Welcome to Pragya Yog School — Where Science Meets Spirituality. I'm PragyaBot. I can help with our classes, courses, fees, teachers, or enrollment. What would you like to know?";

  if (has("price", "cost", "fee", "how much", "membership"))
    return "Here are our popular memberships:\n• 3-Class Trial Pass: HK$450\n• Drop-in: HK$288\n• 4-Class/Month (6M): HK$4,895\n• 8-Class/Month (6M): HK$7,648\n• Unlimited (6M): HK$9,707\n\n🎉 Anniversary Offer: up to 25% off until 5 July 2026! Would you like help choosing a plan?";

  if (has("teacher training", "ttc", "200 hour", "200-hour"))
    return "Our 200-Hour Yog Teacher Training is the only university-affiliated TTC in Hong Kong! 🎓\n• Fee: HK$38,000\n• Dates: April–May 2026\n• Schedule: Tue/Thu 7–9am + weekends 9am–5pm\n• Eligibility: 12 months practice, injury-free\n\nA scholarship is available too. Want the curriculum details?";

  if (has("enroll", "join", "sign up", "register", "trial", "book"))
    return "Wonderful! 🙏 The easiest way to start is our 3-Class Trial Pass (HK$450) — 3 classes over 3 weeks, and the fee counts toward your membership if you join! Let me get a few details so our team can reach out to you personally.";

  if (has("class", "course", "what do you offer"))
    return "We offer 9 regular group classes: Advanced, Balance, Flow, Pragya (our signature), Flexibility, Restorative, Strength, Pregnancy-Friendly, and Traditional — plus private 1-on-1 and 2-on-1 sessions. Which interests you?";

  if (has("teacher", "instructor", "founder", "who teaches"))
    return "Our faculty includes founder Aarya Kuldeep (PhD Scholar, MSc Yogic Science), three Master Teachers (Dr. Yatendra Dutt Amoli, Dr. Usha Jaiswal, Dr. Rakesh Jaiswal), and instructors like Ashish, Louise, Charlotte, Tavia, Angela, and Marcus. Want to know more about any of them?";

  if (has("where", "location", "address", "contact", "phone", "email"))
    return "📍 1303-04, 13/F Tak Woo House, 1-3 Wo On Lane, Central, Hong Kong\n📞 +852 6708 2503\n✉️ info@pyshk.com\n🌐 pyshk.com\n\nHow else can I help?";

  if (has("cancel", "refund", "freeze", "suspend"))
    return "For memberships: all are non-refundable and non-transferable. You can suspend once per term (medical/travel) with 14 days notice + a HK$500 fee. Group classes: cancel 6+ hours before. For specific cases, contact info@pyshk.com or +852 6708 2503.";

  // Long-tail topics (retreats, kids camps, workshops, consultations…) —
  // answer straight from the editable knowledge base.
  const kbAnswer = matchKnowledge(userMessage, knowledge);
  if (kbAnswer) return kbAnswer;

  return "That's a great question! For the most accurate answer, please reach our team:\n📞 +852 6708 2503\n✉️ info@pyshk.com\n🌐 pyshk.com/contact/\n\nMeanwhile, I can help with courses, fees, teachers, schedules, or enrollment. What would you like?";
}

/**
 * Detect if a message shows enrollment intent (to trigger the lead form).
 */
function detectLeadIntent(message) {
  const q = message.toLowerCase();
  const leadKeywords = ["enroll", "join", "sign up", "register", "i want to start", "get started", "book a trial", "interested in joining", "how do i apply"];
  return leadKeywords.some((k) => q.includes(k));
}

module.exports = { getAIResponse, detectLeadIntent, getFallbackResponse, selectRelevantFaqs };
