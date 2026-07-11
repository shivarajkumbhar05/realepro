/*const otpGenerator = require("otp-generator");
const Otp = require("../models/Otp");
const User = require("../models/User");
const transporter = require("../config/mailer");
const jwt = require("jsonwebtoken");

// =========================
// Generate JWT
// =========================
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

// =========================
// Email Validation
// =========================
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// =========================
// SEND OTP
// POST /api/auth/send-otp
// =========================
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate Email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    // OTP Cooldown (60 seconds)
    const recentOTP = await Otp.findOne({ email });

    if (
      recentOTP &&
      Date.now() - new Date(recentOTP.createdAt).getTime() < 60000
    ) {
      return res.status(429).json({
        success: false,
        message: "Please wait 60 seconds before requesting another OTP.",
      });
    }

    // Generate Unique OTP
    let otp;
    let existingOTP;

    do {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
      });

      existingOTP = await Otp.findOne({ otp });
    } while (existingOTP);

    // Remove previous OTP
    await Otp.deleteMany({ email });

    // Save OTP
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Verify Mail Configuration
    await transporter.verify();

    // Send Email
    const info = await transporter.sendMail({
      from: `"PropEstate" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Email Verification OTP",

      html: `
      <div style="font-family:Arial;padding:25px;background:#f5f5f5">
        <div style="background:white;padding:25px;border-radius:10px">

          <h2 style="color:#2563eb">
            PropEstate Email Verification
          </h2>

          <p>Hello,</p>

          <p>Your One Time Password (OTP) is:</p>

          <h1 style="
            letter-spacing:10px;
            color:#2563eb;
            text-align:center;
          ">
            ${otp}
          </h1>

          <p>
            This OTP will expire in
            <strong>5 minutes</strong>.
          </p>

          <hr>

          <small style="color:gray">
            Never share this OTP with anyone.
          </small>

        </div>
      </div>
      `,
    });

    console.log("OTP Sent:", info.messageId);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });

  } catch (error) {
    console.error("Send OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP.",
      error: error.message,
    });
  }
};
// =========================
// VERIFY OTP & REGISTER
// POST /api/auth/verify-otp
// =========================
exports.verifyOTP = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      otp,
    } = req.body;

    // =========================
    // Validation
    // =========================
    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled.",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // =========================
    // Check User Already Exists
    // =========================
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }

    // =========================
    // Find OTP
    // =========================
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    // =========================
    // Check Expiry
    // =========================
    if (otpRecord.expiresAt < new Date()) {

      await Otp.deleteMany({ email });

      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    // =========================
    // Verify OTP
    // =========================
    if (otpRecord.otp !== otp) {

      return res.status(400).json({
        success: false,
        message: "Incorrect OTP.",
      });
    }

    // =========================
    // Create User
    // =========================
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || "",
      role: role === "agent" ? "agent" : "buyer",
    });

    // =========================
    // Delete OTP
    // =========================
    await Otp.deleteMany({ email });

    // =========================
    // Generate JWT
    // =========================
    const token = generateToken(user._id);

    // =========================
    // Success Response
    // =========================
    return res.status(201).json({
      success: true,
      message: "Registration completed successfully.",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      },
    });

  } catch (error) {

    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: error.message,
    });
  }
};
// =========================
// RESEND OTP
// POST /api/auth/resend-otp
// =========================
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await transporter.sendMail({
      from: `"PropEstate" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "New OTP",

      html: `
      <h2>Your New OTP</h2>

      <h1 style="letter-spacing:8px;color:#2563eb;">
        ${otp}
      </h1>

      <p>This OTP expires in 5 minutes.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "OTP resent successfully.",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// =========================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// =========================
exports.forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found.",
      });

    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await transporter.sendMail({

      from: `"PropEstate" <${process.env.EMAIL_USER}>`,

      to: email,

      subject: "Reset Password OTP",

      html: `
      <h2>Password Reset</h2>

      <p>Your OTP is</p>

      <h1 style="letter-spacing:8px;">
        ${otp}
      </h1>

      <p>Expires in 5 minutes.</p>
      `

    });

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent.",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
// =========================
// RESET PASSWORD
// POST /api/auth/reset-password
// =========================
exports.resetPassword = async (req, res) => {

  try {

    const {
      email,
      otp,
      newPassword
    } = req.body;

    if (!email || !otp || !newPassword) {

      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });

    }

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {

      return res.status(400).json({
        success: false,
        message: "OTP not found.",
      });

    }

    if (otpRecord.expiresAt < new Date()) {

      await Otp.deleteMany({ email });

      return res.status(400).json({
        success: false,
        message: "OTP expired.",
      });

    }

    if (otpRecord.otp !== otp) {

      return res.status(400).json({
        success: false,
        message: "Incorrect OTP.",
      });

    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found.",
      });

    }

    user.password = newPassword;

    await user.save();

    await Otp.deleteMany({ email });

    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};*/