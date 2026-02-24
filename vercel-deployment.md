### 1. Push Fixes
Final fix for routing and protocol errors:
```powershell
git add .
git commit -m "Fix: Protocol-safe API routing"
git push
```

### 2. Check Build Logs
In Vercel Dashboard, ensure the **Root Directory** is NOT set (leave it at the top level).

### 3. Environment Variables (Required)
Go to **Vercel Settings > Environment Variables**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` -> **RECOMMENDED: Leave this EMPTY** (it will now correctly use relative `/api` paths).

### 4. API Routing
The new code automatically detects if it's on Vercel and uses relative paths without triggering "Name Not Resolved" errors.
