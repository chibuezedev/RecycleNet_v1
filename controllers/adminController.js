const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

const User = require("../models/user");

const getAdminSignup = (req, res) => {
  res.render("admin/signup", { errors: [], name: "", email: "" });
};

const postAdminSignup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("admin/signup", {
      errors: errors.array().map((err) => err.msg),
      name: req.body.name,
      email: req.body.email,
    });
  }

  try {
    res.redirect("/admin/login");
  } catch (error) {
    res.render("admin/signup", {
      errors: ["An error occurred. Please try again."],
      name: req.body.name,
      email: req.body.email,
    });
  }
};

const getAdminLogin = (req, res) => {
  res.render("admin/login", { errors: [], email: "" });
};

const postAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  let errors = [];

  if (!email || !password) {
    errors.push("All fields are required.");
  }

  const user = await User.findOne({ email: email, accountType: "Admin" });
  if (!user) {
    errors.push("User does not exist");
  } else {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      errors.push("Incorrect email or password!");
    } else {
      if (user.status !== "verified") {
        req.session.info = `It looks like you haven't verified your email - ${email}`;
        res.redirect("/user-otp");
        return;
      }
      req.session.user = user;
      res.redirect("/complaints");
    }
  }

  if (errors.length > 0) {
    res.render("admin/login", { errors, email });
  }
};

module.exports = {
  getAdminSignup,
  postAdminSignup,
  postAdminLogin,
  getAdminLogin,
};
