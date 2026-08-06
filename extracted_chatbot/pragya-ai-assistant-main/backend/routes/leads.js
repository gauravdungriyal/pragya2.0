/**
 * Leads Routes
 * POST /api/leads      — capture a new lead (and send email notification)
 * GET  /api/leads      — get all leads (admin-only; requires login token or admin key)
 */

const express = require("express");
const router = express.Router();
const dataService = require("../services/data-service");
const { sendLeadNotification } = require("../services/email-service");
const { adminAuthMiddleware } = require("../services/admin-auth");

// POST /api/leads — capture a lead
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, country, course, sessionId } = req.body;

    if (!name || !email || !course) {
      return res.status(400).json({ error: "Name, email, and course are required." });
    }

    const lead = await dataService.saveLead({
      name,
      email,
      phone: phone || "",
      country: country || "",
      course,
      sessionId: sessionId || "",
    });

    // Work out which staff (if any) should also be notified, per the admin's
    // Lead Routing config: "all" → every staff member; "course" → those whose
    // keywords match the interest (a member with no keywords catches all).
    let staffRecipients = [];
    try {
      const routing = await dataService.getSetting("leadRouting");
      if (routing && routing.mode !== "off" && Array.isArray(routing.staff)) {
        if (routing.mode === "course") {
          const courseLc = String(course || "").toLowerCase();
          staffRecipients = routing.staff
            .filter((s) => {
              const kws = String(s.courses || "").toLowerCase().split(/[,;]+/).map((k) => k.trim()).filter(Boolean);
              return !kws.length || kws.some((k) => courseLc.includes(k));
            })
            .map((s) => s.email);
        } else {
          staffRecipients = routing.staff.map((s) => s.email);
        }
      }
    } catch (e) { /* routing is best-effort; the main inbox is still notified */ }

    // Send email notification (non-blocking — don't fail if email fails)
    sendLeadNotification(lead, staffRecipients).catch((e) =>
      console.error("Email notification failed:", e.message)
    );

    // Echo back only what the widget renders. The stored document also holds
    // the internal id, sessionId and status, and the caller is unauthenticated.
    res.json({
      success: true,
      message: `Thank you, ${name}! Our team will reach out within 24 hours.`,
      lead: { name: lead.name, course: lead.course },
    });
  } catch (error) {
    console.error("Lead capture error:", error.message);
    res.status(500).json({ error: "Could not save your details. Please call +852 6708 2503." });
  }
});

// GET /api/leads — admin: get all leads (protected — contains personal data)
router.get("/", adminAuthMiddleware, async (req, res) => {
  try {
    const leads = await dataService.getAllLeads();
    res.json({ leads });
  } catch (error) {
    res.status(500).json({ error: "Could not load leads." });
  }
});

module.exports = router;
