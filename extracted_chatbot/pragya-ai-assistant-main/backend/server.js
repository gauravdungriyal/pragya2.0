/**
 * PRAGYA AI ASSISTANT — Main Server
 * Express server that powers the chatbot backend.
 *
 * Run with: node server.js   (or npm start)
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const chatRoutes = require("./routes/chat");
const leadRoutes = require("./routes/leads");
const adminRoutes = require("./routes/admin");
const feedbackRoutes = require("./routes/feedback");

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────
// Behind Vercel/other proxies: trust the first proxy hop so req.ip and
// req.protocol are correct (required by express-rate-limit and reset links).
app.set("trust proxy", 1);
app.disable("x-powered-by"); // don't advertise the framework

// ─── SECURITY HEADERS ───────────────────────────────────────────────────────
// The chat widget is embedded on pyshk.com as an <iframe src="…">, so this app
// MUST stay framable by that site — a blanket X-Frame-Options: DENY would take
// the live widget down. Framing is therefore restricted by an allowlist
// (frame-ancestors) rather than denied outright, and the admin dashboard gets
// its own DENY policy below, since nothing should ever frame that.
const FRAME_ANCESTORS = (process.env.FRAME_ANCESTORS ||
  "https://pyshk.com https://www.pyshk.com")
  .split(/[\s,]+/)
  .filter(Boolean);

function buildCsp(frameAncestors) {
  return {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      // No 'unsafe-inline': there are no inline <script> blocks and no inline
      // event handlers left. All JS is served from this origin, plus the
      // sheetjs CDN, which the dashboard loads on demand for .xlsx FAQ import.
      // Keep it that way — an inline onclick="" anywhere will now silently fail.
      scriptSrc: ["'self'", "https://cdn.sheetjs.com"],
      // Inline *styles* are still allowed: the markup uses style="" attributes
      // throughout. That is a far weaker exposure than inline script, and the
      // brief asked specifically for scripts to be restricted to our domain.
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors,
      ...(IS_PROD ? { upgradeInsecureRequests: [] } : {}),
    },
  };
}

app.use(
  helmet({
    contentSecurityPolicy: buildCsp(["'self'", ...FRAME_ANCESTORS]),
    // HSTS: 1 year. Only meaningful over HTTPS, so keep it off locally.
    hsts: IS_PROD ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    // Set per-route below instead: the widget must remain framable.
    frameguard: false,
    crossOriginEmbedderPolicy: false, // would block the Google Fonts / CDN loads
    // Allow the widget iframe and its assets to be loaded cross-origin.
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// The admin dashboard must never be framed — clickjacking an authenticated
// admin would expose every lead. Override the permissive widget policy here.
app.use(["/admin", "/admin.html", "/api/admin"], (req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  helmet.contentSecurityPolicy(buildCsp(["'none'"]))(req, res, next);
});

// ─── CORS ───────────────────────────────────────────────────────────────────
// Not a wildcard. The chat itself runs inside an iframe served by this app, so
// it is same-origin; the only genuine cross-origin caller is the widget snippet
// on pyshk.com, which fetches /api/chat/teasers from the parent page.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  "https://pyshk.com,https://www.pyshk.com")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
if (process.env.APP_URL) ALLOWED_ORIGINS.push(process.env.APP_URL.replace(/\/$/, ""));

app.use(
  cors({
    origin(origin, cb) {
      // No Origin header = same-origin navigation, curl, or server-to-server.
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      if (!IS_PROD && /^https?:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
      // Reject by omitting the CORS headers — the browser blocks it. Do not
      // throw: that would surface as a 500 instead of a clean CORS failure.
      return cb(null, false);
    },
    credentials: true, // the admin session cookie
  })
);

app.use(express.json({ limit: "1mb" })); // roomy enough for bulk FAQ imports

// ─── NoSQL OPERATOR-INJECTION SANITISER ─────────────────────────────────────
// MongoDB query objects treat keys like $ne, $gt, $where as operators. If a
// client-supplied value reaches a query as an OBJECT instead of a string, those
// operators execute — e.g. ?sessionId[$ne]=x makes findOne({sessionId}) match
// any document, letting an unauthenticated caller read or delete another
// visitor's chat. Express's default query parser turns ?a[$ne]=b into a nested
// object, and JSON bodies can carry operator objects directly. We strip any key
// beginning with "$" from req.body and req.query (recursively). No legitimate
// field in this app starts with "$", so nothing valid is lost.
function stripMongoOperators(obj, depth = 0) {
  if (!obj || typeof obj !== "object" || depth > 6) return obj;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$")) {
      delete obj[key];
      continue;
    }
    const val = obj[key];
    if (val && typeof val === "object") stripMongoOperators(val, depth + 1);
  }
  return obj;
}

app.use((req, res, next) => {
  if (req.body) stripMongoOperators(req.body);
  if (req.query) stripMongoOperators(req.query);
  next();
});

// ─── RATE LIMITING ──────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Too many requests. Please slow down and try again shortly." },
});
app.use("/api/", limiter);

// Auth endpoints get their own, much tighter budgets on top of the global one.
// Login: 5/min per IP (a failed-attempt lockout in routes/admin.js layers on
// top of this). Password reset: 3/hour per IP.
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // only failed attempts count toward the budget
  message: { error: "Too many login attempts. Please wait a minute and try again." },
});
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: "Too many password reset requests. Please try again later." },
});
app.use("/api/admin/login", loginLimiter);
app.use("/api/admin/forgot-password", resetLimiter);
app.use("/api/admin/reset-password", resetLimiter);

// Lead submission sends a notification email to the school, so an unthrottled
// endpoint is an email-flood / provider-quota-burn primitive. Cap it well below
// the global limit; a genuine visitor submits once. Feedback is likewise
// write-only spam surface.
const leadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many submissions. Please try again in a minute." },
});
app.use("/api/leads", (req, res, next) => (req.method === "POST" ? leadLimiter(req, res, next) : next()));
const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many submissions. Please try again in a minute." },
});
app.use("/api/feedback", feedbackLimiter);

// Serve the frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

// Ensure the database is connected before handling any API request.
// (connectDB caches the connection, so this is a no-op once connected.)
app.use("/api/", async (req, res, next) => {
  try { await connectDB(); } catch (e) { /* falls back to in-memory store */ }
  next();
});

// ─── ROUTES ───────────────────────────────────────────────────────────────
app.use("/api/chat", chatRoutes);
app.use("/api/leads", leadRoutes);

// Fail closed: with a forgeable session secret, serving the admin API would be
// worse than not serving it. Checked per request (ADMIN_DISABLED is resolved
// during startup validation, below).
app.use("/api/admin", (req, res, next) => {
  if (ADMIN_DISABLED) {
    return res.status(503).json({
      error: "The admin dashboard is disabled: the server is missing a valid SESSION_SECRET. Set it and redeploy.",
    });
  }
  next();
});
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    ai: process.env.GEMINI_API_KEY ? "Gemini connected" : "Fallback mode (no API key)",
    database: mongoose.connection.readyState === 1 ? "MongoDB connected" : "In-memory store",
    time: new Date().toISOString(),
  });
});

// Serve admin dashboard
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/admin.html"));
});

// ─── ERROR HANDLING ─────────────────────────────────────────────────────────
// Unknown API route → clean 404 (not the HTML fallback).
app.use("/api/", (req, res) => {
  res.status(404).json({ error: "Not found." });
});

// Catch-all error handler. Without this, Express's default handler returns the
// stack trace to the client outside production (a malformed JSON body is enough
// to trigger it). The client gets a generic message plus a correlation id; the
// stack goes to the server log only, tagged with the same id so the two can be
// matched up when someone reports an error.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const correlationId = crypto.randomUUID();
  console.error(`[${correlationId}] ${req.method} ${req.originalUrl} —`, err.stack || err.message);

  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "That upload is too large.", correlationId });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Malformed request body.", correlationId });
  }
  res.status(500).json({
    error: "Something went wrong on our end. Please try again.",
    correlationId,
  });
});

// ─── DATABASE CONNECTION (serverless-safe) ──────────────────────────────────
// On Vercel, functions freeze and thaw between requests. We cache the
// connection promise on `global` so a single connection is reused across warm
// invocations, and re-attempted if a previous attempt failed. Each request
// awaits this (via the middleware below) so the DB is ready before we query it.
let cached = global._mongo;
if (!cached) cached = global._mongo = { promise: null, listenersBound: false };

// If the connection drops (e.g. the socket dies while a serverless container is
// frozen), clear the cached promise so the next request starts a fresh connect
// instead of awaiting a stale, resolved promise that returns a dead connection.
// Without this, one dropped connection strands an instance on the in-memory
// store until it cold-restarts — a cause of the "sometimes in-memory" flip.
function bindConnectionListeners() {
  if (cached.listenersBound) return;
  cached.listenersBound = true;
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected — will reconnect on the next request.");
    cached.promise = null;
  });
  mongoose.connection.on("error", (e) => {
    console.error("⚠️  MongoDB connection error:", e.message);
  });
}

async function connectDB() {
  if (!process.env.MONGODB_URI) return null; // no DB configured → in-memory store
  bindConnectionListeners();

  // Already connected → reuse it.
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  // Fully disconnected (0) with a stale resolved promise still cached: drop it
  // so the block below starts a real reconnect. readyState 2 (connecting) keeps
  // its in-flight promise so concurrent requests share the one attempt.
  if (mongoose.connection.readyState === 0) cached.promise = null;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        // Atlas shared tiers can be slow to answer the first request after idle,
        // and a Vercel cold start adds latency on top. The previous 8s was the
        // main reason early requests fell back to in-memory. 15s covers a cold
        // cluster while staying under a typical serverless function limit.
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10, // cap connections so many warm lambdas don't exhaust Atlas
      })
      .then((m) => {
        console.log("✅ MongoDB connected.");
        return m;
      })
      .catch((error) => {
        console.error("⚠️  MongoDB connection failed — using in-memory store for now.");
        console.error("   ", error.message);
        cached.promise = null; // allow a fresh retry on the next request
        return null;
      });
  }

  await cached.promise;
  // Report the live state, not a possibly-stale cached handle.
  return mongoose.connection.readyState === 1 ? mongoose.connection : null;
}

// ─── START SERVER ───────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log("");
    console.log("🧘 ═══════════════════════════════════════════════");
    console.log("   PRAGYA AI ASSISTANT — Server Running");
    console.log("═══════════════════════════════════════════════════");
    console.log(`   Chatbot:   http://localhost:${PORT}`);
    console.log(`   Admin:     http://localhost:${PORT}/admin`);
    console.log(`   Health:    http://localhost:${PORT}/api/health`);
    console.log(`   AI:        ${process.env.GEMINI_API_KEY ? "✅ Gemini connected" : "⚠️  Fallback mode (add GEMINI_API_KEY)"}`);
    console.log(`   Database:  ${process.env.MONGODB_URI ? "MongoDB" : "In-memory (demo)"}`);
    console.log("═══════════════════════════════════════════════════");
    console.log("");
  });
}

// ─── ENVIRONMENT VALIDATION ─────────────────────────────────────────────────
// A weak SESSION_SECRET means admin session tokens can be forged, so in
// production the admin surface must not be served at all. It does NOT take the
// whole app down: the public chat widget is embedded on pyshk.com and has no
// dependency on that secret, and knocking visitors offline over an admin-only
// misconfiguration would do more harm than the misconfiguration itself.
const WEAK_VALUES = ["pragya123", "password", "admin", "123456", "changeme"];

function sessionSecretIsStrong() {
  const s = process.env.SESSION_SECRET || "";
  return s.length >= 24 && !/change-this|change-me/i.test(s);
}

// True when the admin surface is unsafe to serve in production.
const ADMIN_DISABLED = IS_PROD && !sessionSecretIsStrong();

function validateEnv() {
  const fatal = [];
  const warns = [];

  if (!sessionSecretIsStrong()) {
    (IS_PROD ? fatal : warns).push(
      "SESSION_SECRET is missing or still a placeholder. Generate one with: openssl rand -hex 32" +
        (IS_PROD
          ? "\n     → /api/admin/* is DISABLED (503) until this is set. The public chat widget is unaffected."
          : "\n     → Sessions are signed with a random per-process key; admins are logged out on restart.")
    );
  }
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    warns.push("ADMIN_EMAIL / ADMIN_PASSWORD are not both set — no admin account is seeded, so the dashboard cannot be logged into.");
  }
  if (WEAK_VALUES.includes((process.env.ADMIN_PASSWORD || "").toLowerCase())) {
    warns.push("ADMIN_PASSWORD is a well-known weak value — change it.");
  }
  if (process.env.ADMIN_KEY && WEAK_VALUES.includes(process.env.ADMIN_KEY.toLowerCase())) {
    warns.push("ADMIN_KEY is a well-known weak value — set a strong one, or remove it to disable the legacy key login entirely.");
  }
  if (!process.env.GEMINI_API_KEY) {
    warns.push("GEMINI_API_KEY is not set — the bot runs in offline keyword-fallback mode only.");
  }
  if (!process.env.MONGODB_URI) {
    warns.push("MONGODB_URI is not set — using the in-memory store. All leads and chats are lost on restart.");
  } else if (IS_PROD && !/^mongodb\+srv:\/\//.test(process.env.MONGODB_URI) && !/tls=true|ssl=true/i.test(process.env.MONGODB_URI)) {
    warns.push("MONGODB_URI may not be using TLS. Use a mongodb+srv:// Atlas URI, or append ?tls=true.");
  }

  if (fatal.length) {
    console.error("\n⛔ PRODUCTION CONFIG ERROR:");
    fatal.forEach((f) => console.error("   • " + f));
    console.error("");
  }
  if (warns.length) {
    console.warn("\n⚠️  CONFIG CHECK — address before going live:");
    warns.forEach((w) => console.warn("   • " + w));
    console.warn("");
  }
  if (!fatal.length && !warns.length) {
    console.log("✅ Environment validated — no configuration warnings.");
  }
}
validateEnv();

// On Vercel (serverless), the platform imports the app instead of listening;
// the per-request middleware establishes the DB connection on demand.
// Locally, we connect and start the HTTP server normally.
if (!process.env.VERCEL) {
  start();
}

module.exports = app;
