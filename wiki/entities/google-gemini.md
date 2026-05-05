# Google Gemini

Google's multimodal AI model serving as the primary vision provider for [[zarii-ai]]'s crop disease diagnosis.

## Model Details

**Gemini 1.5 Pro** is used for:

- **Vision:** Analyzing leaf images to identify crop diseases
- **Text:** Generating treatment recommendations and explanations
- **Multimodal:** Processing both image and text context simultaneously

The model excels at:
- Fine-grained visual analysis (disease symptoms, severity)
- Contextual reasoning (crop type, region, season)
- Multilingual output (Urdu and English)
- Confidence scoring (0-100% disease identification confidence)

## Integration

Gemini is integrated via the Google Generative AI SDK:

```javascript
// backend/services/aiRouter.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
```

## Diagnosis Workflow

1. Farmer uploads leaf image
2. Image sent to Gemini with prompt: "Identify crop disease, confidence, treatment"
3. Gemini analyzes image and returns:
   - Disease name (English + Urdu)
   - Pathogen (scientific name)
   - Confidence score (0-100%)
   - Severity (Low/Medium/High)
   - Symptoms observed
   - Prevention measures
   - Treatment recommendations with dosage

## Failover Role

Gemini is the **primary provider** in the [[ai-failover-chain]]:

- First attempt for all diagnoses
- If Gemini fails (timeout, rate limit, error), system falls back to [[openai]] GPT-4o
- If both fail, mock diagnosis is returned

## Accuracy & Limitations

**Strengths:**
- High accuracy on common Pakistani crop diseases
- Fast response time (typically <2 seconds)
- Handles poor image quality gracefully
- Provides confidence scores for uncertainty

**Limitations:**
- May struggle with rare or emerging diseases
- Requires clear leaf images (blurry photos reduce accuracy)
- Cannot diagnose soil-borne diseases from leaf images alone
- Seasonal disease patterns require regional context

## Cost & Rate Limits

- **Pricing:** Per-token billing (input + output tokens)
- **Rate Limits:** 60 requests per minute (configurable)
- **Quota:** Monitored via `api_usage` table in [[supabase]]

## Related Concepts

- [[zarii-ai]] — Main platform
- [[crop-disease-diagnosis]] — Diagnosis workflow
- [[ai-failover-chain]] — Failover architecture
- [[openai]] — Secondary AI provider
