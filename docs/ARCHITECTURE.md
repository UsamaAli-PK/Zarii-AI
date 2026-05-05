# ZARii AI - Technical Documentation

## Architecture Overview

ZARii AI is a bilingual agricultural AI assistant built with a CDN-based frontend and Express.js backend, using Supabase for database and storage.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  Express    │────▶│  Supabase   │
│  (React 18)  │     │   Server    │     │  (Postgres) │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
               ┌────▼────┐   ┌───▼────┐
               │ Gemini  │   │11Labs  │
               │ Vision  │   │ Voice  │
               └─────────┘   └────────┘
```

## Data Flow

### 1. Disease Detection Flow
```
User Image → /api/diagnose → Vision AI (Gemini) → Treatment AI → Response
```

1. User uploads crop image
2. Server sends to Vision AI (Gemini 2.5)
3. AI returns disease name + confidence
4. Second AI call gets treatment recommendations
5. Response with weather context

### 2. Voice Assistant Flow
```
User Voice → STT (ElevenLabs Scribe) → Gemini AI → TTS (ElevenLabs) → Audio
```

1. User records voice message
2. Audio sent to ElevenLabs Scribe → text
3. Text sent to Gemini → answer
4. Answer sent to ElevenLabs TTS → audio
5. Audio played to user

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | Farmer accounts |
| `scans` | Disease scan records |
| `voice_queries` | Voice assistant queries |
| `api_keys` | Encrypted AI API keys |
| `catalog` | Product catalog |
| `sponsors` | Sponsor products |
| `admin_users` | Admin accounts |

### Key Columns (scans)
- `image_url` - Uploaded image
- `disease_name` - Detected disease
- `treatment` - AI recommendation
- `city` - Location at time of scan
- `weather_temp` - Temperature
- `weather_humidity` - Humidity
- `input_lang` - Language used (ur/en/pa)

## Security

### API Key Encryption
- AES-256-CBC encryption
- Keys stored encrypted in database
- Decrypted only when making API calls

### Authentication
- JWT tokens for users
- Role-based access for admins
- OTP verification for phone auth

## Configuration

### Environment Variables
```env
SUPABASE_URL=<supabase-project-url>
SUPABASE_ANON_KEY=<anon-key>
GEMINI_API_KEY=<gemini-key>
ELEVENLABS_API_KEY=<elevenlabs-key>
JWT_SECRET=<secret>
ENCRYPT_KEY=<32-char-key>
```

### API Keys Pool
API keys are managed in the Admin Panel under "API Keys" tab. Keys are organized into pools:
- **vision** - Gemini, OpenAI (for disease detection)
- **voice** - ElevenLabs, Groq (for STT/TTS)
- **weather** - OpenWeatherMap

## Error Handling

### Failover Chain
If primary AI provider fails, system automatically tries next available key in the pool.

### Rate Limiting
- Global: 100 requests/15 min
- Auth: 5 requests/15 min
- Admin: 10 requests/15 min

## Deployment

### Vercel
- Deploys backend as serverless functions
- Serves frontend from `/` route
- Environment variables configured in Vercel dashboard

### Supabase
- Managed PostgreSQL
- RLS policies enabled
- Storage for images and audio

---

*Last updated: May 2026*