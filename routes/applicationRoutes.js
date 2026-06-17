const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadResume");

const {
  applyJob,
  getApplications,
  deleteApplication,
} = require("../controllers/applicationController");

// ======================
// APPLY JOB (WITH RESUME UPLOAD)
// ======================
router.post(
  "/",
  upload.single("resume"),
  applyJob
);

// ======================
// GET ALL APPLICATIONS
// ======================
router.get("/", getApplications);

// ======================
// DELETE APPLICATION
// ======================
router.delete("/:id", deleteApplication);

module.exports = router;