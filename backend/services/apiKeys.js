const supabase = require("../supabase");
const crypto = require("crypto");

const ENCRYPT_KEY =
  process.env.ENCRYPT_KEY || "zarii-key-32-char-secret-padding!";
const KEY = crypto.scryptSync(ENCRYPT_KEY, "salt", 32);

// Decryption helper
const decrypt = (encryptedText) => {
  try {
    const parts = encryptedText.split(":");
    if (parts.length < 2) return encryptedText; // Fallback for unencrypted legacy keys
    const iv = Buffer.from(parts.shift(), "hex");
    const encrypted = Buffer.from(parts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error("[API Keys Service] Decryption failed:", err.message);
    return "[decryption error]";
  }
};

let cache = {
  vision: [],
  voice: [],
  weather: [],
};
let lastFetched = 0;

const fetchKeys = async () => {
  if (Date.now() - lastFetched < 60000) return; // cache for 60s
  try {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .order("priority", { ascending: true });
    if (error) throw error;

    cache = { vision: [], voice: [], weather: [] };
    for (const row of data) {
      if (!cache[row.pool]) cache[row.pool] = [];
      if (row.status !== "down") {
        cache[row.pool].push({
          ...row,
          api_key: decrypt(row.key_encrypted),
        });
      }
    }
    lastFetched = Date.now();
  } catch (err) {
    console.error("[API Keys Service] Failed to fetch keys:", err);
  }
};

const getServiceKey = async (pool, filterFn = null) => {
  await fetchKeys();
  let poolKeys = cache[pool] || [];

  if (filterFn) {
    poolKeys = poolKeys.filter(filterFn);
  }

  if (!poolKeys || poolKeys.length === 0) {
    console.warn(
      `[API Keys Service] No healthy keys in pool '${pool}'${filterFn ? " with filter" : ""}. Falling back to process.env.`,
    );
    // Fallback logic
    if (pool === "vision") {
      return {
        api_key: process.env.GEMINI_API_KEY,
        model_id: "gemini-1.5-flash",
        provider: "env",
      };
    }
    if (pool === "voice") {
      // If filtering for TTS vs STT
      return {
        api_key: process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || "",
        model_id: "whisper-large-v3-turbo",
        provider: "env",
      };
    }
    if (pool === "weather") {
      return {
        api_key:
          process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || "",
        provider: "env",
      };
    }
    return null;
  }

  // Simple weighted random selection for healthy keys
  const totalWeight = poolKeys.reduce((acc, k) => acc + k.weight, 0);
  let random = Math.random() * totalWeight;
  for (const k of poolKeys) {
    random -= k.weight;
    if (random <= 0) return k;
  }
  return poolKeys[0];
};

// Get all keys in a pool (for retry logic)
const getAllServiceKeys = async (pool) => {
  await fetchKeys();
  return cache[pool] || [];
};

const reportUsage = async (id, success) => {
  if (!id) return; // env fallback
  try {
    const rpcName = success ? "increment_api_usage" : "increment_api_error";
    await supabase.rpc(rpcName, { key_id: id });
  } catch (err) {
    console.error("[API Keys Service] Usage report error:", err);
  }
};

// Force-clear the in-memory cache so next call re-fetches from DB.
// Called by the admin API keys routes after add/update/delete.
const clearCache = () => {
  lastFetched = 0;
  cache = { vision: [], voice: [], weather: [] };
  console.log("[API Keys] Cache cleared — will re-fetch on next request");
};

module.exports = {
  getServiceKey,
  getAllServiceKeys,
  reportUsage,
  fetchKeys,
  clearCache,
};
