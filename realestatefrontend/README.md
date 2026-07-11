# Real Estate Frontend

Built with **React + Vite + Tailwind CSS**

## Setup

```bash
npm install
cp .env.example .env   # Set VITE_API_URL to your backend URL
npm run dev
```

## Role-Based Access

| Role    | Access                                          |
|---------|-------------------------------------------------|
| `admin` | Dashboard stats, all properties, users, pending approvals |
| `agent` | My listings (create/edit/delete), browse all    |
| `buyer` | Browse approved listings only                   |

## Pages

- `/login` – Login
- `/register` – Register (buyer or agent)
- `/dashboard` – Role-specific dashboard with charts (admin) or quick actions
- `/properties` – Browse & search/filter all properties
- `/properties/:id` – Property detail with image gallery
- `/agent/my-listings` – Agent's own listings table
- `/agent/my-listings/new` – Create property
- `/agent/my-listings/:id/edit` – Edit property
- `/admin/users` – Manage users (create, role change, deactivate)
- `/admin/pending` – Approve/reject pending listings
- `/profile` – Update profile info, avatar, password

## Features

- JWT auth stored in localStorage
- Axios interceptors for auto token injection + 401 redirect
- Responsive sidebar navigation (mobile drawer + desktop static)
- Filter panel for properties (type, status, city, price, bedrooms)
- Image gallery with thumbnail strip
- Charts on admin dashboard (recharts)
- Toast notifications (react-hot-toast)
- Role-guard route components

## Default Admin Credentials

```
Email:    admin@realestate.com
Password: Admin@123
```
