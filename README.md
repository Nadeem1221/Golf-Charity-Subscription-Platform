# ⛳ Golf Charity Platform

Hey there! Welcome to the Golf Charity Platform. I built this full-stack MERN application to combine golf performance tracking, charity giving, and monthly prize draws into one seamless platform.

It handles everything from user subscriptions via Stripe, to calculating dynamic monthly prize pools, and generating algorithmic lottery draws based on players' actual golf scores!

## 🚀 Tech Stack
- **Frontend:**  React 18, React Router v6
- **Backend:**   Node.js, Express.js
- **Database:**  MongoDB Atlas
- **Payments:**  Stripe (Checkout Sessions + Webhooks)
- **Auth & Security:** JWT Auth, bcryptjs

## ⚙️ Quick Local Setup

To get this running on your local machine, follow these steps:

### 1. Install Dependencies
```bash
npm run install-all
```
*(This automatically installs the root, backend, and frontend dependencies all at once).*

### 2. Environment Variables
You'll need to set up your environment variables. Copy the example files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Make sure you fill in your `MONGODB_URI`, `JWT_SECRET`, and your **Stripe API Keys** (including your Product Price IDs for the $60/month and $650/year subscriptions) inside the `.env` files.

### 3. Start the Servers
```bash
npm run dev
```
The application will boot up concurrently:
- **Frontend Interface:** http://localhost:3000
- **Backend API Server:** http://localhost:5000

## 🔑 Admin Access
The system automatically creates an admin account on your first run. You can access the Admin Panel using:
- **Email:** `admin@golfcharity.com`
- **Password:** `Admin@123456`

*(Tip: Remember to change your admin details in your `.env` once you go to production!)*

## 💡 Core Features
- **Subscription Management:** Users subscribe to enter draws. At least 10% of revenue goes to a charity of their choice, and 60% feeds the prize pool.
- **Score Tracking:** Active players maintain a rolling 5-score performance window.
- **Monthly Draw Engine:** Admins can simulate and execute monthly prize draws (Random or Algorithmic calculations based on user scores).
- **Admin Dashboard:** Full control over managing users, verifying winnings via uploaded screenshot proofs, managing charities, and executing draws. 
