const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

const User = require("../models/user");
const Complaint = require("../models/complain");

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
      res.redirect("/admin/dashboard");
    }
  }

  if (errors.length > 0) {
    res.render("admin/login", { errors, email });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const user = req.session.user;
    const data = await Complaint.find();
    res.render("admin/dashboard", {
      data: data,
      user,
    });
  } catch (err) {
    console.error(err);
  }
};

const adminDeleteComplain = async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
};

const adminUpdateComplainStatus = async (req, res) => {
  try {
    const newStatus =
      req.params.status === "pending" || "Pending" ? "completed" : "pending";
    await Complaint.findByIdAndUpdate(req.params.id, { status: newStatus });
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
};

const adminLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("/");
  });
};

module.exports = {
  getAdminSignup,
  postAdminSignup,
  postAdminLogin,
  getAdminLogin,
  adminLogout,
  getAdminDashboard,
  adminDeleteComplain,
  adminUpdateComplainStatus,
};
