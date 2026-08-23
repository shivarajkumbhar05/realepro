const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const net = require('net');
const connectDB = require('./config/db');
const { getDBConnection } = require('./config/db');
const User = require('./models/User');

// Load env vars
dotenv.config();

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production.');
}

const ensureDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    const adminPassword = process.env.ADMIN_PASSWORD?.trim();

    if (!adminEmail || !adminPassword) {
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
      }
      return;
    }

    await User.create({
      name: 'System Admin',
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: 'admin',
      phone: '0000000000',
      isVerified: true,
      isActive: true,
    });

    console.log(`✅ Default admin created for ${adminEmail}`);
  } catch (error) {
    console.error('⚠️ Could not ensure default admin:', error.message);
  }
};

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});
const actionLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://realepro-9g99aio8i-squad-tech.vercel.app",
  "https://realepro.vercel.app"
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return allowedOrigins.includes(origin)
    || /^http:\/\/localhost:\d+$/.test(origin)
    || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
};

app.use(cors({
  origin: function (origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// ─── Static File Serving ──────────────────────────────────────────────────────
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.options('*', cors());

// ─── API Routes ───────────────────────────────────────────────────────────────
console.log('🔍 Loading authRoutes...');
const authRoutes = require('./routes/authRoutes');
console.log('✅ authRoutes loaded, type:', typeof authRoutes);
app.use('/api/auth', authLimiter, authRoutes);

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

console.log('🔍 Loading propertyRoutes...');
const propertyRoutes = require('./routes/propertyRoutes');
console.log('✅ propertyRoutes loaded, type:', typeof propertyRoutes);
app.use('/api/properties', propertyRoutes);

console.log('🔍 Loading adminRoutes...');
const adminRoutes = require('./routes/adminRoutes');
console.log('✅ adminRoutes loaded, type:', typeof adminRoutes);
app.use('/api/admin', adminRoutes);

console.log('🔍 Loading reviewRoutes...');
const reviewRoutes = require('./routes/reviewRoutes');
console.log('✅ reviewRoutes loaded, type:', typeof reviewRoutes);
app.use('/api/reviews', reviewRoutes);

console.log('🔍 Loading purchaseRoutes...');
const purchaseRoutes = require('./routes/purchaseRoutes');
console.log('✅ purchaseRoutes loaded, type:', typeof purchaseRoutes);
app.use('/api/purchases', actionLimiter, purchaseRoutes);

console.log('Loading transactionRoutes...');
const transactionRoutes = require('./routes/transactionRoutes');
app.use('/api/transactions', actionLimiter, transactionRoutes);

console.log('🔍 Loading chatbotRoutes...');
const chatbotRoutes = require('./routes/chatbotRoutes');
console.log('✅ chatbotRoutes loaded, type:', typeof chatbotRoutes);
app.use('/api/chatbot', actionLimiter, chatbotRoutes);

console.log('🔍 Loading contactRoutes...');
const contactRoutes = require('./routes/contactRoutes');
console.log('✅ contactRoutes loaded, type:', typeof contactRoutes);
app.use('/api/contact', actionLimiter, contactRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Real Estate API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File size too large. Maximum size is 5MB.' });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ success: false, message: 'Too many files uploaded.' });
  }
  if (err.message && err.message.includes('Only')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field} already exists.` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    if (!getDBConnection()) {
      throw new Error('Database connection was not established.');
    }
    await ensureDefaultAdmin();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ All routes loaded successfully`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`⚠️ Port ${PORT} is already in use. Please stop the other process and try again.`);
      } else {
        console.error('❌ Server error:', error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;