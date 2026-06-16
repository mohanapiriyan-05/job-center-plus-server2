const router = require("express").Router();

const uploadResume = require("../middleware/uploadResume");

const {
  applyJob,
  getApplications,
  deleteApplication,
} = require("../controllers/applicationController");

router.post("/", uploadResume.single("resume"), applyJob);

router.get("/", getApplications);

router.delete("/:id", deleteApplication);

module.exports = router;