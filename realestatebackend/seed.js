/**
 * Seed Script — creates default admin user, agents, buyers, properties, purchases, and reviews
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Property = require('./models/Property');
const Purchase = require('./models/Purchase');
const Review = require('./models/Review');
const connectDB = require('./config/db');

const ROLE_ADMIN = 'admin';
const ROLE_AGENT = 'agent';
const ROLE_BUYER = 'buyer';
const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'plot', 'commercial', 'office'];
const PROPERTY_STATUSES = ['sale', 'rent', 'sold', 'rented'];
const FURNISHED_STATUSES = ['unfurnished', 'semi-furnished', 'fully-furnished'];
const ROOM_TYPES = ['exterior', 'living_room', 'bedroom', 'kitchen', 'bathroom', 'balcony', 'other'];

const AGENT_PROFILES = [
  { name: 'Arjun Patel', email: 'arjun.agent@realestate.com', phone: '9000000001' },
  { name: 'Meera Sharma', email: 'meera.agent@realestate.com', phone: '9000000002' },
  { name: 'Rohan Singh', email: 'rohan.agent@realestate.com', phone: '9000000003' },
  { name: 'Priya Nair', email: 'priya.agent@realestate.com', phone: '9000000004' },
  { name: 'Sneha Gupta', email: 'sneha.agent@realestate.com', phone: '9000000005' },
];

const BUYER_PROFILES = [
  { name: 'Amit Joshi', email: 'amit.buyer@realestate.com', phone: '9100000001' },
  { name: 'Anjali Mehta', email: 'anjali.buyer@realestate.com', phone: '9100000002' },
  { name: 'Rahul Verma', email: 'rahul.buyer@realestate.com', phone: '9100000003' },
  { name: 'Neha Iyer', email: 'neha.buyer@realestate.com', phone: '9100000004' },
  { name: 'Vikram Reddy', email: 'vikram.buyer@realestate.com', phone: '9100000005' },
  { name: 'Sana Khan', email: 'sana.buyer@realestate.com', phone: '9100000006' },
  { name: 'Dev Joshi', email: 'dev.buyer@realestate.com', phone: '9100000007' },
  { name: 'Isha Rao', email: 'isha.buyer@realestate.com', phone: '9100000008' },
];

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Kolkata'];
const STATES = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Maharashtra', 'Gujarat', 'West Bengal'];
const STREET_NAMES = ['Main Road', 'MG Road', 'Park Street', 'Lake Avenue', 'Green Boulevard', 'Sunset Drive', 'Hill Road', 'Beach Road'];
const PROPERTY_NAMES = [
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
const AMENITIES = [
  'Swimming Pool', 'Gym', 'Parking', 'Garden', 'Security', 'Playground',
  'Club House', 'Elevator', 'Balcony', 'AC', 'WiFi', 'Solar Panels',
  'Jogging Track', 'Tennis Court', 'Golf Course', 'Jacuzzi', 'Sauna',
  '24/7 Security', 'Power Backup', 'Water Supply', 'Rainwater Harvesting'
];
const REVIEW_COMMENTS = [
  'Excellent experience with the agent and property.',
  'The home met our expectations and had a great location.',
  'Smooth transaction and responsive support from the team.',
  'Good property, but the documents took some time to verify.',
  'Lovely home; the amenities were exactly as advertised.',
  'Friendly staff, and the process was transparent and easy.',
];

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

// ─── Local placeholder image generator ──────────────────────────────────────
// Generates a self-contained SVG data URI so seed data never depends on an
// external placeholder service (via.placeholder.com / placehold.co, etc. have
// all proven unreliable — timeouts, dead SSL certs, or outright shutdowns).
// Renders instantly in the browser with zero network requests.
const placeholderImage = (text, { width = 800, height = 600, bg = '4A90D9', fg = 'FFFFFF' } = {}) => {
  const label = String(text).replace(/[<>&]/g, '');
  const fontSize = Math.round(Math.min(width, height) / 10);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="#${bg}"/>` +
    `<text x="50%" y="50%" fill="#${fg}" font-family="Arial, sans-serif" font-size="${fontSize}" ` +
    `text-anchor="middle" dominant-baseline="middle">${label}</text>` +
    `</svg>`;
  const base64 = Buffer.from(svg, 'utf8').toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};
const randomPastDate = (monthsBack = 6) => {
  const now = Date.now();
  const maxDays = monthsBack * 30;
  return new Date(now - randomBetween(0, maxDays) * 24 * 60 * 60 * 1000);
};

const buildUser = (profile, role) => ({
  name: profile.name,
  email: profile.email,
  password: 'Password@123',
  role,
  phone: profile.phone,
  isActive: true,
  createdAt: randomPastDate(6),
  updatedAt: new Date(),
});

const createUsers = async (profiles, role) => {
  const users = [];
  for (const profile of profiles) {
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = await User.create(buildUser(profile, role));
      console.log(`✅ Created ${role}: ${profile.email}`);
    } else {
      users.push(user);
      continue;
    }
    users.push(user);
  }
  return users;
};

const createAdmin = async () => {
  const adminEmail = 'admin@realestate.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: 'Admin@123',
      role: ROLE_ADMIN,
      phone: '9999999999',
      isActive: true,
      createdAt: randomPastDate(6),
      updatedAt: new Date(),
    });
    console.log('✅ Admin user created');
  } else {
    console.log('⚠️ Admin user already exists');
  }
  return admin;
};

const generateProperties = (agents, count = 48, startIndex = 0) => {
  const properties = [];
  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    const cityIndex = randomBetween(0, CITIES.length - 1);
    const city = CITIES[cityIndex];
    const state = STATES[cityIndex];
    const type = randomItem(PROPERTY_TYPES);
    const status = randomItem(PROPERTY_STATUSES);
    const furnished = randomItem(FURNISHED_STATUSES);
    const bedrooms = randomBetween(1, 4);
    const bathrooms = Math.min(bedrooms + randomBetween(0, 1), 5);
    const area = bedrooms * 400 + randomBetween(200, 450);
    let basePrice = 0;

    if (city === 'Mumbai' || city === 'Delhi') {
      basePrice = randomBetween(5000000, 10000000);
    } else if (city === 'Bangalore' || city === 'Hyderabad') {
      basePrice = randomBetween(3000000, 6000000);
    } else {
      basePrice = randomBetween(2000000, 4000000);
    }

    if (type === 'villa' || type === 'house') basePrice *= 2.5;
    if (type === 'commercial' || type === 'office') basePrice *= 2;
    if (type === 'apartment') basePrice *= 1.2;
    if (type === 'plot') basePrice *= 1.5;
    if (status === 'rent') basePrice = Math.max(Math.floor(basePrice / 100), 8000);

    const propertyAmenities = shuffle(AMENITIES).slice(0, randomBetween(3, 7));
    const images = Array.from({ length: randomBetween(3, 5) }, (_, j) => ({
      filename: `property-${i + 1}-image-${j + 1}`,
      path: placeholderImage(`${type} ${j + 1}`),
      originalName: `property_${i + 1}_${j + 1}.jpg`,
      caption: `${type} view ${j + 1}`,
      room: randomItem(ROOM_TYPES),
      isCover: j === 0,
    }));

    properties.push({
      title: `${PROPERTY_NAMES[i % PROPERTY_NAMES.length]} ${type}`,
      description: `Beautiful ${bedrooms} BHK ${type} located in prime location of ${city}. This property features modern amenities, spacious rooms, and excellent connectivity. Perfect for families looking for a comfortable living experience.`,
      type,
      status,
      price: Math.round(basePrice / 100000) * 100000,
      area,
      areaUnit: 'sqft',
      bedrooms,
      bathrooms,
      floors: randomBetween(1, 3),
      parking: Math.random() > 0.4,
      furnished,
      location: {
        address: `${randomBetween(1, 150)}, ${randomItem(STREET_NAMES)}`,
        city,
        state,
        pincode: String(randomBetween(100000, 999999)),
        lat: 12.9716 + (Math.random() - 0.5) * 0.5,
        lng: 77.5946 + (Math.random() - 0.5) * 0.5,
      },
      images,
      documents: [
        {
          filename: `title_deed_${i + 1}`,
          path: placeholderImage(`Title Deed ${i + 1}`),
          originalName: `title_deed_${i + 1}.pdf`,
          docType: 'title_deed',
          verificationStatus: 'unverified',
          verificationScore: randomBetween(50, 99),
          verificationNotes: ['Document uploaded'],
          verifiedAt: null,
        },
        {
          filename: `floor_plan_${i + 1}`,
          path: placeholderImage(`Floor Plan ${i + 1}`),
          originalName: `floor_plan_${i + 1}.pdf`,
          docType: 'floor_plan',
          verificationStatus: 'unverified',
          verificationScore: null,
          verificationNotes: [],
          verifiedAt: null,
        },
      ],
      amenities: propertyAmenities,
      avgRating: 0,
      numReviews: 0,
      agent: randomItem(agents)._id,
      isApproved: status === 'sold' || status === 'rented' ? true : Math.random() > 0.3,
      isActive: true,
      views: randomBetween(0, 1000),
      reviews: [],
      createdAt: randomPastDate(6),
      updatedAt: new Date(),
    });
  }
  return properties;
};

const createPurchases = async (properties, buyers) => {
  const purchaseCount = await Purchase.countDocuments();
  if (purchaseCount > 0) {
    console.log(`⚠️ ${purchaseCount} purchases already exist. Skipping purchase seed.`);
    return;
  }

  const purchaseDocuments = [];
  const targetProperties = shuffle(properties).slice(0, Math.min(20, properties.length));

  for (const property of targetProperties) {
    const buyer = randomItem(buyers);
    const offerPrice = Math.max(property.price * (property.status === 'rent' ? 1 : 0.9), 5000);
    const status = property.status === 'sold' ? 'accepted' : randomItem(['pending', 'accepted', 'rejected', 'cancelled']);

    purchaseDocuments.push({
      property: property._id,
      buyer: buyer._id,
      agent: property.agent,
      offerPrice,
      message: 'Interested in this property. Please share more details.',
      contactPhone: buyer.phone,
      status,
      createdAt: randomPastDate(6),
      updatedAt: new Date(),
    });
  }

  if (purchaseDocuments.length) {
    await Purchase.insertMany(purchaseDocuments);
    console.log(`✅ Created ${purchaseDocuments.length} sample purchases`);
  }
};

const createReviews = async (properties, buyers) => {
  const reviewCount = await Review.countDocuments();
  if (reviewCount > 0) {
    console.log(`⚠️ ${reviewCount} reviews already exist. Skipping review seed.`);
    return;
  }

  const reviewDocuments = [];
  const targetProperties = shuffle(properties).slice(0, Math.min(24, properties.length));

  for (const property of targetProperties) {
    const reviewers = shuffle(buyers).slice(0, randomBetween(1, Math.min(3, buyers.length)));
    for (const buyer of reviewers) {
      reviewDocuments.push({
        property: property._id,
        user: buyer._id,
        rating: randomBetween(3, 5),
        comment: randomItem(REVIEW_COMMENTS),
        createdAt: randomPastDate(6),
        updatedAt: new Date(),
      });
    }
  }

  if (reviewDocuments.length) {
    await Review.insertMany(reviewDocuments);
    const propertyIds = [...new Set(reviewDocuments.map((review) => review.property.toString()))];
    await Promise.all(propertyIds.map((propertyId) => Review.recalculateForProperty(propertyId)));
    console.log(`✅ Created ${reviewDocuments.length} sample reviews and recalculated property ratings`);
  }
};

const seedAdmin = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    const admin = await createAdmin();
    const agents = await createUsers(AGENT_PROFILES, ROLE_AGENT);
    const buyers = await createUsers(BUYER_PROFILES, ROLE_BUYER);

    let properties = [];
    const propertyCount = await Property.countDocuments();
    if (propertyCount >= 50) {
      console.log(`⚠️ ${propertyCount} properties already exist. Skipping property seed.`);
      properties = await Property.find().lean();
    } else {
      const needed = 50 - propertyCount;
      console.log(`🏠 Creating ${needed} properties to reach 50 total listings...`);
      const propertyDocs = generateProperties(agents, needed, propertyCount);
      const createdProperties = await Property.insertMany(propertyDocs);
      properties = await Property.find().lean();
      console.log(`✅ Added ${createdProperties.length} properties successfully!`);
    }

    await createPurchases(properties, buyers);
    await createReviews(properties, buyers);

    const [totalUsers, totalAgents, totalBuyers, totalProperties, approvedProperties, pendingProperties, soldProperties, totalReviews, totalPurchases] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: ROLE_AGENT, isActive: true }),
      User.countDocuments({ role: ROLE_BUYER, isActive: true }),
      Property.countDocuments({ isActive: true }),
      Property.countDocuments({ isActive: true, isApproved: true }),
      Property.countDocuments({ isActive: true, isApproved: false }),
      Property.countDocuments({ isActive: true, status: 'sold' }),
      Review.countDocuments(),
      Purchase.countDocuments(),
    ]);

    console.log('\n📊 Seed Summary:');
    console.log(`   Admin Email: ${admin.email}`);
    console.log('   Admin Password: Admin@123');
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Total Agents: ${totalAgents}`);
    console.log(`   Total Buyers: ${totalBuyers}`);
    console.log(`   Total Properties: ${totalProperties}`);
    console.log(`   Approved Properties: ${approvedProperties}`);
    console.log(`   Pending Properties: ${pendingProperties}`);
    console.log(`   Sold Properties: ${soldProperties}`);
    console.log(`   Total Reviews: ${totalReviews}`);
    console.log(`   Total Purchases: ${totalPurchases}`);
    console.log('\n⚠️  Please change the admin password after first login!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
};

seedAdmin();