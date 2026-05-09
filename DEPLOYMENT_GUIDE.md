# Vercel Deployment Guide

## Backend Deployment

### Required Environment Variables in Vercel:

1. **MONGODB_URI** (Required)
   - Get from MongoDB Atlas: https://cloud.mongodb.com
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/eventmitra`
   - **Do NOT use localhost** - Vercel servers need cloud DB

2. **JWT_SECRET** (Required)
   - Generate a strong secret: `openssl rand -base64 64`
   - Or use: `your-super-secret-jwt-key-change-this-in-production`

3. **CLIENT_URL** (Required for CORS)
   - Your frontend Vercel URL: `https://eventmitra-frontend.vercel.app`
   - Or custom domain: `https://eventmitra.com`

4. **NODE_ENV** (Optional but recommended)
   - Set to `production`

### Optional (if using payments):
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET
- RAZORPAY_ACCOUNT_NUMBER

### Deploy Backend:
```bash
cd backend
vercel --prod
```

---

## Frontend Deployment

### Required Environment Variables in Vercel:

1. **VITE_API_BASE_URL**
   - If frontend and backend on same domain (monorepo): `/api`
   - If separate deployments: `https://event-mitra-backend.vercel.app/api`

### Deploy Frontend:
```bash
cd frontend
vercel --prod
```

---

## Common Issues & Solutions

### Issue 1: "ENOENT: no such file or directory, stat '/var/task/frontend/dist/index.html'"
**Cause:** Trying to serve frontend from backend in Vercel monorepo without proper setup.
**Solution:** Deploy frontend and backend as **separate Vercel projects** (recommended).

### Issue 2: CORS Errors
**Cause:** `CLIENT_URL` in backend doesn't match frontend URL.
**Solution:** Set `CLIENT_URL` to your exact frontend Vercel URL.

### Issue 3: MongoDB Connection Failed
**Cause:** Using `localhost` in MONGODB_URI.
**Solution:** Use MongoDB Atlas connection string. Add Vercel's IP to MongoDB Atlas whitelist (or allow all for testing).

### Issue 4: API calls work locally but not on Vercel
**Cause:** Frontend still pointing to `localhost:5000`.
**Solution:** Set `VITE_API_BASE_URL` in frontend Vercel env to production backend URL.

---

## Quick Start (Separate Deployments - Recommended)

1. Deploy backend:
```bash
cd backend
vercel --prod
# Set env vars in Vercel dashboard: MONGODB_URI, JWT_SECRET, CLIENT_URL
```

2. Deploy frontend:
```bash
cd frontend
vercel --prod
# Set env var: VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

3. Update backend `CLIENT_URL` to frontend URL if different.

---

## Verify Deployment

1. Test backend: `https://your-backend.vercel.app/api/health`
2. Test frontend: `https://your-frontend.vercel.app`
3. Check browser console for CORS errors
4. Check Vercel function logs for runtime errors
