const express = require("express");

const controllers = require("../controllers/complainController");
const upload = require("../helpers/multer");
const checkUserSession = require("../middlewares/is-Auth");

const router = express.Router();
router.use(checkUserSession);

router.get("/report", controllers.getReport);

router.get("/success", controllers.getSuccess);

router.post("/complain", upload.single("file"), controllers.registerComplain);

router.get("/complaints", controllers.getComplaints);

router.get("/delete/:id", controllers.deleteComplaint);

router.get("/update/:id", controllers.getUpdateComplaint);

router.post("/update/:id", upload.single("file"), controllers.postUpdateComplaint);

module.exports = router;
