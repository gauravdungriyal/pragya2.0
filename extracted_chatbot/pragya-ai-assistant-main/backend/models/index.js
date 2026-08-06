/**
 * MongoDB Models (Mongoose schemas)
 * Collections: Conversations, Leads, Feedback
 * Falls back to in-memory storage if MongoDB is not connected.
 */

const mongoose = require("mongoose");

// ─── CONVERSATION ─────────────────────────────────────────────────────────
const conversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  messages: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ─── LEAD ─────────────────────────────────────────────────────────────────
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  country: { type: String, default: "" },
  course: { type: String, required: true },
  sessionId: { type: String, default: "" },
  status: { type: String, enum: ["new", "contacted", "converted"], default: "new" },
  createdAt: { type: Date, default: Date.now },
});

// ─── FEEDBACK ─────────────────────────────────────────────────────────────
const feedbackSchema = new mongoose.Schema({
  sessionId: { type: String, default: "" },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

// ─── FAQ ──────────────────────────────────────────────────────────────────
const faqSchema = new mongoose.Schema({
  category: { type: String, required: true, default: "General" },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ─── ADMIN (dashboard login accounts) ───────────────────────────────────────
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  // "super_admin" controls everything (incl. team + appearance + erasure);
  // "staff" maintains content but can't manage other accounts. The default is
  // super_admin: Mongoose applies this default when it hydrates an OLD admin
  // document that predates roles, so the existing owner keeps full access.
  // New staff accounts are always created with an explicit role: "staff".
  role: { type: String, enum: ["super_admin", "staff"], default: "super_admin" },
  resetTokenHash: { type: String, default: null },
  resetTokenExpires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ─── KNOWLEDGE BASE (admin-editable sections the AI answers from) ────────────
const knowledgeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ─── SETTINGS (key-value store for admin-configurable options) ───────────────
const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  updatedAt: { type: Date, default: Date.now },
});

// ─── AUDIT LOG (who changed what, when) ──────────────────────────────────────
const auditLogSchema = new mongoose.Schema({
  email: { type: String, default: "unknown" },
  action: { type: String, required: true },
  detail: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const Conversation = mongoose.model("Conversation", conversationSchema);
const Lead = mongoose.model("Lead", leadSchema);
const Feedback = mongoose.model("Feedback", feedbackSchema);
const FAQ = mongoose.model("FAQ", faqSchema);
const Admin = mongoose.model("Admin", adminSchema);
const AuditLog = mongoose.model("AuditLog", auditLogSchema);
const Knowledge = mongoose.model("Knowledge", knowledgeSchema);
const Setting = mongoose.model("Setting", settingSchema);

module.exports = { Conversation, Lead, Feedback, FAQ, Admin, AuditLog, Knowledge, Setting };
