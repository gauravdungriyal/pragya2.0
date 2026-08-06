/**
 * Admin Authentication Service
 * Handles password hashing and signed session tokens using Node's built-in
 * `crypto` module — no external dependencies (bcrypt/jsonwebtoken) required,
 * which keeps it portable and avoids native builds on Windows.
 *
 * - Passwords are hashed with scrypt + a per-user random salt.
 * - Session tokens are compact signed tokens (HMAC-SHA256), like a mini-JWT.
 */

const crypto = require("crypto");

// Secret used to sign session tokens. Set SESSION_SECRET in .env for production.
//
// There is deliberately no hardcoded fallback: any literal here would be public
// in the repo, and knowing the HMAC key is enough to forge a session token for
// any admin email. When no usable secret is configured we sign with a random
// per-process key instead — sessions then don't survive a restart, but they
// cannot be forged.
let ephemeralSecret = null;

function getSecret() {
  const configured = process.env.SESSION_SECRET;
  const usable =
    configured && configured.length >= 24 && !/change-this|change-me/i.test(configured);
  if (usable) return configured;

  if (!ephemeralSecret) {
    ephemeralSecret = crypto.randomBytes(32).toString("hex");
    console.warn(
      "⚠️  SESSION_SECRET is missing or still a placeholder — signing sessions with a " +
        "random per-process key. Admins will be logged out on every restart until you set " +
        "SESSION_SECRET (openssl rand -hex 32)."
    );
  }
  return ephemeralSecret;
}

// Constant-time string compare that also tolerates length mismatches
// (crypto.timingSafeEqual throws when buffer lengths differ).
function safeEqual(a, b) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// ─── PASSWORD HASHING ───────────────────────────────────────────────────────
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || typeof stored !== "string" || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const test = crypto.scryptSync(String(password), salt, 64).toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(test, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ─── SESSION TOKENS ─────────────────────────────────────────────────────────
function b64url(str) {
  return Buffer.from(str).toString("base64url");
}

// Default token lifetime: 8 hours.
function signToken(payload, ttlMs = 8 * 60 * 60 * 1000) {
  const body = { ...payload, iat: Date.now(), exp: Date.now() + ttlMs };
  const data = b64url(JSON.stringify(body));
  const sig = crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let body;
  try {
    body = JSON.parse(Buffer.from(data, "base64url").toString());
  } catch (e) {
    return null;
  }
  if (!body.exp || body.exp < Date.now()) return null;
  return body;
}

// ─── SESSION COOKIE ─────────────────────────────────────────────────────────
// The session token lives in an httpOnly cookie rather than localStorage, so
// page JavaScript (including anything injected via XSS) cannot read it.
const SESSION_COOKIE = "pragya_admin_session";

function readCookie(req, name) {
  const raw = req.headers.cookie;
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return null;
}

function setSessionCookie(res, token, ttlMs = 8 * 60 * 60 * 1000) {
  const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true, // not readable by JS — blunts XSS session theft
    secure: isProd, // HTTPS only in production; plain http still works locally
    sameSite: "strict", // not sent on cross-site requests — blunts CSRF
    maxAge: ttlMs,
    path: "/",
  });
}

function clearSessionCookie(res) {
  const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
  });
}

// ─── EXPRESS MIDDLEWARE ─────────────────────────────────────────────────────
/**
 * Protects a route. Accepts, in order: the httpOnly session cookie, a Bearer
 * session token (kept for API clients), or the legacy static x-admin-key
 * header. Sets req.admin = { email }.
 */
async function adminAuthMiddleware(req, res, next) {
  // 1. Preferred: httpOnly session cookie, then Bearer token.
  const authHeader = req.headers["authorization"] || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  const token = readCookie(req, SESSION_COOKIE) || bearer;
  if (token) {
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }
    // Bind the session to the account's current password. The token carries a
    // `pv` fingerprint of the password hash at login time; if the password has
    // since changed (a reset, or a change-password), the fingerprint no longer
    // matches and the token is rejected. This is what makes a password reset
    // actually lock out anyone holding a previously issued session token.
    //
    // The check is ONLY enforced when the database is connected. Without a DB
    // the app uses the in-memory store, which is wiped on every serverless cold
    // start and holds no admin record — so a DB-backed check there would reject
    // every valid session on the next cold instance (that was the "logged out
    // in minutes" bug). In that mode we fall back to stateless verification: the
    // HMAC signature and expiry are still checked above, and the store resets on
    // restart anyway, so there is no persisted session to protect against.
    // Role comes from the token, but if the DB is connected we prefer the live
    // record (so a promotion/demotion takes effect without re-login). A missing
    // role — e.g. a legacy account created before roles existed — is treated as
    // super_admin so nobody is accidentally locked out of their own dashboard.
    let role = payload.role || "super_admin";
    try {
      // Lazily required to avoid a load-order cycle with data-service.
      const dataService = require("./data-service");
      if (dataService.isDbConnected()) {
        const admin = await dataService.getAdminByEmail(payload.email);
        // If the admin lookup comes back empty while the DB is connected, the
        // account was genuinely removed — reject. (In-memory mode skips this
        // whole block, so a transient fallback can't trigger it.)
        if (!admin) return res.status(401).json({ error: "Session no longer valid. Please log in again." });
        if (payload.pv && payload.pv !== passwordVersion(admin.passwordHash)) {
          return res.status(401).json({ error: "Session ended after a password change. Please log in again." });
        }
        role = admin.role || "super_admin";
      }
    } catch (e) {
      // A DB hiccup must not log a valid session out: the signature and expiry
      // already passed, so accept the token and let the next request re-check.
    }
    req.admin = { email: payload.email, role };
    return next();
  }

  // 2. Legacy: static admin key (kept for backward compatibility).
  // Only honoured when ADMIN_KEY is explicitly configured — there is no
  // guessable built-in default, so this is not a universal backdoor.
  // Header only: a key passed as ?key= would end up in access logs, browser
  // history and Referer headers.
  const expected = process.env.ADMIN_KEY;
  if (expected) {
    const key = req.headers["x-admin-key"];
    if (key && safeEqual(String(key), String(expected))) {
      req.admin = { email: "admin-key", role: "super_admin" };
      return next();
    }
  }

  return res.status(401).json({ error: "Unauthorized. Please log in." });
}

// Gate for actions only a super admin may perform (managing other accounts,
// erasing a person's data). Must run AFTER adminAuthMiddleware.
function requireSuperAdmin(req, res, next) {
  if (!req.admin || req.admin.role !== "super_admin") {
    return res.status(403).json({ error: "Only a super admin can do this." });
  }
  next();
}

// ─── PASSWORD RESET TOKENS ──────────────────────────────────────────────────
function sha256(str) {
  return crypto.createHash("sha256").update(String(str)).digest("hex");
}

// A short, non-reversible fingerprint of the stored password hash. Embedded in
// each session token (the `pv` claim) so that changing the password — which
// changes the hash — invalidates every token issued before the change.
function passwordVersion(passwordHash) {
  return sha256(String(passwordHash || "")).slice(0, 16);
}

// Returns a raw token (emailed to the user) and its hash (stored in the DB).
// Only the hash is persisted, so a database leak cannot reveal usable tokens.
function generateResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  return { token, hash: sha256(token) };
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  adminAuthMiddleware,
  requireSuperAdmin,
  passwordVersion,
  sha256,
  generateResetToken,
  setSessionCookie,
  clearSessionCookie,
  SESSION_COOKIE,
};
