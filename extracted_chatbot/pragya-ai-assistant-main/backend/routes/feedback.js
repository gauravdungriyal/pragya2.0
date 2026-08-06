/**
 * Feedback Routes
 * POST /api/feedback   — submit a rating (1-5) and optional comment
 */

const express = require("express");
const router = express.Router();
const dataService = require("../services/data-service");

// POST /api/feedback
router.post("/", async (req, res) => {
  try {
    const { rating, comment, sessionId } = req.body;

    const numRating = parseInt(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }

    // Bound the free-text fields before they are stored. Without a cap a client
    // can persist arbitrarily large documents.
    const feedback = await dataService.saveFeedback({
      rating: numRating,
      comment: String(comment || "").slice(0, 1000),
      sessionId: String(sessionId || "").slice(0, 100),
    });

    res.json({ success: true, message: "Thank you for your feedback!", feedback });
  } catch (error) {
    console.error("Feedback error:", error.message);
    res.status(500).json({ error: "Could not save feedback." });
  }
});

module.exports = router;
