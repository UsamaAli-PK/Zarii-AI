# ZARii AI: Real Features & Tech (From Codebase)

ZARii AI is a smart phone companion for Pakistani farmers. It helps identify crop diseases, gives expert advice, and warns about local outbreaks—all in natural Urdu voice and text.

---

## 🛠️ How it Works (The Real Tech)
- **Fast App**: Built with **React 18** and **Vanilla CSS** for a premium, custom experience without heavy frameworks.
- **Solid Database**: Powered by **Supabase** for real-time data, secure login, and photo storage.
- **AI Eyes (Vision)**: Uses **Google Gemini 1.5 Pro** (Primary) and **OpenAI GPT-4o** (Failover) to find diseases in photos.
- **Urdu Voice**: 
    - **Hearing**: Uses **Whisper** (via Groq/OpenAI) to understand spoken Urdu.
    - **Speaking**: Uses **ElevenLabs** for human-like Urdu voice replies.
- **Smart Failover**: A custom-built system that monitors AI health and automatically switches providers to ensure 100% uptime.
- **Fully Connected**: Direct integration with **WhatsApp Graph API** and **OpenWeather** for field-level risk analysis.

## 🌾 Problems We Solve
- **No Experts Nearby**: Brings expert agricultural advice to the most remote villages in Pakistan.
- **Language Barriers**: No need for English; farmers can talk to ZARii naturally in Urdu (Voice + Text).
- **Saving Crops**: Catches diseases like *Yellow Rust* or *Early Blight* before they destroy the harvest.
- **Predictive Alerts**: Warns farmers about pests or diseases moving into their specific district.

## ✨ Why ZARii is Unique
- **Urdu Voice First**: Optimized for speaking and listening, removing the barrier of literacy.
- **WhatsApp Native**: Works inside the app farmers already use every day.
- **Localized Wisdom**: Trained on Pakistani crops (Wheat, Cotton, Rice) and local pesticide prices (PKR).
- **Crowdsourced Intelligence**: Every scan helps build a regional map to protect the entire farming community.

## ⚙️ Admin & Control Power
- **Live Monitoring**: Real-time map showing disease outbreaks across all districts of Pakistan.
- **Blast Messaging**: Send emergency agricultural advisories to thousands of farmers with one click.
- **Human-in-the-Loop**: Admins can monitor AI-farmer chats on WhatsApp and jump in to help manually.
- **Key Manager**: Dynamic control over AI API keys, usage limits, and cost tracking.
- **Partner Dashboard**: Manage seed and pesticide sponsors with real-time click and conversion tracking.

## 💰 Business Model
- **Brand Sponsorships**: Agricultural companies pay to have their products recommended in treatment plans.
- **Data Insights**: Selling regional disease outbreak maps to government bodies and NGOs.
- **Premium Services**: Basic diagnosis is free; advanced predictive alerts and direct voice calls are paid.
- **Referral Fees**: Earning commissions from pesticide and seed orders placed through the app.
