/**
 * Data Service
 * A single interface for all data operations.
 * Automatically uses MongoDB if connected, otherwise falls back to in-memory store.
 * This means the app works WITH or WITHOUT a database.
 */

const mongoose = require("mongoose");
const memoryStore = require("./memory-store");
const { FAQ_LIST } = require("../data/faq-list");
const { KNOWLEDGE_SECTIONS } = require("../data/knowledge-base");
let models = null;

// Try to load Mongoose models (only works if mongoose connects)
try {
  models = require("../models");
} catch (e) {
  models = null;
}

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// ─── CONVERSATIONS ──────────────────────────────────────────────────────────
// Force sessionId to a primitive string before it is ever used in a query, so a
// value like { $ne: null } can never reach MongoDB as an operator. This is the
// last line of defence behind the global operator sanitiser in server.js.
const sid = (v) => String(v == null ? "" : v);

async function saveMessage(sessionId, role, content) {
  sessionId = sid(sessionId);
  if (isDbConnected() && models) {
    let convo = await models.Conversation.findOne({ sessionId });
    if (!convo) {
      convo = new models.Conversation({ sessionId, messages: [] });
    }
    convo.messages.push({ role, content });
    convo.updatedAt = new Date();
    await convo.save();
  } else {
    memoryStore.saveMessage(sessionId, role, content);
  }
}

async function getConversation(sessionId) {
  sessionId = sid(sessionId);
  if (isDbConnected() && models) {
    const convo = await models.Conversation.findOne({ sessionId });
    return convo || { sessionId, messages: [] };
  }
  return memoryStore.getConversation(sessionId);
}

async function getAllConversations() {
  if (isDbConnected() && models) {
    return await models.Conversation.find().sort({ updatedAt: -1 }).limit(50);
  }
  return memoryStore.getAllConversations();
}

// ─── LEADS ────────────────────────────────────────────────────────────────
async function saveLead(lead) {
  if (isDbConnected() && models) {
    const newLead = new models.Lead(lead);
    await newLead.save();
    return newLead;
  }
  return memoryStore.saveLead(lead);
}

async function getAllLeads() {
  if (isDbConnected() && models) {
    return await models.Lead.find().sort({ createdAt: -1 }).limit(100);
  }
  return memoryStore.getAllLeads();
}

async function updateLeadStatus(id, status) {
  if (isDbConnected() && models) {
    return await models.Lead.findByIdAndUpdate(id, { status }, { new: true });
  }
  return memoryStore.updateLeadStatus(id, status);
}

// ─── ERASURE ────────────────────────────────────────────────────────────────
async function deleteLead(id) {
  if (isDbConnected() && models) {
    const res = await models.Lead.findByIdAndDelete(id);
    return !!res;
  }
  return memoryStore.deleteLead(id);
}

async function deleteConversation(sessionId) {
  sessionId = sid(sessionId);
  if (isDbConnected() && models) {
    const res = await models.Conversation.deleteOne({ sessionId });
    return res.deletedCount > 0;
  }
  return memoryStore.deleteConversation(sessionId);
}

/**
 * Erase everything held about one person, matched on the email they gave us:
 * their lead record(s) and the chat transcript(s) those leads came from.
 * This is the handler for a "delete my data" request.
 */
async function deleteByEmail(email) {
  const target = String(email).toLowerCase().trim();
  if (!target) return { leads: 0, conversations: 0 };

  if (isDbConnected() && models) {
    const matched = await models.Lead.find({ email: new RegExp(`^${escapeRegex(target)}$`, "i") });
    const sessionIds = matched.map((l) => l.sessionId).filter(Boolean);
    await models.Lead.deleteMany({ _id: { $in: matched.map((l) => l._id) } });
    let conversations = 0;
    if (sessionIds.length) {
      const res = await models.Conversation.deleteMany({ sessionId: { $in: sessionIds } });
      conversations = res.deletedCount || 0;
    }
    return { leads: matched.length, conversations };
  }
  return memoryStore.deleteByEmail(target);
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── FEEDBACK ───────────────────────────────────────────────────────────────
async function saveFeedback(feedback) {
  if (isDbConnected() && models) {
    const fb = new models.Feedback(feedback);
    await fb.save();
    return fb;
  }
  return memoryStore.saveFeedback(feedback);
}

async function getAllFeedback() {
  if (isDbConnected() && models) {
    return await models.Feedback.find().sort({ createdAt: -1 }).limit(100);
  }
  return memoryStore.getAllFeedback();
}

// ─── FAQs ─────────────────────────────────────────────────────────────────
// On first DB access, seed the collection with the static starter list so the
// manager isn't empty on a fresh database.
async function seedFaqsIfEmpty() {
  if (!(isDbConnected() && models)) return;
  const count = await models.FAQ.countDocuments();
  if (count === 0) {
    await models.FAQ.insertMany(
      FAQ_LIST.map((f) => ({
        category: f.category || "General",
        question: f.question,
        answer: f.answer,
      }))
    );
  }
}

async function getAllFaqs() {
  if (isDbConnected() && models) {
    await seedFaqsIfEmpty();
    return await models.FAQ.find().sort({ category: 1, createdAt: 1 });
  }
  return memoryStore.getAllFaqs();
}

async function addFaq(faq) {
  if (isDbConnected() && models) {
    const newFaq = new models.FAQ(faq);
    await newFaq.save();
    return newFaq;
  }
  return memoryStore.addFaq(faq);
}

async function updateFaq(id, updates) {
  if (isDbConnected() && models) {
    return await models.FAQ.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  }
  return memoryStore.updateFaq(id, updates);
}

async function deleteFaq(id) {
  if (isDbConnected() && models) {
    const res = await models.FAQ.findByIdAndDelete(id);
    return !!res;
  }
  return memoryStore.deleteFaq(id);
}

// ─── KNOWLEDGE BASE ──────────────────────────────────────────────────────────
// Seed the collection from the static sections on first DB access.
async function seedKnowledgeIfEmpty() {
  if (!(isDbConnected() && models)) return;
  const count = await models.Knowledge.countDocuments();
  if (count === 0) {
    await models.Knowledge.insertMany(
      KNOWLEDGE_SECTIONS.map((s) => ({ title: s.title, content: s.content, order: s.order }))
    );
  }
}

async function getAllKnowledge() {
  if (isDbConnected() && models) {
    await seedKnowledgeIfEmpty();
    return await models.Knowledge.find().sort({ order: 1, createdAt: 1 });
  }
  return memoryStore.getAllKnowledge();
}

async function addKnowledge(entry) {
  if (isDbConnected() && models) {
    const k = new models.Knowledge(entry);
    await k.save();
    return k;
  }
  return memoryStore.addKnowledge(entry);
}

async function updateKnowledge(id, updates) {
  if (isDbConnected() && models) {
    return await models.Knowledge.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  }
  return memoryStore.updateKnowledge(id, updates);
}

async function deleteKnowledge(id) {
  if (isDbConnected() && models) {
    const res = await models.Knowledge.findByIdAndDelete(id);
    return !!res;
  }
  return memoryStore.deleteKnowledge(id);
}

// ─── SETTINGS (key-value, admin-configurable) ───────────────────────────────
async function getSetting(key) {
  if (isDbConnected() && models) {
    const doc = await models.Setting.findOne({ key });
    return doc ? doc.value : null;
  }
  return memoryStore.getSetting(key);
}

async function setSetting(key, value) {
  if (isDbConnected() && models) {
    await models.Setting.findOneAndUpdate(
      { key },
      { value, updatedAt: new Date() },
      { upsert: true }
    );
    return value;
  }
  return memoryStore.setSetting(key, value);
}

// ─── ADMINS ───────────────────────────────────────────────────────────────
async function getAdminByEmail(email) {
  const e = String(email || "").toLowerCase().trim();
  if (isDbConnected() && models) {
    return await models.Admin.findOne({ email: e });
  }
  return memoryStore.getAdminByEmail(e);
}

async function countAdmins() {
  if (isDbConnected() && models) {
    return await models.Admin.countDocuments();
  }
  return memoryStore.countAdmins();
}

async function createAdmin({ email, passwordHash, role }) {
  const clean = { email, passwordHash };
  if (role === "super_admin" || role === "staff") clean.role = role;
  if (isDbConnected() && models) {
    const admin = new models.Admin(clean);
    await admin.save();
    return admin;
  }
  return memoryStore.createAdmin(clean);
}

// Everyone on the team (for the admin manager). Never returns password hashes.
async function getAllAdmins() {
  if (isDbConnected() && models) {
    const admins = await models.Admin.find({}, "email role createdAt").sort({ createdAt: 1 });
    return admins.map((a) => ({ email: a.email, role: a.role || "super_admin", createdAt: a.createdAt }));
  }
  return memoryStore.getAllAdmins();
}

async function deleteAdmin(email) {
  const e = String(email || "").toLowerCase().trim();
  if (isDbConnected() && models) {
    const res = await models.Admin.deleteOne({ email: e });
    return res.deletedCount > 0;
  }
  return memoryStore.deleteAdmin(e);
}

async function updateAdminRole(email, role) {
  const e = String(email || "").toLowerCase().trim();
  if (role !== "super_admin" && role !== "staff") return null;
  if (isDbConnected() && models) {
    return await models.Admin.findOneAndUpdate({ email: e }, { role, updatedAt: new Date() }, { new: true });
  }
  return memoryStore.updateAdminRole(e, role);
}

async function updateAdminPassword(email, passwordHash) {
  const e = String(email || "").toLowerCase().trim();
  if (isDbConnected() && models) {
    return await models.Admin.findOneAndUpdate(
      { email: e },
      { passwordHash, resetTokenHash: null, resetTokenExpires: null, updatedAt: new Date() },
      { new: true }
    );
  }
  return memoryStore.updateAdminPassword(e, passwordHash);
}

async function setAdminResetToken(email, tokenHash, expires) {
  const e = String(email || "").toLowerCase().trim();
  if (isDbConnected() && models) {
    return await models.Admin.findOneAndUpdate(
      { email: e },
      { resetTokenHash: tokenHash, resetTokenExpires: expires, updatedAt: new Date() },
      { new: true }
    );
  }
  return memoryStore.setAdminResetToken(e, tokenHash, expires);
}

async function getAdminByResetTokenHash(tokenHash) {
  if (!tokenHash) return null;
  if (isDbConnected() && models) {
    return await models.Admin.findOne({ resetTokenHash: tokenHash });
  }
  return memoryStore.getAdminByResetTokenHash(tokenHash);
}

// ─── AUDIT LOG ──────────────────────────────────────────────────────────────
async function logAudit(entry) {
  try {
    if (isDbConnected() && models) {
      await new models.AuditLog(entry).save();
      return;
    }
    memoryStore.logAudit(entry);
  } catch (e) {
    // Audit logging must never break the main action.
    console.error("Audit log error:", e.message);
  }
}

async function getAuditLog(limit = 100) {
  if (isDbConnected() && models) {
    return await models.AuditLog.find().sort({ createdAt: -1 }).limit(limit);
  }
  return memoryStore.getAuditLog(limit);
}

// ─── STATS ────────────────────────────────────────────────────────────────
async function getStats() {
  if (isDbConnected() && models) {
    const totalConversations = await models.Conversation.countDocuments();
    const totalLeads = await models.Lead.countDocuments();
    const newLeads = await models.Lead.countDocuments({ status: "new" });
    const convos = await models.Conversation.find();
    const totalMessages = convos.reduce((s, c) => s + c.messages.length, 0);
    return { totalConversations, totalMessages, totalLeads, newLeads, avgRating: "N/A" };
  }
  return memoryStore.getStats();
}

// ─── ANALYTICS ──────────────────────────────────────────────────────────────
async function getAnalytics() {
  let leads = [];
  let conversations = [];
  let feedback = [];

  if (isDbConnected() && models) {
    leads = await models.Lead.find().sort({ createdAt: -1 }).limit(500);
    conversations = await models.Conversation.find().limit(500);
    feedback = await models.Feedback.find().limit(500);
  } else {
    leads = memoryStore.getAllLeads();
    conversations = memoryStore.getAllConversations();
    feedback = memoryStore.getAllFeedback();
  }

  // Leads grouped by interested course
  const leadsByCourse = {};
  leads.forEach((l) => {
    const c = l.course || "Unknown";
    leadsByCourse[c] = (leadsByCourse[c] || 0) + 1;
  });

  // Leads grouped by day (last 7 days)
  const leadsByDay = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    leadsByDay[key] = 0;
  }
  leads.forEach((l) => {
    const key = new Date(l.createdAt).toISOString().slice(0, 10);
    if (key in leadsByDay) leadsByDay[key]++;
  });

  // Average rating
  const ratings = feedback.map((f) => f.rating).filter(Boolean);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "N/A";

  // Conversion rate (leads / conversations)
  const conversionRate = conversations.length ? ((leads.length / conversations.length) * 100).toFixed(1) + "%" : "N/A";

  return {
    leadsByCourse,
    leadsByDay,
    avgRating,
    totalRatings: ratings.length,
    conversionRate,
    totalConversations: conversations.length,
    totalLeads: leads.length,
  };
}

module.exports = {
  isDbConnected,
  saveMessage,
  getConversation,
  getAllConversations,
  saveLead,
  getAllLeads,
  updateLeadStatus,
  deleteLead,
  deleteConversation,
  deleteByEmail,
  saveFeedback,
  getAllFeedback,
  getAllFaqs,
  addFaq,
  updateFaq,
  deleteFaq,
  getAllKnowledge,
  addKnowledge,
  updateKnowledge,
  deleteKnowledge,
  getSetting,
  setSetting,
  getAdminByEmail,
  countAdmins,
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  updateAdminRole,
  updateAdminPassword,
  setAdminResetToken,
  getAdminByResetTokenHash,
  logAudit,
  getAuditLog,
  getStats,
  getAnalytics,
};
