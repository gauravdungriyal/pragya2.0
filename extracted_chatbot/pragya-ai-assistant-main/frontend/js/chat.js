/**
 * PRAGYA AI ASSISTANT — Frontend Chat Logic
 * Connects to the backend API for real AI responses.
 */

// ─── CONFIG ───────────────────────────────────────────────────────────────
// When embedded on pyshk.com, change this to your deployed backend URL,
// e.g. "https://pragya-ai.onrender.com"
const API_BASE = window.PRAGYA_API_BASE || "";

// ─── STATE ────────────────────────────────────────────────────────────────
let sessionId = localStorage.getItem("pragya_session") || null;
let selectedRating = 0;
let leadSubmitted = localStorage.getItem("pragya_lead_done") === "1";
let isSending = false;
let lastUserMessage = "";
const DEFAULT_CHIPS = ["View Courses", "Membership Prices", "Book a Trial", "Contact Info"];
let WHATSAPP_NUMBER = "85267082503";
let WELCOME_TEXT = ""; // admin override for the welcome description (blank = default)
let GREETING = "Namaste 🙏"; // admin-editable welcome greeting
// Lead-form course options — admin-editable via General settings.
let LEAD_COURSES = ["Regular Group Classes", "200-Hr Teacher Training", "Private Classes", "Kids Summer Camp", "Retreat", "Not sure yet"];

// ─── LANGUAGE ───────────────────────────────────────────────────────────────
// Two ways to work, and both are always available:
//  • "auto" (default) — the visitor just asks in ANY language and the reply
//    comes back in that same language. No selection needed. For typed chat the
//    backend/Gemini auto-detects; for voice we detect the reply's script to pick
//    the spoken voice, and recognise using the device's language.
//  • an explicit pick (English / Cantonese / Mandarin) — FORCES that language
//    for both text and voice, which is the only way to pin Cantonese vs Mandarin.
const LANGUAGES = {
  auto: { short: "Auto", recog: null, tts: null, placeholder: "Ask me anything",
          greet: "Hi! I'm listening — ask me anything, in any language.",
          ui: { listening: "Listening…", thinking: "Thinking…", speaking: "Speaking…", you: "You" } },
  en:  { short: "EN", recog: "en-US", tts: ["en-us", "en-gb", "en"], placeholder: "Ask me anything",
         greet: "Hi! I'm listening — ask me anything about our classes, prices, or teacher training.",
         ui: { listening: "Listening…", thinking: "Thinking…", speaking: "Speaking…", you: "You" } },
  yue: { short: "廣", recog: "zh-HK", tts: ["zh-hk", "yue", "zh"], placeholder: "問我任何問題",
         greet: "你好！我聽緊。可以問我任何關於課程、價錢或導師培訓嘅問題。",
         ui: { listening: "聆聽緊…", thinking: "諗緊…", speaking: "回應緊…", you: "你" } },
  cmn: { short: "普", recog: "zh-CN", tts: ["zh-cn", "zh-tw", "zh"], placeholder: "问我任何问题",
         greet: "你好！我在听。你可以问我任何关于课程、价格或导师培训的问题。",
         ui: { listening: "聆听中…", thinking: "思考中…", speaking: "回应中…", you: "你" } },
};
let chatLang = localStorage.getItem("pragya_lang") || "auto";
if (!LANGUAGES[chatLang]) chatLang = "auto";
function langCfg() { return LANGUAGES[chatLang] || LANGUAGES.auto; }

// Guess a language from the script of some text, so that in "auto" mode the
// spoken reply uses a matching voice (and recognition a matching language).
const SCRIPT_VOICES = {
  zh: ["zh-cn", "zh-tw", "zh-hk", "zh"],
  ja: ["ja"],
  ko: ["ko"],
  hi: ["hi"],
  en: ["en-us", "en-gb", "en"],
};
const SCRIPT_RECOG = { zh: "zh-CN", ja: "ja-JP", ko: "ko-KR", hi: "hi-IN", en: "en-US" };
function detectScript(text) {
  const s = String(text || "");
  if (/[぀-ヿ]/.test(s)) return "ja";       // kana
  if (/[가-힯]/.test(s)) return "ko";       // hangul
  if (/[一-鿿]/.test(s)) return "zh";       // CJK ideographs
  if (/[ऀ-ॿ]/.test(s)) return "hi";       // devanagari
  return "en";
}

// Reflect the current language in the header pill, the input placeholder, and
// the checked state of the menu options.
function applyLangToUI() {
  const cur = document.getElementById("langCurrent");
  if (cur) cur.textContent = langCfg().short;
  if (chatInput) chatInput.setAttribute("placeholder", langCfg().placeholder);
  document.querySelectorAll(".lang-opt").forEach((o) =>
    o.setAttribute("aria-checked", String(o.dataset.arg === chatLang))
  );
}
function setLang(code) {
  if (!LANGUAGES[code]) return;
  chatLang = code;
  localStorage.setItem("pragya_lang", code);
  applyLangToUI();
  closeLangMenu();
}
function toggleLangMenu() {
  const menu = document.getElementById("langMenu");
  const btn = document.getElementById("langBtn");
  if (!menu || !btn) return;
  const willOpen = menu.hasAttribute("hidden");
  menu.toggleAttribute("hidden", !willOpen);
  btn.setAttribute("aria-expanded", String(willOpen));
}
function closeLangMenu() {
  const menu = document.getElementById("langMenu");
  const btn = document.getElementById("langBtn");
  if (menu) menu.setAttribute("hidden", "");
  if (btn) btn.setAttribute("aria-expanded", "false");
}
// Close the language menu when clicking anywhere outside the picker.
document.addEventListener("click", (e) => {
  if (!e.target.closest(".lang-picker")) closeLangMenu();
});

// Welcome quick-action cards — replaced by the admin-configured set
// (dashboard → Widget tab) as soon as the config loads.
let QUICK_ACTIONS = [
  { icon: "🧘", title: "Book a Trial", subtitle: "3 classes · HK$450", type: "message", value: "I want to book a trial class" },
  { icon: "📅", title: "Class Schedule", subtitle: "View & book online", type: "link", value: "https://pyshk.com/schedule/" },
  { icon: "💰", title: "Memberships", subtitle: "Plans & pricing", type: "message", value: "How much is the membership? Show me the plans." },
  { icon: "🎓", title: "Teacher Training", subtitle: "200-Hr certified", type: "message", value: "Tell me about the 200-Hour Teacher Training" },
];

// ─── DOM ──────────────────────────────────────────────────────────────────
const chatBody = document.getElementById("chatBody");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

// ─── INIT ─────────────────────────────────────────────────────────────────
async function init() {
  // Load the admin-configured cards/questions BEFORE the welcome renders,
  // so visitors always see the latest set. Falls back to defaults fast.
  await loadConfig();
  restoreHistory();
  restoreDraft();
  setupConnectivity();
  setupScrollButton();
  refreshSendBtn();
}

async function loadConfig() {
  try {
    const res = await fetch(`${API_BASE}/api/chat/config`);
    const data = await res.json();
    if (Array.isArray(data.suggestions) && data.suggestions.length) window.SUGGESTIONS = data.suggestions;
    if (Array.isArray(data.quickActions) && data.quickActions.length) QUICK_ACTIONS = data.quickActions;
    if (data.theme) applyTheme(data.theme);
    if (data.general) applyGeneral(data.general);
  } catch (e) { /* defaults stay in place */ }
}

// Apply admin-configured General settings: greeting, offer banner, lead-form
// courses, and feature toggles (voice / language picker / breathing). Runs on
// config load, before the welcome renders.
function applyGeneral(g) {
  if (!g || typeof g !== "object") return;
  if (g.greeting) GREETING = g.greeting;
  if (Array.isArray(g.courses) && g.courses.length) LEAD_COURSES = g.courses;

  const f = g.features || {};
  if (f.voice === false) { const b = document.getElementById("voiceLiveBtn"); if (b) b.remove(); }
  if (f.languages === false) { const lp = document.querySelector(".lang-picker"); if (lp) lp.style.display = "none"; }
  // Only an explicit false disables the calming breathing animation.
  document.documentElement.classList.toggle("no-breathe", f.breathing === false);

  if (g.offerBanner) showOfferBanner(g.offerBanner);
}

// A dismissible promo strip under the header (e.g. "🎉 25% off until…").
function showOfferBanner(text) {
  const existing = document.querySelector(".offer-banner");
  if (existing) { existing.querySelector(".ob-text").textContent = text; return; }
  const header = document.querySelector(".chat-header");
  if (!header) return;
  const bar = document.createElement("div");
  bar.className = "offer-banner";
  bar.innerHTML = `<span class="ob-text"></span><button class="ob-close" data-action="closeOffer" type="button" aria-label="Dismiss offer">✕</button>`;
  bar.querySelector(".ob-text").textContent = text;
  header.insertAdjacentElement("afterend", bar);
}
function closeOffer() {
  const bar = document.querySelector(".offer-banner");
  if (bar) bar.remove();
}

// Apply the admin-configured appearance (colors, bot name, mascot & logo) so
// staff can rebrand the chatbot from the dashboard with no code change. Runs
// before the welcome/history render, so everything picks up the new brand.
function applyTheme(theme) {
  if (!theme || typeof theme !== "object") return;
  const root = document.documentElement;
  const c = theme.colors || {};
  const setVar = (name, val) => { if (typeof val === "string" && val) root.style.setProperty(name, val); };
  setVar("--gold", c.gold);
  setVar("--header-a", c.headerA);
  setVar("--header-b", c.headerB);
  setVar("--header-c", c.headerC);
  setVar("--user-bubble", c.userBubble);
  // Live-voice button gradient. Its drop-shadow glow is derived from the end
  // colour so the two never drift apart.
  setVar("--voice-a", c.voiceA);
  setVar("--voice-b", c.voiceB);
  if (c.voiceB) setVar("--voice-glow", hexToRgba(c.voiceB, 0.5));

  if (theme.botName) {
    BOT_NAME = theme.botName;
    const h = document.querySelector(".chat-header-info h3");
    if (h) h.textContent = BOT_NAME;
  }
  if (theme.mascot) {
    MASCOT_SRC = theme.mascot;
    document.querySelectorAll(".chat-avatar img, .msg-avatar.bot-logo img").forEach((img) => { img.src = MASCOT_SRC; });
  }
  if (theme.logo) {
    LOGO_SRC = theme.logo;
    document.querySelectorAll(".w-medallion img, .breathe-ring img").forEach((img) => { img.src = LOGO_SRC; });
  }
  if (theme.font) loadWidgetFont(theme.font);
  if (typeof theme.welcomeText === "string" && theme.welcomeText) WELCOME_TEXT = theme.welcomeText;
  if (Array.isArray(theme.taglines) && theme.taglines.length) TAGLINES = theme.taglines;
  if (theme.whatsapp) {
    WHATSAPP_NUMBER = theme.whatsapp;
    const wa = document.querySelector(".wa-btn");
    if (wa) wa.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Namaste 🙏 I have a question about " + (BOT_NAME || "Pragya"))}`;
  }
  if (theme.headerStatus) {
    const st = document.querySelector(".chat-header-info .status");
    if (st) st.innerHTML = `<span class="pulse"></span>${escapeHtml(theme.headerStatus)}`;
  }
  // Rebuild the avatar template so future bot messages use the new mascot/name.
  BOT_AVATAR = `<div class="msg-avatar bot-logo"><img src="${MASCOT_SRC}" alt="${escapeHtml(BOT_NAME)}"></div>`;
}

// #rgb / #rrggbb → rgba(...), so a picked hex can drive a translucent glow.
function hexToRgba(hex, alpha) {
  let h = String(hex || "").replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((ch) => ch + ch).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) return "";
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

// Load an admin-chosen Google Font and apply it across the widget. The name is
// from a fixed server-side allowlist, so building the <link> href is safe. The
// Content Security Policy already permits fonts.googleapis.com / gstatic.com.
function loadWidgetFont(name) {
  const id = "pragya-font-" + name.replace(/\s+/g, "-");
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" + name.replace(/ /g, "+") + ":wght@300;400;500;700&display=swap";
    document.head.appendChild(link);
  }
  document.body.style.fontFamily = `"${name}", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
}

// Send button reflects intent: greyed out until there's something to send.
function refreshSendBtn() {
  if (!sendBtn) return;
  sendBtn.disabled = isSending || chatInput.value.trim().length === 0;
}

// Conversation continuity: if the visitor returns (same session), restore
// their previous conversation instead of starting from scratch.
async function restoreHistory() {
  if (!sessionId) { showWelcome(); return; }
  try {
    const res = await fetch(`${API_BASE}/api/chat/history?sessionId=${encodeURIComponent(sessionId)}`);
    const data = await res.json();
    if (data.messages && data.messages.length) {
      chatBody.innerHTML = "";
      data.messages.forEach((m) => addMessage(m.content, m.role === "user" ? "user" : "bot", m.timestamp));
      renderChips(DEFAULT_CHIPS);
      return;
    }
  } catch (e) { /* fall through to welcome */ }
  showWelcome();
}

// ─── DRAFT PERSISTENCE (don't lose a half-typed message) ───────────────────
function restoreDraft() {
  const draft = localStorage.getItem("pragya_draft");
  if (draft && !chatInput.value) {
    chatInput.value = draft;
    chatInput.dispatchEvent(new Event("input"));
  }
}

// ─── CONNECTIVITY (offline banner) ──────────────────────────────────────────
function setupConnectivity() {
  const bar = document.getElementById("offlineBar");
  if (!bar) return;
  const update = () => { bar.classList.toggle("show", !navigator.onLine); };
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();
}

// ─── SCROLL-TO-BOTTOM BUTTON ────────────────────────────────────────────────
function setupScrollButton() {
  const btn = document.getElementById("scrollDownBtn");
  if (!btn) return;
  chatBody.addEventListener("scroll", () => {
    const fromBottom = chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight;
    btn.classList.toggle("show", fromBottom > 220);
  });
}

async function loadSuggestions() {
  try {
    const res = await fetch(`${API_BASE}/api/chat/suggestions`);
    const data = await res.json();
    if (data.suggestions) window.SUGGESTIONS = data.suggestions;
  } catch (e) {
    window.SUGGESTIONS = ["What courses do you offer?", "How much is membership?", "Teacher Training info", "Book a trial class", "Who are your teachers?", "Contact info"];
  }
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "☀️ Good morning";
  if (h < 17) return "🌤️ Good afternoon";
  return "🌙 Good evening";
}

// Rotating taglines typed out letter-by-letter under the greeting.
let TAGLINES = [
  "Where Science Meets Spirituality",
  "Breathe · Stretch · Transform",
  "Your yoga journey starts here",
  "Ancient wisdom, modern living",
];

const prefersCalm = () =>
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function showWelcome() {
  chatBody.innerHTML = `
    <div class="welcome">
      <div class="w-stage">
        <span class="w-petal p1">🪷</span><span class="w-petal p2">✦</span>
        <span class="w-petal p3">🍃</span><span class="w-petal p4">✦</span>
        <span class="w-petal p5">🪷</span><span class="w-petal p6">🕉️</span>
        <div class="w-hero">
          <div class="w-medallion" role="button" tabindex="0"
               aria-label="Start a 30-second guided calming breath"
               data-action="startBreathe">
            <img src="${LOGO_SRC}" alt="Pragya Yog School logo">
          </div>
        </div>
        <div class="w-tap-hint">✨ tap the logo for a calming breath</div>
        <h2><span class="namaste">${escapeHtml(GREETING)}</span></h2>
        <div class="w-type"><span id="wType"></span><span class="w-caret"></span></div>
        <p class="w-desc">${WELCOME_TEXT ? escapeHtml(WELCOME_TEXT) : `I'm <strong>${escapeHtml(BOT_NAME)}</strong> — ask me about classes, memberships &amp; teacher training.`}</p>
        <div class="w-stats">
          <span class="w-stat">${timeGreeting()}</span>
          <span class="w-stat">⚡ <b>24/7</b> answers</span>
        </div>
      </div>
    </div>
    <div class="w-actions-label">How can I help you today?</div>
    <div class="w-actions" role="group" aria-label="Quick actions">
      ${QUICK_ACTIONS.map((c, i) => `
      <button class="w-card" style="--i:${i}" data-action="quickAction" data-arg="${i}">${i === 0 ? '<span class="w-badge">★ Popular</span>' : ""}<span class="w-card-ico">${escapeHtml(c.icon || "✨")}</span><span class="w-card-t">${escapeHtml(c.title)}<small>${escapeHtml(c.subtitle || "")}</small></span><span class="w-card-go">›</span></button>`).join("")}
    </div>`;
  // First suggestions come from the admin-editable list, shown as the stacked
  // prompt list rather than inline chips (see renderChips).
  const chips = (window.SUGGESTIONS || ["Current offers 🎉", "Who are your teachers?", "Where are you located?"]).slice(0, 4);
  renderChips(chips, true, "rail");
  startTypewriter();
  scheduleIdleNudge();
}

// ─── WELCOME EXTRAS: typewriter, count-up, guided breathing ────────────────
let typeTimer = null;
function startTypewriter() {
  const first = document.getElementById("wType");
  if (!first) return;
  if (prefersCalm()) { first.textContent = TAGLINES[0]; return; }
  clearTimeout(typeTimer);
  let pi = 0, ci = 0, deleting = false;
  const tick = () => {
    const el = document.getElementById("wType");
    if (!el) return; // welcome screen replaced by a conversation — stop
    const phrase = TAGLINES[pi];
    ci += deleting ? -1 : 1;
    el.textContent = phrase.slice(0, ci);
    if (!deleting && ci === phrase.length) { deleting = true; typeTimer = setTimeout(tick, 2100); return; }
    if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % TAGLINES.length; typeTimer = setTimeout(tick, 420); return; }
    typeTimer = setTimeout(tick, deleting ? 26 : 55);
  };
  typeTimer = setTimeout(tick, 450);
}

// Tap the medallion → a 30-second guided breathing moment. On-brand calm
// that turns the welcome screen into an experience, not just a menu.
let breatheTimers = [];
function startBreathe() {
  const shell = document.querySelector(".chat-shell");
  if (!shell || document.querySelector(".breathe-ov")) return;
  const ov = document.createElement("div");
  ov.className = "breathe-ov";
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-label", "Guided breathing exercise. Tap anywhere to exit.");
  ov.innerHTML = `
    <button class="breathe-close" aria-label="Close breathing exercise">✕</button>
    <div class="breathe-ring" id="bRing"><img src="${LOGO_SRC}" alt=""></div>
    <div class="breathe-word" id="bWord" aria-live="polite">Get comfortable…</div>
    <div class="breathe-sub" id="bSub">3 slow breaths · tap anywhere to exit</div>`;
  shell.appendChild(ov);
  ov.addEventListener("click", closeBreathe);
  const ring = ov.querySelector("#bRing");
  const word = ov.querySelector("#bWord");
  const sub = ov.querySelector("#bSub");
  const at = (t, fn) => breatheTimers.push(setTimeout(fn, t));
  let t = 900;
  for (let round = 1; round <= 3; round++) {
    at(t, () => {
      word.textContent = "Breathe in…"; sub.textContent = `Round ${round} of 3`;
      ring.classList.remove("shrink"); ring.classList.add("grow");
    });
    t += 4000;
    at(t, () => { word.textContent = "Hold…"; });
    t += 1800;
    at(t, () => {
      word.textContent = "Breathe out…";
      ring.classList.remove("grow"); ring.classList.add("shrink");
    });
    t += 4600;
  }
  at(t, () => { word.textContent = "Namaste 🙏"; sub.textContent = "Carry this calm into your day."; });
  at(t + 2400, closeBreathe);
}

function closeBreathe() {
  breatheTimers.forEach(clearTimeout);
  breatheTimers = [];
  const ov = document.querySelector(".breathe-ov");
  if (!ov) return;
  ov.style.transition = "opacity 0.35s";
  ov.style.opacity = "0";
  setTimeout(() => ov.remove(), 360);
}

// Quick-action cards are admin-configured (dashboard → Widget tab):
// "message" cards ask the bot, "link" cards open a page (e.g. booking).
function quickAction(i) {
  const c = QUICK_ACTIONS[i];
  if (!c) return;
  if (c.type === "link") {
    window.open(c.value, "_blank", "noopener");
    return;
  }
  chatInput.value = c.value;
  sendMessage();
}

// If a fresh visitor opens the chat but doesn't type for a while, send one
// gentle nudge so the conversation doesn't die at the welcome screen.
let nudgeShown = false;
function scheduleIdleNudge() {
  if (nudgeShown) return;
  setTimeout(() => {
    // Only nudge if they still haven't said anything.
    if (nudgeShown || lastUserMessage || !chatBody.querySelector(".welcome")) return;
    nudgeShown = true;
    addMessage("Still browsing? 😊 Most people ask me about the 3-Class Trial Pass (HK$450) or our class schedule. Or just tell me what you're looking for — I'm happy to help!", "bot");
  }, 20000);
}

// ─── RENDERING ──────────────────────────────────────────────────────────────
// Suggested questions render in one of two styles:
//   "chip" — compact wrapping pills, used for follow-ups mid-conversation
//            where the reply above is the focus and space is tight.
//   "rail" — a horizontally swipeable row of prompt cards, used on the welcome
//            screen (Gemini / Copilot / ChatGPT-mobile pattern).
//
// The welcome screen has a hard height budget: the embedded widget is 380x600,
// which leaves ~454px of body once the header and footer are taken out. The
// hero and quick-action cards already spend ~357px of that, so the suggestions
// get ~100px. A vertical stack of full-width rows needs ~300px and pushes the
// whole screen off-view; a horizontal rail fits the same four questions in one
// ~90px band. The third card is deliberately left half-visible at the right
// edge — a peeking card is the clearest signal that the row scrolls, more
// reliable than an arrow or a fade.
const PROMPT_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>';
const WHATSAPP_ICON =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.2s-.7.9-.9 1.1c-.2.2-.3.2-.6.1a8.3 8.3 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.6.3-.5v-.5c0-.2-.7-1.6-.9-2.2s-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4zM12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z"></path></svg>';

function renderChips(chips, withHuman = true, variant = "chip") {
  const rail = variant === "rail";
  const wrap = document.createElement("div");
  wrap.className = rail ? "prompts" : "chips";
  let target = wrap;

  if (rail) {
    const label = document.createElement("div");
    label.className = "prompts-label";
    label.textContent = "Or ask me anything";
    wrap.appendChild(label);
    target = document.createElement("div");
    target.className = "prompts-rail";
    target.setAttribute("role", "group");
    target.setAttribute("aria-label", "Suggested questions");
    wrap.appendChild(target);
  }

  chips.forEach((c, i) => {
    const chip = document.createElement("button");
    if (rail) {
      chip.className = "prompt";
      chip.style.setProperty("--i", i);
      chip.innerHTML =
        `<span class="prompt-ico">${PROMPT_ICON}</span>` +
        `<span class="prompt-t">${escapeHtml(c)}</span>`;
    } else {
      chip.className = "chip";
      chip.textContent = c;
    }
    chip.onclick = () => { chatInput.value = c; sendMessage(); };
    target.appendChild(chip);
  });

  // Human handoff — always one tap away, opens WhatsApp with chat context.
  // On the welcome screen it sits below the rail as a single quiet line: it is
  // an escape hatch, not a fifth suggestion, and giving it card weight made it
  // compete with the questions.
  if (withHuman) {
    const human = document.createElement("button");
    if (rail) {
      human.className = "prompt-human";
      human.innerHTML = `${WHATSAPP_ICON}<span>Talk to a human on WhatsApp</span>`;
      wrap.appendChild(human);
    } else {
      human.className = "chip chip-human";
      human.textContent = "👤 Talk to a human";
      wrap.appendChild(human);
    }
    human.onclick = talkToHuman;
  }
  chatBody.appendChild(wrap);
  scrollDown();
}

// Open WhatsApp with the visitor's last question prefilled so the team
// has context immediately — a true human handoff, not just a link.
function talkToHuman() {
  let text = "Namaste 🙏 I was chatting with Pragya and would like to talk to a person.";
  if (lastUserMessage) text += `\n\nMy question was: "${lastUserMessage.slice(0, 200)}"`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
}

// The mascot fronts every bot message. These are the widget's live "brand" and
// can all be overridden from the admin Appearance settings via applyTheme().
let BOT_NAME = "Pragya";
let MASCOT_SRC = "mascot.png";
let LOGO_SRC = "logo.png";
let BOT_AVATAR = `<div class="msg-avatar bot-logo"><img src="${MASCOT_SRC}" alt="Pragya"></div>`;

function addMessage(text, sender, when) {
  const msg = document.createElement("div");
  msg.className = "msg " + sender;
  // Convert markdown-ish text to HTML (bold, links, line breaks)
  const html = formatText(text);
  const time = formatTime(when ? new Date(when) : new Date());
  if (sender === "bot") {
    msg.dataset.raw = text;
    msg.innerHTML = `${BOT_AVATAR}<div class="msg-content"><div class="msg-bubble">${html}</div><div class="msg-meta"><span class="msg-time">${time}</span><span class="msg-tools"><button class="msg-tool" data-action="copyMsg" title="Copy answer" aria-label="Copy answer">⧉</button><button class="msg-tool" data-action="speakMsg" title="Listen" aria-label="Listen to answer">🔊</button></span></div></div>`;
  } else {
    msg.innerHTML = `<div class="msg-avatar">🙂</div><div class="msg-content"><div class="msg-bubble">${html}</div><div class="msg-time">${time}<span class="ticks">✓</span></div></div>`;
  }
  chatBody.appendChild(msg);
  scrollDown();
}

// When Pragya starts "reading" (typing begins), the visitor's last message
// gets the familiar double-tick ✓✓ — the small human cues of a messenger.
function markLastUserSeen() {
  const ticks = chatBody.querySelectorAll(".msg.user .ticks");
  const last = ticks[ticks.length - 1];
  if (last) { last.textContent = "✓✓"; last.classList.add("seen"); }
}

// ── Per-message tools (bot replies): copy the answer, or hear it aloud ──
function copyMsg(btn) {
  const raw = btn.closest(".msg").dataset.raw || "";
  const done = () => {
    btn.textContent = "✓";
    btn.classList.add("done");
    setTimeout(() => { btn.textContent = "⧉"; btn.classList.remove("done"); }, 1600);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(raw).then(done).catch(() => {});
  } else {
    const ta = document.createElement("textarea");
    ta.value = raw; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    ta.remove();
  }
}

// Click 🔊 to listen; click again (or the footer button) to stop.
let activeSpeakBtn = null;
function clearActiveSpeak() {
  if (activeSpeakBtn) { activeSpeakBtn.textContent = "🔊"; activeSpeakBtn.classList.remove("speaking"); }
  activeSpeakBtn = null;
}
function speakMsg(btn) {
  if (!window.speechSynthesis) return;
  const wasThis = activeSpeakBtn === btn;
  window.speechSynthesis.cancel(); // stop anything already playing
  clearActiveSpeak();
  if (wasThis) return; // second click on the same button → just stop
  const raw = (btn.closest(".msg").dataset.raw || "").replace(/[*_#]/g, "");
  const u = new SpeechSynthesisUtterance(raw);
  u.onend = u.onerror = () => { if (activeSpeakBtn === btn) clearActiveSpeak(); };
  activeSpeakBtn = btn;
  btn.textContent = "⏹";
  btn.classList.add("speaking");
  window.speechSynthesis.speak(u);
}

// ── Streaming reply: reveal the bot's answer word-by-word (ChatGPT-style) ──
let streamTimer = null;
function streamBotReply(text) {
  const msg = document.createElement("div");
  msg.className = "msg bot";
  msg.dataset.raw = text;
  const time = formatTime(new Date());
  msg.innerHTML = `${BOT_AVATAR}<div class="msg-content"><div class="msg-bubble"><span class="stream-live"></span><span class="stream-caret"></span></div><div class="msg-meta" style="visibility:hidden"><span class="msg-time">${time}</span><span class="msg-tools"><button class="msg-tool" data-action="copyMsg" title="Copy answer" aria-label="Copy answer">⧉</button><button class="msg-tool" data-action="speakMsg" title="Listen" aria-label="Listen to answer">🔊</button></span></div></div>`;
  chatBody.appendChild(msg);
  scrollDown();

  const bubble = msg.querySelector(".msg-bubble");
  const live = msg.querySelector(".stream-live");
  const meta = msg.querySelector(".msg-meta");

  // Reduced-motion visitors get the answer instantly.
  if (prefersCalm()) { finishStream(bubble, meta, text); return; }

  const tokens = text.match(/\S+\s*/g) || [text]; // words with trailing spaces
  let i = 0;
  const nearBottom = () => chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight < 120;
  clearTimeout(streamTimer);
  const step = () => {
    if (!live.isConnected) return; // message removed (reset) — stop
    live.textContent += tokens[i];
    i++;
    if (nearBottom()) scrollDown();
    if (i < tokens.length) {
      streamTimer = setTimeout(step, 26 + Math.random() * 34);
    } else {
      finishStream(bubble, meta, text);
    }
  };
  streamTimer = setTimeout(step, 90);
}
function finishStream(bubble, meta, text) {
  bubble.innerHTML = formatText(text); // apply bold/links/line-breaks
  if (meta) meta.style.visibility = "";
  scrollDown();
}

function formatTime(d) {
  if (isNaN(d.getTime())) d = new Date();
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatText(text) {
  return String(text)
    // Escape ALL HTML-significant characters first, including quotes. Without
    // escaping quotes, a URL containing a " breaks out of the href="" below and
    // injects attributes (e.g. an event handler) — an XSS. The linkifiers run
    // after this, so any quote inside a matched URL is already the harmless
    // &quot; entity and stays inside the attribute value.
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
    .replace(/^\s*[*•-]\s+/gm, "&nbsp;&nbsp;• ")          // markdown bullets → clean dots
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,!?]|$)/g, "$1<em>$2</em>") // *italic*
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
    .replace(/(^|[^/])\b(pyshk\.com[^\s<]*)/g, '$1<a href="https://$2" target="_blank" rel="noopener">$2</a>')
    .replace(/\n/g, "<br>");
}

function showTyping() {
  const t = document.createElement("div");
  t.className = "msg bot";
  t.id = "typingMsg";
  t.innerHTML = `${BOT_AVATAR}<div class="msg-bubble" style="padding:0;"><div class="typing"><span></span><span></span><span></span></div></div>`;
  chatBody.appendChild(t);
  markLastUserSeen();
  scrollDown();
}
function hideTyping() {
  const t = document.getElementById("typingMsg");
  if (t) t.remove();
}

// ─── SEND MESSAGE (calls real backend) ──────────────────────────────────────
async function sendMessage(retryText) {
  const text = (retryText || chatInput.value).trim();
  if (!text || isSending) return;
  isSending = true;
  lastUserMessage = text;

  const welcome = chatBody.querySelector(".welcome");
  if (welcome) chatBody.innerHTML = "";
  removeChips();

  // Only add the user bubble once — a retry re-sends the same bubble's text.
  if (!retryText) {
    addMessage(text, "user");
    chatInput.value = "";
    chatInput.style.height = "auto";
    localStorage.removeItem("pragya_draft");
  }
  sendBtn.disabled = true;
  showTyping();

  // Abort if the network hangs, so the visitor is never stuck on "typing…".
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35000);

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, sessionId, language: chatLang }),
      signal: controller.signal,
    });

    if (res.status === 429) {
      hideTyping();
      addMessage("I'm getting a lot of questions right now 😊 Please wait a few seconds and try again.", "bot");
      renderRetry(text);
      return;
    }

    const data = await res.json();
    hideTyping();

    if (data.sessionId) {
      sessionId = data.sessionId;
      localStorage.setItem("pragya_session", sessionId);
    }

    if (data.reply) {
      streamBotReply(data.reply);
      speak(data.reply);
    } else {
      addMessage("I'm sorry, something went wrong. Please contact us at +852 6708 2503 or info@pyshk.com.", "bot");
    }

    // Show lead form on enrollment intent (unless already submitted),
    // otherwise show the server's topic-aware follow-up suggestions.
    if (data.showLeadForm && !leadSubmitted) {
      renderLeadForm();
    } else {
      renderChips((data.suggestions && data.suggestions.length) ? data.suggestions : DEFAULT_CHIPS);
    }
  } catch (error) {
    hideTyping();
    const offline = !navigator.onLine;
    addMessage(
      offline
        ? "It looks like you're offline. Check your connection and tap Retry below. 🙏"
        : "I couldn't reach the server just now. Tap Retry below, or contact us at +852 6708 2503 / info@pyshk.com. 🙏",
      "bot"
    );
    renderRetry(text);
  } finally {
    clearTimeout(timeout);
    isSending = false;
    refreshSendBtn();
  }
}

// Retry chip that re-sends the failed message, plus a human escape hatch.
function renderRetry(text) {
  const wrap = document.createElement("div");
  wrap.className = "chips";
  const chip = document.createElement("button");
  chip.className = "chip chip-retry";
  chip.textContent = "🔄 Retry";
  chip.onclick = () => { removeChips(); sendMessage(text); };
  wrap.appendChild(chip);
  const human = document.createElement("button");
  human.className = "chip chip-human";
  human.textContent = "👤 Talk to a human";
  human.onclick = talkToHuman;
  wrap.appendChild(human);
  chatBody.appendChild(wrap);
  scrollDown();
}

// ─── LEAD FORM ──────────────────────────────────────────────────────────────
function renderLeadForm() {
  const form = document.createElement("div");
  form.className = "msg bot";
  form.innerHTML = `
    ${BOT_AVATAR}
    <div class="lead-form">
      <h4>📋 Let's Get You Started</h4>
      <p>Share your details and our team will reach out within 24 hours.</p>
      <input type="text" id="leadName" placeholder="Full Name *">
      <input type="email" id="leadEmail" placeholder="Email Address *">
      <input type="tel" id="leadPhone" placeholder="Phone Number (optional)">
      <input type="text" id="leadCountry" placeholder="Country">
      <select id="leadCourse">
        <option value="">Interested Course *</option>
        ${LEAD_COURSES.map((c) => `<option>${escapeHtml(c)}</option>`).join("")}
      </select>
      <button id="leadSubmit" data-action="submitLead">Submit My Details 🙏</button>
    </div>`;
  chatBody.appendChild(form);
  scrollDown();
}

async function submitLead() {
  const name = document.getElementById("leadName").value.trim();
  const email = document.getElementById("leadEmail").value.trim();
  const phone = document.getElementById("leadPhone").value.trim();
  const country = document.getElementById("leadCountry").value.trim();
  const course = document.getElementById("leadCourse").value;

  if (!name || !email || !course) {
    alert("Please fill in your Name, Email, and Course of interest.");
    return;
  }

  const btn = document.getElementById("leadSubmit");
  btn.disabled = true;
  btn.textContent = "Submitting...";

  try {
    const res = await fetch(`${API_BASE}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, country, course, sessionId }),
    });
    const data = await res.json();

    leadSubmitted = true;
    localStorage.setItem("pragya_lead_done", "1");

    const forms = chatBody.querySelectorAll(".lead-form");
    const lastForm = forms[forms.length - 1];
    if (lastForm) {
      lastForm.outerHTML = `<div class="lead-success">✅ Thank you, ${escapeHtml(name)}!<br>Our team at info@pyshk.com will reach out within 24 hours. You can also call +852 6708 2503 to get started right away! 🙏</div>`;
    }

    setTimeout(() => {
      addMessage("Is there anything else I can help you with while you wait? 🧘", "bot");
      renderChips(["View Courses", "Class Schedule", "Our Teachers"]);
      showRating();
    }, 800);
  } catch (error) {
    alert("Could not submit. Please call us at +852 6708 2503.");
    btn.disabled = false;
    btn.textContent = "Submit My Details 🙏";
  }
}

// ─── RESET ────────────────────────────────────────────────────────────────
function resetChat() {
  sessionId = null;
  localStorage.removeItem("pragya_session");
  clearTimeout(streamTimer);
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  clearActiveSpeak();
  showWelcome();
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function scrollDown() { setTimeout(() => { chatBody.scrollTop = chatBody.scrollHeight; }, 50); }
function removeChips() { chatBody.querySelectorAll(".chips, .prompts").forEach((c) => c.remove()); }
function escapeHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
chatInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 90) + "px";
  // Persist the draft so an accidental close/refresh doesn't lose it.
  if (this.value.trim()) localStorage.setItem("pragya_draft", this.value);
  else localStorage.removeItem("pragya_draft");
  refreshSendBtn();
});

// ─── VOICE INPUT (Bonus Feature — Web Speech API) ───────────────────────────
let recognition = null;
function setupVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const voiceBtn = document.getElementById("voiceBtn");
  if (!SpeechRecognition || !voiceBtn) {
    if (voiceBtn) voiceBtn.style.display = "none";
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = "en-US"; // change to "hi-IN" for Hindi voice input
  recognition.interimResults = false;
  recognition.continuous = false;

  voiceBtn.addEventListener("click", () => {
    try { voiceBtn.classList.add("listening"); recognition.start(); }
    catch (e) { /* already listening */ }
  });
  recognition.onresult = (event) => {
    chatInput.value = event.results[0][0].transcript;
    voiceBtn.classList.remove("listening");
    sendMessage();
  };
  recognition.onerror = () => voiceBtn.classList.remove("listening");
  recognition.onend = () => voiceBtn.classList.remove("listening");
}

// ─── VOICE OUTPUT (Bonus — Text-to-Speech) ──────────────────────────────────
let ttsEnabled = false;
function speak(text) {
  if (!ttsEnabled || !window.speechSynthesis) return;
  const cleaned = text.replace(/[*_#]/g, "");
  const utter = new SpeechSynthesisUtterance(cleaned);
  utter.rate = 1.0;
  window.speechSynthesis.speak(utter);
}
function toggleTTS() {
  // If something is currently being read, the first tap just stops it.
  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    clearActiveSpeak();
    ttsEnabled = false;
    const b = document.getElementById("ttsBtn");
    if (b) { b.classList.remove("active"); b.textContent = "🔊 Read aloud"; }
    return;
  }
  ttsEnabled = !ttsEnabled;
  const btn = document.getElementById("ttsBtn");
  if (btn) {
    btn.classList.toggle("active", ttsEnabled);
    btn.textContent = ttsEnabled ? "🔊 Reading — tap to stop" : "🔊 Read aloud";
  }
}

// ─── LIVE VOICE CHAT (hands-free voice conversation) ─────────────────────────
// A ChatGPT/Gemini-style voice mode. Tap the header wave button and it opens a
// full-panel overlay: speak your question, Pragya answers OUT LOUD, then it
// listens again — a continuous, hands-free loop. Turn-based (it never listens
// while speaking, so it can't hear its own voice), with tap-to-interrupt.
//
// Built entirely on the browser's Web Speech API — SpeechRecognition for the
// mic and speechSynthesis for the reply — so there are NO server changes and NO
// API keys. It reuses the same /api/chat endpoint the typed chat uses, and
// mirrors every exchange into the visible transcript so nothing is lost on exit.
const VoiceChat = (() => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const supported = !!SR && !!window.speechSynthesis;
  let rec = null;
  let active = false; // overlay open
  let busy = false;   // mid-turn (thinking/speaking) — pauses the auto-listen loop
  let els = null;

  // Pick the best available voice for the given lang-prefix list (varies by
  // OS/browser): e.g. Sinji for Cantonese, Ting-Ting/Mei-Jia for Mandarin,
  // Samantha/Google for English. Falls back to any voice in that language.
  function pickVoice(prefs) {
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    if (!voices.length) return null;
    const inLang = prefs && prefs.length
      ? voices.filter((v) => prefs.some((p) => (v.lang || "").toLowerCase().startsWith(p)))
      : [];
    const pool = inLang.length ? inLang : voices;
    const nice = [/Google/i, /Samantha/i, /Sinji/i, /Ting-?Ting/i, /Mei-?Jia/i,
      /Microsoft (Aria|Jenny|Michelle|HiuGaai|HiuMaan|Xiaoxiao|Yunyang|HsiaoChen|Yating)/i, /Natural/i];
    for (const n of nice) { const v = pool.find((x) => n.test(x.name)); if (v) return v; }
    return pool[0];
  }
  // Kick off async voice loading so a voice is ready by the first reply.
  if (supported) { try { window.speechSynthesis.getVoices(); } catch (_) {} }

  function setState(state, statusText) {
    if (!els) return;
    els.orb.classList.remove("is-listening", "is-thinking", "is-speaking");
    if (state) els.orb.classList.add("is-" + state);
    if (statusText != null) els.status.textContent = statusText;
  }
  function caption(role, text) {
    if (!els) return;
    els.caption.innerHTML = `<span class="vc-role"></span>`;
    els.caption.firstChild.textContent = role;
    els.caption.appendChild(document.createTextNode(text));
  }

  function buildOverlay() {
    const shell = document.querySelector(".chat-shell");
    const ov = document.createElement("div");
    ov.className = "voice-ov";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-label", "Live voice chat");
    ov.innerHTML =
      '<button class="voice-close" aria-label="Exit voice chat" type="button">✕</button>' +
      '<div class="voice-orb" id="voiceOrb" role="button" tabindex="0" aria-label="Tap to talk, or tap to interrupt"></div>' +
      '<div class="voice-status" id="voiceStatus" aria-live="polite">Starting…</div>' +
      '<div class="voice-caption" id="voiceCaption"></div>' +
      '<div class="voice-hint">Tap the orb to interrupt · ✕ to exit</div>';
    shell.appendChild(ov);
    els = {
      ov,
      orb: ov.querySelector("#voiceOrb"),
      status: ov.querySelector("#voiceStatus"),
      caption: ov.querySelector("#voiceCaption"),
    };
    ov.querySelector(".voice-close").addEventListener("click", close);
    els.orb.addEventListener("click", onOrbTap);
    els.orb.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOrbTap(); }
    });
  }

  // Tapping the orb interrupts a spoken reply and starts listening immediately
  // (barge-in), or retries listening after a mic error.
  function onOrbTap() {
    if (window.speechSynthesis && window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    listen();
  }

  function setupRecognition() {
    rec = new SR();
    // Forced pick → its language; "auto" → the device's language (best the
    // browser can do, since Web Speech can't auto-detect the spoken language).
    rec.lang = langCfg().recog || navigator.language || "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }
      if (interim && !busy) caption(langCfg().ui.you, interim + "…");
      if (final.trim()) {
        busy = true;
        try { rec.stop(); } catch (_) {}
        handleSpeech(final.trim());
      }
    };
    rec.onerror = (e) => {
      // A missing/blocked mic would otherwise restart-loop forever — halt and
      // wait for the user to fix it and tap the orb.
      if (["not-allowed", "service-not-allowed", "audio-capture"].includes(e.error)) {
        busy = true;
        setState(null, "Microphone unavailable");
        caption("Pragya", "I can't reach a microphone. Make sure one is connected and this site has mic permission, then tap the orb to retry.");
      }
      // no-speech / network / aborted → let onend restart listening.
    };
    rec.onend = () => {
      // Ended on silence while still in voice mode → keep listening (debounced
      // so a hard error can't spin a tight loop).
      if (active && !busy) setTimeout(() => { if (active && !busy) listen(); }, 300);
    };
  }

  function listen() {
    if (!active || !rec) return;
    busy = false;
    setState("listening", langCfg().ui.listening);
    try { rec.start(); } catch (_) { /* already listening — ignore */ }
  }

  async function handleSpeech(text) {
    caption(langCfg().ui.you, text);
    setState("thinking", langCfg().ui.thinking);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    let reply;
    try { reply = await ask(text); }
    catch (_) { reply = "Sorry, I couldn't reach the server just now. Tap the orb to try again."; }
    if (!active) return; // exited mid-request
    speakReply(reply);
  }

  // Same backend the typed chat uses; also logs the turn to the transcript.
  async function ask(text) {
    const welcome = chatBody.querySelector(".welcome");
    if (welcome) chatBody.innerHTML = "";
    removeChips();
    addMessage(text, "user");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);
    let reply;
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId, language: chatLang }),
        signal: controller.signal,
      });
      if (res.status === 429) {
        reply = "I'm getting a lot of questions right now. Please pause a moment, then tap the orb to try again.";
      } else {
        const data = await res.json();
        if (data.sessionId) { sessionId = data.sessionId; localStorage.setItem("pragya_session", sessionId); }
        reply = data.reply || "Sorry, something went wrong. Please contact us at +852 6708 2503 or info@pyshk.com.";
      }
    } catch (_) {
      reply = "I couldn't reach the server just now. Tap the orb to try again, or contact +852 6708 2503.";
    } finally {
      clearTimeout(timeout);
    }
    addMessage(reply, "bot");
    return reply;
  }

  function speakReply(text) {
    caption("Pragya", text);
    if (!window.speechSynthesis) { if (active) listen(); return; }
    setState("speaking", langCfg().ui.speaking);
    // Strip markdown/symbols so they aren't read aloud literally.
    const clean = text.replace(/[*_#`>]/g, "").replace(/\s+/g, " ").trim();
    const u = new SpeechSynthesisUtterance(clean);
    // In auto mode, match the voice to the reply's OWN script (so a Chinese
    // reply is spoken by a Chinese voice); otherwise use the forced language.
    let prefs, fallbackLang;
    if (chatLang === "auto") {
      const base = detectScript(clean);
      prefs = SCRIPT_VOICES[base] || SCRIPT_VOICES.en;
      fallbackLang = SCRIPT_RECOG[base] || "en-US";
    } else {
      prefs = langCfg().tts;
      fallbackLang = langCfg().recog;
    }
    const voice = pickVoice(prefs);
    if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = fallbackLang; }
    u.rate = 1.0; u.pitch = 1.0;
    u.onend = () => { if (active) listen(); };
    u.onerror = () => { if (active) listen(); };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function open() {
    if (!supported) {
      alert("Live voice chat needs a browser with speech support — try Chrome or Edge (desktop or Android).");
      return;
    }
    if (active) return;
    active = true;
    busy = false;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    clearActiveSpeak();
    buildOverlay();
    setupRecognition();
    // A short spoken hello (in the chosen language) greets the visitor AND primes
    // speech synthesis inside the button-click gesture (browsers require that
    // first utterance to be user-initiated). When it finishes, we start listening.
    speakReply(langCfg().greet);
    // Safety net: some browsers occasionally drop the synthesis "end" event, so
    // if the greeting never hands off, start listening anyway rather than hang.
    setTimeout(() => {
      if (active && !busy && !(window.speechSynthesis && window.speechSynthesis.speaking)) listen();
    }, 7000);
  }

  function close() {
    active = false;
    busy = false;
    if (rec) { try { rec.abort(); } catch (_) {} rec = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (els && els.ov) {
      const ov = els.ov;
      ov.style.transition = "opacity 0.25s";
      ov.style.opacity = "0";
      setTimeout(() => ov.remove(), 260);
    }
    els = null;
    // Leave the visitor a way to continue by typing.
    if (chatBody.querySelector(".msg")) { removeChips(); renderChips(DEFAULT_CHIPS); }
  }

  return { open, close, supported };
})();

// Exposed for the header button's data-action (see CHAT_ACTIONS).
function openVoiceMode() { VoiceChat.open(); }

// ─── FEEDBACK / RATING (Bonus Feature) ──────────────────────────────────────
function showRating() {
  // Avoid showing twice
  if (document.getElementById("ratingBox")) return;
  const box = document.createElement("div");
  box.className = "msg bot";
  box.id = "ratingBox";
  box.innerHTML = `
    ${BOT_AVATAR}
    <div class="rating-widget">
      <p>How was your experience? Tap a star:</p>
      <div class="rating-stars">
        ${[1,2,3,4,5].map(n => `<span class="rating-star" data-val="${n}" data-action="submitRating" data-arg="${n}">☆</span>`).join("")}
      </div>
    </div>`;
  chatBody.appendChild(box);
  scrollDown();
}

async function submitRating(value) {
  // Fill stars visually
  document.querySelectorAll(".rating-star").forEach((s, i) => {
    s.textContent = i < value ? "★" : "☆";
  });
  try {
    await fetch(`${API_BASE}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: value, sessionId }),
    });
  } catch (e) { /* ignore */ }
  const box = document.getElementById("ratingBox");
  if (box) {
    const w = box.querySelector(".rating-widget");
    if (w) w.innerHTML = `<p style="color:var(--teal);font-weight:600;margin:0;">🙏 Thank you for your feedback!</p>`;
  }
}

// ─── EVENT DELEGATION ───────────────────────────────────────────────────────
// Elements declare `data-action="fnName"` (plus an optional `data-arg`) instead
// of an inline onclick="", so the Content Security Policy can forbid inline
// scripts outright (script-src 'self'). Inline handlers are blocked by CSP even
// when injected via innerHTML, so the chat's rendered markup — welcome cards,
// message tools, rating stars — uses data-* too. Delegating from `document`
// picks all of it up without rebinding after every render.
const CHAT_ACTIONS = {
  sendMessage,
  resetChat,
  scrollDown,
  startBreathe,
  openVoiceMode,
  toggleLangMenu,
  setLang: (arg) => setLang(arg),
  closeOffer,
  submitLead,
  quickAction: (arg) => quickAction(Number(arg)),
  submitRating: (arg) => submitRating(Number(arg)),
  // These two act on the button that was clicked.
  copyMsg: (arg, e, el) => copyMsg(el),
  speakMsg: (arg, e, el) => speakMsg(el),
};

function dispatchAction(e, el) {
  const fn = CHAT_ACTIONS[el.dataset.action];
  if (fn) fn(el.dataset.arg, e, el);
}

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (el) dispatchAction(e, el);
});

// Keyboard equivalent for non-<button> controls (the breathing medallion is a
// div with role="button"), preserving the Enter/Space behaviour it had inline.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const el = e.target.closest("[data-action]");
  if (!el || el.tagName === "BUTTON") return; // real buttons fire click natively
  e.preventDefault();
  dispatchAction(e, el);
});

// Start
init();
setupVoice();
applyLangToUI(); // reflect the saved language on load

// Live voice chat needs the browser's speech-recognition engine, which Firefox
// and iOS Safari don't provide. Where it's missing, remove the button (never
// offer a feature that can't work) and leave one small, friendly note so
// visitors know it's available elsewhere. Everything else (typing, read-aloud)
// keeps working exactly as before.
if (!VoiceChat.supported) {
  const vlb = document.getElementById("voiceLiveBtn");
  if (vlb) vlb.remove();
  const footer = document.querySelector(".chat-footer");
  if (footer && !document.getElementById("voiceUnsupportedNote")) {
    const note = document.createElement("div");
    note.id = "voiceUnsupportedNote";
    note.className = "voice-unsupported-note";
    note.innerHTML =
      '🎙️ <span>Live voice chat is available in <strong>Chrome</strong> or <strong>Edge</strong> on desktop, and <strong>Chrome</strong> on Android.</span>';
    footer.appendChild(note);
  }
}
