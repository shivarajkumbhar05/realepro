const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://realepro-9g99aio8i-squad-tech.vercel.app",
  "https://realepro.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ─── Static File Serving ──────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────────
console.log('🔍 Loading authRoutes...');
const authRoutes = require('./routes/authRoutes');
console.log('✅ authRoutes loaded, type:', typeof authRoutes);
app.use('/api/auth', authRoutes);

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
app.use('/api/purchases', purchaseRoutes);

console.log('🔍 Loading chatbotRoutes...');
const chatbotRoutes = require('./routes/chatbotRoutes');
console.log('✅ chatbotRoutes loaded, type:', typeof chatbotRoutes);
app.use('/api/chatbot', chatbotRoutes);

console.log('🔍 Loading contactRoutes...');
const contactRoutes = require('./routes/contactRoutes');
console.log('✅ contactRoutes loaded, type:', typeof contactRoutes);
app.use('/api/contact', contactRoutes);

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
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ All routes loaded successfully`);
});

module.exports = app;