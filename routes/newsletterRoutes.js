const express = require("express");
const router = express.Router();

const {
  subscribeNewsletter,
} = require("../controllers/newsletterController");

// ======================
// SUBSCRIBE NEWSLETTER
// ======================
router.post("/subscribe", subscribeNewsletter);

module.exports = router;