const router = require("express").Router();

const {
  subscribeNewsletter,
} = require("../controllers/newsletterController");

router.post("/subscribe", subscribeNewsletter);

module.exports = router;