require('dotenv').config();

// const nodemailer = require("nodemailer");

// // console.log("EMAIL_USER:", process.env.EMAIL_USER);
// // console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// transporter.verify(function (error, success) {
//   if (error) {
//     console.log("Mailer Error:", error);
//   } else {
//     console.log("Mailer Ready");
//   }
// });

// module.exports = transporter;

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: String(process.env.EMAIL_SECURE).toLowerCase() === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

module.exports = transporter;