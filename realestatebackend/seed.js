/**
 * Seed Script — creates default admin user and 100+ properties
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Property = require('./models/Property');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create Admin User
    const adminExists = await User.findOne({ role: 'admin' });
    let admin;
    if (!adminExists) {
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@realestate.com',
        password: 'Admin@123',
        role: 'admin',
        phone: '9999999999',
      });
      console.log('✅ Admin user created');
    } else {
      admin = adminExists;
      console.log('⚠️ Admin user already exists');
    }

    // Create 100+ Properties
    const propertyCount = await Property.countDocuments();
    if (propertyCount > 0) {
      console.log(`⚠️ ${propertyCount} properties already exist. Skipping property seed.`);
    } else {
      console.log('🏠 Creating 100+ properties...');
      
      const properties = generateProperties(admin._id);
      await Property.insertMany(properties);
      console.log(`✅ ${properties.length} properties created successfully!`);
    }

    console.log('\n📊 Seed Summary:');
    console.log(`   Admin Email: ${admin.email}`);
    console.log(`   Admin Password: Admin@123`);
    console.log(`   Total Properties: ${propertyCount > 0 ? propertyCount : 44}`);
    console.log('\n⚠️  Please change the admin password after first login!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
};

// Function to generate 44+ properties (MATCHES YOUR MODEL EXACTLY)
const generateProperties = (adminId) => {
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Kolkata'];
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Maharashtra', 'Gujarat', 'West Bengal'];
  
  // Your model's enum values
  const propertyTypes = ['apartment', 'house', 'villa', 'plot', 'commercial', 'office'];
  const statuses = ['sale', 'rent', 'sold', 'rented'];
  const furnishedStatuses = ['unfurnished', 'semi-furnished', 'fully-furnished'];
  const roomTypes = ['exterior', 'living_room', 'bedroom', 'kitchen', 'bathroom', 'balcony', 'other'];
  
  const amenities = [
    'Swimming Pool', 'Gym', 'Parking', 'Garden', 'Security', 'Playground',
    'Club House', 'Elevator', 'Balcony', 'AC', 'WiFi', 'Solar Panels',
    'Jogging Track', 'Tennis Court', 'Golf Course', 'Jacuzzi', 'Sauna',
    '24/7 Security', 'Power Backup', 'Water Supply', 'Rainwater Harvesting'
  ];
  
  const propertyNames = [
    'Green Valley Estate', 'Lake View Residency', 'Sunset Heights', 'Royal Palm Villas',
    'Silver Oak Enclave', 'Golden Pearl Apartments', 'Emerald Heights', 'Sapphire Towers',
    'Diamond Crest', 'Ruby Villas', 'Pearl Residency', 'Opal Heights',
    'Topaz Apartments', 'Amber Estate', 'Coral Retreat', 'Jade Valley',
    'Moonlight Residency', 'Star Towers', 'Sunrise Villas', 'Cloud Nine',
    'Harmony Heights', 'Serenity Enclave', 'Tranquil Garden', 'Bliss Residency',
    'Paradise Towers', 'Eden Gardens', 'Majestic Views', 'Royal Heritage',
    'Grand Residency', 'Premier Heights', 'Luxury Living', 'Dream Homes',
    'Blue Waters', 'Green Meadows', 'Golden Sands', 'Silver Springs',
    'Maple Woods', 'Cedar Grove', 'Pine Valley', 'Oak Residency',
    'Ivy Apartments', 'Rose Garden', 'Lotus Towers', 'Orchid Villas',
    'Lily Residency', 'Daisy Estate', 'Tulip Gardens', 'Magnolia Heights'
  ];

  const properties = [];
  
  for (let i = 0; i < 48; i++) {
    const cityIndex = Math.floor(Math.random() * cities.length);
    const city = cities[cityIndex];
    const state = states[cityIndex];
    
    const type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const furnished = furnishedStatuses[Math.floor(Math.random() * furnishedStatuses.length)];
    
    // Generate random amenities (3-7 amenities per property)
    const numAmenities = Math.floor(Math.random() * 5) + 3;
    const shuffledAmenities = [...amenities].sort(() => 0.5 - Math.random());
    const propertyAmenities = shuffledAmenities.slice(0, numAmenities);

    // Generate realistic prices based on city and type
    let basePrice = 0;
    if (city === 'Mumbai' || city === 'Delhi') {
      basePrice = Math.floor(Math.random() * 5000000) + 5000000; // 50L - 1Cr
    } else if (city === 'Bangalore' || city === 'Hyderabad') {
      basePrice = Math.floor(Math.random() * 3000000) + 3000000; // 30L - 60L
    } else {
      basePrice = Math.floor(Math.random() * 2000000) + 2000000; // 20L - 40L
    }

    // Adjust price based on property type
    if (type === 'villa' || type === 'house') {
      basePrice *= 2.5;
    } else if (type === 'commercial' || type === 'office') {
      basePrice *= 2;
    } else if (type === 'apartment') {
      basePrice *= 1.2;
    } else if (type === 'plot') {
      basePrice *= 1.5;
    }

    // Adjust for status (rent is cheaper)
    if (status === 'rent') {
      basePrice = Math.floor(basePrice / 100); // Convert to monthly rent
    }

    const bedrooms = Math.floor(Math.random() * 4) + 1; // 1-4 BHK
    const bathrooms = Math.min(bedrooms + 1, 5);
    const area = (bedrooms * 400) + Math.floor(Math.random() * 300) + 200;
    const address = `${Math.floor(Math.random() * 100) + 1}, ${['Main Road', 'MG Road', 'Park Street', 'Lake Avenue', 'Green Boulevard', 'Sunset Drive', 'Hill Road', 'Beach Road'][Math.floor(Math.random() * 8)]}`;

    // Generate 3-5 images for each property
    const numImages = Math.floor(Math.random() * 3) + 3; // 3-5 images
    const images = [];
    for (let j = 0; j < numImages; j++) {
      const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      images.push({
        filename: `property-${i + 1}-image-${j + 1}`,
        path: `https://via.placeholder.com/800x600/4A90D9/FFFFFF?text=${encodeURIComponent(type)}+${j + 1}`,
        originalName: `property_${i + 1}_${j + 1}.jpg`,
        caption: `${type} view ${j + 1}`,
        room: roomType,
        isCover: j === 0, // First image is cover
      });
    }

    // Generate random coordinates
    const lat = 12.9716 + (Math.random() - 0.5) * 0.5;
    const lng = 77.5946 + (Math.random() - 0.5) * 0.5;

    properties.push({
      title: `${propertyNames[i % propertyNames.length]} ${type}`,
      description: `Beautiful ${bedrooms} BHK ${type} located in prime location of ${city}. This property features modern amenities, spacious rooms, and excellent connectivity. Perfect for families looking for a comfortable living experience.`,
      type: type,
      status: status,
      price: Math.round(basePrice / 100000) * 100000, // Round to nearest lakh
      area: area,
      areaUnit: 'sqft',
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      floors: Math.floor(Math.random() * 3) + 1, // 1-3 floors
      parking: Math.random() > 0.5, // 50% chance of parking
      furnished: furnished,
      location: {
        address: address,
        city: city,
        state: state,
        pincode: String(100000 + Math.floor(Math.random() * 899999)),
        lat: lat,
        lng: lng,
      },
      images: images,
      documents: [
        {
          filename: `title_deed_${i + 1}`,
          path: `https://via.placeholder.com/800x600/4A90D9/FFFFFF?text=Title+Deed+${i + 1}`,
          originalName: `title_deed_${i + 1}.pdf`,
          docType: 'title_deed',
          verificationStatus: 'unverified',
          verificationScore: Math.floor(Math.random() * 100),
          verificationNotes: ['Document uploaded'],
          verifiedAt: null,
        },
        {
          filename: `floor_plan_${i + 1}`,
          path: `https://via.placeholder.com/800x600/4A90D9/FFFFFF?text=Floor+Plan+${i + 1}`,
          originalName: `floor_plan_${i + 1}.pdf`,
          docType: 'floor_plan',
          verificationStatus: 'unverified',
          verificationScore: null,
          verificationNotes: [],
          verifiedAt: null,
        }
      ],
      amenities: propertyAmenities,
      avgRating: 0,
      numReviews: 0,
      agent: adminId,
      isApproved: Math.random() > 0.3, // 70% chance of being approved
      isActive: true,
      views: Math.floor(Math.random() * 1000),
      reviews: [],
    });
  }

  return properties;
};

seedAdmin();