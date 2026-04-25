# DriveEase — Car Rental Platform

A full-stack car rental web app built with React + Vite, Node.js + Express, and Supabase.

---

## Project Structure

```
/
├── carrental-app/     # React + Vite frontend
├── backend/           # Node.js + Express API
├── supabase-schema.sql          # Main database schema
└── create-notifications-table.sql  # Notifications table
```

---

## Local Development

### 1. Backend
```bash
cd backend
# Copy env and fill in your values
cp .env.example .env
node server.js
# Runs on http://localhost:5000
```

### 2. Frontend
```bash
cd carrental-app
npm install
npm run dev
# Runs on http://localhost:5173
```

### Default Credentials
| Role  | Username/Email | Password |
|-------|---------------|----------|
| Admin | admin | Test@12345 |
| User  | Register a new account | — |

---

## Deployment on Vercel

### Deploy Backend

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repo, set **Root Directory** to `backend`
4. Add these **Environment Variables**:

```
SUPABASE_URL=https://tmfbhwktuvpjxlumyytz.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=driveease-super-secret-key-2026-do-not-change
NODE_ENV=production
RESEND_API_KEY=your-resend-api-key
ADMIN_EMAIL=your-admin@email.com
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

5. Deploy → note the URL e.g. `https://driveease-api.vercel.app`

### Deploy Frontend

1. Go to Vercel → New Project
2. Import same repo, set **Root Directory** to `carrental-app`
3. Add this **Environment Variable**:

```
VITE_API_URL=https://driveease-api.vercel.app/api
```

4. Deploy

### After Both Are Deployed

Go back to the **backend** Vercel project → Settings → Environment Variables  
Update `ALLOWED_ORIGINS` to your actual frontend URL:
```
ALLOWED_ORIGINS=https://your-actual-frontend.vercel.app
```
Then redeploy the backend.

---

## Features

- Browse & search vehicles with brand/fuel/price filters
- User registration & login (JWT, 30-day tokens)
- Car booking with date conflict detection
- My Bookings with car images and status
- In-app notifications (bell icon) for users and admin
- Email notifications via Resend:
  - User receives email when booking is submitted
  - User receives email when booking is confirmed/cancelled
  - Admin receives email when a new booking is made
- Admin dashboard with stats
- Admin vehicle management (add/edit/delete with image upload to Supabase Storage)
- Admin booking management (confirm/cancel with one click)
- Contact form, newsletter subscription
- CMS pages (About, Terms, Privacy, FAQs)
# DriveEase
