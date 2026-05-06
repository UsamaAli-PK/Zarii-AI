# AI Failover Chain

The reliability architecture that ensures [[zarii-ai]] remains operational even when primary AI providers experience outages or rate limits.

## Provider Hierarchy

The system implements automatic failover in this order:

1. **Primary:** Google Gemini 1.5 Pro (vision + text capabilities)
2. **Secondary:** OpenAI GPT-4o (fallback if Gemini unavailable)
3. **Tertiary:** Mock diagnoses (for testing, demo, and complete provider failure)

## Why Failover is Critical

Pakistani farmers depend on [[zarii-ai]] for time-sensitive crop disease diagnosis. A single point of failure could mean:
- Missed disease identification during critical growing seasons
- Lost revenue from preventable crop loss
- Reduced farmer trust in the platform

The failover chain ensures uptime even during provider maintenance windows or unexpected outages.

## Implementation

The failover logic is implemented in `backend/services/aiRouter.js`:

```javascript
// Pseudocode flow
1. Try Gemini API with image + prompt
2. If Gemini fails (timeout, rate limit, error):
   - Log failure
   - Try OpenAI GPT-4o with same image + prompt
3. If OpenAI fails:
   - Log failure
   - Return mock diagnosis from hardcoded database
4. Return result to farmer
```

Each provider attempt includes:
- Timeout enforcement (prevents hanging)
- Error logging (for monitoring)
- Graceful degradation (next provider tried automatically)

## Mock Diagnoses

The mock fallback includes realistic disease scenarios:
- Common Pakistani crop diseases (powdery mildew, leaf rust, etc.)
- Confidence scores (0-100%)
- Treatment recommendations with PKR pricing
- Used for development, testing, and complete provider failure

## Monitoring

Failed provider attempts are logged with:
- Timestamp
- Provider name
- Error type
- Fallback provider used
- Farmer ID (for analytics)

This data helps identify patterns and plan provider redundancy improvements.

## Related Concepts

- [[zarii-ai]] — Main platform
- [[crop-disease-diagnosis]] — Diagnosis workflow
- [[google-gemini]] — Primary AI provider
- [[openai]] — Secondary AI provider
