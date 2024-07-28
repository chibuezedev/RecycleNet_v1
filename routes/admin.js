const express = require("express");

const adminController = require("../controllers/adminController");

const router = express.Router();

router.get("/admin/signup", adminController.getAdminSignup);
router.post("/admin/signup", adminController.postAdminSignup);

router.get("/admin/login", adminController.getAdminLogin);
router.post("/admin/login", adminController.postAdminLogin);


module.exports = router;
