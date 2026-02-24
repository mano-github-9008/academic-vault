### 1. Push Final Fixes
This completely removes dependency on the API URL variable:
```powershell
git add .
git commit -m "Fix: Standardized relative API paths"
git push
```

### 2. Check Build Logs
In Vercel Dashboard, ensure the **Root Directory** is NOT set (keep it empty).

### 3. Environment Variables (Required)
Go to **Vercel Settings > Environment Variables**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- **REMOVE `VITE_API_URL`** (It is no longer used by the code).

### 4. Verification
Once the build is done, try navigating to a specific semester or the video library. The relative paths will now correctly route via the Vercel proxy.
