# Source: DOCUMENTATION.md

## Summary
Comprehensive technical documentation covering architecture, database schema, API reference, and security for ZARii AI (Version 1.0.0).

## Key Takeaways
- **Architecture**: Express server serving both JSON API and React SPA. Uses AI failover chain (Gemini -> GPT-4o -> Mock).
- **Database**: 19 tables in Supabase (PostgreSQL 17.6). RLS enabled. Backend uses `service_role` key.
- **Auth**: Phone-based auth via OTP (sent via WhatsApp/SMS) and JWT.
- **API**: Comprehensive Farmer and Admin endpoints. 
- **Services**: `aiRouter` for vision/QA, `otp` service, `cronJobs` for outbreaks and churn risk.
- **Intelligence Layer**: Outbreak detection (300% spike threshold), Weather-disease correlation, Churn risk scoring.

## Related Pages
- [[supabase]]
- [[ai-failover-chain]]
- [[security-architecture]]
- [[outbreak-intelligence]]
