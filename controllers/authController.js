const User = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

exports.getSignup = (req, res) => {
  res.render("auth/signup", { errors: [], name: "", email: "" });
};

exports.postSignup = async (req, res) => {
  const { name, email, password, cpassword } = req.body;
  let errors = [];

  if (!name || !email || !password || !cpassword) {
    errors.push("All fields are required.");
  }

  if (password !== cpassword) {
    errors.push("Passwords do not match.");
  }

  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    errors.push("Email already exists.");
  }

  if (errors.length > 0) {
    res.render("auth/signup", { errors, name, email });
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      code,
      status: "notverified",
    });

    await newUser.save();

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.OFFICIAL_USER_EMAIL,
        pass: process.env.OFFICIAL_USER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.OFFICIAL_USER_EMAIL,
      to: email,
      subject: "Email Verification Code",
      text: `Your verification code is ${code}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        errors.push("Failed while sending code!");
        res.render("auth/signup", { errors, name, email });
      } else {
        req.session.info = `We've sent a verification code to your email - ${email}`;
        req.session.email = email;
        res.redirect("auth/user-otp");
      }
    });
  }
};

exports.getLogin = (req, res) => {
  res.render("auth/login", { errors: [], email: "" });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  let errors = [];

  if (!email || !password) {
    errors.push("All fields are required.");
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    errors.push("User does not exist");
  } else {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      errors.push("Incorrect email or password!");
    } else {
      if (user.status !== "verified") {
        req.session.info = `It looks like you haven't verified your email - ${email}`;
        res.redirect("auth/user-otp");
        return;
      }
      req.session.user = user;
      res.redirect("complain/index");
    }
  }

  if (errors.length > 0) {
    res.render("auth/login", { errors, email });
  }
};

exports.getOTP = (req, res) => {
  res.render("auth/user-otp", { errors: [], info: req.session.info || "" });
};

exports.postOTP = async (req, res) => {
  const { otp } = req.body;
  const user = await User.findOne({ code: otp });

  if (user) {
    user.status = "verified";
    user.code = 0;
    await user.save();
    req.session.user = user;
    res.redirect("complain/index");
  } else {
    res.render("auth/user-otp", {
      errors: ["Incorrect code"],
      info: req.session.info,
    });
  }
};

exports.getResetPassword = (req, res) => {
  res.render("auth/reset-code", { errors: [], info: req.session.info || "" });
};

exports.postResetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.render("auth/reset-code", {
      errors: ["This email address does not exist!"],
      info: "",
    });
  } else {
    const code = Math.floor(100000 + Math.random() * 900000);
    user.code = code;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.OFFICIAL_USER_EMAIL,
        pass: process.env.OFFICIAL_USER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.OFFICIAL_USER_EMAIL,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is ${code}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.render("auth/reset-code", {
          errors: ["Failed while sending code!"],
          info: "",
        });
      } else {
        req.session.info = `We've sent a password reset code to your email - ${email}`;
        res.redirect("auth/reset-code");
      }
    });
  }
};

exports.getNewPassword = (req, res) => {
  res.render("auth/new-password", { errors: [], info: req.session.info || "" });
};

exports.postNewPassword = async (req, res) => {
  const { password, cpassword } = req.body;
  const email = req.session.email;
  let errors = [];

  if (!password || !cpassword) {
    errors.push("All fields are required.");
  }

  if (password !== cpassword) {
    errors.push("Passwords do not match.");
  }

  if (errors.length > 0) {
    res.render("auth/new-password", { errors, info: req.session.info });
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ email }, { password: hashedPassword, code: 0 });

    req.session.info =
      "Your password has been changed. Now you can login with your new password.";
    res.redirect("auth/password-changed");
  }
};

exports.getPasswordChanged = (req, res) => {
  res.render("auth/password-changed", { info: req.session.info || "" });
};
