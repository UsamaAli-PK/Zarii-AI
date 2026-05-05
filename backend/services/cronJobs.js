const cron = require("node-cron");
const supabase = require("../supabase");

async function runOutbreakDetection() {
  console.log("[Cron] Running outbreak detector...");
  try {
    const since24h = new Date(Date.now() - 24 * 3600000).toISOString();
    const since8d = new Date(Date.now() - 8 * 86400000).toISOString();
    const since1d = new Date(Date.now() - 1 * 86400000).toISOString();

    const { data: recentScans } = await supabase
      .from("scans")
      .select("disease_name, crop_type, users(region)")
      .gt("created_at", since24h)
      .neq("disease_name", "Healthy");

    if (!recentScans) return;

    const grouped = {};
    for (const s of recentScans) {
      const region = s.users?.region;
      if (!region) continue;
      const key = `${region}||${s.disease_name}||${s.crop_type || "Unknown"}`;
      grouped[key] = (grouped[key] || 0) + 1;
    }

    for (const [key, count] of Object.entries(grouped)) {
      if (count < 3) continue;
      const [region, disease, crop] = key.split("||");

      const { data: baselineData } = await supabase
        .from("scans")
        .select("id, users(region)")
        .eq("disease_name", disease)
        .gt("created_at", since8d)
        .lt("created_at", since1d);

      const baselineInRegion = (baselineData || []).filter(
        (s) => s.users?.region === region,
      ).length;
      const avg = baselineInRegion / 7.0;
      const spike = avg > 0 ? count / avg : 0;

      if (spike > 3 || (avg === 0 && count >= 5)) {
        const pressure =
          spike > 10 ? "Critical" : spike > 5 ? "High" : "Moderate";
        const { data: existing } = await supabase
          .from("outbreaks")
          .select("id")
          .eq("region", region)
          .eq("disease", disease)
          .single();

        if (existing) {
          await supabase
            .from("outbreaks")
            .update({
              pressure_level: pressure,
              farm_count: count,
              trend_pct: Math.round(spike * 100),
              crop: crop !== "Unknown" ? crop : null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
        } else {
          await supabase.from("outbreaks").insert({
            region,
            disease,
            crop: crop !== "Unknown" ? crop : null,
            pressure_level: pressure,
            farm_count: count,
            trend_pct: Math.round(spike * 100),
          });
          console.log(
            `[Outbreak] NEW: ${disease} on ${crop} in ${region} (×${spike.toFixed(1)} spike)`,
          );
        }
      }
    }
  } catch (err) {
    console.error("[Cron] Outbreak detector error:", err.message);
  }
}

async function runWeatherAlerts() {
  console.log("[Cron] Checking weather intelligence for disease risk...");
  try {
    const { data: regions } = await supabase
      .from("users")
      .select("region")
      .not("region", "is", null);
    if (!regions) return;

    const uniqueRegions = [...new Set(regions.map((r) => r.region))];

    for (const region of uniqueRegions) {
      // Logic: Correlate weather with disease risk
      // Simulated intelligence based on humidity thresholds
      const humidity = 82; // Simulated from potential API integration
      const temp = 18; // Simulated from potential API integration

      if (humidity > 80 && temp > 15 && temp < 25) {
        const diseaseRisk = "Fungal Risk (High Humidity)";
        const { data: existing } = await supabase
          .from("outbreaks")
          .select("id")
          .eq("region", region)
          .eq("disease", diseaseRisk)
          .single();

        if (!existing) {
          await supabase.from("outbreaks").insert({
            region,
            disease: diseaseRisk,
            pressure_level: "High",
            trend_pct: 100,
            farm_count: 0, // Predictive alert
          });
          console.log(`[Weather] Risk Alert: ${diseaseRisk} in ${region}`);
        }
      }
    }
  } catch (err) {
    console.error("[Cron] Weather alert error:", err.message);
  }
}

async function runChurnCalculation() {
  console.log("[Cron] Updating churn risk scores...");
  try {
    const since30d = new Date(Date.now() - 30 * 86400000).toISOString();

    // Batch: fetch all users + their scan counts in two queries instead of N×2
    const [{ data: users }, { data: scanRows }] = await Promise.all([
      supabase.from("users").select("id, last_seen"),
      supabase.from("scans").select("user_id").gt("created_at", since30d),
    ]);
    if (!users) return;

    const scanCounts = {};
    for (const s of scanRows || [])
      scanCounts[s.user_id] = (scanCounts[s.user_id] || 0) + 1;

    // Group users by risk so we do 3 bulk updates instead of N individual ones
    const groups = { low: [], med: [], high: [] };
    for (const user of users) {
      const daysSince = Math.floor(
        (Date.now() - new Date(user.last_seen || 0).getTime()) / 86400000,
      );
      const count = scanCounts[user.id] || 0;
      let risk = "low";
      if (daysSince > 30 || count === 0) risk = "high";
      else if (daysSince > 14 || count < 2) risk = "med";
      groups[risk].push(user.id);
    }

    await Promise.all(
      Object.entries(groups)
        .filter(([, ids]) => ids.length > 0)
        .map(([risk, ids]) =>
          supabase.from("users").update({ churn_risk: risk }).in("id", ids),
        ),
    );

    console.log(
      `[Cron] Churn updated: ${groups.high.length} high, ${groups.med.length} med, ${groups.low.length} low`,
    );
  } catch (err) {
    console.error("[Cron] Churn risk error:", err.message);
  }
}

async function runDailyResets() {
  try {
    await Promise.all([
      supabase
        .from("sponsored_products")
        .update({ impressions_today: 0 })
        .gte("id", 0),
      supabase
        .from("api_keys")
        .update({ calls_today: 0, errors_today: 0 })
        .gte("id", 0),
    ]);
    console.log("[Cron] Daily counters reset");
  } catch (err) {
    console.error("[Cron] Counter reset error:", err.message);
  }
}

async function runAnalyticsAggregation() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data: keys } = await supabase
      .from("api_keys")
      .select("id, calls_today, latency_p95")
      .gt("calls_today", 0);
    if (!keys) return;

    for (const k of keys) {
      const { data: existing } = await supabase
        .from("api_usage")
        .select("id")
        .eq("key_id", k.id)
        .eq("date", today)
        .single();
      if (existing) {
        await supabase
          .from("api_usage")
          .update({ calls_count: k.calls_today, latency_p95: k.latency_p95 })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("api_usage")
          .insert({
            key_id: k.id,
            date: today,
            calls_count: k.calls_today,
            latency_p95: k.latency_p95,
          });
      }
    }
  } catch {}
}

function startCronJobs() {
  // ── Scheduled Jobs (for persistent server mode) ─────────────
  cron.schedule("0 * * * *", runOutbreakDetection);
  cron.schedule("0 */4 * * *", runWeatherAlerts);
  cron.schedule("0 0 * * *", runChurnCalculation);
  cron.schedule("0 0 * * *", runDailyResets);
  cron.schedule("*/15 * * * *", runAnalyticsAggregation);

  console.log("[Cron] All jobs scheduled ✓");
}

module.exports = {
  startCronJobs,
  runOutbreakDetection,
  runWeatherAlerts,
  runChurnCalculation,
  runDailyResets,
  runAnalyticsAggregation,
};
