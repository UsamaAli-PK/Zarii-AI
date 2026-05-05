const router = require("express").Router();
const supabase = require("../supabase");
const auth = require("../middleware/auth");

// GET /api/users/me
router.get("/me", auth, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .single();
    if (!user) return res.status(404).json({ error: "User not found" });

    const [{ count: scanCount }, { count: voiceCount }] = await Promise.all([
      supabase
        .from("scans")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("voice_queries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    res.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      lang: user.lang,
      region: user.region,
      crops: user.crops || [],
      channel: user.channel,
      premium: !!user.premium,
      created_at: user.created_at,
      last_seen: user.last_seen,
      stats: { total_scans: scanCount || 0, total_voice: voiceCount || 0 },
    });
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// PATCH /api/users/me
router.patch("/me", auth, async (req, res) => {
  try {
    const { name, lang, region, crops } = req.body;
    const updates = { last_seen: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (lang !== undefined) updates.lang = lang;
    if (region !== undefined) updates.region = region;
    if (crops !== undefined) updates.crops = crops;

    await supabase.from("users").update(updates).eq("id", req.user.id);
    const { data: updated } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .single();
    res.json({ success: true, user: updated });
  } catch (err) {
    console.error("PATCH /me error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// GET /api/users/me/health-score
router.get("/me/health-score", auth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: scans } = await supabase
      .from("scans")
      .select("severity, created_at")
      .eq("user_id", req.user.id)
      .gt("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: true });

    const sevMap = { None: 100, Low: 85, Moderate: 60, High: 35, Critical: 10 };
    let score = 80;
    if (scans && scans.length > 0) {
      const avg =
        scans.reduce((sum, s) => sum + (sevMap[s.severity] || 60), 0) /
        scans.length;
      score = Math.round(avg);
    }

    // Fetch all 7 days in 1 query instead of 7
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: weekScans } = await supabase
      .from("scans")
      .select("severity, created_at")
      .eq("user_id", req.user.id)
      .gte("created_at", sevenDaysAgo);
    const byDay = {};
    (weekScans || []).forEach((s) => {
      const d = s.created_at.slice(0, 10);
      if (!byDay[d]) byDay[d] = [];
      byDay[d].push(sevMap[s.severity] || 60);
    });
    const timeline = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000)
        .toISOString()
        .slice(0, 10);
      const vals = byDay[d];
      const dayScore = vals
        ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
        : score;
      return { date: d, score: dayScore };
    });

    res.json({
      score,
      trend: scans && scans.length > 1 ? "up" : "stable",
      timeline,
    });
  } catch (err) {
    console.error("health-score error:", err);
    res.status(500).json({ error: "Failed to get health score" });
  }
});

module.exports = router;
