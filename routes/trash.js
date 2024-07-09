const express = require("express");
const router = express.Router();
const controller = require("../controllers/trashController");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.use(controller.checkUserSession);

router.get("/trash", (req, res) => {
  res.render("trash", { msg: "", alertType: "" });
});

router.post("/trash", upload.single("file"), controller.registerComplain);

module.exports = router;
