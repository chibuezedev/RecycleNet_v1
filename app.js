"use strict";

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

// Routes
const homeRoutes = require("./routes/home");
const authRoutes = require("./routes/auth");
const complainRoutes = require("./routes/complain");
const adminRoutes = require("./routes/admin");

// Environment variables
const MONGODB_URL = process.env.MONGODB_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;

const app = express();
const csrfProtection = csrf();

// Set the template engine
app.set("view engine", "ejs");
app.set("views", "views");

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(flash());

// Session middleware
const store = new MongoDBStore({
  uri: MONGODB_URL,
  collection: "sessions",
});

app.use(
  session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// Authentication middleware
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});


// Custom routes
app.use(homeRoutes);
app.use(authRoutes);
app.use(complainRoutes)
app.use(adminRoutes);


mongoose.connect(MONGODB_URL)
  .then((result) => {
    app.listen(PORT, () => {
      console.log(`Listening on port http://localhost:${PORT}`);
      console.log("Connected to MongoDB");
    });
  })
  .catch((err) => {
    console.log(err);
  });
