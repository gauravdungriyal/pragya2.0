/**
 * In-Memory Store
 * A fallback data store used when MongoDB is NOT connected.
 * This lets the chatbot run fully without a database during development/demo.
 * Data resets when the server restarts.
 */

const { FAQ_LIST } = require("../data/faq-list");
const { KNOWLEDGE_SECTIONS } = require("../data/knowledge-base");

const store = {
  conversations: {}, // keyed by sessionId
  leads: [],
  feedback: [],
  faqs: [],
  admins: [],
  auditLog: [],
  knowledge: [],
  settings: {},
};

let leadIdCounter = 1;
let faqIdCounter = 1;
let adminIdCounter = 1;
let auditIdCounter = 1;
let knowledgeIdCounter = 1;

// Seed the in-memory knowledge base from the static sections.
KNOWLEDGE_SECTIONS.forEach((s) => {
  store.knowledge.push({
    _id: String(knowledgeIdCounter++),
    title: s.title,
    content: s.content,
    order: s.order,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

// Seed the in-memory FAQ store from the static starter list so the manager
// always has content to show even before an admin adds anything.
FAQ_LIST.forEach((f) => {
  store.faqs.push({
    _id: String(faqIdCounter++),
    category: f.category || "General",
    question: f.question,
    answer: f.answer,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

module.exports = {
  // ─── Conversations ───
  saveMessage(sessionId, role, content) {
    if (!store.conversations[sessionId]) {
      store.conversations[sessionId] = {
        sessionId,
        messages: [],
        createdAt: new Date(),
      };
    }
    store.conversations[sessionId].messages.push({
      role,
      content,
      timestamp: new Date(),
    });
    store.conversations[sessionId].updatedAt = new Date();
  },

  getConversation(sessionId) {
    return store.conversations[sessionId] || { sessionId, messages: [] };
  },

  getAllConversations() {
    return Object.values(store.conversations).sort(
      (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );
  },

  deleteConversation(sessionId) {
    if (!store.conversations[sessionId]) return false;
    delete store.conversations[sessionId];
    return true;
  },

  // ─── Leads ───
  saveLead(lead) {
    const newLead = {
      _id: leadIdCounter++,
      ...lead,
      status: "new",
      createdAt: new Date(),
    };
    store.leads.unshift(newLead);
    return newLead;
  },

  getAllLeads() {
    return store.leads;
  },

  updateLeadStatus(id, status) {
    const lead = store.leads.find((l) => String(l._id) === String(id));
    if (!lead) return null;
    lead.status = status;
    return lead;
  },

  deleteLead(id) {
    const i = store.leads.findIndex((l) => String(l._id) === String(id));
    if (i === -1) return false;
    store.leads.splice(i, 1);
    return true;
  },

  // Erase every trace of a person: their lead record(s) and the conversation
  // they were captured from. Matched on email, which is what an erasure
  // request arrives with.
  deleteByEmail(email) {
    const target = String(email).toLowerCase().trim();
    const matched = store.leads.filter((l) => String(l.email).toLowerCase().trim() === target);
    const sessionIds = matched.map((l) => l.sessionId).filter(Boolean);
    store.leads = store.leads.filter((l) => String(l.email).toLowerCase().trim() !== target);
    // Count transcripts actually removed, not session ids seen — the audit
    // entry should not claim to have erased more than it did.
    let conversations = 0;
    sessionIds.forEach((sid) => {
      if (store.conversations[sid]) {
        delete store.conversations[sid];
        conversations += 1;
      }
    });
    return { leads: matched.length, conversations };
  },

  // ─── Feedback ───
  saveFeedback(feedback) {
    const fb = { _id: store.feedback.length + 1, ...feedback, createdAt: new Date() };
    store.feedback.unshift(fb);
    return fb;
  },

  getAllFeedback() {
    return store.feedback;
  },

  // ─── FAQs ───
  getAllFaqs() {
    return store.faqs;
  },

  addFaq(faq) {
    const newFaq = {
      _id: String(faqIdCounter++),
      category: faq.category || "General",
      question: faq.question,
      answer: faq.answer,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.faqs.push(newFaq);
    return newFaq;
  },

  updateFaq(id, updates) {
    const faq = store.faqs.find((f) => String(f._id) === String(id));
    if (!faq) return null;
    if (updates.category != null) faq.category = updates.category;
    if (updates.question != null) faq.question = updates.question;
    if (updates.answer != null) faq.answer = updates.answer;
    faq.updatedAt = new Date();
    return faq;
  },

  deleteFaq(id) {
    const idx = store.faqs.findIndex((f) => String(f._id) === String(id));
    if (idx === -1) return false;
    store.faqs.splice(idx, 1);
    return true;
  },

  // ─── Knowledge Base ───
  getAllKnowledge() {
    return store.knowledge.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  addKnowledge({ title, content, order }) {
    const entry = {
      _id: String(knowledgeIdCounter++),
      title,
      content: content || "",
      order: order != null ? order : store.knowledge.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.knowledge.push(entry);
    return entry;
  },

  updateKnowledge(id, updates) {
    const entry = store.knowledge.find((k) => String(k._id) === String(id));
    if (!entry) return null;
    if (updates.title != null) entry.title = updates.title;
    if (updates.content != null) entry.content = updates.content;
    if (updates.order != null) entry.order = updates.order;
    entry.updatedAt = new Date();
    return entry;
  },

  deleteKnowledge(id) {
    const idx = store.knowledge.findIndex((k) => String(k._id) === String(id));
    if (idx === -1) return false;
    store.knowledge.splice(idx, 1);
    return true;
  },

  // ─── Settings ───
  getSetting(key) {
    return key in store.settings ? store.settings[key] : null;
  },

  setSetting(key, value) {
    store.settings[key] = value;
    return value;
  },

  // ─── Admins ───
  getAdminByEmail(email) {
    const e = String(email || "").toLowerCase().trim();
    return store.admins.find((a) => a.email === e) || null;
  },

  countAdmins() {
    return store.admins.length;
  },

  createAdmin({ email, passwordHash, role }) {
    const admin = {
      _id: String(adminIdCounter++),
      email: String(email).toLowerCase().trim(),
      passwordHash,
      role: role === "super_admin" || role === "staff" ? role : "staff",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.admins.push(admin);
    return admin;
  },

  getAllAdmins() {
    return store.admins.map((a) => ({ email: a.email, role: a.role || "super_admin", createdAt: a.createdAt }));
  },

  deleteAdmin(email) {
    const e = String(email || "").toLowerCase().trim();
    const i = store.admins.findIndex((a) => a.email === e);
    if (i === -1) return false;
    store.admins.splice(i, 1);
    return true;
  },

  updateAdminRole(email, role) {
    const admin = this.getAdminByEmail(email);
    if (!admin) return null;
    admin.role = role;
    admin.updatedAt = new Date();
    return admin;
  },

  updateAdminPassword(email, passwordHash) {
    const admin = this.getAdminByEmail(email);
    if (!admin) return null;
    admin.passwordHash = passwordHash;
    admin.resetTokenHash = null;
    admin.resetTokenExpires = null;
    admin.updatedAt = new Date();
    return admin;
  },

  setAdminResetToken(email, tokenHash, expires) {
    const admin = this.getAdminByEmail(email);
    if (!admin) return null;
    admin.resetTokenHash = tokenHash;
    admin.resetTokenExpires = expires;
    admin.updatedAt = new Date();
    return admin;
  },

  getAdminByResetTokenHash(tokenHash) {
    if (!tokenHash) return null;
    return store.admins.find((a) => a.resetTokenHash === tokenHash) || null;
  },

  // ─── Audit Log ───
  logAudit({ email, action, detail }) {
    const entry = {
      _id: String(auditIdCounter++),
      email: email || "unknown",
      action,
      detail: detail || "",
      createdAt: new Date(),
    };
    store.auditLog.unshift(entry);
    // Keep memory bounded in fallback mode.
    if (store.auditLog.length > 500) store.auditLog.length = 500;
    return entry;
  },

  getAuditLog(limit = 100) {
    return store.auditLog.slice(0, limit);
  },

  // ─── Stats ───
  getStats() {
    const conversations = Object.values(store.conversations);
    const totalMessages = conversations.reduce(
      (sum, c) => sum + c.messages.length,
      0
    );
    return {
      totalConversations: conversations.length,
      totalMessages,
      totalLeads: store.leads.length,
      newLeads: store.leads.filter((l) => l.status === "new").length,
      avgRating:
        store.feedback.length > 0
          ? (
              store.feedback.reduce((s, f) => s + (f.rating || 0), 0) /
              store.feedback.length
            ).toFixed(1)
          : "N/A",
    };
  },
};
