const express = require("express");
const router = express.Router();
const controller = require("../controllers/trashController");
const multer = require("multer");
const path = require("path");

const uploadDir = path.join(__dirname, "../upload");
const fs = require("fs");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.use(controller.checkUserSession);

router.get("/report", (req, res) => {
  const user = req.session.user;
  res.render("complain/index", { msg: "", alertType: "", user: user });
});

router.get("/success", (req, res) => {
  const user = req.session.user;
  res.render("complain/success", {
    msg: "Complaint submitted successfully",
    alertType: "success",
    user: user,
  });
});

router.post("/complain", upload.single("file"), controller.registerComplain);

module.exports = router;
