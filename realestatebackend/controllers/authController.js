const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ─── Helper: generate JWT ─────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, role: assignedRole, phone });
    sendTokenResponse(user, 201, res, 'Registered successfully');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

// ─── @route  POST /api/auth/reset-password ───────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email.' });
    }

    user.password = password;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successfully');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  POST /api/auth/google-register ──────────────────────────────────
exports.googleRegister = async (req, res) => {
  try {
    const { idToken, userData } = req.body;
    
    const { email, displayName, photoURL, uid } = userData || {};
    
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
        email: email,
        password: randomPassword,
        role: 'buyer',
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