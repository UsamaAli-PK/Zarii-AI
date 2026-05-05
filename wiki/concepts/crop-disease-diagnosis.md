# Crop Disease Diagnosis

The primary technical and domain concept of ZARii AI.

## Implementation
Diagnosis is performed via a multi-layered [[ai-failover-chain]]. 
1. **Vision AI**: Analyzes uploaded leaf photos to identify pathogens, symptoms, and severity.
2. **Pathogen Identification**: Includes scientific names and Urdu translations.
3. **Treatment Pipeline**: Recommends products from the [[zarii-ai]] catalog, including dosages and local PKR prices.

## Intelligent Outbreaks
The system monitors scan density. A 300% spike in a specific disease within a region triggers a regional outbreak alert.

## AI Failover Chain
When a provider returns 429 (rate limit) or quota exceeded, the system automatically tries the next available API key in the pool. This continues until a working key is found or all keys are exhausted.

## Daily Image Limit
- **Limit**: 2 images per day per user
- **Enforced at**: Both API level (diagnose.js) and database level (Supabase trigger)
- **Error**: "Daily image limit reached (2/day). Come back tomorrow."

## No Mock Fallback
If ALL AI providers fail (no key, all rate limited, network error), the system returns HTTP 503 with "System temporarily unavailable" - NOT fake diagnosis data. Frontend displays "System down - please try later."
