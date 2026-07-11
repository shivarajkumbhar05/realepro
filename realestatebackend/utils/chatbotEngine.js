const Property = require('../models/Property');

/**
 * PropEstate Assistant — rule-based conversational engine
 * ───────────────────────────────────────────────────────────────────────────
 * Parses free-text messages for intent (greeting, search, price, contact,
 * documents, help) and entities (city, property type, bedrooms, budget,
 * sale/rent) and responds conversationally, querying live listings from
 * MongoDB when the user is looking for properties. Works fully offline —
 * no external LLM API key required.
 */

const CITIES = ['mumbai', 'pune', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata', 'sangli', 'nagpur', 'ahmedabad', 'noida', 'gurgaon', 'gurugram', 'jaipur', 'surat', 'kolhapur'];
const TYPES = ['apartment', 'house', 'villa', 'plot', 'commercial', 'office', 'flat'];
const TYPE_ALIASES = { flat: 'apartment' };

function extractEntities(text) {
  const lower = text.toLowerCase();
  const entities = {};

  const city = CITIES.find((c) => lower.includes(c));
  if (city) entities.city = city === 'bengaluru' ? 'bangalore' : city === 'gurugram' ? 'gurgaon' : city;

  const type = TYPES.find((t) => lower.includes(t));
  if (type) entities.type = TYPE_ALIASES[type] || type;

  if (/\brent\b/.test(lower)) entities.status = 'rent';
  if (/\b(buy|sale|sell|purchase)\b/.test(lower)) entities.status = 'sale';

  const bhkMatch = lower.match(/(\d+)\s*(bhk|bed|bedroom)/);
  if (bhkMatch) entities.bedrooms = Number(bhkMatch[1]);

  // budget e.g. "under 50 lakh", "below 1 crore", "50000-80000"
  const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*lakh/);
  const croreMatch = lower.match(/(\d+(?:\.\d+)?)\s*crore/);
  if (lakhMatch) entities.maxPrice = Number(lakhMatch[1]) * 100000;
  if (croreMatch) entities.maxPrice = Number(croreMatch[1]) * 10000000;

  return entities;
}

function detectIntent(text) {
  const lower = text.toLowerCase();
  if (/\b(hi|hello|hey|namaste|good morning|good evening)\b/.test(lower)) return 'greeting';
  if (/\b(map|location|near me|coordinates|pin|address on map)\b/.test(lower)) return 'map';
  if (/\b(approve|approval|pending|review process|how long.*approv)\b/.test(lower)) return 'approval';
  if (/\b(password|forgot|reset|otp|login issue|can'?t log ?in|locked out)\b/.test(lower)) return 'account';
  if (/\b(document|verify|verification|noc|title deed|legal)\b/.test(lower)) return 'documents';
  if (/\b(contact|agent|call|whatsapp|phone|talk to)\b/.test(lower)) return 'contact';
  if (/\b(review|rating|feedback)\b/.test(lower)) return 'reviews';
  if (/\b(buy|purchase|offer|book|invest)\b/.test(lower)) return 'buy';
  if (/\b(list|sell my|post a property|become an agent|add property)\b/.test(lower)) return 'sell';
  if (/\b(help|what can you do|options)\b/.test(lower)) return 'help';
  if (
    /\b(house|apartment|villa|plot|flat|property|properties|rent|bhk|office|commercial)\b/.test(lower) ||
    Object.keys(extractEntities(text)).length > 0
  ) {
    return 'search';
  }
  return 'fallback';
}

async function buildSearchReply(entities, requester) {
  const query = { isActive: true, isApproved: true };
  if (entities.city) query['location.city'] = { $regex: entities.city, $options: 'i' };
  if (entities.type) query.type = entities.type;
  if (entities.status) query.status = entities.status;
  if (entities.bedrooms) query.bedrooms = { $gte: entities.bedrooms };
  if (entities.maxPrice) query.price = { $lte: entities.maxPrice };

  const properties = await Property.find(query)
    .select('title price status type location bedrooms bathrooms area areaUnit')
    .sort({ createdAt: -1 })
    .limit(5);

  if (properties.length === 0) {
    return {
      text:
        "I couldn't find any matching listings right now" +
        (entities.city ? ` in ${cap(entities.city)}` : '') +
        ". Try widening your search — a different city, budget, or property type — or browse all properties from the sidebar.",
      properties: [],
    };
  }

  const filterDesc = [
    entities.type ? cap(entities.type) : 'Properties',
    entities.status ? `for ${entities.status}` : '',
    entities.city ? `in ${cap(entities.city)}` : '',
    entities.bedrooms ? `(${entities.bedrooms}+ BHK)` : '',
    entities.maxPrice ? `under ₹${entities.maxPrice.toLocaleString('en-IN')}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    text: `I found ${properties.length} listing${properties.length > 1 ? 's' : ''} — ${filterDesc}:`,
    properties: properties.map((p) => ({
      id: p._id,
      title: p.title,
      price: p.price,
      status: p.status,
      type: p.type,
      city: p.location?.city,
      bedrooms: p.bedrooms,
      area: p.area,
      areaUnit: p.areaUnit,
    })),
  };
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const GREETINGS = [
  (name) => `Hi ${name} 👋 I'm the PropEstate Assistant. I can help you find properties, explain how document verification works, connect you with an agent, or answer questions about buying and reviews. What are you looking for today?`,
  (name) => `Hello ${name}! Ready to find a place? Tell me a city, budget, or BHK and I'll pull up matching listings.`,
  (name) => `Hey ${name} 🏡 Ask me anything — property search, the approval process, map locations, or your account. What do you need?`,
];

async function respond(message, user) {
  const intent = detectIntent(message);
  const entities = extractEntities(message);
  const firstName = user?.name?.split(' ')[0] || 'there';

  switch (intent) {
    case 'greeting': {
      const pick = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
      return { text: pick(firstName), properties: [] };
    }

    case 'search':
      return await buildSearchReply(entities, user);

    case 'map':
      return {
        text: 'Every approved property shows an interactive map with its exact pinned location on the property detail page. You can also switch to "Map" view on the Browse Properties page to see all approved listings plotted at once. Listings only appear on the map after an admin approves them — pending listings show a placeholder until then.',
        properties: [],
      };

    case 'approval':
      if (user?.role === 'agent') {
        return {
          text: "New listings you submit go to 'Pending Approval' until an admin reviews them, checks your uploaded documents, and approves the listing. Once approved, it becomes visible to buyers, appears on the map, and buyers can submit purchase offers. You can track a listing's status from \"My Listings\".",
          properties: [],
        };
      }
      if (user?.role === 'admin') {
        return {
          text: 'You can review and approve pending listings from "Pending Approval" in the sidebar, and manage every user (buyers and agents) from "Users". Approving a listing makes it public, visible on the map, and eligible for purchase offers.',
          properties: [],
        };
      }
      return {
        text: 'Every property listed by an agent is reviewed by an admin — including document checks — before it goes live. That\'s why some listings show a "Pending Approval" badge; once approved, they\'re fully visible with map location and open for offers.',
        properties: [],
      };

    case 'account':
      return {
        text: 'If you\'re locked out, use "Forgot Password?" on the login page — we\'ll email you a 6-digit OTP to verify your identity, then let you set a new password. You can also update your profile info, phone, and avatar anytime from the Profile page.',
        properties: [],
      };

    case 'documents':
      return {
        text: 'Every property listing can attach documents (title deed, NOC, floor plan). Our automated document testing system checks file integrity, format, and naming patterns and gives each document a confidence score. Listings show a "Verified" or "Needs review" badge next to each document. Admins can trigger re-verification any time from the property page.',
        properties: [],
      };

    case 'contact':
      return {
        text: "You can reach the listing agent directly from any property page — there's an email, phone, and WhatsApp button in the sidebar. Open a property you're interested in and tap the green WhatsApp icon to start chatting instantly. You can also reach PropEstate support from the Contact page linked in the footer.",
        properties: [],
      };

    case 'reviews':
      return {
        text: 'Buyers who are interested in a property can leave a star rating and written review on the property detail page, under "Reviews & Ratings". This helps other buyers gauge trust in a listing or agent.',
        properties: [],
      };

    case 'buy':
      return {
        text: 'To buy a property, open its detail page and click "Buy / Make an Offer". You can submit your offer price and a message — the agent will be notified and can accept or decline your request. You can track your requests from "My Purchases".',
        properties: [],
      };

    case 'sell':
      return {
        text: 'If you want to list a property, register or log in as an Agent, then go to "My Listings → Add Property". Pin the exact location on the map, attach your documents, and an admin will review and approve your listing before it goes live.',
        properties: [],
      };

    case 'help': {
      const base = 'Here\'s what I can help with:\n• Find properties by city, type, budget, or BHK (e.g. "2 BHK apartment in Pune under 60 lakh")\n• Explain how buying and offers work\n• Explain document verification and the admin approval process\n• Help you contact an agent (call, email, or WhatsApp)\n• Explain map locations and reviews & ratings\n• Help with login, password reset, and your account';
      const adminExtra = '\n• As an admin, ask me about approving listings or managing users';
      const agentExtra = '\n• As an agent, ask me about listing a property or tracking approval status';
      return {
        text: base + (user?.role === 'admin' ? adminExtra : user?.role === 'agent' ? agentExtra : ''),
        properties: [],
      };
    }

    default:
      return {
        text: "I'm not sure I caught that — try asking me something like \"2 BHK flat for rent in Mumbai\", \"how does approval work?\", or \"how do I contact an agent?\". You can also type \"help\" to see everything I can do.",
        properties: [],
      };
  }
}

module.exports = { respond, extractEntities, detectIntent };
