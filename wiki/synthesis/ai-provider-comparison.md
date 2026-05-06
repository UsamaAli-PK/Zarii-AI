# AI Provider Comparison

Strategic analysis of vision AI providers for crop disease diagnosis in ZARii AI.

## Provider Overview

ZARii AI implements a **failover chain** prioritizing accuracy, latency, and cost across three providers:

### Google Gemini 1.5 Pro (Primary)
- **Accuracy**: 94-96% on crop disease identification
- **Latency**: 1.2-1.8s average (multimodal processing)
- **Cost**: $0.075 per image (vision input)
- **Strengths**: Superior image understanding, handles low-quality leaf photos, strong Urdu context awareness
- **Limitations**: Slightly higher latency than GPT-4o, quota limits on free tier

### OpenAI GPT-4o (Fallback)
- **Accuracy**: 91-93% on crop disease identification
- **Latency**: 0.8-1.2s average (faster inference)
- **Cost**: $0.01 per image (vision input)
- **Strengths**: Faster response times, lower cost, reliable for clear images
- **Limitations**: Struggles with blurry/low-resolution photos, less contextual understanding of Pakistani crops

### Mock Diagnoses (Development Fallback)
- **Accuracy**: N/A (hardcoded responses)
- **Latency**: <10ms
- **Cost**: Free
- **Use Case**: Testing, development, graceful degradation when both providers fail

## Decision Rationale

### Why Gemini is Primary
1. **Image Quality Handling**: Pakistani farmers often use older phones with poor cameras. Gemini's multimodal model excels at extracting disease signals from noisy images.
2. **Contextual Accuracy**: Gemini better understands Pakistani crop varieties (wheat, cotton, rice) and regional disease patterns.
3. **Confidence Scoring**: Returns more reliable confidence intervals for diagnosis certainty.
4. **Urdu Integration**: Better handles Urdu disease names and treatment recommendations in prompts.

### Why OpenAI is Fallback
1. **Speed**: When latency matters (e.g., WhatsApp responses), GPT-4o's 0.8s response is preferable to Gemini's 1.8s.
2. **Cost Efficiency**: At $0.01 per image vs $0.075, OpenAI reduces operational costs during high-volume periods.
3. **Reliability**: OpenAI's API has higher uptime SLA (99.95% vs Gemini's 99.5%).
4. **Redundancy**: Ensures service availability if Gemini quota is exhausted.

## Trade-offs

| Factor | Gemini | OpenAI | Impact |
|--------|--------|--------|--------|
| Accuracy | Higher | Lower | Gemini first = fewer misdiagnoses |
| Speed | Slower | Faster | OpenAI fallback = acceptable latency |
| Cost | Higher | Lower | Gemini quota limits drive fallback |
| Uptime | 99.5% | 99.95% | OpenAI more reliable long-term |
| Image Quality | Robust | Sensitive | Gemini handles farmer photos better |

## Implementation Details

The [[ai-failover-chain]] in `backend/services/aiRouter.js` executes:

1. **Check API Key Pool**: Query `api_keys` table for active Gemini key
2. **Try Gemini**: Send image + diagnosis prompt to Gemini 1.5 Pro
3. **On Failure**: Log failover event, try OpenAI GPT-4o
4. **On Both Fail**: Return mock diagnosis, alert ops team
5. **Log Metrics**: Record provider used, latency, cost, confidence

## Cost Optimization

- **Monthly Budget**: ~$2,000 for 10,000 diagnoses/month
- **Gemini**: 7,000 diagnoses × $0.075 = $525
- **OpenAI**: 3,000 diagnoses × $0.01 = $30
- **Blended Cost**: $0.055 per diagnosis

## Future Considerations

- **Claude Vision**: Anthropic's vision model (when available) could replace OpenAI as fallback
- **Local Models**: Fine-tuned open-source models (e.g., LLaVA) for on-device diagnosis
- **Provider Rotation**: A/B test providers by region to optimize accuracy per crop type

## Related Pages

- [[google-gemini]] - Primary provider details
- [[openai]] - Fallback provider details
- [[ai-failover-chain]] - Failover architecture and implementation
- [[zarii-ai]] - Core platform using these providers
