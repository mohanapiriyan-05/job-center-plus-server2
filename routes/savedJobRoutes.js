const express = require("express");
const router = express.Router();

const savedJobController = require("../controllers/savedJobController");

// ======================
// SAVE JOB
// ======================
router.post("/", savedJobController.saveJob);

// ======================
// GET SAVED JOBS BY USER
// ======================
router.get("/:user_id", savedJobController.getSavedJobs);

// ======================
// DELETE SAVED JOB
// ======================
router.delete("/:id", savedJobController.deleteSavedJob);

module.exports = router;