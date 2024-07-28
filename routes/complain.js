const express = require("express");
const router = express.Router();
const controller = require("../controllers/trashController");
const upload = require("../utils/upload");

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
