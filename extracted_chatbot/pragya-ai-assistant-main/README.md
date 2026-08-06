# 🧘 Pragya AI Assistant — Production Build (Gemini + Vercel)

**Real AI Chatbot for Pragya Yog School (Hong Kong)**
*Where Science Meets Spirituality*

A full-stack, **Google Gemini-powered** AI assistant: answers visitor queries, recommends courses, assists with admissions, captures leads, collects feedback, and includes a full 6-section admin dashboard. Deployable to **Vercel**.

---

## 🔐 Security — read before deploying

All secrets live in environment variables; none are hardcoded in the source. `.env` is gitignored and has **never** been committed to this repo.

### Required environment variables

Set these in your host (Vercel → Settings → Environment Variables):

| Variable | Required | Purpose |
|---|---|---|
| `SESSION_SECRET` | **yes** | Signs admin session tokens. Generate with `openssl rand -hex 32`. |
| `ADMIN_EMAIL` + `ADMIN_PASSWORD` | **yes** | Seeds the dashboard login on first run. Both must be set, or no admin account is created. |
| `GEMINI_API_KEY` | recommended | Google Gemini. Without it the bot runs in offline keyword-fallback mode. |
| `MONGODB_URI` | optional | Falls back to an in-memory store if unset. |
| `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` | optional | Password-reset and lead-alert email. The `SMTP_*` vars are a fallback. |
| `ADMIN_KEY` | optional | Legacy `x-admin-key` header login. Leave unset to disable it. |
| `APP_URL` | optional | Base URL used to build password-reset links in production. |

### Rotate your secrets

Any secret that was ever committed stays in git history forever — rewriting history does not un-leak it, so **rotating at the provider is the only real fix**. Before going live:

- **`SESSION_SECRET`** — if it still starts with `change-this…`, it is not a secret. A guessable signing key lets anyone forge an admin session token and reach every lead, chat log and knowledge-base entry.
- **`ADMIN_KEY` / `ADMIN_PASSWORD`** — if short or guessable, change them. `ADMIN_KEY` grants full admin access via a single header; prefer removing it entirely and using the email+password login.
- **`GEMINI_API_KEY`, `BREVO_API_KEY`, `MONGODB_URI`** — rotate at the provider if they were ever shared, pasted or committed anywhere.

If no `SESSION_SECRET` is configured, sessions are signed with a random per-process key: they cannot be forged, but admins are logged out on every restart. The server prints a security self-check on boot — read it.

---
