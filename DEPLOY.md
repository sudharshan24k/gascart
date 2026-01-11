# Deployment Guide

## 1. Prerequisites
- **GitHub Account**: Push this code to a GitHub repository.
- **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
- **Supabase Project**: Ensure you have your Supabase project ready.

## 2. Deploying the Backend
1. Go to your Vercel Dashboard and click **"Add New Project"**.
2. Import your GitHub repository.
3. **Configure Project**:
   - **Root Directory**: Click "Edit" and select `backend`.
   - **Framework Preset**: Select "Other" (or let it auto-detect, but ensure it doesn't try to use Next.js).
   - **Environment Variables**: Add the following from your `.env`:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**.
5. Once deployed, note down the **assigned domain** (e.g., `https://ecommerce-backend-xyz.vercel.app`).

## 3. Deploying the Frontend
1. Go to your Vercel Dashboard and click **"Add New Project"**.
2. Import the **same** GitHub repository again.
3. **Configure Project**:
   - **Root Directory**: Click "Edit" and select `frontend`.
   - **Framework Preset**: "Vite".
   - **Environment Variables**: Add the following:
     - `VITE_SUPABASE_URL`: Your Supabase URL.
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
     - `VITE_API_URL`: **IMPORTANT** - Set this to your **Backend Deployment URL** from Step 2 (e.g., `https://ecommerce-backend-xyz.vercel.app/api/v1`).
4. Click **Deploy**.

## 4. Verification
- Open your Frontend URL.
- Try adding a product to the cart or logging in.
- If you see Network Errors, check the `VITE_API_URL` variable in your Frontend deployment settings on Vercel.
- Check Vercel Logs for the Backend if API calls fail.
