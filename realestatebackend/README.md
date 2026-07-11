# Real Estate Property Listing System — Backend API

Built with **Node.js + Express + MongoDB + JWT + Multer** (MERN Stack Backend)

---

## 🚀 Setup

```bash
cd real-estate-backend
npm install
cp .env.example .env        # Fill in your MONGO_URI and JWT_SECRET
node seed.js                # Create default admin user
npm run dev                 # Start with nodemon (development)
npm start                   # Start (production)
```

---

## 🔐 Roles & Access

| Role    | Can Do                                                          |
|---------|-----------------------------------------------------------------|
| `admin` | Everything — manage users, approve listings, view all data      |
| `agent` | Create/edit/delete **their own** listings, view their listings  |
| `buyer` | View **approved** listings only                                 |

> ⚠️ **All routes (except `/api/auth/register` and `/api/auth/login`) require a valid JWT token.**

---

## 📌 Authentication

Send the token in every request header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📡 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint                    | Access  | Description              |
|--------|-----------------------------|---------|--------------------------|
| POST   | `/register`                 | Public  | Register (buyer/agent)   |
| POST   | `/login`                    | Public  | Login & get JWT          |
| GET    | `/me`                       | Private | Get current user info    |
| PUT    | `/updateprofile`            | Private | Update name/phone/avatar |
| PUT    | `/changepassword`           | Private | Change password          |
| GET    | `/logout`                   | Private | Logout (clear token)     |

**Register Body:**
```json
{ "name": "John", "email": "john@email.com", "password": "pass123", "role": "agent", "phone": "9876543210" }
```

**Login Body:**
```json
{ "email": "john@email.com", "password": "pass123" }
```

---

### Property Routes — `/api/properties`

| Method | Endpoint                        | Access           | Description                |
|--------|---------------------------------|------------------|----------------------------|
| GET    | `/`                             | All (logged in)  | List/search/filter listings|
| GET    | `/:id`                          | All (logged in)  | Get single property        |
| POST   | `/`                             | admin, agent     | Create property            |
| PUT    | `/:id`                          | admin, agent     | Update property            |
| DELETE | `/:id`                          | admin, agent     | Soft-delete property       |
| PATCH  | `/:id/approve`                  | admin only       | Approve a listing          |
| DELETE | `/:id/images/:filename`         | admin, agent     | Delete a specific image    |

**Create/Update — multipart/form-data fields:**
```
title, description, type, status, price, area, areaUnit,
bedrooms, bathrooms, floors, parking, furnished,
address, city, state, pincode, lat, lng, amenities
images[]     (files — max 10, 5MB each)
documents[]  (files — max 5, 10MB each)
```

**Query Params for GET /:**
```
type, status, city, minPrice, maxPrice, minArea, maxArea,
bedrooms, furnished, parking, search,
page, limit, sortBy, order
```

---

### Admin Routes — `/api/admin` (admin only)

| Method | Endpoint                | Description                    |
|--------|-------------------------|--------------------------------|
| GET    | `/dashboard`            | Stats + analytics              |
| GET    | `/users`                | All users (filter by role)     |
| POST   | `/users`                | Create user (any role)         |
| PUT    | `/users/:id`            | Update role / activate status  |
| DELETE | `/users/:id`            | Deactivate user                |
| GET    | `/pending-properties`   | Listings awaiting approval     |

---

## 📁 Project Structure

```
real-estate-backend/
├── config/
│   └── db.js               # MongoDB connection
├── controllers/
│   ├── authController.js   # Register, login, profile
│   ├── propertyController.js # CRUD + search
│   └── adminController.js  # Dashboard, user management
├── middleware/
│   ├── auth.js             # JWT protect + role authorize
│   └── upload.js           # Multer config (images/docs/avatar)
├── models/
│   ├── User.js             # User schema (bcrypt, roles)
│   └── Property.js         # Property schema (indexes)
├── routes/
│   ├── authRoutes.js
│   ├── propertyRoutes.js
│   └── adminRoutes.js
├── uploads/
│   ├── properties/         # Property images
│   ├── documents/          # Property documents
│   └── avatars/            # User avatars
├── .env.example
├── seed.js                 # Creates default admin
├── server.js               # Entry point
└── package.json
```

---

## 🔑 Default Admin (after running seed.js)

```
Email:    admin@realestate.com
Password: Admin@123
```
> Change this immediately after first login!

---

## 🛡️ Security Features

- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWT tokens expire in **7 days** (configurable)
- Role-based access on every route
- Soft-delete (data never permanently removed)
- Multer file-type validation
- Global error handler with Mongoose error parsing
