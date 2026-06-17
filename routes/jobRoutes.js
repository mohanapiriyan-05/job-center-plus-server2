const express = require("express");
const router = express.Router();

const {
  getJobs,
  addJob,
  deleteJob,
} = require("../controllers/jobController");

// ======================
// GET ALL JOBS
// ======================
router.get("/", getJobs);

// ======================
// ADD JOB
// ======================
router.post("/", addJob);

// ======================
// DELETE JOB
// ======================
router.delete("/:id", deleteJob);

module.exports = router;