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

  getComplaints: async (req, res) => {
    try {
      const complaints = await Complain.find();
      res.render("complain/user/history", { complaints });
    } catch (error) {
      res.status(500).send("Server error");
    }
  },

  deleteComplaint: async (req, res) => {
    try {
    
      await Complain.findByIdAndDelete(req.params.id);
      res.redirect("/complaints");
    } catch (error) {
      res.status(500).send("Server error");
    }
  },

  getUpdateComplaint: async (req, res) => {
    try {
      const user = req.session.user;
      const complaint = await Complain.findById(req.params.id);
      res.render("complain/user/update", {
        complaint,
        msg: "",
        alertType: "",
        user: user,
      });
    } catch (error) {
      res.status(500).send("Server error");
    }
  },

  postUpdateComplaint: async (req, res) => {
    try {
      const {
        name,
        mobile,
        email,
        location,
        locationDescription,
        date,
        status,
      } = req.body;

      const file = req.file ? req.file.filename : "";
      const wastetype = req.body.wastetype

      let updateData = {
        name,
        mobile,
        email,
        wastetype: wastetype,
        location,
        locationDescription,
        date,
        status,
      };

      if (req.file) {
        updateData.file = file;
      }

      await Complain.findByIdAndUpdate(req.params.id, updateData);

      res.redirect("/complaints");
    } catch (error) {
      console.error("Error registering complain:", error);
      res.render("complain/index", {
        msg: "Failed to Register!",
        alertType: "warning",
        user: req.session.user,
      });
    }
  },
};
