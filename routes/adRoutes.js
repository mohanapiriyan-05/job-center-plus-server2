const router = require("express").Router();

const upload = require("../middleware/upload"); // ஒரே தடவை மட்டும்

const {
  getAds,
  addAd,
  deleteAd
} = require("../controllers/adController");

router.get("/", getAds);

// image upload
router.post("/", upload.single("image"), addAd);

router.delete("/:id", deleteAd);

module.exports = router;