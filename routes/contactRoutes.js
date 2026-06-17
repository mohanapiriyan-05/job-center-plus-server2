const express = require("express");
const router = express.Router();

const {
  sendContactEmail,
} = require("../controllers/contactController");

// ======================
// SEND CONTACT EMAIL
// ======================
router.post("/send-email", sendContactEmail);

module.exports = router;