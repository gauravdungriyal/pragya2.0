/**
 * Pragya Admin Dashboard.
 * Extracted from an inline <script> in admin.html so the Content Security
 * Policy can forbid inline scripts (script-src 'self'). Handlers are bound by
 * delegation on data-action attributes rather than inline onclick="".
 */
const API_BASE = window.PRAGYA_API_BASE || "";
// The session token is held in an httpOnly cookie the browser attaches
// automatically. It is deliberately NOT in a JS variable or localStorage, so a
// script injected into this page cannot read it. We only track "am I logged in".
let LOGGED_IN = false;
let ADMIN_EMAIL = "";
let ADMIN_ROLE = "super_admin";

// Panel element ids in tab-index order. Kept explicit so the side navigation can
// group items in whatever order reads best without the panels having to sit in
// the same order in the markup.
const PANEL_IDS = [
  "panel0",          // 0  Overview
  "panel1",          // 1  Analytics
  "panel2",          // 2  Leads
  "panel3",          // 3  Chat Logs
  "panel4",          // 4  FAQ Manager
  "panelKB",         // 5  Knowledge Base
  "panelWidget",     // 6  Widget
  "panel5",          // 7  Feedback
  "panel6",          // 8  Account
  "panelAppearance", // 9  Appearance
  "panelTeam",       // 10 Team
  "panelGeneral",    // 11 General
];

function showTab(i) {
  i = Number(i); // may arrive as a string from data-arg
  if (!Number.isInteger(i) || i < 0 || i >= PANEL_IDS.length) i = 0;
  // Staff must never land on the super-admin-only Team panel (e.g. via a
  // remembered tab from a previous super-admin session on the same browser).
  if (i === 10 && ADMIN_ROLE !== "super_admin") i = 0;
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", Number(t.dataset.arg) === i));
  PANEL_IDS.forEach((id, j) => {
    const p = document.getElementById(id);
    if (p) p.classList.toggle("on", j === i);
  });
  try { localStorage.setItem("pragya_admin_tab", String(i)); } catch (e) { /* private mode */ }
  if (i===1) loadAnalytics();
  if (i===2) { loadLeads(); loadLeadRouting(); }
  if (i===3) loadConversations();
  if (i===4) loadFaqs();
  if (i===5) loadKnowledge();
  if (i===6) loadWidgetCfg();
  if (i===7) loadFeedback();
  if (i===8) { document.getElementById("acctEmail").textContent = ADMIN_EMAIL || "—"; loadAudit(); }
  if (i===9) loadTheme();
  if (i===10) loadTeam();
  if (i===11) loadGeneral();
}

// Show/hide the super-admin-only surfaces (Team tab, data erasure) based on role.
function applyRoleUI() {
  const isSuper = ADMIN_ROLE === "super_admin";
  const teamTab = document.getElementById("tabTeam");
  if (teamTab) teamTab.style.display = isSuper ? "" : "none";
  const eraseSection = document.getElementById("eraseSection");
  if (eraseSection) eraseSection.style.display = isSuper ? "" : "none";
}

function handleAuthError() {
  // Session invalid/expired — force a fresh login.
  logout();
  document.getElementById("loginError").textContent = "Your session expired. Please sign in again.";
}

function api(path) {
  return fetch(`${API_BASE}/api/admin/${path}`, { credentials: "same-origin" }).then(r => {
    if (r.status === 401) { handleAuthError(); throw new Error("unauthorized"); }
    return r.json();
  });
}

function apiSend(path, method, body) {
  return fetch(`${API_BASE}/api/admin/${path}`, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async r => {
    const data = await r.json().catch(() => ({}));
    if (r.status === 401) { handleAuthError(); throw new Error(data.error || "unauthorized"); }
    if (!r.ok) throw new Error(data.error || "Request failed.");
    return data;
  });
}

function login() {
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;
  const errEl = document.getElementById("loginError");
  errEl.textContent = "";
  if (!email || !password) { errEl.textContent = "Please enter your email and password."; return; }
  fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    credentials: "same-origin", // let the browser store the httpOnly session cookie
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then(async r => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { errEl.textContent = data.error || "Login failed."; return null; }
      return data;
    })
    .then(data => {
      if (!data) return;
      enterDashboard(data.email, data.role);
    })
    .catch(() => { errEl.textContent = "Could not connect to the server. Is the backend running?"; });
}

function enterDashboard(email, role) {
  LOGGED_IN = true;
  ADMIN_EMAIL = email || "";
  ADMIN_ROLE = role || "super_admin";
  document.getElementById("loginError").textContent = "";
  document.getElementById("adminPassword").value = "";
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  applyRoleUI();
  // Reopen whichever section was last in use, so a refresh doesn't dump the
  // admin back on Overview mid-task. showTab() validates the value and falls
  // back to Overview if it is stale or not allowed for this role.
  let last = 0;
  try { last = Number(localStorage.getItem("pragya_admin_tab")) || 0; } catch (e) { /* private mode */ }
  showTab(last);
  loadOverview(); loadHealth();
}

function logout() {
  LOGGED_IN = false;
  ADMIN_EMAIL = "";
  // Clear tokens written by older versions of this dashboard, which kept the
  // session token and admin email in localStorage.
  localStorage.removeItem("pragya_admin_token");
  localStorage.removeItem("pragya_admin_email");
  // The cookie is httpOnly, so only the server can clear it.
  fetch(`${API_BASE}/api/admin/logout`, { method: "POST", credentials: "same-origin" }).catch(() => {});
  document.getElementById("dashboard").style.display = "none";
  showLogin();
}

// ─── Auth view switching (login / forgot / reset) ───
function showAuthView(which) {
  document.getElementById("loginBox").style.display = which === "login" ? "block" : "none";
  document.getElementById("forgotBox").style.display = which === "forgot" ? "block" : "none";
  document.getElementById("resetBox").style.display = which === "reset" ? "block" : "none";
}
function showLogin() { showAuthView("login"); }
function showForgot() {
  document.getElementById("forgotMsg").textContent = "";
  document.getElementById("forgotEmail").value = document.getElementById("adminEmail").value.trim();
  showAuthView("forgot");
}

function sendResetLink() {
  const email = document.getElementById("forgotEmail").value.trim();
  const msg = document.getElementById("forgotMsg");
  if (!email) { msg.style.color = "#b91c1c"; msg.textContent = "Please enter your email."; return; }
  msg.style.color = "#666"; msg.textContent = "Sending…";
  fetch(`${API_BASE}/api/admin/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
    .then(async r => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || "Failed"); return d; })
    .then(d => { msg.style.color = "var(--teal)"; msg.textContent = d.message || "If that email is registered, a reset link has been sent."; })
    .catch(() => { msg.style.color = "#b91c1c"; msg.textContent = "Could not send reset link. Please try again."; });
}

function submitReset() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("reset");
  const newPassword = document.getElementById("resetNew").value;
  const confirm = document.getElementById("resetConfirm").value;
  const msg = document.getElementById("resetMsg");
  if (!token) { msg.style.color = "#b91c1c"; msg.textContent = "Missing reset token. Please use the link from your email."; return; }
  if (!newPassword || newPassword.length < 6) { msg.style.color = "#b91c1c"; msg.textContent = "Password must be at least 6 characters."; return; }
  if (newPassword !== confirm) { msg.style.color = "#b91c1c"; msg.textContent = "Passwords do not match."; return; }
  msg.style.color = "#666"; msg.textContent = "Updating…";
  fetch(`${API_BASE}/api/admin/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  })
    .then(async r => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || "Failed"); return d; })
    .then(() => {
      msg.style.color = "var(--teal)";
      msg.textContent = "Password updated! Redirecting to sign in…";
      setTimeout(() => { window.history.replaceState({}, "", window.location.pathname); showLogin(); }, 1800);
    })
    .catch(err => { msg.style.color = "#b91c1c"; msg.textContent = err.message || "Could not reset password."; });
}

function loadHealth() {
  fetch(`${API_BASE}/api/health`).then(r=>r.json()).then(d=>{
    document.getElementById("aiStatus").textContent = d.ai + " · " + d.database;
  }).catch(()=>{});
}

function loadOverview() {
  api("stats").then(d => {
    document.getElementById("sConvos").textContent = d.totalConversations ?? 0;
    document.getElementById("sLeads").textContent = d.totalLeads ?? 0;
    document.getElementById("sMsgs").textContent = d.totalMessages ?? 0;
    document.getElementById("sNew").textContent = d.newLeads ?? 0;
  }).catch(()=>{});
  api("analytics").then(d => {
    document.getElementById("oRating").textContent = d.avgRating ?? "N/A";
    document.getElementById("oConv").textContent = d.conversionRate ?? "N/A";
    document.getElementById("oRatings").textContent = d.totalRatings ?? 0;
  }).catch(()=>{});
  api("faqs").then(d => {
    document.getElementById("oFaqs").textContent = (d.faqs ? d.faqs.length : 0) + " FAQs";
  }).catch(()=>{});
}

function loadAnalytics() {
  api("analytics").then(d => {
    // course chart
    const cc = document.getElementById("courseChart");
    const courses = d.leadsByCourse || {};
    const entries = Object.entries(courses);
    if (!entries.length) { cc.innerHTML = `<div class="empty">No lead data yet.</div>`; }
    else {
      const max = Math.max(...entries.map(e=>e[1]));
      cc.innerHTML = entries.map(([name,val]) =>
        `<div class="bar-row"><div class="bar-label">${esc(name)}</div><div class="bar-track"><div class="bar-fill" style="width:${(val/max*100)}%"></div></div><div class="bar-val">${val}</div></div>`
      ).join("");
    }
    // day chart
    const dc = document.getElementById("dayChart");
    const days = d.leadsByDay || {};
    const dentries = Object.entries(days);
    if (!dentries.length) { dc.innerHTML = `<div class="empty">No activity data yet.</div>`; }
    else {
      const dmax = Math.max(1, ...dentries.map(e=>e[1]));
      dc.innerHTML = dentries.map(([day,val]) =>
        `<div class="bar-row"><div class="bar-label">${esc(day)}</div><div class="bar-track"><div class="bar-fill" style="width:${(val/dmax*100)}%"></div></div><div class="bar-val">${val}</div></div>`
      ).join("");
    }
  }).catch(()=>{});
}

let leadsCache = [];

function loadLeads() {
  api("leads").then(d => {
    leadsCache = d.leads || [];
    const wrap = document.getElementById("leadsWrap");
    if (!leadsCache.length) { wrap.innerHTML = `<div class="empty">No leads captured yet.</div>`; return; }
    let rows = leadsCache.map(l => {
      let tag = l.course && l.course.includes("Teacher") ? "tag-ttc" : (l.course && l.course.includes("Class")) ? "tag-course" : "tag-new";
      const time = new Date(l.createdAt).toLocaleString();
      const st = l.status || "new";
      const sel = `<select class="status-sel status-${st}" data-change="setLeadStatus" data-arg="${esc(String(l._id))}">
        ${["new","contacted","converted"].map(s => `<option value="${s}" ${s===st?"selected":""}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join("")}
      </select>`;
      const del = `<button class="btn-del" title="Delete this lead permanently" data-action="deleteLead" data-arg="${esc(String(l._id))}">🗑</button>`;
      return `<tr><td><strong>${esc(l.name)}</strong></td><td>${esc(l.email)}</td><td>${esc(l.phone||"—")}</td><td>${esc(l.country||"—")}</td><td><span class="tag ${tag}">${esc(l.course)}</span></td><td>${sel}</td><td style="font-size:11px;color:#888;">${time}</td><td>${del}</td></tr>`;
    }).join("");
    wrap.innerHTML = `<table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Country</th><th>Interest</th><th>Status</th><th>Captured</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
  }).catch(()=>{});
}

function setLeadStatus(id, status) {
  apiSend(`leads/${id}`, "PATCH", { status })
    .then(() => { loadLeads(); loadOverview(); })
    .catch(err => { alert(err.message || "Could not update lead status."); loadLeads(); });
}

function deleteLead(id) {
  if (!confirm("Permanently delete this lead? This cannot be undone.")) return;
  apiSend(`leads/${id}`, "DELETE")
    .then(() => { loadLeads(); loadOverview(); })
    .catch(err => alert(err.message || "Could not delete the lead."));
}

// Handle a "delete my data" request: removes the person's lead record(s) and
// the chat transcript(s) those leads came from.
function eraseByEmail() {
  const el = document.getElementById("eraseEmail");
  const email = el.value.trim();
  const out = document.getElementById("eraseResult");
  out.textContent = "";
  if (!email || !email.includes("@")) { out.textContent = "Enter a valid email address."; return; }
  if (!confirm(`Permanently erase ALL data for ${email}?\n\nThis deletes their lead record(s) and chat transcript(s). It cannot be undone.`)) return;
  apiSend("erase", "POST", { email })
    .then(d => {
      out.textContent = `✅ Erased ${d.leads} lead(s) and ${d.conversations} conversation(s) for ${email}.`;
      el.value = "";
      loadLeads(); loadOverview(); loadAudit();
    })
    .catch(err => { out.textContent = err.message || "Could not complete the erasure."; });
}

function exportLeadsCSV() {
  if (!leadsCache.length) { alert("No leads to export yet."); return; }
  const cols = ["name","email","phone","country","course","status","createdAt"];
  const header = ["Name","Email","Phone","Country","Interested Course","Status","Captured At"];
  const cell = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  const lines = [header.map(cell).join(",")];
  leadsCache.forEach(l => lines.push(cols.map(c => cell(c === "createdAt" ? new Date(l[c]).toLocaleString() : l[c])).join(",")));
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `pragya-leads-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

let convosCache = [];

function loadConversations() {
  api("conversations").then(d => {
    convosCache = (d.conversations || []).slice(0, 20);
    const wrap = document.getElementById("convosWrap");
    if (!convosCache.length) { wrap.innerHTML = `<div class="empty">No conversations yet.</div>`; return; }
    let rows = convosCache.map((c, i) => {
      const last = c.messages && c.messages.length ? c.messages[c.messages.length-1] : null;
      const preview = last ? (last.role === "user" ? "👤 " : "🧘 ") + last.content.slice(0,70) : "—";
      const count = c.messages ? c.messages.length : 0;
      const time = new Date(c.updatedAt || c.createdAt).toLocaleString();
      return `<tr class="convo-row" data-action="openTranscript" data-arg="${i}" title="Click to read the full conversation"><td style="font-family:monospace;font-size:11px;">${esc((c.sessionId||"").slice(0,8))}…</td><td>${esc(preview)}</td><td style="text-align:center;">${count}</td><td style="font-size:11px;color:#888;">${time}</td></tr>`;
    }).join("");
    wrap.innerHTML = `<table><thead><tr><th>Session</th><th>Last Message</th><th>Msgs</th><th>Updated</th></tr></thead><tbody>${rows}</tbody></table>`;
  }).catch(()=>{});
}

function openTranscript(i) {
  const c = convosCache[Number(i)]; // may arrive as a string from data-arg
  if (!c) return;
  const msgs = (c.messages || []).map(m => {
    const who = m.role === "user" ? "👤 Visitor" : "🙏 Pragya";
    const cls = m.role === "user" ? "t-user" : "t-bot";
    const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : "";
    return `<div class="t-msg ${cls}"><div class="t-who">${who} <span class="t-time">${esc(time)}</span></div><div class="t-text">${esc(m.content)}</div></div>`;
  }).join("");
  document.getElementById("modalTitle").textContent = `Conversation ${(c.sessionId||"").slice(0,8)}… (${(c.messages||[]).length} messages)`;
  document.getElementById("modalBody").innerHTML = msgs || `<div class="empty">No messages.</div>`;
  document.getElementById("modalOverlay").classList.add("open");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

// The backdrop closes the dialog, but a click *inside* the dialog must not.
// Delegation means we can no longer lean on e.currentTarget, so compare the
// click target against the overlay element itself.
function closeModalOverlay(arg, e, el) {
  if (e.target !== el) return;
  closeModal();
}

let faqCache = [];

function loadFaqs() {
  api("faqs").then(d => {
    faqCache = d.faqs || [];
    const wrap = document.getElementById("faqWrap");
    // Populate the category suggestions datalist from existing FAQs.
    const cats = [...new Set(faqCache.map(f => f.category).filter(Boolean))].sort();
    document.getElementById("faqCatList").innerHTML = cats.map(c => `<option value="${esc(c)}">`).join("");

    if (!faqCache.length) { wrap.innerHTML = `<div class="empty">No FAQs yet. Add one above.</div>`; return; }
    let rows = faqCache.map(f => {
      const id = esc(f._id);
      return `<tr>
        <td><span class="cat-tag">${esc(f.category)}</span></td>
        <td><strong>${esc(f.question)}</strong></td>
        <td style="color:#555;">${esc(f.answer)}</td>
        <td><div class="faq-actions">
          <button class="btn btn-sm btn-edit" data-action="startEditFaq" data-arg="${id}">Edit</button>
          <button class="btn btn-sm btn-del" data-action="removeFaq" data-arg="${id}">Delete</button>
        </div></td>
      </tr>`;
    }).join("");
    wrap.innerHTML = `<table><thead><tr><th style="width:120px;">Category</th><th style="width:30%;">Question</th><th>Answer</th><th style="width:120px;">Actions</th></tr></thead><tbody>${rows}</tbody></table>`;
  }).catch(()=>{});
}

function faqMsg(text, ok) {
  const el = document.getElementById("faqMsg");
  el.textContent = text;
  el.className = "faq-msg " + (ok ? "ok" : "err");
  if (text) setTimeout(() => { if (el.textContent === text) { el.textContent = ""; el.className = "faq-msg"; } }, 4000);
}

function resetFaqForm() {
  document.getElementById("faqId").value = "";
  document.getElementById("faqCategory").value = "General";
  document.getElementById("faqQuestion").value = "";
  document.getElementById("faqAnswer").value = "";
  document.getElementById("faqFormTitle").textContent = "Add New FAQ";
  document.getElementById("faqSubmitBtn").textContent = "＋ Add FAQ";
  document.getElementById("faqCancelBtn").style.display = "none";
}

function startEditFaq(id) {
  const f = faqCache.find(x => String(x._id) === String(id));
  if (!f) return;
  document.getElementById("faqId").value = f._id;
  document.getElementById("faqCategory").value = f.category || "General";
  document.getElementById("faqQuestion").value = f.question || "";
  document.getElementById("faqAnswer").value = f.answer || "";
  document.getElementById("faqFormTitle").textContent = "Edit FAQ";
  document.getElementById("faqSubmitBtn").textContent = "Save Changes";
  document.getElementById("faqCancelBtn").style.display = "inline-block";
  document.getElementById("faqForm").scrollIntoView({ behavior: "smooth", block: "center" });
}

function submitFaq(event) {
  event.preventDefault();
  const id = document.getElementById("faqId").value.trim();
  const category = document.getElementById("faqCategory").value.trim() || "General";
  const question = document.getElementById("faqQuestion").value.trim();
  const answer = document.getElementById("faqAnswer").value.trim();
  if (!question || !answer) { faqMsg("Question and answer are required.", false); return; }

  const payload = { category, question, answer };
  const req = id
    ? apiSend(`faqs/${id}`, "PUT", payload)
    : apiSend("faqs", "POST", payload);

  req.then(() => {
    faqMsg(id ? "FAQ updated." : "FAQ added.", true);
    resetFaqForm();
    loadFaqs();
    loadOverview();
  }).catch(err => faqMsg(err.message || "Something went wrong.", false));
}

function removeFaq(id) {
  const f = faqCache.find(x => String(x._id) === String(id));
  if (!confirm(`Delete this FAQ?\n\n${f ? f.question : ""}`)) return;
  apiSend(`faqs/${id}`, "DELETE").then(() => {
    faqMsg("FAQ deleted.", true);
    loadFaqs();
    loadOverview();
  }).catch(err => faqMsg(err.message || "Could not delete.", false));
}

// ─── FAQ BULK IMPORT (Excel/CSV) ───
let faqImportRows = [];

function faqImportMsg(text, ok) {
  const el = document.getElementById("faqImportMsg");
  el.textContent = text;
  el.className = "faq-msg " + (ok ? "ok" : "err");
}

// The Excel reader (SheetJS) is only fetched when someone actually picks an
// .xlsx/.xls file, so the dashboard itself stays light.
function loadSheetJS() {
  return new Promise((resolve, reject) => {
    if (window.XLSX) return resolve(window.XLSX);
    const s = document.createElement("script");
    s.src = "https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js";
    s.onload = () => resolve(window.XLSX);
    s.onerror = () => reject(new Error("Could not load the Excel reader (check your internet). Or save the file as CSV and upload that instead."));
    document.head.appendChild(s);
  });
}

// Quote-aware CSV → array of row arrays (handles commas and line breaks inside "quoted" cells).
function parseCsv(text) {
  const rows = []; let row = []; let cell = ""; let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else { inQuotes = false; }
      } else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some(c => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some(c => c.trim() !== "")) rows.push(row);
  return rows;
}

// Turn raw sheet rows into {category, question, answer} using the header row.
// Header names are matched loosely (Question/Questions/Q, Answer/Response, Category/Topic…).
function mapFaqRows(rows) {
  if (!rows.length) return { rows: [], note: "" };
  const norm = (s) => String(s || "").trim().toLowerCase().replace(/[^a-z]/g, "");
  const header = rows[0].map(norm);
  const findCol = (names) => header.findIndex(h => names.includes(h));
  let qCol = findCol(["question", "questions", "q", "faq", "query"]);
  let aCol = findCol(["answer", "answers", "a", "response", "reply", "solution"]);
  let cCol = findCol(["category", "cat", "topic", "section", "group", "type"]);
  let dataRows = rows.slice(1);
  let note = "";
  if (qCol === -1 || aCol === -1) {
    // No recognizable header — assume column 1 = question, column 2 = answer.
    qCol = 0; aCol = 1; cCol = -1; dataRows = rows;
    note = "No Question/Answer header row found — using column 1 as the question and column 2 as the answer.";
  }
  const mapped = dataRows.map(r => ({
    category: cCol >= 0 ? String(r[cCol] || "").trim() : "",
    question: String(r[qCol] || "").trim(),
    answer: String(r[aCol] || "").trim(),
  })).filter(r => r.question || r.answer);
  return { rows: mapped, note };
}

async function previewFaqFile() {
  const input = document.getElementById("faqFile");
  const previewEl = document.getElementById("faqImportPreview");
  const importBtn = document.getElementById("faqImportBtn");
  faqImportRows = [];
  previewEl.innerHTML = "";
  importBtn.style.display = "none";
  faqImportMsg("", true);
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    faqImportMsg("Reading file…", true);
    let rawRows;
    if (/\.(xlsx|xls)$/i.test(file.name)) {
      const XLSX = await loadSheetJS();
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" })
        .map(r => r.map(c => String(c == null ? "" : c)));
    } else {
      rawRows = parseCsv(await file.text());
    }
    const { rows, note } = mapFaqRows(rawRows);
    const valid = rows.filter(r => r.question && r.answer);
    const invalid = rows.length - valid.length;
    if (!valid.length) {
      faqImportMsg("No usable rows found. Make sure the file has Question and Answer columns with data.", false);
      return;
    }
    faqImportRows = valid;
    const sample = valid.slice(0, 5).map(r => `
      <tr>
        <td style="white-space:nowrap;">${esc(r.category || "General")}</td>
        <td>${esc(r.question.slice(0, 90))}${r.question.length > 90 ? "…" : ""}</td>
        <td>${esc(r.answer.slice(0, 110))}${r.answer.length > 110 ? "…" : ""}</td>
      </tr>`).join("");
    previewEl.innerHTML = `
      ${note ? `<div style="font-size:12px;color:#b45309;margin-bottom:8px;">⚠️ ${esc(note)}</div>` : ""}
      <div style="font-size:12.5px;color:#333;margin-bottom:8px;">
        Found <b>${valid.length}</b> FAQ${valid.length === 1 ? "" : "s"} ready to import${invalid ? ` (${invalid} incomplete row${invalid === 1 ? "" : "s"} will be skipped)` : ""}. Preview:
      </div>
      <div style="overflow-x:auto;">
        <table>
          <thead><tr><th>Category</th><th>Question</th><th>Answer</th></tr></thead>
          <tbody>${sample}</tbody>
        </table>
      </div>
      ${valid.length > 5 ? `<div style="font-size:12px;color:#888;margin-top:6px;">…and ${valid.length - 5} more.</div>` : ""}`;
    importBtn.textContent = `Import ${valid.length} FAQ${valid.length === 1 ? "" : "s"}`;
    importBtn.style.display = "inline-block";
    faqImportMsg("", true);
  } catch (err) {
    faqImportMsg(err.message || "Could not read that file.", false);
  }
}

function runFaqImport() {
  if (!faqImportRows.length) return;
  const importBtn = document.getElementById("faqImportBtn");
  importBtn.disabled = true;
  faqImportMsg("Importing… this can take a few seconds.", true);
  apiSend("faqs/import", "POST", { faqs: faqImportRows }).then(d => {
    const parts = [`✅ ${d.added} added`];
    if (d.skippedDuplicate) parts.push(`${d.skippedDuplicate} duplicate${d.skippedDuplicate === 1 ? "" : "s"} skipped`);
    if (d.skippedInvalid) parts.push(`${d.skippedInvalid} incomplete skipped`);
    faqImportMsg(parts.join(" · "), true);
    faqImportRows = [];
    document.getElementById("faqFile").value = "";
    document.getElementById("faqImportPreview").innerHTML = "";
    importBtn.style.display = "none";
    loadFaqs();
    loadOverview();
  }).catch(err => {
    faqImportMsg(err.message || "Import failed.", false);
  }).finally(() => { importBtn.disabled = false; });
}

// ─── KNOWLEDGE BASE ───
let kbCache = [];

function loadKnowledge() {
  api("knowledge").then(d => {
    kbCache = d.knowledge || [];
    const wrap = document.getElementById("kbWrap");
    if (!kbCache.length) { wrap.innerHTML = `<div class="empty">No knowledge sections yet. Add one above.</div>`; return; }
    wrap.innerHTML = kbCache.map(k => {
      const id = esc(String(k._id));
      const preview = esc((k.content || "").slice(0, 320)) + ((k.content || "").length > 320 ? "…" : "");
      return `<div class="kb-card">
        <div class="kb-card-head">
          <span class="cat-tag">${esc(k.title)}</span>
          <div class="faq-actions">
            <button class="btn btn-sm btn-edit" data-action="startEditKb" data-arg="${id}">Edit</button>
            <button class="btn btn-sm btn-del" data-action="removeKb" data-arg="${id}">Delete</button>
          </div>
        </div>
        <div class="kb-card-body">${preview.replace(/\n/g, "<br>")}</div>
      </div>`;
    }).join("");
  }).catch(()=>{});
}

function kbMsg(text, ok) {
  const el = document.getElementById("kbMsg");
  el.textContent = text;
  el.className = "faq-msg " + (ok ? "ok" : "err");
  if (text) setTimeout(() => { if (el.textContent === text) { el.textContent = ""; el.className = "faq-msg"; } }, 4000);
}

function resetKbForm() {
  document.getElementById("kbId").value = "";
  document.getElementById("kbTitle").value = "";
  document.getElementById("kbContent").value = "";
  document.getElementById("kbFormTitle").textContent = "Add Knowledge Section";
  document.getElementById("kbSubmitBtn").textContent = "＋ Add Section";
  document.getElementById("kbCancelBtn").style.display = "none";
}

function startEditKb(id) {
  const k = kbCache.find(x => String(x._id) === String(id));
  if (!k) return;
  document.getElementById("kbId").value = k._id;
  document.getElementById("kbTitle").value = k.title || "";
  document.getElementById("kbContent").value = k.content || "";
  document.getElementById("kbFormTitle").textContent = "Edit Knowledge Section";
  document.getElementById("kbSubmitBtn").textContent = "Save Changes";
  document.getElementById("kbCancelBtn").style.display = "inline-block";
  document.getElementById("kbForm").scrollIntoView({ behavior: "smooth", block: "center" });
}

function submitKnowledge(event) {
  event.preventDefault();
  const id = document.getElementById("kbId").value.trim();
  const title = document.getElementById("kbTitle").value.trim();
  const content = document.getElementById("kbContent").value.trim();
  if (!title) { kbMsg("A section title is required.", false); return; }
  const payload = { title, content };
  const req = id ? apiSend(`knowledge/${id}`, "PUT", payload) : apiSend("knowledge", "POST", payload);
  req.then(() => {
    kbMsg(id ? "Section updated — the bot uses it now." : "Section added.", true);
    resetKbForm();
    loadKnowledge();
  }).catch(err => kbMsg(err.message || "Something went wrong.", false));
}

function removeKb(id) {
  const k = kbCache.find(x => String(x._id) === String(id));
  if (!confirm(`Delete this knowledge section?\n\n${k ? k.title : ""}\n\nThe chatbot will no longer know this information.`)) return;
  apiSend(`knowledge/${id}`, "DELETE").then(() => {
    kbMsg("Section deleted.", true);
    loadKnowledge();
  }).catch(err => kbMsg(err.message || "Could not delete.", false));
}

// ─── Widget tab (cards, suggested questions, teasers) ───
let qaList = [];

function loadWidgetCfg() {
  fetch(`${API_BASE}/api/chat/config`).then(r => r.json()).then(d => {
    qaList = (d.quickActions || []).map(c => ({ icon: c.icon || "✨", title: c.title || "", subtitle: c.subtitle || "", type: c.type === "link" ? "link" : "message", value: c.value || "" }));
    renderQaRows();
    document.getElementById("sqText").value = (d.suggestions || []).join("\n");
  }).catch(()=>{});
  loadTeasers();
}

function renderQaRows() {
  const wrap = document.getElementById("qaRows");
  wrap.innerHTML = qaList.map((c, i) => `
    <div class="qa-row" data-i="${i}">
      <input class="faq-input qa-icon" value="${esc(c.icon)}" maxlength="8" title="Icon (emoji)">
      <input class="faq-input qa-title" value="${esc(c.title)}" maxlength="30" placeholder="Card title *">
      <input class="faq-input qa-sub" value="${esc(c.subtitle)}" maxlength="40" placeholder="Subtitle (small text)">
      <select class="faq-input qa-type">
        <option value="message" ${c.type === "message" ? "selected" : ""}>Ask the bot</option>
        <option value="link" ${c.type === "link" ? "selected" : ""}>Open a link</option>
      </select>
      <input class="faq-input qa-value" value="${esc(c.value)}" maxlength="300" placeholder="Message to send, or https:// link *">
      <button type="button" class="btn btn-sm btn-del" data-action="rmQaRow" data-arg="${i}" title="Remove card">✕</button>
    </div>`).join("");
}

function collectQa() {
  qaList = [...document.querySelectorAll("#qaRows .qa-row")].map(row => ({
    icon: row.querySelector(".qa-icon").value.trim() || "✨",
    title: row.querySelector(".qa-title").value.trim(),
    subtitle: row.querySelector(".qa-sub").value.trim(),
    type: row.querySelector(".qa-type").value,
    value: row.querySelector(".qa-value").value.trim(),
  }));
}

function addQaRow() {
  collectQa();
  if (qaList.length >= 6) { qaMsgShow("Maximum 6 cards.", false); return; }
  qaList.push({ icon: "✨", title: "", subtitle: "", type: "message", value: "" });
  renderQaRows();
}

function rmQaRow(i) {
  collectQa();
  qaList.splice(Number(i), 1); // may arrive as a string from data-arg
  renderQaRows();
}

function qaMsgShow(text, ok) {
  const el = document.getElementById("qaMsg");
  el.textContent = text;
  el.className = "faq-msg " + (ok ? "ok" : "err");
  if (text) setTimeout(() => { if (el.textContent === text) { el.textContent = ""; el.className = "faq-msg"; } }, 4000);
}

function saveQuickActions() {
  collectQa();
  const bad = qaList.find(c => c.title && c.type === "link" && !/^https?:\/\//i.test(c.value));
  if (bad) { qaMsgShow(`"${bad.title}": link must start with http:// or https://`, false); return; }
  const complete = qaList.filter(c => c.title && c.value);
  if (complete.length < 2) { qaMsgShow("At least 2 cards need a title and a message/link.", false); return; }
  apiSend("quick-actions", "PUT", { quickActions: complete }).then(d => {
    qaList = d.quickActions;
    renderQaRows();
    qaMsgShow(`Saved ${d.quickActions.length} card(s) — live now.`, true);
  }).catch(err => qaMsgShow(err.message || "Could not save.", false));
}

function saveSuggestionsAdmin() {
  const lines = document.getElementById("sqText").value.split("\n").map(s => s.trim()).filter(Boolean);
  const el = document.getElementById("sqMsg");
  const show = (t, ok) => { el.textContent = t; el.className = "faq-msg " + (ok ? "ok" : "err"); setTimeout(() => { if (el.textContent === t) { el.textContent = ""; el.className = "faq-msg"; } }, 4000); };
  if (!lines.length) { show("Add at least one question.", false); return; }
  if (lines.length > 8) { show("Maximum 8 questions — remove some lines.", false); return; }
  apiSend("suggestions", "PUT", { suggestions: lines }).then(d => {
    show(`Saved ${d.suggestions.length} question(s) — live now.`, true);
  }).catch(err => show(err.message || "Could not save.", false));
}

function loadTeasers() {
  fetch(`${API_BASE}/api/chat/teasers`).then(r => r.json()).then(d => {
    if (d.teasers) document.getElementById("teaserText").value = d.teasers.join("\n");
  }).catch(()=>{});
}

function teaserMsg(text, ok) {
  const el = document.getElementById("teaserMsg");
  el.textContent = text;
  el.className = "faq-msg " + (ok ? "ok" : "err");
  if (text) setTimeout(() => { if (el.textContent === text) { el.textContent = ""; el.className = "faq-msg"; } }, 4000);
}

function saveTeasers() {
  const lines = document.getElementById("teaserText").value.split("\n").map(s => s.trim()).filter(Boolean);
  if (!lines.length) { teaserMsg("Add at least one message.", false); return; }
  if (lines.length > 10) { teaserMsg("Maximum 10 messages — remove some lines.", false); return; }
  apiSend("teasers", "PUT", { teasers: lines }).then(d => {
    teaserMsg(`Saved ${d.teasers.length} message(s) — live on the website now.`, true);
  }).catch(err => teaserMsg(err.message || "Could not save.", false));
}

function loadFeedback() {
  api("analytics").then(d => {
    document.getElementById("fbAvg").textContent = d.avgRating ?? "N/A";
    const avg = parseFloat(d.avgRating);
    const stars = isNaN(avg) ? "" : "★".repeat(Math.round(avg)) + "☆".repeat(5-Math.round(avg));
    document.getElementById("fbStars").textContent = stars;
    document.getElementById("fbCount").textContent = (d.totalRatings || 0) + " rating(s)";
  }).catch(()=>{});
  api("feedback").then(d => {
    const wrap = document.getElementById("feedbackWrap");
    if (!d.feedback || !d.feedback.length) { wrap.innerHTML = `<div class="empty">No feedback submitted yet.</div>`; return; }
    let rows = d.feedback.map(f => {
      const stars = "★".repeat(f.rating||0) + "☆".repeat(5-(f.rating||0));
      const time = new Date(f.createdAt).toLocaleString();
      return `<tr><td class="stars-display">${stars}</td><td>${esc(f.comment||"—")}</td><td style="font-size:11px;color:#888;">${time}</td></tr>`;
    }).join("");
    wrap.innerHTML = `<table><thead><tr><th style="width:120px;">Rating</th><th>Comment</th><th style="width:160px;">Time</th></tr></thead><tbody>${rows}</tbody></table>`;
  }).catch(()=>{});
}

function pwMsg(text, ok) {
  const el = document.getElementById("pwMsg");
  el.textContent = text;
  el.className = "faq-msg " + (ok ? "ok" : "err");
  if (text) setTimeout(() => { if (el.textContent === text) { el.textContent = ""; el.className = "faq-msg"; } }, 4000);
}

function submitPassword(event) {
  event.preventDefault();
  const currentPassword = document.getElementById("pwCurrent").value;
  const newPassword = document.getElementById("pwNew").value;
  const confirm = document.getElementById("pwConfirm").value;
  if (!currentPassword || !newPassword) { pwMsg("Please fill in all fields.", false); return; }
  if (newPassword.length < 6) { pwMsg("New password must be at least 6 characters.", false); return; }
  if (newPassword !== confirm) { pwMsg("New passwords do not match.", false); return; }
  apiSend("change-password", "POST", { currentPassword, newPassword }).then(() => {
    pwMsg("Password updated.", true);
    document.getElementById("pwForm").reset();
    loadAudit();
  }).catch(err => pwMsg(err.message || "Could not change password.", false));
}

const AUDIT_LABELS = {
  "login": "🔓 Logged in",
  "login-failed": "⛔ Failed login",
  "change-password": "🔑 Changed password",
  "forgot-password": "📧 Requested reset",
  "reset-password": "🔑 Reset via email",
  "faq-add": "➕ Added FAQ",
  "faq-import": "📥 Bulk-imported FAQs",
  "faq-edit": "✏️ Edited FAQ",
  "faq-delete": "🗑️ Deleted FAQ",
  "lead-status": "🎯 Lead status",
  "kb-add": "📖 Added KB section",
  "kb-edit": "📖 Edited KB section",
  "kb-delete": "📖 Deleted KB section",
  "teasers-edit": "💬 Updated teasers",
  "quick-actions-edit": "🗂️ Updated welcome cards",
  "suggestions-edit": "❓ Updated suggested questions",
  "theme-edit": "🎨 Updated appearance",
  "lead-routing-edit": "📤 Updated lead routing",
  "team-add": "👥 Added team member",
  "team-remove": "👥 Removed team member",
  "team-role": "👥 Changed a role",
  "data-erasure": "🗑️ Erased a person's data",
  "general-edit": "⚙️ Updated general settings",
};

function togglePw() {
  const pw = document.getElementById("adminPassword");
  pw.type = pw.type === "password" ? "text" : "password";
}

function loadAudit() {
  api("audit").then(d => {
    const wrap = document.getElementById("auditWrap");
    if (!d.logs || !d.logs.length) { wrap.innerHTML = `<div class="empty">No activity recorded yet.</div>`; return; }
    let rows = d.logs.map(l => {
      const label = AUDIT_LABELS[l.action] || esc(l.action);
      const time = new Date(l.createdAt).toLocaleString();
      return `<tr><td>${esc(l.email)}</td><td>${label}</td><td style="color:#555;">${esc(l.detail||"—")}</td><td style="font-size:11px;color:#888;">${time}</td></tr>`;
    }).join("");
    wrap.innerHTML = `<table><thead><tr><th style="width:180px;">Admin</th><th style="width:150px;">Action</th><th>Detail</th><th style="width:160px;">Time</th></tr></thead><tbody>${rows}</tbody></table>`;
  }).catch(()=>{});
}

// ─── APPEARANCE (theme colors, bot name, mascot & logo) ───
let themeCache = {};
const THEME_DEFAULTS = { gold:"#C49A2A", headerA:"#ff7f3f", headerB:"#f2a93c", headerC:"#5e9e56", userBubble:"#23130e", voiceA:"#ff7ab8", voiceB:"#e01277" };

// Live swatch for the voice button so the admin sees the gradient before saving.
function updateVoicePreview() {
  const a = document.getElementById("thVoiceA"), b = document.getElementById("thVoiceB");
  const el = document.getElementById("thVoicePreview");
  if (!a || !b || !el) return;
  el.style.background = `linear-gradient(135deg, ${a.value} 0%, ${b.value} 100%)`;
  el.style.boxShadow = `0 3px 12px ${hexToRgba(b.value, 0.5)}`;
}

// #rgb / #rrggbb → rgba(...) — used for the glow under the voice button.
function hexToRgba(hex, alpha) {
  let h = String(hex || "").replace("#", "").trim();
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) return `rgba(255,45,120,${alpha})`;
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function thMsg(id, text, ok) {
  const el = document.getElementById(id);
  el.textContent = text; el.className = "faq-msg " + (ok ? "ok" : "err");
  if (text) setTimeout(() => { if (el.textContent === text) { el.textContent = ""; el.className = "faq-msg"; } }, 4000);
}

function loadTheme() {
  api("theme").then(d => {
    themeCache = d.theme || {};
    const c = themeCache.colors || {};
    document.getElementById("thBotName").value = themeCache.botName || "";
    document.getElementById("thFont").value = themeCache.font || "";
    document.getElementById("thGold").value = c.gold || THEME_DEFAULTS.gold;
    document.getElementById("thHeaderA").value = c.headerA || THEME_DEFAULTS.headerA;
    document.getElementById("thHeaderB").value = c.headerB || THEME_DEFAULTS.headerB;
    document.getElementById("thHeaderC").value = c.headerC || THEME_DEFAULTS.headerC;
    document.getElementById("thUserBubble").value = c.userBubble || THEME_DEFAULTS.userBubble;
    document.getElementById("thVoiceA").value = c.voiceA || THEME_DEFAULTS.voiceA;
    document.getElementById("thVoiceB").value = c.voiceB || THEME_DEFAULTS.voiceB;
    updateVoicePreview();
    document.getElementById("thWelcome").value = themeCache.welcomeText || "";
    document.getElementById("thTaglines").value = (themeCache.taglines || []).join("\n");
    document.getElementById("thWhatsapp").value = themeCache.whatsapp || "";
    document.getElementById("thHeaderStatus").value = themeCache.headerStatus || "";
    document.getElementById("thMascotImg").src = themeCache.mascot || "mascot.png";
    document.getElementById("thLogoImg").src = themeCache.logo || "logo.png";
  }).catch(()=>{});
}

function saveTheme() {
  const colors = {
    gold: document.getElementById("thGold").value,
    headerA: document.getElementById("thHeaderA").value,
    headerB: document.getElementById("thHeaderB").value,
    headerC: document.getElementById("thHeaderC").value,
    userBubble: document.getElementById("thUserBubble").value,
    voiceA: document.getElementById("thVoiceA").value,
    voiceB: document.getElementById("thVoiceB").value,
  };
  const botName = document.getElementById("thBotName").value.trim();
  const font = document.getElementById("thFont").value;
  const welcomeText = document.getElementById("thWelcome").value.trim();
  const taglines = document.getElementById("thTaglines").value.split("\n").map(s => s.trim()).filter(Boolean);
  const whatsapp = document.getElementById("thWhatsapp").value.trim();
  const headerStatus = document.getElementById("thHeaderStatus").value.trim();
  apiSend("theme", "PUT", { colors, botName, font, welcomeText, taglines, whatsapp, headerStatus }).then(d => {
    themeCache = d.theme || {};
    thMsg("thMsg", "Appearance saved — live on the website now.", true);
  }).catch(err => thMsg("thMsg", err.message || "Could not save.", false));
}

function resetThemeColors() {
  document.getElementById("thGold").value = THEME_DEFAULTS.gold;
  document.getElementById("thHeaderA").value = THEME_DEFAULTS.headerA;
  document.getElementById("thHeaderB").value = THEME_DEFAULTS.headerB;
  document.getElementById("thHeaderC").value = THEME_DEFAULTS.headerC;
  document.getElementById("thUserBubble").value = THEME_DEFAULTS.userBubble;
  document.getElementById("thVoiceA").value = THEME_DEFAULTS.voiceA;
  document.getElementById("thVoiceB").value = THEME_DEFAULTS.voiceB;
  updateVoicePreview();
  thMsg("thMsg", "Colors reset — click Save Appearance to apply.", true);
}

function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("Could not read that file."));
    r.readAsDataURL(file);
  });
}

function uploadThemeImage(kind, fileInputId, imgId) {
  const input = document.getElementById(fileInputId);
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 600 * 1024) { thMsg("thImgMsg", "That image is too large — please use one under ~600 KB.", false); input.value = ""; return; }
  thMsg("thImgMsg", "Uploading…", true);
  fileToDataUri(file).then(dataUri =>
    apiSend("theme", "PUT", { [kind]: dataUri }).then(d => {
      themeCache = d.theme || {};
      document.getElementById(imgId).src = (d.theme && d.theme[kind]) || (kind === "mascot" ? "mascot.png" : "logo.png");
      thMsg("thImgMsg", (kind === "mascot" ? "Mascot" : "Logo") + " updated — live now.", true);
      input.value = "";
    })
  ).catch(err => { thMsg("thImgMsg", err.message || "Upload failed.", false); input.value = ""; });
}
function uploadMascot() { uploadThemeImage("mascot", "thMascotFile", "thMascotImg"); }
function uploadLogo() { uploadThemeImage("logo", "thLogoFile", "thLogoImg"); }

function resetThemeImage(kind, imgId) {
  if (!confirm(`Reset the ${kind} back to the default image?`)) return;
  apiSend("theme", "PUT", { [kind]: null }).then(d => {
    themeCache = d.theme || {};
    document.getElementById(imgId).src = kind === "mascot" ? "mascot.png" : "logo.png";
    thMsg("thImgMsg", (kind === "mascot" ? "Mascot" : "Logo") + " reset to default.", true);
  }).catch(err => thMsg("thImgMsg", err.message || "Could not reset.", false));
}
function resetMascot() { resetThemeImage("mascot", "thMascotImg"); }
function resetLogo() { resetThemeImage("logo", "thLogoImg"); }

// ─── LEAD ROUTING (staff notifications) ───
let staffList = [];

function lrMsg(text, ok) {
  const el = document.getElementById("lrMsg");
  el.textContent = text; el.className = "faq-msg " + (ok ? "ok" : "err");
  if (text) setTimeout(() => { if (el.textContent === text) { el.textContent = ""; el.className = "faq-msg"; } }, 4000);
}

function loadLeadRouting() {
  api("lead-routing").then(d => {
    const cfg = d.leadRouting || { mode: "all", staff: [] };
    document.getElementById("lrMode").value = cfg.mode || "all";
    staffList = Array.isArray(cfg.staff) ? cfg.staff.map(s => ({ name: s.name || "", email: s.email || "", courses: s.courses || "" })) : [];
    renderStaffRows();
  }).catch(()=>{});
}

function renderStaffRows() {
  const wrap = document.getElementById("lrRows");
  if (!staffList.length) { wrap.innerHTML = `<div class="empty" style="padding:14px;">No staff yet — add one to notify them automatically.</div>`; return; }
  wrap.innerHTML = staffList.map((s, i) => `
    <div class="qa-row" data-i="${i}">
      <input class="faq-input st-name" value="${esc(s.name)}" maxlength="60" placeholder="Name" style="flex:1 1 130px;">
      <input class="faq-input st-email" value="${esc(s.email)}" maxlength="120" placeholder="staff@email.com *" style="flex:1 1 180px;">
      <input class="faq-input st-courses" value="${esc(s.courses)}" maxlength="200" placeholder="course keywords, e.g. teacher, training" style="flex:2 1 200px;">
      <button type="button" class="btn btn-sm btn-del" data-action="rmStaffRow" data-arg="${i}" title="Remove">✕</button>
    </div>`).join("");
}

function collectStaff() {
  staffList = [...document.querySelectorAll("#lrRows .qa-row")].map(r => ({
    name: r.querySelector(".st-name").value.trim(),
    email: r.querySelector(".st-email").value.trim(),
    courses: r.querySelector(".st-courses").value.trim(),
  }));
}

function addStaffRow() { collectStaff(); staffList.push({ name: "", email: "", courses: "" }); renderStaffRows(); }
function rmStaffRow(i) { collectStaff(); staffList.splice(Number(i), 1); renderStaffRows(); }

function saveLeadRouting() {
  collectStaff();
  const mode = document.getElementById("lrMode").value;
  const withEmail = staffList.filter(s => s.email);
  const bad = withEmail.find(s => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email));
  if (bad) { lrMsg(`"${bad.email}" is not a valid email.`, false); return; }
  apiSend("lead-routing", "PUT", { mode, staff: withEmail }).then(d => {
    const cfg = d.leadRouting || {};
    staffList = cfg.staff || [];
    renderStaffRows();
    lrMsg(cfg.mode === "off" ? "Saved — routing is off (main inbox only)." : `Saved — ${cfg.staff.length} staff will be notified.`, true);
  }).catch(err => lrMsg(err.message || "Could not save.", false));
}

// ─── TEAM (admin accounts & roles — super admin only) ───
function tmMsg(text, ok) {
  const el = document.getElementById("tmMsg");
  el.textContent = text; el.className = "faq-msg " + (ok ? "ok" : "err");
  if (text) setTimeout(() => { if (el.textContent === text) { el.textContent = ""; el.className = "faq-msg"; } }, 4000);
}

function loadTeam() {
  api("team").then(d => {
    const wrap = document.getElementById("teamWrap");
    const team = d.team || [];
    if (!team.length) { wrap.innerHTML = `<div class="empty">No team members.</div>`; return; }
    const rows = team.map(m => {
      const role = m.role || "super_admin";
      const isMe = m.email === d.me;
      const badge = role === "super_admin" ? `<span class="role-badge role-super">Super Admin</span>` : `<span class="role-badge role-staff">Staff</span>`;
      const toggle = isMe ? "" : `<button class="btn btn-sm btn-edit" data-action="toggleTeamRole" data-arg="${esc(m.email)}|${role}">${role === "super_admin" ? "Make Staff" : "Make Super"}</button>`;
      const del = isMe ? `<span style="font-size:11px;color:#999;">(you)</span>` : `<button class="btn btn-sm btn-del" data-action="removeTeamMember" data-arg="${esc(m.email)}">Remove</button>`;
      const added = m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—";
      return `<tr><td>${esc(m.email)}</td><td>${badge}</td><td style="font-size:11px;color:#888;">${added}</td><td><div class="faq-actions">${toggle}${del}</div></td></tr>`;
    }).join("");
    wrap.innerHTML = `<table><thead><tr><th>Email</th><th>Role</th><th>Added</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>`;
  }).catch(()=>{});
}

function submitTeam(event) {
  event.preventDefault();
  const email = document.getElementById("tmEmail").value.trim();
  const role = document.getElementById("tmRole").value;
  const password = document.getElementById("tmPassword").value;
  if (!email || !password) { tmMsg("Email and password are required.", false); return; }
  if (password.length < 6) { tmMsg("Password must be at least 6 characters.", false); return; }
  apiSend("team", "POST", { email, password, role }).then(() => {
    tmMsg(`Added ${email}.`, true);
    document.getElementById("teamForm").reset();
    loadTeam(); loadAudit();
  }).catch(err => tmMsg(err.message || "Could not add the team member.", false));
}

function removeTeamMember(email) {
  if (!confirm(`Remove ${email}? They will lose dashboard access.`)) return;
  apiSend(`team/${encodeURIComponent(email)}`, "DELETE")
    .then(() => { loadTeam(); loadAudit(); })
    .catch(err => alert(err.message || "Could not remove the team member."));
}

function toggleTeamRole(arg) {
  const idx = String(arg).lastIndexOf("|");
  const email = String(arg).slice(0, idx);
  const currentRole = String(arg).slice(idx + 1);
  const newRole = currentRole === "super_admin" ? "staff" : "super_admin";
  apiSend(`team/${encodeURIComponent(email)}`, "PATCH", { role: newRole })
    .then(() => loadTeam())
    .catch(err => alert(err.message || "Could not change the role."));
}

// ─── GENERAL SETTINGS ───
const DEFAULT_COURSES = ["Regular Group Classes", "200-Hr Teacher Training", "Private Classes", "Kids Summer Camp", "Retreat", "Not sure yet"];

function gnMsg(text, ok) {
  const el = document.getElementById("gnMsg");
  el.textContent = text; el.className = "faq-msg " + (ok ? "ok" : "err");
  if (text) setTimeout(() => { if (el.textContent === text) { el.textContent = ""; el.className = "faq-msg"; } }, 4000);
}

function loadGeneral() {
  api("general").then(d => {
    const g = d.general || {};
    document.getElementById("gnPhone").value = g.contactPhone || "";
    document.getElementById("gnEmail").value = g.contactEmail || "";
    document.getElementById("gnUrl").value = g.contactUrl || "";
    document.getElementById("gnHours").value = g.businessHours || "";
    document.getElementById("gnGreeting").value = g.greeting || "";
    document.getElementById("gnOffer").value = g.offerBanner || "";
    const f = g.features || {};
    document.getElementById("gnVoice").checked = f.voice !== false;
    document.getElementById("gnLang").checked = f.languages !== false;
    document.getElementById("gnBreathe").checked = f.breathing !== false;
    document.getElementById("gnTeaser").value = g.teaserSeconds || 9;
    document.getElementById("gnBadge").checked = g.showBadge !== false;
    document.getElementById("gnCourses").value = (Array.isArray(g.courses) && g.courses.length ? g.courses : DEFAULT_COURSES).join("\n");
  }).catch(()=>{});
}

function saveGeneral() {
  const payload = {
    contactPhone: document.getElementById("gnPhone").value.trim(),
    contactEmail: document.getElementById("gnEmail").value.trim(),
    contactUrl: document.getElementById("gnUrl").value.trim(),
    businessHours: document.getElementById("gnHours").value.trim(),
    greeting: document.getElementById("gnGreeting").value.trim(),
    offerBanner: document.getElementById("gnOffer").value.trim(),
    features: {
      voice: document.getElementById("gnVoice").checked,
      languages: document.getElementById("gnLang").checked,
      breathing: document.getElementById("gnBreathe").checked,
    },
    teaserSeconds: Number(document.getElementById("gnTeaser").value) || 9,
    showBadge: document.getElementById("gnBadge").checked,
    courses: document.getElementById("gnCourses").value.split("\n").map(s => s.trim()).filter(Boolean),
  };
  apiSend("general", "PUT", payload)
    .then(() => gnMsg("Saved — live on the website now.", true))
    .catch(err => gnMsg(err.message || "Could not save.", false));
}

function esc(s){ const d=document.createElement("div"); d.textContent = s==null?"":String(s); return d.innerHTML; }

// On load: if arriving from a reset email link, show the "set new password"
// view. Otherwise, auto-login if a valid session token is stored.
(function init() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("reset")) {
    showAuthView("reset");
    return;
  }
  // Drop any session token a previous version of this dashboard left in
  // localStorage — it is no longer used, and it should not linger there.
  localStorage.removeItem("pragya_admin_token");
  localStorage.removeItem("pragya_admin_email");

  // Ask the server who we are. The httpOnly cookie rides along automatically;
  // if it is missing or expired we simply stay on the login screen.
  fetch(`${API_BASE}/api/admin/me`, { credentials: "same-origin" })
    .then(r => { if (!r.ok) throw new Error("expired"); return r.json(); })
    .then(d => enterDashboard(d.email, d.role))
    .catch(() => {});
})();

document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

setInterval(() => { if (LOGGED_IN) { loadOverview(); loadHealth(); } }, 15000);

// ─── EVENT DELEGATION ───────────────────────────────────────────────────────
// Markup declares `data-action="fnName"` (plus an optional `data-arg`) instead
// of an inline onclick="", so the Content Security Policy can forbid inline
// scripts entirely (script-src 'self'). Inline handlers are blocked by CSP even
// when injected via innerHTML, so rows rendered at runtime use data-* too —
// delegating from `document` covers them without rebinding after every render.
const ACTIONS = {
  // auth
  login, logout, togglePw, showLogin, showForgot, submitReset, sendResetLink,
  // navigation
  showTab,
  // leads
  loadLeads, exportLeadsCSV, deleteLead, eraseByEmail,
  // conversations
  loadConversations, openTranscript, closeModal, closeModalOverlay,
  // faqs
  loadFaqs, startEditFaq, removeFaq, resetFaqForm, runFaqImport,
  // knowledge base
  loadKnowledge, startEditKb, removeKb, resetKbForm,
  // widget config
  saveQuickActions, saveSuggestionsAdmin, saveTeasers, addQaRow, rmQaRow,
  // appearance
  loadTheme, saveTheme, resetThemeColors, resetMascot, resetLogo,
  // lead routing
  loadLeadRouting, addStaffRow, rmStaffRow, saveLeadRouting,
  // team
  loadTeam, removeTeamMember, toggleTeamRole,
  // general settings
  loadGeneral, saveGeneral,
  // misc panels
  loadAnalytics, loadFeedback, loadAudit,
};

const SUBMITS = { submitPassword, submitKnowledge, submitFaq, submitTeam };
const CHANGES = { setLeadStatus, previewFaqFile, uploadMascot, uploadLogo };

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const fn = ACTIONS[el.dataset.action];
  if (!fn) return;
  if (el.tagName === "A") e.preventDefault(); // these were href="#" links
  fn(el.dataset.arg, e, el);
});

document.addEventListener("submit", (e) => {
  const form = e.target.closest("[data-submit]");
  if (!form) return;
  const fn = SUBMITS[form.dataset.submit];
  if (fn) fn(e); // each handler calls preventDefault() itself
});

document.addEventListener("change", (e) => {
  const el = e.target.closest("[data-change]");
  if (!el) return;
  const fn = CHANGES[el.dataset.change];
  if (fn) fn(el.dataset.arg, el.value, el); // setLeadStatus(id, status)
});

// Voice-button swatch follows the two colour pickers while they are dragged.
document.addEventListener("input", (e) => {
  if (e.target.id === "thVoiceA" || e.target.id === "thVoiceB") updateVoicePreview();
});

// Enter-to-submit on the login / reset fields.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const el = e.target.closest("[data-enter]");
  if (!el) return;
  const fn = ACTIONS[el.dataset.enter];
  if (fn) { e.preventDefault(); fn(); }
});
