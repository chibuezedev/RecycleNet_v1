const express = require("express");

const authController = require("../controllers/authController");

const router = express.Router();

router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/user-otp", authController.getOTP);
router.post("/user-otp", authController.postOTP);
router.get("/reset-code", authController.getResetPassword);
router.post("/reset-code", authController.postResetPassword);
router.get("/new-password", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);
router.get("/password-changed", authController.getPasswordChanged);

module.exports = router;
