const supabase = require("../supabase");
const { AI } = require("../config");
const apiKeys = require("./apiKeys");

// ─── SSRF Protection: Validate URLs before server-side fetch ────
function validateImageUrl(urlStr) {
  if (!urlStr) return false;
  try {
    const parsed = new URL(urlStr);
    // Only allow HTTPS
    if (!["https:"].includes(parsed.protocol)) return false;
    // Block private/internal IPs and cloud metadata
    const hostname = parsed.hostname.toLowerCase();
    const blockedPatterns = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^169\.254\./, // AWS/cloud metadata
      /^0\./,
      /^\[::1\]/,
      /^metadata\./i,
      /\.internal$/i,
      /\.local$/i,
    ];
    if (blockedPatterns.some((p) => p.test(hostname))) return false;
    return true;
  } catch {
    return false;
  }
}

const MOCK_DIAGNOSES = [
  {
    disease_name: "Early Blight",
    disease_name_ur: "ابتدائی جھلساؤ",
    pathogen: "Alternaria solani",
    confidence: 94,
    severity: "Moderate",
    symptoms: [
      "Concentric brown rings on lower leaves",
      "Yellow halo around lesions",
      "Lesion size 4-12mm",
    ],
    prevention: [
      "Water at base, not on leaves",
      "Allow morning sun to dry leaves",
      "Rotate crops every 2 seasons",
      'Space plants 18" apart',
    ],
    primary_treatment: {
      name: "Antracol 70 WP",
      company: "Bayer",
      price: "1,180",
      unit: "per kg",
      dosage: "2g per L water",
      schedule: "Every 7 days · 3 sprays",
    },
    alt_treatments: [
      {
        name: "Mancozeb 75 WP",
        company: "Ali Akbar",
        price: "760",
        unit: "per kg",
      },
      {
        name: "Score 250 EC",
        company: "Syngenta",
        price: "2,400",
        unit: "per L",
      },
    ],
  },
  {
    disease_name: "Whitefly",
    disease_name_ur: "سفید مکھی",
    pathogen: "Bemisia tabaci",
    confidence: 89,
    severity: "High",
    symptoms: [
      "White powdery insects on leaf undersides",
      "Yellowing and wilting of leaves",
      "Honeydew secretion causing sooty mold",
    ],
    prevention: [
      "Use yellow sticky traps",
      "Plant barrier crops",
      "Spray in early morning",
      "Remove heavily infested leaves",
    ],
    primary_treatment: {
      name: "Confidor 200 SL",
      company: "Bayer",
      price: "980",
      unit: "per 250ml",
      dosage: "0.5ml per L water",
      schedule: "Every 10 days · 2 sprays",
    },
    alt_treatments: [
      {
        name: "Actara 25 WG",
        company: "Syngenta",
        price: "2,200",
        unit: "per 100g",
      },
      {
        name: "Karate 2.5 EC",
        company: "Syngenta",
        price: "720",
        unit: "per 250ml",
      },
    ],
  },
  {
    disease_name: "Late Blight",
    disease_name_ur: "جدید جھلساؤ",
    pathogen: "Phytophthora infestans",
    confidence: 91,
    severity: "Moderate",
    symptoms: [
      "Dark brown water-soaked lesions",
      "White mold on leaf undersides",
      "Rapid brown rot of stems",
    ],
    prevention: [
      "Avoid overhead irrigation",
      "Improve field drainage",
      "Use certified disease-free seed",
      "Destroy crop debris after harvest",
    ],
    primary_treatment: {
      name: "Ridomil Gold MZ",
      company: "Syngenta",
      price: "1,650",
      unit: "per 500g",
      dosage: "2g per L water",
      schedule: "Every 7-10 days",
    },
    alt_treatments: [
      {
        name: "Antracol 70 WP",
        company: "Bayer",
        price: "1,180",
        unit: "per kg",
      },
      {
        name: "Mancozeb 75 WP",
        company: "Ali Akbar",
        price: "760",
        unit: "per kg",
      },
    ],
  },
  {
    disease_name: "Yellow Rust",
    disease_name_ur: "پیلی زنگ",
    pathogen: "Puccinia striiformis",
    confidence: 88,
    severity: "Moderate",
    symptoms: [
      "Yellow pustules in stripes on leaves",
      "Yellowing of entire leaves",
      "Reduced grain filling",
    ],
    prevention: [
      "Plant resistant varieties",
      "Avoid excessive nitrogen",
      "Monitor from December onwards",
    ],
    primary_treatment: {
      name: "Tilt 250 EC",
      company: "Syngenta",
      price: "1,800",
      unit: "per L",
      dosage: "0.5ml per L water",
      schedule: "Every 14 days · 2 sprays",
    },
    alt_treatments: [
      {
        name: "Score 250 EC",
        company: "Syngenta",
        price: "2,400",
        unit: "per L",
      },
    ],
  },
];

// ─── Provider detection helpers (flexible naming) ───────────
// Matches: "Gemini", "Google AI Studio", "Google Gemini", "gemini-2.5", etc.
function isGeminiProvider(provider, envKey) {
  if (provider === "env") return !!envKey;
  const p = (provider || "").toLowerCase();
  return p.includes("gemini") || p.includes("google");
}

// Matches: "OpenAI", "GPT-4", "gpt", "openai", "ChatGPT", etc.
function isOpenAIProvider(provider, envKey) {
  if (provider === "env") return !!envKey;
  const p = (provider || "").toLowerCase();
  return p.includes("openai") || p.includes("gpt") || p.includes("chatgpt");
}

// ─── STEP 1: Detect disease from image only ─────────────────
async function detectDisease({ imageBase64, imageUrl, cropType, lang }) {
  const poolKeys = await apiKeys.getAllServiceKeys("vision");
  if (!poolKeys || poolKeys.length === 0) {
    console.warn("[aiRouter] No vision API keys in pool.");
    return { ok: false, reason: "missing_api_key", provider: "none" };
  }

  const prompt = buildDetectionPrompt(cropType, lang);
  let lastError = null;

  // Try each key until one works
  for (const keyObj of poolKeys) {
    if (!keyObj.api_key || keyObj.api_key === "[decryption error]") {
      continue;
    }

    const providerLabel =
      keyObj.provider === "env" ? "Gemini 1.5 Pro (env)" : keyObj.provider;

    console.log(
      `[aiRouter] Step 1: Disease detection via ${providerLabel}, model: ${keyObj.model_id || "default"}`,
    );

    try {
      let result;
      if (isGeminiProvider(keyObj.provider, AI.GEMINI_API_KEY)) {
        result = await callGemini(
          { imageBase64, imageUrl, cropType, lang, prompt },
          keyObj,
        );
      } else if (isOpenAIProvider(keyObj.provider, AI.OPENAI_API_KEY)) {
        result = await callOpenAIVision(
          { imageBase64, imageUrl, cropType, lang, prompt },
          keyObj,
        );
      } else {
        console.warn(`[aiRouter] Unknown provider type: "${keyObj.provider}".`);
        continue;
      }

      await apiKeys.reportUsage(keyObj.id, true);
      console.log(
        `[aiRouter] Step 1 success: ${result.disease_name} (${result.confidence}% confidence)`,
      );
      return {
        ok: true,
        data: { ...result, vision_provider: providerLabel },
        provider: providerLabel,
      };
    } catch (err) {
      console.error(`[aiRouter] Step 1 (${providerLabel}) FAILED:`, err.message);
      await apiKeys.reportUsage(keyObj.id, false);
      lastError = err.message;

      // Check for rate limit (429) - try next key
      const errStr = err.message || "";
      if (errStr.includes("429") || errStr.toLowerCase().includes("rate limit") || errStr.toLowerCase().includes("quota")) {
        console.log(`[aiRouter] Rate limit on ${providerLabel}, trying next key...`);
        continue;
      }

      // Non-rate-limit error, stop trying
      break;
    }
  }

  // All keys exhausted
  return {
    ok: false,
    reason: lastError && lastError.includes("429") ? "rate_limit_all_keys" : "all_keys_failed",
    provider: "none",
    error: lastError,
  };
}

// ─── STEP 2: Get solution using disease name + sponsored products + weather ─
async function getSolution({
  diseaseName,
  diseaseNameUr,
  cropType,
  lang,
  sponsoredProducts,
  weatherContext,
}) {
  const poolKeys = await apiKeys.getAllServiceKeys("vision");
  if (!poolKeys || poolKeys.length === 0) {
    return { ok: false, reason: "missing_or_invalid_api_key", provider: "none" };
  }

  const prompt = buildSolutionPrompt(
    diseaseName,
    diseaseNameUr,
    cropType,
    lang,
    sponsoredProducts,
    weatherContext,
  );
  let lastError = null;

  // Try each key until one works
  for (const keyObj of poolKeys) {
    if (!keyObj.api_key || keyObj.api_key === "[decryption error]") {
      continue;
    }

    const providerLabel =
      keyObj.provider === "env" ? "Gemini 1.5 Pro (env)" : keyObj.provider;
    console.log(
      `[aiRouter] Step 2: Solution via ${providerLabel}, model: ${keyObj.model_id || "default"}`,
    );

    try {
      let text;
      if (isGeminiProvider(keyObj.provider, AI.GEMINI_API_KEY)) {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(keyObj.api_key);
        const model = genAI.getGenerativeModel({
          model: keyObj.model_id || "gemini-1.5-pro",
        });
        const response = await model.generateContent(prompt);
        text = response.response.text();
      } else if (isOpenAIProvider(keyObj.provider, AI.OPENAI_API_KEY)) {
        const { OpenAI } = require("openai");
        const client = new OpenAI({
          apiKey: keyObj.api_key,
          baseURL: keyObj.base_url || undefined,
        });
        const response = await client.chat.completions.create({
          model: keyObj.model_id || "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 800,
        });
        text = response.choices[0].message.content;
      } else {
        console.warn(`[aiRouter] Step 2: Unknown provider "${keyObj.provider}".`);
        continue;
      }

      await apiKeys.reportUsage(keyObj.id, true);
      if (text) {
        console.log(`[aiRouter] Step 2 success via ${providerLabel}`);
        return {
          ok: true,
          data: {
            ...parseSolutionResponse(text),
            solution_provider: providerLabel,
          },
          provider: providerLabel,
        };
      }
    } catch (err) {
      console.error(`[aiRouter] Step 2 (${providerLabel}) FAILED:`, err.message);
      await apiKeys.reportUsage(keyObj.id, false);
      lastError = err.message;

      // Check for rate limit (429) - try next key
      const errStr = err.message || "";
      if (errStr.includes("429") || errStr.toLowerCase().includes("rate limit") || errStr.toLowerCase().includes("quota")) {
        console.log(`[aiRouter] Rate limit on ${providerLabel}, trying next key...`);
        continue;
      }

      // Non-rate-limit error, stop trying
      break;
    }
  }

  // All keys exhausted
  return {
    ok: false,
    reason: lastError && lastError.includes("429") ? "rate_limit_all_keys" : "all_keys_failed",
    provider: "none",
    error: lastError,
  };
}

// ─── MAIN: Two-step diagnosis ────────────────────────────────
async function diagnoseImage({
  imageBase64,
  imageUrl,
  cropType,
  lang,
  userId,
  sponsoredProducts,
  weatherContext,
}) {
  const start = Date.now();

  // ── Step 1: Disease Detection ────────────────────────────
  const detectionResult = await detectDisease({
    imageBase64,
    imageUrl,
    cropType,
    lang,
  });
  let detection = detectionResult?.data || null;
  let visionProvider = detection?.vision_provider || "mock";
  let detectionUsedFallback = !detectionResult?.ok;

  if (!detection) {
    detection = {
      disease_name: "Analysis unavailable",
      disease_name_ur: "تجزیہ دستیاب نہیں",
      pathogen: null,
      confidence: 0,
      severity: "Unknown",
      symptoms: [],
      vision_provider: "mock",
    };
    visionProvider = "mock";
  }

  // ── Step 2: Solution Recommendation ──────────────────────
  // Step 1 analysis: confidence must be >= 95 to accept, otherwise ask for reupload
  let reuploadNeeded = false;
  let reuploadMessage = "";

  if (detection.confidence < 95) {
    reuploadNeeded = true;
    reuploadMessage = lang === "ur"
      ? "تصویر صاف نہیں ہے۔ براہ کرم دن کی روشنی میں واضح تصویر لیں۔"
      : "Image not clear (confidence: " + detection.confidence + "%). Please upload a clearer photo.";
  }

  let solution = null;
  let solutionProvider = "mock";
  let solutionUsedFallback = false;

  // Get solution only for valid disease detection
  console.log(`[aiRouter] Diagnosis: ${detection.disease_name}, confidence: ${detection.confidence}, reupload: ${reuploadNeeded}`);

  // Only call solution if:
  // 1. Not healthy AND
  // 2. Not "Analysis unavailable" (detection failed) AND
  // 3. Not unknown AND
  // 4. Has valid confidence > 0 AND
  // 5. Did NOT use fallback (mock)
  const isValidDisease = detection.disease_name && 
    detection.disease_name.toLowerCase() !== "healthy" &&
    detection.disease_name.toLowerCase() !== "analysis unavailable" &&
    detection.disease_name.toLowerCase() !== "unknown" &&
    detection.confidence > 0 &&
    !detectionUsedFallback;

  if (isValidDisease) {
    console.log(`[aiRouter] Calling getSolution for ${detection.disease_name}...`);
    const solutionResult = await getSolution({
      diseaseName: detection.disease_name,
      diseaseNameUr: detection.disease_name_ur,
      cropType,
      lang,
      sponsoredProducts,
      weatherContext,
    });
    solution = solutionResult?.data || null;
    solutionProvider = solution?.solution_provider || "mock";
    solutionUsedFallback = !solutionResult?.ok;

    // Check if AI returned reupload_needed
    if (solution?.reupload_needed) {
      reuploadNeeded = true;
      reuploadMessage = solution.message || reuploadMessage;
      solution = null;
    }
  }

  // If healthy or no solution needed
  if (!solution) {
    solution = {
      prevention: detection.disease_name?.toLowerCase() === "healthy"
        ? ["Crop looks healthy! Continue good farming practices.", "Monitor regularly for any changes."]
        : ["Retake a clearer image for better diagnosis.", "Consult local agriculture extension officer."],
      primary_treatment: null, // No treatment for healthy
      alt_treatments: [],
      solution_provider: detection.disease_name?.toLowerCase() === "healthy" ? "healthy" : "mock",
    };
  }

  const processingMs = Date.now() - start;

  return {
    // From Step 1 (detection)
    disease_name: detection.disease_name,
    disease_name_ur: detection.disease_name_ur,
    pathogen: detection.pathogen,
    confidence: detection.confidence,
    severity: detection.severity,
    symptoms: detection.symptoms || [],
    // From Step 2 (solution)
    prevention: solution.prevention || [],
    primary_treatment: solution.primary_treatment,
    alt_treatments: solution.alt_treatments || [],
    // Metadata
    ai_provider: visionProvider, // vision step provider
    solution_provider: solutionProvider, // solution step provider
    processing_ms: processingMs,
    reupload_needed: reuploadNeeded,
    reupload_message: reuploadNeeded ? reuploadMessage : null,
    diagnosis_status:
      detectionUsedFallback && solutionUsedFallback
        ? "fallback"
        : detectionUsedFallback || solutionUsedFallback
          ? "partial_fallback"
          : "real_ai",
    used_fallback: detectionUsedFallback || solutionUsedFallback,
    fallback_details: {
      detection: detectionUsedFallback
        ? {
            reason: detectionResult?.reason || "unknown",
            provider: detectionResult?.provider || "unknown",
            error: detectionResult?.error || null,
          }
        : null,
      solution: solutionUsedFallback
        ? {
            reason: solutionResult?.reason || "unknown",
            provider: solutionResult?.provider || "unknown",
            error: solutionResult?.error || null,
          }
        : null,
    },
  };
}

async function callGemini({ imageBase64, imageUrl, cropType, lang }, keyObj) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(keyObj.api_key);
  const model = genAI.getGenerativeModel({
    model: keyObj.model_id || "gemini-1.5-pro",
  });
  const prompt = buildDiagnosisPrompt(cropType, lang);

  let imagePart;
  if (imageBase64) {
    imagePart = { inlineData: { data: imageBase64, mimeType: "image/jpeg" } };
  } else if (imageUrl) {
    if (!validateImageUrl(imageUrl))
      throw new Error("Invalid image URL: blocked by security policy");
    const fetch = require("node-fetch");
    const resp = await fetch(imageUrl, { timeout: 10000 });
    const buf = await resp.buffer();
    if (buf.length > 10 * 1024 * 1024)
      throw new Error("Image too large (max 10MB)");
    imagePart = {
      inlineData: { data: buf.toString("base64"), mimeType: "image/jpeg" },
    };
  }

  const response = await model.generateContent([prompt, imagePart]);
  return parseAIResponse(response.response.text());
}

async function callOpenAIVision(
  { imageBase64, imageUrl, cropType, lang },
  keyObj,
) {
  const { OpenAI } = require("openai");
  const client = new OpenAI({
    apiKey: keyObj.api_key,
    baseURL: keyObj.base_url || undefined,
  });
  const imageContent = imageBase64
    ? {
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
      }
    : { type: "image_url", image_url: { url: imageUrl } };

  const response = await client.chat.completions.create({
    model: keyObj.model_id || "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: buildDiagnosisPrompt(cropType, lang) },
          imageContent,
        ],
      },
    ],
    max_tokens: 1000,
  });
  return parseAIResponse(response.choices[0].message.content);
}

// ── Step 1 prompt: only detect disease, no treatment yet ────
function buildDetectionPrompt(cropType, lang) {
  const langNote =
    lang === "ur"
      ? "Provide disease_name_ur in Urdu script (Nastaliq)."
      : lang === "pa"
        ? "Provide disease_name_ur in Punjabi (Shahmukhi) script."
        : "Provide disease_name_ur in Urdu script as well.";

  const cropGuidance = (cropType || "").toLowerCase().includes("wheat")
    ? "Focus on: rust (yellow/orange pustules), powdery mildew (white coating), leaf spot, stem rust. Common in Punjab/Sindh."
    : (cropType || "").toLowerCase().includes("rice")
      ? "Focus on: bacterial leaf blight, blast, brown spot, sheath blight. Common in Sindh."
      : (cropType || "").toLowerCase().includes("cotton")
        ? "Focus on: cotton leaf curl virus, wilt, boll rot, pink bollworm damage. Common in Punjab."
        : "Identify any visible disease, pest damage, nutrient deficiency, or healthy status.";

  return `You are ZARii AI - a highly experienced plant pathologist specializing in Pakistani/South Asian crops.

TASK: Analyze this ${cropType || "crop"} leaf/plant image and identify the disease or condition.

${cropGuidance}

${langNote}

CRITICAL RULES:
1. If plant looks HEALTHY with no visible symptoms → return confidence 100, severity "None", disease_name "Healthy"
2. If you CANNOT confidently identify the issue (unclear image, unknown symptom) → return confidence BELOW 90
3. NEVER guess - if unsure, use lower confidence

EXAMINATION CRITERIA:
1. Look for: color changes (yellowing, browning, spots), lesions, wilting, unusual growths
2. Check: leaf undersides, stems, growing points
3. Identify: fungal, bacterial, viral, pest damage, nutrient deficiency, or healthy
4. Severity: None (healthy) | Low | Moderate | High | Critical

Return EXACTLY this JSON - no explanation:
{
  "disease_name": "English name - e.g., 'Wheat Yellow Rust' or 'Healthy' or 'Unknown'",
  "disease_name_ur": "اردو نام",
  "pathogen": "Scientific name or 'null' if healthy/unknown",
  "confidence": 85,
  "severity": "Moderate",
  "symptoms": ["symptom1", "symptom2", "symptom3"]
}

IMPORTANT: If confidence is below 90, the system will ask user to reupload a clearer image.`;
}

// ── Step 2 prompt: solution using disease + sponsored products + weather ──
function buildSolutionPrompt(
  diseaseName,
  diseaseNameUr,
  cropType,
  lang,
  sponsoredProducts,
  weatherContext,
) {
  const langInstruction =
    lang === "ur"
      ? "Respond with ALL text fields in URDU (Nastaliq script) only."
      : lang === "pa"
        ? "Respond with all text fields in PUNJABI (Shahmukhi) script only."
        : "Respond in English.";

  const weatherWarning = weatherContext
    ? `\nCURRENT WEATHER (${weatherContext.city}):
- ${weatherContext.temp}°C, ${weatherContext.humidity}% humidity, ${weatherContext.condition}

WEATHER-BASED ADVICE:
- High humidity (>70%): Strongly recommend fungicide - fungal diseases spread fast
- Rainy season: Apply preventive fungicide BEFORE rain
- Hot (>35°C): Water only in morning/evening to avoid leaf burn`
    : "";

  const sponsoredList =
    (sponsoredProducts || []).length > 0
      ? `PAKISTANI PRODUCTS AVAILABLE:\n${sponsoredProducts
          .map(
            (sp) =>
              `• ${sp.name} (${sp.company}) - PKR ${sp.pkr_price}/${sp.unit}`,
          )
          .join("\n")}`
      : "Use products from Pakistani agricultural markets: Nawabshah, Lahore, Karachi, Multan.";

  return `You are ZARii AI - expert agricultural consultant for Pakistani farmers.

DISEASE DETECTED: ${diseaseName}${diseaseNameUr ? ` (${diseaseNameUr})` : ""}
CROP: ${cropType || "crop"}
REGION: Punjab/Sindh, Pakistan${weatherWarning}

AVAILABLE PAKISTANI PRODUCTS:
${sponsoredList}

${langInstruction}

CRITICAL RULES:
1. If disease is "Healthy" or "None" → return ONLY prevention tips, NO treatment products
2. If confidence below 90 → use special response below
3. ONLY recommend products available in Pakistan with PKR prices
4. Include wait period before harvest (days to wait after last spray)

If confidence below 90 or unclear diagnosis, return this EXACT JSON:
{
  "reupload_needed": true,
  "message": "Image not clear enough. Please take a closer, clearer photo in good daylight.",
  "message_ur": "تصویر صاف نہیں ہے۔ براہ کرم دن کی روشنی میں واضح تصویر لیں۔"
}

Otherwise return EXACTLY this JSON:
{
  "prevention": ["step1", "step2", "step3", "step4"],
  "primary_treatment": {
    "name": "Product name (Pakistan)",
    "company": "Company",
    "price": "PKR 1500",
    "unit": "per 250ml",
    "dosage": "2ml per liter",
    "schedule": "Every 7 days, 3 sprays",
    "wait_harvest_days": 14
  },
  "alt_treatments": [
    {"name": "Alt1", "company": "Comp", "price": "PKR 800", "unit": "per kg"},
    {"name": "Alt2", "company": "Comp", "price": "PKR 1200", "unit": "per liter"}
  ]
}`;
}

function parseSolutionResponse(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in solution response");
  return JSON.parse(match[0]);
}

function buildDiagnosisPrompt(cropType, lang) {
  return `You are ZARii AI, an expert agronomist for Pakistani farmers. Analyze this ${cropType || "crop"} leaf image and return a JSON diagnosis with exactly this structure:
{
  "disease_name": "English disease name or Healthy",
  "disease_name_ur": "اردو نام",
  "pathogen": "Scientific name",
  "confidence": 0-100,
  "severity": "None|Low|Moderate|High|Critical",
  "symptoms": ["symptom1", "symptom2", "symptom3"],
  "prevention": ["tip1", "tip2", "tip3", "tip4"],
  "primary_treatment": {
    "name": "Pakistan market product name",
    "company": "Company name",
    "price": "PKR price number only",
    "unit": "per kg/L/etc",
    "dosage": "X per L water",
    "schedule": "Every X days"
  },
  "alt_treatments": [
    {"name": "...", "company": "...", "price": "...", "unit": "..."},
    {"name": "...", "company": "...", "price": "...", "unit": "..."}
  ]
}
Return ONLY the JSON, no other text.`;
}

function parseAIResponse(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in AI response");
  return JSON.parse(match[0]);
}

async function answerVoiceQuery({ text, lang }) {
  const keyObj = await apiKeys.getServiceKey("vision"); // LLMs are in the vision pool usually (Gemini/GPT-4)

  const langInstruction =
    lang === "ur"
      ? "Always answer in Urdu (Nastaliq script)."
      : "Answer in English.";

  const systemPrompt = `You are ZARii AI, an agricultural expert assistant for Pakistani farmers. Give concise, practical advice about crops, diseases, pesticides available in Pakistan with PKR prices. ${langInstruction} Keep answers under 100 words.`;

  if (
    keyObj &&
    keyObj.api_key &&
    isOpenAIProvider(keyObj.provider, AI.OPENAI_API_KEY)
  ) {
    try {
      const { OpenAI } = require("openai");
      const client = new OpenAI({
        apiKey: keyObj.api_key,
        baseURL: keyObj.base_url || undefined,
      });
      const response = await client.chat.completions.create({
        model: keyObj.model_id || "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        max_tokens: 300,
      });
      return response.choices[0].message.content;
    } catch {}
  } else if (
    keyObj &&
    keyObj.api_key &&
    isGeminiProvider(keyObj.provider, AI.GEMINI_API_KEY)
  ) {
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(keyObj.api_key);
      const model = genAI.getGenerativeModel({
        model: keyObj.model_id || "gemini-1.5-pro",
      });
      const prompt = `${systemPrompt}\n\nUser: ${text}`;
      const response = await model.generateContent(prompt);
      return response.response.text();
    } catch {}
  }

  const mockAnswers = {
    en: "Yellowing wheat leaves usually means nitrogen deficiency. Apply Urea at 1 bag per acre and water lightly. Want me to recommend a specific brand available in your area?",
    ur: "گندم کے پیلے پتے عام طور پر نائٹروجن کی کمی کا اشارہ ہیں۔ فی ایکڑ ایک بوری یوریا ڈالیں اور ہلکا پانی دیں۔",
  };
  return mockAnswers[lang] || mockAnswers.en;
}

async function logFailover(from, to, reason, pool) {
  try {
    await supabase
      .from("failover_events")
      .insert({ from_provider: from, to_provider: to, reason, pool });
  } catch {}
}

async function updateKeyUsage(provider, latencyMs) {
  try {
    const { data: keys } = await supabase
      .from("api_keys")
      .select("id, calls_today")
      .ilike("provider", `%${provider.split(" ")[0]}%`);
    if (keys && keys.length > 0) {
      await supabase
        .from("api_keys")
        .update({
          calls_today: (keys[0].calls_today || 0) + 1,
          latency_p95: latencyMs,
        })
        .eq("id", keys[0].id);
    }
  } catch {}
}

module.exports = { diagnoseImage, answerVoiceQuery };
