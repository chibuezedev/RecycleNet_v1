const Complain = require("../models/complain");
const sendEmail = require("../utils/email");
const cloudinaryUploader = require("../utils/cloudinaryUploader");

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;


const getReport = (req, res) => {
  const user = req.session.user;
  res.render("complain/index", { msg: "", alertType: "", user: user });
}

const registerComplain = async (req, res) => {
  const { name, mobile, location, locationdescription, date, status } =
    req.body;
  const wastetype = req.body.wastetype.join(", ");
  const file = req.file;
  const user = req.session.user;

  try {
    const newComplain = {
      name,
      mobile,
      email: user.email,
      wasteType: wastetype,
      location,
      locationDescription: locationdescription,
      date,
      status,
    };

    const complain = await Complain.create(newComplain);

    // Upload the file to Cloudinary
    const imageUpload = await cloudinaryUploader(file, {
      allowedTypes: ALLOWED_IMAGE_TYPES,
      folder: "recycleNet/images",
      public_id: `complaint-${complain._id.toString()}`,
      overwrite: true,
      maxSize: MAX_IMAGE_SIZE,
    });

    // Update the complain with the uploaded file URL
    await Complain.findByIdAndUpdate(complain._id, {
      file: imageUpload.secure_url,
    });

    // Flash success message
    req.flash("success", "Complain registered successfully!");

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
    const emailSubject = "New Complaint Registered";
    const emailBody = `
  New Complaint Registered
  
  A new complaint has been registered by ${user.name}
  
  Complaint Details:
  ${complainDetails}
  
  Login to admin dashboard: http://localhost:3000/admin/new/complain
      `;

    await sendEmail("paulpadro03@gmail.com", emailSubject, emailBody);

    // Render success page
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
};

const getSuccess = (req, res) => {
  const user = req.session.user;
  res.render("complain/success", {
    msg: "Complaint submitted successfully",
    alertType: "success",
    user: user,
  });
}

const getComplaints = async (req, res) => {
  try {
    const user = req.session.user;

    const complaints = await Complain.find({ email: user.email });

    res.render("complain/user/history", { complaints, user: user });
  } catch (error) {
    res.status(500).send("Server error");
  }
};

const deleteComplaint = async (req, res) => {
  try {
    await Complain.findByIdAndDelete(req.params.id);
    res.redirect("/complaints");
  } catch (error) {
    res.status(500).send("Server error");
  }
};

const getUpdateComplaint = async (req, res) => {
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
};

const postUpdateComplaint = async (req, res) => {
  try {
    const { name, mobile, email, location, locationDescription, date, status } =
      req.body;

    const file = req.file ? req.file.filename : "";
    const wastetype = req.body.wastetype;

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
};

module.exports = {
  getReport,
  registerComplain,
  getSuccess,
  getComplaints,
  deleteComplaint,
  getUpdateComplaint,
  postUpdateComplaint,
};
