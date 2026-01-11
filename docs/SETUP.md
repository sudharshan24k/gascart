# Setup Guide

## Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Supabase Account

## 1. Database Setup (Supabase)

1. Create a new Supabase project.
2. Go to the SQL Editor in Supabase dashboard.
3. Copy the contents of `backend/database/schema.sql` and run it.
   - This will create the tables: `profiles`, `categories`, `products`, `carts`, `orders`, etc.
   - It also enables Row Level Security (RLS) policies.

4. Get your API Credentials:
   - Project URL
   - `anon` public key
   - `service_role` secret key (for backend usage)

## 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
   *Note: If npm is not in your path, ensure you have Node.js installed globally.*

3. Configure Environment Variables:
   - Copy `.env.example` to `.env`.
   - Fill in your Supabase credentials.

4. Start the server:
   ```bash
   npm run dev
   ```
   The backend runs on `http://localhost:3000`.

## 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Create `.env` file (or `.env.local`).
   - Add:
     ```
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:5173`.

## 4. Verification

- Open `http://localhost:5173`.
- Browse products (mock data is initially used in frontend components until API integration is finalized in `services/api.ts`).
- Add items to cart.
- Go to `/login` to authenticate.
- Go to `/admin` to view the dashboard.
