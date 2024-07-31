const express = require("express");

const adminController = require("../controllers/adminController");

const router = express.Router();

router.get("/admin/signup", adminController.getAdminSignup);
router.post("/admin/signup", adminController.postAdminSignup);

router.get("/admin/login", adminController.getAdminLogin);
router.post("/admin/login", adminController.postAdminLogin);

router.get("/admin/dashboard", adminController.getAdminDashboard)
router.get("/delete/:id", adminController.adminDeleteComplain)
router.get("/status/:id/:status", adminController.adminUpdateComplainStatus)

router.get("/admin/logout", adminController.adminLogout)


module.exports = router;
