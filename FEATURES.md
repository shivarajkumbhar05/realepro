# What's New — Enhancement Summary

This build adds the following on top of the original PropEstate app.

## 1. AI Chatbot Assistant (`realestatefrontend/src/components/chat/ChatbotWidget.jsx`)
- Floating chat launcher on every page (bottom-right).
- Understands natural queries like *"2 BHK apartment in Pune under 60 lakh"* and
  returns live, matching listings pulled straight from the database.
- Also answers FAQs about buying, reviews, contacting agents, and document
  verification.
- Backend: `POST /api/chatbot/message` → `controllers/chatbotController.js` →
  `utils/chatbotEngine.js` (rule-based intent/entity engine, no external API
  key required, fully offline).

## 2. WhatsApp Chat
- `components/chat/WhatsAppButton.jsx` exports a floating global support
  button and an inline "Chat on WhatsApp" button.
- On a property page, the inline button opens a WhatsApp chat pre-filled
  with a message to that property's agent, using the agent's phone number.
- Configure the fallback support number via `VITE_WHATSAPP_SUPPORT_NUMBER`
  in `realestatefrontend/.env`.

## 3. Buy & Review Section (on Property Detail page)
- **Buy / Make an Offer**: buyers (and non-owning agents) can submit an offer
  with a price, phone number, and message. Backend model `Purchase`, routes
  under `/api/purchases`. Agents/Admins can accept or decline from the new
  **My Purchases** page (`/purchases`), which lists both sent and received
  requests. Accepting an offer automatically marks the property `sold`/`rented`.
- **Reviews & Ratings**: buyers can leave a 1–5 star rating + comment per
  property. Average rating and review count are cached on the `Property`
  document and shown on both the listing cards and the detail page.
  Backend model `Review`, routes under `/api/reviews`.

## 4. AI Document Testing / Verification System
- `utils/documentAnalyzer.js` runs a deterministic, explainable rules engine
  against each uploaded property document: file existence, size sanity,
  extension vs. expected doc type, suspicious/naming heuristics, and basic
  PDF structural integrity (header/EOF sniffing).
- Produces a 0–100 confidence score, a Verified/Needs-review status, and
  human-readable notes.
- Agents/Admins can trigger a re-scan any time via the "Run AI Verification"
  button on a property's Documents card (`POST /api/properties/:id/documents/verify`).

## 5. Photo Details / Gallery
- `components/property/PhotoGallery.jsx`: full lightbox viewer with
  next/prev navigation, thumbnail strip, and per-photo **captions + room
  tags** (Exterior, Living Room, Bedroom, Kitchen, Bathroom, Balcony).
- Owners/Admins can edit a photo's caption and room tag inline
  (`PATCH /api/properties/:id/images/:filename`).

## 6. Frontend polish
- New "My Purchases" nav item for all roles.
- Star-rating badges on property cards and the detail page.
- Consistent use of the existing design system (primary/gold color tokens,
  `.card`/`.btn-*` classes) so new UI blends with the rest of the app.

---

## Running locally

```bash
# Backend
cd realestatebackend
npm install
npm run dev        # https://realepro.onrender.com

# Frontend
cd realestatefrontend
npm install
npm run dev         # http://localhost:5173
```

Make sure MongoDB is running and `.env` values (JWT secret, Mongo URI, email
credentials) are set — see `realestatebackend/.env`.

No external AI API key is required for the chatbot or document verification
features; both run fully offline using rule-based engines. If you'd like to
swap in a real LLM later, replace the logic in `utils/chatbotEngine.js` and
`utils/documentAnalyzer.js` with calls to your provider of choice.
