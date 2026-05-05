# Outbreak Intelligence

The regional disease alert system that detects crop disease outbreaks and warns farmers in affected areas.

## Detection Algorithm

Outbreak Intelligence uses a 300% spike detection algorithm:

1. **Baseline:** Calculate average disease frequency for region + crop + season
2. **Current:** Count recent diagnoses (last 7 days) for same region + crop
3. **Spike:** If current > baseline × 3.0, trigger outbreak alert
4. **Severity:** Classify as Critical (>500% spike), High (300-500%), or Moderate (200-300%)

## Regional Tracking

Outbreaks are tracked by:

- **District:** Pakistan's 120+ administrative districts
- **Crop Type:** Wheat, cotton, rice, sugarcane, etc.
- **Disease:** Specific pathogen or pest
- **Time Window:** 7-day rolling window for spike detection

## Alert Delivery

When an outbreak is detected:

1. **In-App Alert:** Farmers in affected region see alert on dashboard
2. **WhatsApp Alert:** (Coming soon) Alert sent via WhatsApp
3. **Advisory:** Agricultural experts create treatment advisory
4. **Recommendations:** Pesticide/fertilizer suggestions for outbreak

## Weather Correlation

Outbreak Intelligence correlates disease risk with weather:

- **Temperature:** Optimal disease development ranges
- **Humidity:** Fungal disease pressure increases with humidity
- **Rainfall:** Bacterial disease pressure increases after rain
- **Wind:** Spore dispersal patterns

Weather-based warnings alert farmers before outbreaks occur.

## Data Sources

Outbreak data comes from:

- **Farmer Diagnoses:** Real diagnoses from [[crop-disease-diagnosis]]
- **Expert Reports:** Agricultural extension officers
- **Historical Data:** Previous seasons' outbreak patterns
- **Weather Data:** [[openweather]] API integration

## Farmer Actions

When farmers receive outbreak alerts, they can:

1. **View Advisory:** Read expert recommendations
2. **Get Products:** See recommended pesticides/fertilizers
3. **Ask Questions:** Use [[urdu-voice-assistant]] to ask about outbreak
4. **Report Sighting:** Confirm outbreak in their area

## Future Roadmap

**Phase 1 (Q3 2026):** District-level alerts
- Outbreak detection by district
- Regional advisory generation

**Phase 2 (Q4 2026):** Predictive modeling
- ML model to predict outbreaks before they occur
- Weather-based risk scoring

**Phase 3 (Q1 2027):** National health map
- Government dashboard for disease tracking
- NGO integration for coordinated response

## Related Concepts

- [[zarii-ai]] — Main platform
- [[crop-disease-diagnosis]] — Diagnosis source data
- [[punjab]] — Primary market
- [[sindh]] — Secondary market
