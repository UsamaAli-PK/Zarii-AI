# ZARii AI - Deployment Guide

## Vercel Deployment

### Step 1: Prepare Repository
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Framework: Other

### Step 3: Environment Variables
Add these in Vercel dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| SUPABASE_URL | From Supabase dashboard |
| SUPABASE_ANON_KEY | From Supabase settings |
| JWT_SECRET | Generate secure random string |
| ENCRYPT_KEY | 32 character random string |

### Step 4: Deploy
Click Deploy. Your app will be live at `https://your-project.vercel.app`

---

## Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note the URL and anon key

### Run Schema
The schema auto-runs on server startup via `runMigrations()` in `server.js`.

### Configure Storage
1. Create bucket named `scans`
2. Add policies for public read access

---

## Testing Voice Assistant

### Add API Keys via Admin Panel
1. Go to `/#admin`
2. Login as admin
3. Navigate to API Keys tab
4. Add keys:
   - **Vision Pool**: Gemini API key
   - **Voice Pool**: ElevenLabs API key

### Test Flow
1. Open app → Voice
2. Click mic button
3. Speak in Urdu/Punjabi/English
4. Receive voice response

---

## Troubleshooting

### Issue: "Too many redirects"
**Fix**: Clear browser cookies and cache

### Issue: Voice not working
**Fix**: Check API keys are added in Admin Panel → API Keys

### Issue: Images not uploading
**Fix**: Verify Supabase storage bucket exists and has correct policies

---

*Last updated: May 2026*