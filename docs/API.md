# ZARii AI - API Reference

## Authentication

### Send OTP
```
POST /api/auth/send-otp
Body: { "phone": "+923001234567" }
Response: { "success": true, "message": "OTP sent" }
```

### Verify OTP
```
POST /api/auth/verify-otp
Body: { "phone": "+923001234567", "code": "1234" }
Response: { "token": "jwt-token", "user": {...} }
```

## Disease Detection

### Upload Image for Diagnosis
```
POST /api/diagnose
Headers: Authorization: Bearer <token>
Body: FormData with "image" file
Response: {
  "disease": "Leaf Rust",
  "disease_ur": "پتے کا زنگ",
  "confidence": 94,
  "treatment": "Apply fungicide...",
  "weather": { "temp": 32, "humidity": 65, "city": "Lahore" }
}
```

## Voice Assistant

### Speech to Text
```
POST /api/voice/stt
Headers: Authorization: Bearer <token>
Body: FormData with "audio" file and "lang" ("ur"/"en"/"pa")
Response: { "transcript": "...", "provider": "ElevenLabs Scribe" }
```

### Ask Question
```
POST /api/voice/ask
Headers: Authorization: Bearer <token>
Body: { "text": "My wheat leaves are yellow", "lang": "ur" }
Response: { "answer": "This could be nitrogen deficiency..." }
```

### Text to Speech
```
POST /api/voice/tts
Headers: Authorization: Bearer <token>
Body: { "text": "Answer in Urdu", "lang": "ur", "query_id": "123" }
Response: { "audio_url": "https://...", "provider": "ElevenLabs TTS" }
```

## History

### Get User History
```
GET /api/history
Headers: Authorization: Bearer <token>
Response: { "history": [{ "id": 1, "disease": "...", "created_at": "..." }] }
```

## Admin APIs

### Admin Login
```
POST /api/admin/auth/login
Body: { "email": "admin@zarii.ai", "password": "..." }
Response: { "token": "...", "admin": {...} }
```

### Dashboard Overview
```
GET /api/admin/overview
Headers: Authorization: Bearer <admin-token>
Response: { "total_users": 150, "total_scans": 450, "revenue": ... }
```

### API Keys Management
```
GET /api/admin/api-keys
POST /api/admin/api-keys
Body: { "pool": "vision", "provider": "Gemini", "api_key": "..." }
```

---

*For more details, check wiki/audits/COMPLETE-AUDIT.md*