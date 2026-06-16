const router = require("express").Router();

const {
  getJobs,
  addJob,
  deleteJob,
} = require("../controllers/jobController");

router.get("/", getJobs);
router.post("/", addJob);
router.delete("/:id", deleteJob);

module.exports = router;