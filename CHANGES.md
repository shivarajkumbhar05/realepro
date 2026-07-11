# PropEstate — Update Notes (This Revision)

## 1. Role-based portal themes
- `tailwind.config.js` + `src/index.css` now drive the `primary-*` color scale from CSS variables.
- Four theme classes: `.theme-guest` (blue, login/register/public pages), `.theme-buyer` (emerald),
  `.theme-agent` (indigo), `.theme-admin` (rose). Applied automatically by `Layout.jsx` based on
  the logged-in user's role, and by the auth/public pages for guests.
- Sidebar now shows a small "Admin Control Room / Agent Workspace / Buyer Portal" badge.

## 2. Multi-role login
- Already used a single login form with server-driven role redirect — confirmed working, fixed a
  duplicate/broken nested `<form>` bug in `Login.jsx`.
- Registration lets new users sign up as Buyer or Agent (Admin accounts are created by an existing admin).

## 3. Forgot password
- `ForgetPassword.jsx` (OTP + reset flow) is now actually wired into the router at `/forgot-password`
  (it existed before but had no route!). Login page's "Forgot Password?" link now works end-to-end.

## 4. Terms / Privacy / About / Contact
- New public pages under `src/pages/public/` (`Terms.jsx`, `Privacy.jsx`, `About.jsx`, `Contact.jsx`),
  reachable without logging in.
- Linked from the Login, Register, and Forgot Password screens (shared `AuthFooter` component), and
  from a new footer in the main app `Layout` so they're always reachable after logging in too.

## 5. Map integration (post-approval)
- Added `leaflet` + `react-leaflet` (OpenStreetMap tiles — no API key needed).
- `components/map/PropertyMap.jsx`: shows a property's pinned location on its detail page. Hidden
  from buyers until an admin approves the listing (owners/admins get a "preview" first).
- `components/map/LocationPicker.jsx`: lets agents/admins click-to-pin a location (or search an
  address / use current location) when creating or editing a listing.
- `components/map/AllPropertiesMap.jsx`: new "Map" view toggle on the Browse Properties page,
  plotting every **approved** property at once.

## 6. Enhanced chatbot
- `utils/chatbotEngine.js`: added intents for map/location questions, the approval process
  (role-aware answers for buyer/agent/admin), and account/password help; greeting responses now vary.
- `ChatbotWidget.jsx`: quick-suggestion chips are now role-aware (different prompts for buyer, agent,
  admin) and stay visible longer; added a "reset chat" button.

## 7. Admin panel — full user/agent visibility
- New endpoint `GET /api/admin/users/:id` returns a 360° view: profile, listed properties (with
  approval status), purchase offers made/received, and reviews written.
- `AdminUsers.jsx` gained a "View" (eye icon) action opening a detail modal with all of the above.

## Setup reminder
```
cd realestatebackend && npm install && npm run dev
cd realestatefrontend && npm install && npm run dev
```
The frontend build was verified (`npm run build`) after these changes.
