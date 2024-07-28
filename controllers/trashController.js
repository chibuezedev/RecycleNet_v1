const User = require("../models/user");
const Complain = require("../models/complain");
const sendEmail = require("../utils/email");

module.exports = {
  checkUserSession: async (req, res, next) => {
    try {
      const { email } = req.session.user;

      if (email) {
        const user = await User.findOne({ email });
        if (user) {
          const { status, code } = user;

          if (status === "verified") {
            if (code !== 0) {
              return res.redirect("/user-otp");
            } else {
              req.user = user;
              next();
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
  },

  registerComplain: async (req, res) => {
    const { name, mobile, email, location, locationdescription, date, status } =
      req.body;
    const wastetype = req.body.wastetype.join(",");
    const file = req.file ? req.file.filename : "";
    const user = req.session.user;

    const newComplain = {
      name,
      mobile,
      email: user.email,
      wasteType: wastetype,
      location,
      locationDescription: locationdescription,
      file,
      date,
      status,
    };

    try {
      const complain = await Complain.create(newComplain);
      req.flash("success", "Complain registered successfully!");

      // Format the complain details as plain text
      const complainDetails = `
Name: ${complain.name}
Email: ${complain.email}
Waste Type: ${complain.wasteType}
Mobile: ${complain.mobile}
Location: ${complain.location}
Location Description: ${complain.locationDescription}
File: ${complain.file}
Date: ${complain.date}
Status: ${complain.status}
      `;

      // Send email notification to admin
      await sendEmail(
        "paulpadro03@gmail.com",
        "New Complain Registered",
        `<div>
          <h1>New Complain Registered</h1>
          <p>A new complain has been registered by ${user.name}</p>
        <hr />
          <strong>Complain Details:</strong>
          <pre>${complainDetails}</pre>
        
        <p>Login to admin dashboard: <a href="http://localhost:3000/admin/new/complain">Here</a></p>
        </div>`
      );

      // Redirect to success page
      res.render("complain/success", {
        msg: "Complain Registered Successfully!",
        alertType: "success",
        user: user,
      });
    } catch (err) {
      console.error("Error registering complain:", err);
      res.render("complain/index", {
        msg: "Failed to Register!",
        alertType: "warning",
        user: user,
      });
    }
  },
};
