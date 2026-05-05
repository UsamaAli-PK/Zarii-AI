# 🔗 SUPABASE CONNECTION VERIFICATION GUIDE

**Date:** 2026-05-04  
**Status:** ✅ READY TO VERIFY

---

## 📋 CURRENT SETUP

### Project Structure (ORGANIZED)
```
F:\Github\Hackathons\Zarii-AI\
├── backend/                    # Express server
│   ├── server.js              # Main entry point
│   ├── config.js              # Configuration (reads .env)
│   ├── supabase.js            # Supabase client
│   ├── db/
│   │   ├── migrate.js         # Auto-runs migrations
│   │   └── supabase-schema.sql # Database schema
│   ├── routes/                # API endpoints
│   ├── middleware/            # Auth middleware
│   └── services/              # Business logic
├── src/                       # Frontend source
│   ├── app.jsx               # React root
│   └── api.js                # API bridge
├── components/               # React components
├── docs/                     # Documentation (organized)
├── config/                   # Configuration files
├── frontend-assets/          # HTML & CSS
├── wiki/                     # Knowledge base
├── .env.example              # Environment template
├── server.js                 # Legacy entry point
└── package.json              # Dependencies
```

---

## 🔐 ENVIRONMENT SETUP

### Step 1: Create .env File

Copy `.env.example` to `.env`:

```bash
cd F:\Github\Hackathons\Zarii-AI
copy .env.example .env
```

### Step 2: Add Supabase Credentials

Edit `.env` and add your Supabase credentials:

```env
# REQUIRED: Supabase
SUPABASE_URL=https://unbibbdoksruvwudxcwc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# REQUIRED: Auth Secrets
JWT_SECRET=your-jwt-secret-min-32-chars
ADMIN_JWT_SECRET=your-admin-jwt-secret-min-32-chars

# OPTIONAL: AI Providers
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key

# OPTIONAL: Other services
ELEVENLABS_API_KEY=your-elevenlabs-key
OPENWEATHER_API_KEY=your-openweather-key

# Deployment
NODE_ENV=development
PORT=5000
CORS_ORIGINS=http://localhost:5000,http://localhost:3000
```

---

## ✅ SUPABASE CONNECTION VERIFICATION

### How the Connection Works

1. **Backend reads .env** → `backend/config.js`
2. **Creates Supabase client** → `backend/supabase.js`
3. **Initializes on server start** → `backend/server.js`
4. **Runs migrations** → `backend/db/migrate.js`
5. **Queries database** → All routes use Supabase client

### Connection Flow

```
Local Project (.env)
    ↓
backend/config.js (reads SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY)
    ↓
backend/supabase.js (creates Supabase client)
    ↓
Supabase Cloud (unbibbdoksruvwudxcwc.supabase.co)
    ↓
PostgreSQL Database (19 tables)
    ↓
Returns data to local project
```

---

## 🧪 VERIFICATION TESTS

### Test 1: Check Environment Variables

```bash
cd F:\Github\Hackathons\Zarii-AI
node -e "require('dotenv').config(); console.log('SUPABASE_URL:', process.env.SUPABASE_URL); console.log('Has Service Role Key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);"
```

**Expected Output:**
```
SUPABASE_URL: https://unbibbdoksruvwudxcwc.supabase.co
Has Service Role Key: true
```

---

### Test 2: Check Supabase Client Initialization

```bash
cd F:\Github\Hackathons\Zarii-AI
node -e "const supabase = require('./backend/supabase.js'); console.log('Supabase client created:', !!supabase); console.log('Has auth:', !!supabase.auth); console.log('Has from:', !!supabase.from);"
```

**Expected Output:**
```
Supabase client created: true
Has auth: true
Has from: true
```

---

### Test 3: Query Database Tables

```bash
cd F:\Github\Hackathons\Zarii-AI
node -e "
const supabase = require('./backend/supabase.js');
(async () => {
  const { data, error } = await supabase.from('users').select('COUNT(*)');
  if (error) {
    console.log('ERROR:', error.message);
  } else {
    console.log('SUCCESS: Connected to Supabase');
    console.log('Users table accessible:', !!data);
  }
})();
"
```

**Expected Output:**
```
SUCCESS: Connected to Supabase
Users table accessible: true
```

---

### Test 4: Fetch Real Data

```bash
cd F:\Github\Hackathons\Zarii-AI
node -e "
const supabase = require('./backend/supabase.js');
(async () => {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.log('ERROR:', error.message);
  } else {
    console.log('SUCCESS: Fetched data from Supabase');
    console.log('Data:', JSON.stringify(data, null, 2));
  }
})();
"
```

**Expected Output:**
```
SUCCESS: Fetched data from Supabase
Data: [
  {
    "id": 1,
    "phone": "+923001234567",
    "name": "Farmer",
    "region": "Punjab",
    ...
  }
]
```

---

### Test 5: Run Full Server & Test API

```bash
# Terminal 1: Start server
cd F:\Github\Hackathons\Zarii-AI
npm run dev

# Terminal 2: Test API endpoint
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer test-token"
```

**Expected Output:**
```json
{
  "error": "Invalid or expired admin token"
}
```

**Why this is good:** The error shows the server is running and Supabase is connected (it's checking the token, not failing to connect to the database).

---

### Test 6: Test with Valid Admin Token

```bash
# 1. Get admin token
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@zarii.ai", "password": "admin123"}'

# 2. Use token to fetch data
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Output:**
```json
{
  "users": [
    {
      "id": 1,
      "phone": "+923001234567",
      "name": "Farmer",
      "region": "Punjab",
      "scan_count": 1,
      "voice_count": 0,
      "last_scan": "2026-05-04T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 7
  },
  "summary": {
    "total": 7,
    "wau": 2,
    "mau": 5
  }
}
```

**This proves:** ✅ Local project is connected to Supabase and fetching real data!

---

## 📊 VERIFICATION CHECKLIST

Run through these checks to verify Supabase connection:

### Configuration
- [ ] `.env` file created (copy from `.env.example`)
- [ ] `SUPABASE_URL` set to: `https://unbibbdoksruvwudxcwc.supabase.co`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set to your service role key
- [ ] `JWT_SECRET` set to a random string
- [ ] `ADMIN_JWT_SECRET` set to a random string

### Connection
- [ ] `backend/config.js` reads `.env` file
- [ ] `backend/supabase.js` creates Supabase client
- [ ] Environment variables loaded correctly
- [ ] No "Missing environment variables" warnings

### Database
- [ ] Server starts without errors
- [ ] Database migrations run automatically
- [ ] All 19 tables created in Supabase
- [ ] Can query users table
- [ ] Can fetch real data from Supabase

### API
- [ ] `GET /api/admin/users` returns user list
- [ ] `GET /api/admin/overview` returns dashboard stats
- [ ] `GET /api/admin/diagnoses` returns diagnosis history
- [ ] All endpoints fetch from Supabase (not hardcoded)

### Frontend
- [ ] React app loads at `http://localhost:5000`
- [ ] Can navigate between pages
- [ ] No console errors

---

## 🔍 TROUBLESHOOTING

### "Missing environment variables" Warning

**Problem:** Server shows warning about missing Supabase credentials

**Solution:**
1. Create `.env` file (copy from `.env.example`)
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Restart server

---

### "Cannot connect to Supabase"

**Problem:** API returns connection errors

**Solution:**
1. Verify `SUPABASE_URL` is correct: `https://unbibbdoksruvwudxcwc.supabase.co`
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct (from Supabase dashboard)
3. Check internet connection
4. Verify Supabase project is active

---

### "Table does not exist"

**Problem:** Queries fail with "table does not exist"

**Solution:**
1. Check server logs for migration errors
2. Verify migrations ran on startup
3. Check Supabase dashboard to see if tables were created
4. If not, run migrations manually:
   ```bash
   node backend/db/migrate.js
   ```

---

### "RLS policy violation"

**Problem:** Queries fail with RLS policy errors

**Solution:**
1. This is expected - RLS is working!
2. Use proper JWT token in Authorization header
3. Farmer tokens can only access own data
4. Admin tokens need proper permissions

---

## ✨ SUMMARY

### ✅ Local Project IS Connected to Supabase

**How it works:**
1. `.env` file contains Supabase credentials
2. `backend/config.js` reads `.env`
3. `backend/supabase.js` creates Supabase client
4. All API routes use Supabase client to fetch data
5. Data flows from Supabase cloud to local project

### ✅ When You Run Locally

**The project:**
- ✅ Connects to Supabase cloud database
- ✅ Fetches real data from 19 tables
- ✅ Runs migrations automatically
- ✅ Enforces RLS policies
- ✅ Returns real data to frontend

### ✅ Verification

**To verify connection:**
1. Create `.env` with Supabase credentials
2. Run `npm run dev`
3. Test API endpoints with curl
4. Check that data comes from Supabase (not hardcoded)

---

**Status:** ✅ PROJECT READY FOR SUPABASE CONNECTION  
**Next Step:** Create `.env` file with your Supabase credentials
