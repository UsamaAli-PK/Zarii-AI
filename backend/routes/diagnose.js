const router = require("express").Router();
const multer = require("multer");
const supabase = require("../supabase");
const auth = require("../middleware/auth");
const { diagnoseImage } = require("../services/aiRouter");
const apiKeys = require("../services/apiKeys");

const ALLOWED_IMAGE_TYPES = Object.freeze({
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
});
const ALLOWED_IMAGE_EXTENSIONS = new Set(
  Object.values(ALLOWED_IMAGE_TYPES).flat(),
);

function getFileExtension(filename) {
  if (!filename || typeof filename !== "string") return "";
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex < 0) return "";
  return filename.slice(dotIndex).toLowerCase();
}

function isAllowedImageFile(file) {
  if (!file) return false;
  const mime = (file.mimetype || "").toLowerCase();
  const ext = getFileExtension(file.originalname);
  const allowedExtensionsForMime = ALLOWED_IMAGE_TYPES[mime];
  if (!allowedExtensionsForMime) return false;
  if (!ext || !ALLOWED_IMAGE_EXTENSIONS.has(ext)) return false;
  return allowedExtensionsForMime.includes(ext);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ─── IP → City detection ──────────────────────────────────────
async function detectCityFromIP(ip) {
  try {
    // Clean IP (handle IPv6 loopback, proxies)
    const cleanIp = (ip || "").replace(/^::ffff:/, "").replace("::1", "");
    if (
      !cleanIp ||
      cleanIp === "127.0.0.1" ||
      cleanIp.startsWith("192.168") ||
      cleanIp.startsWith("10.")
    ) {
      return null; // local/private — can't geolocate
    }
    const fetch = require("node-fetch");
    const response = await fetch(`https://ipapi.co/${cleanIp}/json/`, {
      timeout: 3000,
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.city || data.region || null;
  } catch {
    return null;
  }
}

// ─── Fetch weather for a city ─────────────────────────────────
async function fetchWeatherForCity(city) {
  if (!city) return null;
  try {
    const keyObj = await apiKeys.getServiceKey("weather");
    if (!keyObj || !keyObj.api_key) return null;
    const fetch = require("node-fetch");
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${keyObj.api_key}&units=metric`;
    const response = await fetch(url, { timeout: 4000 });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      city: data.name || city,
      temp: Math.round(data.main?.temp || 30),
      humidity: data.main?.humidity || 50,
      condition: data.weather?.[0]?.description || "clear sky",
    };
  } catch {
    return null;
  }
}

// POST /api/diagnose
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { crop_type, lang, image_url } = req.body;
    const userId = req.user.id;

    // ── Daily limit check: 2 scans per day ──
    const todayStartUTC = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    todayStartUTC.setHours(0, 0, 0, 0);
    const todayStartStr = todayStartUTC.toISOString();
    console.log(`[diagnose] User ${userId} - checking scans since ${todayStartStr}`);
    
    const { count: todayCount, error: countError } = await supabase
      .from("scans")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", todayStartStr);

    console.log(`[diagnose] User ${userId} - scans today: ${todayCount}, error: ${countError?.message}`);

    if (countError) {
      console.error(`[diagnose] Count error: ${countError.message}`);
    }

    console.log(`[diagnose] User ${userId} - final count check: ${todayCount} >= 2`);

    if ((todayCount || 0) >= 2) {
      return res.status(429).json({
        error: "Daily image limit reached (2/day). Come back tomorrow.",
      });
    }

    if (image_url) {
      return res.status(400).json({
        error:
          "Image URL is not allowed. Please upload an image file (jpg, jpeg, png, or webp).",
      });
    }
    if (!req.file) {
      return res.status(400).json({
        error: "Image file is required. Allowed types: jpg, jpeg, png, webp.",
      });
    }
    if (!isAllowedImageFile(req.file)) {
      return res.status(400).json({
        error:
          "Invalid image type. Allowed types: jpg, jpeg, png, webp. Please upload a valid image file.",
      });
    }

    let imageBase64 = null;
    let finalImageUrl = null;

    if (req.file) {
      imageBase64 = req.file.buffer.toString("base64");
      const filename = `scan-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from("scans")
        .upload(`images/${filename}`, req.file.buffer, {
          contentType: req.file.mimetype || "image/jpeg",
          upsert: false,
        });
      if (!uploadErr) {
        const { data: signed } = await supabase.storage
          .from("scans")
          .createSignedUrl(`images/${filename}`, 86400 * 30);
        finalImageUrl = signed?.signedUrl || null;
      }
    }

    // ── 1. Detect city from IP + fetch weather concurrently ──
    const userIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
    let city = null;
    let weather = null;

    // Also check user's saved region as fallback
    const { data: userRecord } = await supabase
      .from("users")
      .select("region, detected_city")
      .eq("id", userId)
      .single();
    const savedCity = userRecord?.detected_city || userRecord?.region || null;

    const [detectedCity, weatherFromSaved] = await Promise.all([
      detectCityFromIP(userIp),
      savedCity ? fetchWeatherForCity(savedCity) : Promise.resolve(null),
    ]);

    city = detectedCity || savedCity || null;

    if (detectedCity) {
      // Save newly detected city to user profile
      supabase
        .from("users")
        .update({ detected_city: detectedCity })
        .eq("id", userId)
        .then(() => {});
      weather = await fetchWeatherForCity(detectedCity);
    } else {
      weather = weatherFromSaved;
    }

    // ── 2. Fetch sponsored products for Step 2 AI ────────────
    const { data: sponsoredProducts } = await supabase
      .from("sponsored_products")
      .select(
        "*, catalog(name, company, pkr_price, unit, dosage), sponsors(name)",
      )
      .eq("status", "Active")
      .order("boost_weight", { ascending: false })
      .limit(5);

    // Flatten sponsored products for AI prompt
    const sponsoredForAI = (sponsoredProducts || [])
      .filter((sp) => sp.catalog)
      .map((sp) => ({
        name: sp.catalog.name,
        company: sp.catalog.company,
        pkr_price: sp.catalog.pkr_price,
        unit: sp.catalog.unit,
        dosage: sp.catalog.dosage,
        sponsor: sp.sponsors?.name,
      }));

    // ── 3. Two-step AI diagnosis ─────────────────────────────
    const diagnosis = await diagnoseImage({
      imageBase64,
      imageUrl: null,
      cropType: crop_type,
      lang: lang || "ur",
      userId,
      sponsoredProducts: sponsoredForAI,
      weatherContext: weather,
    });

    // If ALL AI providers failed, return 503 instead of fake data
    if (diagnosis.diagnosis_status === "fallback") {
      return res.status(503).json({
        error: "System temporarily unavailable. Please try again later.",
      });
    }

    // ── 4. Store scan with weather + city + language ─────────
    const { data: scanRow } = await supabase
      .from("scans")
      .insert({
        user_id: userId,
        crop_type: crop_type || null,
        image_url: finalImageUrl,
        disease_name: diagnosis.disease_name,
        disease_name_ur: diagnosis.disease_name_ur,
        pathogen: diagnosis.pathogen,
        confidence: diagnosis.confidence,
        severity: diagnosis.severity,
        symptoms: diagnosis.symptoms || [],
        prevention: diagnosis.prevention || [],
        ai_provider: diagnosis.ai_provider,
        solution_provider: diagnosis.solution_provider,
        processing_ms: diagnosis.processing_ms,
        input_lang: lang || "ur",
        city: city || null,
        weather_temp: weather?.temp || null,
        weather_humidity: weather?.humidity || null,
        weather_condition: weather?.condition || null,
      })
      .select("id")
      .single();

    const scanId = scanRow?.id;

    // ── 5. Store treatments (link to catalog if possible) ────
    if (scanId && diagnosis.primary_treatment) {
      // Try to find matching catalog item
      const { data: catalogItem } = await supabase
        .from("catalog")
        .select("id")
        .ilike(
          "name",
          `%${(diagnosis.primary_treatment.name || "").split(" ")[0]}%`,
        )
        .limit(1)
        .single();

      await supabase.from("treatments").insert({
        scan_id: scanId,
        catalog_id: catalogItem?.id || null,
        is_primary: true,
        dosage: diagnosis.primary_treatment?.dosage,
        schedule: diagnosis.primary_treatment?.schedule,
        is_sponsored: sponsoredForAI.some((sp) =>
          sp.name
            ?.toLowerCase()
            .includes(
              (diagnosis.primary_treatment.name || "")
                .toLowerCase()
                .split(" ")[0],
            ),
        ),
      });
    }

    // ── 6. Update sponsored product impressions ───────────────
    if (sponsoredProducts && sponsoredProducts.length > 0) {
      supabase
        .from("sponsored_products")
        .update({
          impressions_today: (sponsoredProducts[0].impressions_today || 0) + 1,
        })
        .eq("id", sponsoredProducts[0].id)
        .then(() => {});
    }

    // ── 7. Tag alternative treatments as sponsored if applicable
    const altTreatments = (diagnosis.alt_treatments || []).map((t) => {
      const sponsoredMatch = (sponsoredProducts || []).find((sp) =>
        sp.catalog?.name
          ?.toLowerCase()
          .includes((t.name || "").toLowerCase().split(" ")[0]),
      );
      return {
        ...t,
        is_sponsored: !!sponsoredMatch,
        sponsor_name: sponsoredMatch?.sponsors?.name,
      };
    });

    res.json({
      scan_id: scanId,
      disease: {
        name: diagnosis.disease_name,
        name_ur: diagnosis.disease_name_ur,
        pathogen: diagnosis.pathogen,
        confidence: diagnosis.confidence,
        severity: diagnosis.severity,
      },
      symptoms: diagnosis.symptoms || [],
      prevention: diagnosis.prevention || [],
      treatment: {
        primary: { ...diagnosis.primary_treatment, is_sponsored: false },
        alternatives: altTreatments,
      },
      ai_provider: diagnosis.ai_provider,
      solution_provider: diagnosis.solution_provider,
      diagnosis_status: diagnosis.diagnosis_status,
      used_fallback: !!diagnosis.used_fallback,
      fallback_details: diagnosis.fallback_details || null,
      processing_ms: diagnosis.processing_ms,
      warning: diagnosis.used_fallback
        ? "Diagnosis used fallback mode. Result is not from full real AI pipeline."
        : null,
      reupload_needed: diagnosis.reupload_needed || false,
      reupload_message: diagnosis.reupload_message || null,
      image_url: finalImageUrl,
      // Context data shown alongside result
      weather: weather
        ? {
            city: weather.city,
            temp: weather.temp,
            humidity: weather.humidity,
            condition: weather.condition,
          }
        : null,
      city: city || null,
    });
  } catch (err) {
    console.error("diagnose error:", err);
    res.status(500).json({ error: "Diagnosis failed: " + err.message });
  }
});

// POST /api/diagnose/:id/feedback
router.post("/:id/feedback", auth, async (req, res) => {
  try {
    const { feedback } = req.body;
    if (!["positive", "negative", "neutral"].includes(feedback)) {
      return res
        .status(400)
        .json({ error: "feedback must be positive|negative|neutral" });
    }
    const { data: scan } = await supabase
      .from("scans")
      .select("id")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single();
    if (!scan) return res.status(404).json({ error: "Scan not found" });
    await supabase
      .from("scans")
      .update({ user_feedback: feedback })
      .eq("id", req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("feedback error:", err);
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

module.exports = router;
