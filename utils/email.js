const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const sendEmail = async (email, subject, message) => {
  try {
    const transporterConfig = {
      service: "gmail",
      auth: {
        user: process.env.GOOGLE_USER_EMAIL,
        pass: process.env.GOOGLE_USER_PASSWORD,
      },
    };

    const transporter = nodemailer.createTransport(transporterConfig);

    const mailOptions = {
      from: process.env.GOOGLE_USER_EMAIL,
      to: email,
      subject: subject,
      text: message,
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(new Error("Failed while sending email!"));
        } else {
          resolve(`Email sent: ${info.response}`);
        }
      });
    });
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
};

module.exports = sendEmail;
