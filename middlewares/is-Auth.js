const User = require("../models/user");

const checkUserSession = async (req, res, next) => {
  try {
    const sessionUser = req.session.user;

    if (sessionUser && sessionUser.email) {
      const user = await User.findOne({ email: sessionUser.email });
      if (user) {
        const { status, code } = user;

        if (status === "verified") {
          if (code !== 0) {
            return res.redirect("/user-otp");
          } else {
            req.user = user;
            return next();
          }
        } else {
          return res.redirect("/report");
        }
      } else {
        return res.redirect("/login");
      }
    } else {
      return res.redirect("/signup");
    }
  } catch (error) {
    console.error("Error checking user session:", error);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = checkUserSession;
