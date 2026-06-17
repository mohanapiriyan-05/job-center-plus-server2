const express = require("express");
const router = express.Router();

const {
  register,
  login,
  phoneLogin,
  googleLogin,
} = require("../controllers/authController");

// ======================
// REGISTER
// ======================
router.post("/register", register);

// ======================
// LOGIN
// ======================
router.post("/login", login);

// ======================
// PHONE LOGIN
// ======================
router.post("/phone", phoneLogin);

// ======================
// GOOGLE LOGIN
// ======================
router.post("/google", googleLogin);

module.exports = router;