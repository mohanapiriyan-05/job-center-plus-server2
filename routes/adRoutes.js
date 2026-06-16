const router=require("express").Router();

const upload=require("../middleware/uploadMiddleware");

const {
getAds,
addAd,
deleteAd
}=require("../controllers/adController");

router.get("/",getAds);

router.post(
"/",
upload.single("image"),
addAd
);

router.delete("/:id",deleteAd);

module.exports=router;