const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    type: {
      type: String,
      enum: ['apartment', 'house', 'villa', 'plot', 'commercial', 'office'],
      required: [true, 'Property type is required'],
    },
    status: {
      type: String,
      enum: ['sale', 'rent', 'sold', 'rented'],
      required: [true, 'Property status is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
    },
    areaUnit: {
      type: String,
      enum: ['sqft', 'sqmt', 'acre', 'bigha'],
      default: 'sqft',
    },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    floors: { type: Number, default: 1 },
    parking: { type: Boolean, default: false },
    furnished: {
      type: String,
      enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
      default: 'unfurnished',
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    images: [
      {
        filename: String,
        path: String,
        originalName: String,
        caption: { type: String, default: '' },
        room: {
          type: String,
          enum: ['exterior', 'living_room', 'bedroom', 'kitchen', 'bathroom', 'balcony', 'other'],
          default: 'other',
        },
        isCover: { type: Boolean, default: false },
      },
    ],
    documents: [
      {
        filename: String,
        path: String,
        originalName: String,
        docType: {
          type: String,
          enum: ['title_deed', 'noc', 'floor_plan', 'other'],
          default: 'other',
        },
        verificationStatus: {
          type: String,
          enum: ['unverified', 'verified', 'flagged'],
          default: 'unverified',
        },
        verificationScore: { type: Number, default: null },
        verificationNotes: [String],
        verifiedAt: { type: Date, default: null },
      },
    ],
    amenities: [String],
    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false, // Admin must approve
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: { type: Number, default: 0 },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        userName: String,
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Index for search/filter performance
propertySchema.index({ 'location.city': 1, status: 1, type: 1, price: 1 });
propertySchema.index({ title: 'text', description: 'text', 'location.address': 'text' });

module.exports = mongoose.model('Property', propertySchema);
