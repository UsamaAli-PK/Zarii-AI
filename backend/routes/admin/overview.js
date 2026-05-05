const router = require("express").Router();
const supabase = require("../../supabase");

// GET /api/admin/overview
router.get("/", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    const [
      { count: totalUsers },
      { count: scansToday },
      { count: scans7d },
      { data: apiKeys },
      { data: recentScans },
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase
        .from("scans")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today),
      supabase
        .from("scans")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo),
      supabase.from("api_keys").select("*").order("pool").order("priority"),
      supabase
        .from("scans")
        .select(
          "id, user_id, crop_type, disease_name, confidence, severity, created_at, users(name, region)",
        )
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const { data: confData } = await supabase
      .from("scans")
      .select("confidence")
      .gte("created_at", weekAgo);
    const avgConf =
      confData && confData.length > 0
        ? confData.reduce((s, r) => s + (r.confidence || 0), 0) /
          confData.length
        : null;

    const { count: activeOutbreaks } = await supabase
      .from("outbreaks")
      .select("*", { count: "exact", head: true })
      .in("pressure_level", ["High", "Critical"]);

    const { data: dauData } = await supabase
      .from("scans")
      .select("user_id")
      .gte("created_at", today);
    const dau = new Set((dauData || []).map((r) => r.user_id)).size;

    // Fetch 7-day window in 2 queries instead of 14
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const [{ data: scanDates }, { data: voiceDates }] = await Promise.all([
      supabase
        .from("scans")
        .select("created_at")
        .gte("created_at", sevenDaysAgo),
      supabase
        .from("voice_queries")
        .select("created_at")
        .gte("created_at", sevenDaysAgo),
    ]);
    const scansByDay = {},
      voiceByDay = {};
    (scanDates || []).forEach((r) => {
      const d = r.created_at.slice(0, 10);
      scansByDay[d] = (scansByDay[d] || 0) + 1;
    });
    (voiceDates || []).forEach((r) => {
      const d = r.created_at.slice(0, 10);
      voiceByDay[d] = (voiceByDay[d] || 0) + 1;
    });
    const chartDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000)
        .toISOString()
        .slice(0, 10);
      return { date: d, scans: scansByDay[d] || 0, voice: voiceByDay[d] || 0 };
    });

    res.json({
      kpis: {
        dau: dau,
        total_users: totalUsers || 0,
        scans_today: scansToday || 0,
        scans_7d: scans7d || 0,
        avg_confidence:
          avgConf !== null ? parseFloat(avgConf.toFixed(1)) : null,
        active_outbreaks: activeOutbreaks || 0,
        api_burn_24h: (apiKeys || []).reduce(
          (sum, k) => sum + (k.cost_mtd || 0),
          0,
        ),
      },
      system_health: (apiKeys || []).map((k) => ({
        id: k.id,
        pool: k.pool,
        provider: k.provider,
        status: k.status,
        latency: k.latency_p95 || null,
        calls_today: k.calls_today,
        cost_mtd: k.cost_mtd,
      })),
      live_feed: (recentScans || []).map((s) => ({
        user: s.users?.name || "Unknown",
        region: s.users?.region || "Punjab",
        crop: s.crop_type,
        disease: s.disease_name,
        time: s.created_at,
      })),
      chart_data: chartDays,
    });
  } catch (err) {
    console.error("overview error:", err);
    res.status(500).json({ error: "Failed to load overview" });
  }
});

module.exports = router;
