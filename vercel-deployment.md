# Vercel Deployment Guide

### 1. Push Fixes
Run these commands to apply the routing fix:
```powershell
git add vercel.json
git commit -m "Fix: Explicit routing for Vercel"
git push
```

### 2. Check Build Logs
Go to your **Vercel Dashboard > Deployments** and click on the latest build. 
> [!IMPORTANT]
> If you still see a 404, check the **Build Logs** to ensure the `frontend` part finished successfully.

### 3. Environment Variables (Critical)
Ensure these are in **Vercel Settings > Environment Variables**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` -> **Set this to `/api`** (or leave it empty)

### 4. API Routing
Your frontend should now automatically find the backend at `/api/`.
