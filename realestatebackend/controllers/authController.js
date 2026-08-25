const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../config/mailer');

const jwtSecret = process.env.JWT_SECRET || 'realpro-dev-secret-change-me';
const jwtExpire = process.env.JWT_EXPIRE || '7d';

// ─── Helper: generate JWT ─────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: jwtExpire,
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    },
  });
};

// ─── @route  POST /api/auth/register ────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const allowedRoles = ['buyer', 'agent'];
    const assignedRole = allowedRoles.includes(role) ? role : 'buyer';

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email: email.toLowerCase(), password, role: assignedRole, phone });
    sendTokenResponse(user, 201, res, 'Registered successfully');
  } catch (error) {
    console.error('Register error:', error);
    const message = error?.name === 'MongoServerSelectionError' || error?.name === 'MongoNetworkError' || error?.message?.includes('ECONNREFUSED')
      ? 'Database connection failed. Please try again in a moment.'
      : error.message;
    res.status(500).json({ success: false, message });
  }
};

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    console.error('Login error:', error);
    const message = error?.name === 'MongoServerSelectionError' || error?.name === 'MongoNetworkError' || error?.message?.includes('ECONNREFUSED')
      ? 'Database connection failed. Please try again in a moment.'
      : error.message;
    res.status(500).json({ success: false, message });
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  PUT /api/auth/updateprofile ─────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updateData = { name, phone };

    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  PUT /api/auth/changepassword ────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password changed successfully');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpire');
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      user.passwordResetExpire = new Date(Date.now() + 15 * 60 * 1000);
      await user.save({ validateBeforeSave: false });

      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
      const resetUrl = `${frontendUrl.replace(/\/$/, '')}/forgot-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Reset your PropEstate password',
          html: `<p>We received a password reset request.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 15 minutes and can be used once.</p>`,
        });
      } catch (mailError) {
        console.warn('Password reset email failed:', mailError.message);
      }
    }

    return res.status(200).json({ success: true, message: 'If an account exists, password reset instructions have been sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select('+password +passwordResetToken +passwordResetExpire');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found for this email.' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successfully');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  POST /api/auth/google-register ──────────────────────────────────
exports.googleRegister = async (req, res) => {
  try {
    const { idToken, userData, email: directEmail, name: directName, avatar: directAvatar, googleId: directGoogleId, role: directRole } = req.body;
    
    const userPayload = userData || {};
    const email = directEmail || userPayload.email;
    const displayName = directName || userPayload.displayName || userPayload.name;
    const photoURL = directAvatar || userPayload.photoURL || userPayload.avatar;
    const uid = directGoogleId || userPayload.uid || userPayload.googleId;
    const role = directRole || userPayload.role || 'buyer';
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required from Google authentication.' 
      });
    }
    
    let user = await User.findOne({ email });
    
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      user = await User.create({
        name: displayName || email.split('@')[0],
        email: email.toLowerCase(),
        password: randomPassword,
        role: role === 'agent' ? 'agent' : 'buyer',
        googleId: uid,
        isVerified: true,
        isActive: true,
        avatar: photoURL || null,
        phone: null
      });
    } else {
      let updated = false;
      
      if (displayName && !user.name) {
        user.name = displayName;
        updated = true;
      }
      
      if (photoURL && !user.avatar) {
        user.avatar = photoURL;
        updated = true;
      }
      
      if (uid && !user.googleId) {
        user.googleId = uid;
        updated = true;
      }
      
      if (!user.isVerified) {
        user.isVerified = true;
        updated = true;
      }
      
      if (updated) {
        await user.save();
      }
    }
    
    sendTokenResponse(user, 200, res, 'Google login successful');
    
  } catch (error) {
    console.error('Google register error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ─── @route  GET /api/auth/logout ────────────────────────────────────────────
exports.logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully. Please clear your token on client.' });
};