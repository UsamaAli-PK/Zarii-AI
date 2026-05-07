/* global React, ReactDOM, Icon, Logo, LangToggle, LeafDeco */

// Shared app shell with sidebar
const AppShell = ({ user, lang, setLang, navigate, current, children }) => {
  const [sidebarOpen, setSidebarOpen] = useS_D(false);
  const items = [
    { id: "dashboard", en: "Dashboard", ur: "ڈیش بورڈ", icon: "home" },
    { id: "analyze", en: "Analyze crop", ur: "فصل کی تشخیص", icon: "camera" },
    { id: "voice", en: "Voice assistant", ur: "آواز معاون", icon: "mic" },
    { id: "history", en: "History", ur: "تاریخ", icon: "history" },
    { id: "analytics", en: "Insights", ur: "تجزیات", icon: "chart" },
    {
      id: "whatsapp-coming-soon",
      en: "WhatsApp bot",
      ur: "واٹس ایپ بوٹ",
      icon: "whatsapp",
    },
  ];

  return (
    <div
      className="app-shell"
      style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}
    >
      {/* Mobile hamburger button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          display: "none",
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 1001,
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "var(--paper)",
          border: "1px solid var(--line-soft)",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <Icon name={sidebarOpen ? "x" : "menu"} size={22} color="var(--green-900)" />
      </button>

      {/* Mobile menu dropdown overlay */}
      {sidebarOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            display: "none",
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 999,
          }}
        />
      )}
      {sidebarOpen && (
        <aside
          className="mobile-sidebar"
          style={{
            display: "none",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            width: 280,
            background: "var(--paper)",
            zIndex: 1000,
            padding: "24px 16px",
            flexDirection: "column",
            boxShadow: "var(--shadow-lg)",
            overflow: "auto",
          }}
        >
          <div style={{ padding: "0 8px 24px", borderBottom: "1px solid var(--line-soft)", marginBottom: 16 }}>
            <div onClick={() => { navigate("landing"); setSidebarOpen(false); }} style={{ cursor: "pointer" }}>
              <Logo size={36} lang={lang} />
            </div>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => { navigate(it.id); setSidebarOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: current === it.id ? "var(--green-50)" : "transparent",
                  color: current === it.id ? "var(--green-900)" : "var(--ink-soft)",
                  fontWeight: current === it.id ? 600 : 500,
                  fontSize: 15,
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <Icon name={it.icon} size={20} color={current === it.id ? "var(--green-700)" : "var(--ink-mute)"} />
                <span style={{ fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit" }}>
                  {lang === "ur" ? it.ur : it.en}
                </span>
              </button>
            ))}
          </nav>
          <div style={{ borderTop: "1px solid var(--line-soft)", paddingTop: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "var(--green-50)", marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--green-700)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                {(user?.name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--green-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.name || "Farmer"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <LangToggle lang={lang} setLang={setLang} />
              <button onClick={() => navigate("landing")} style={{ padding: 8, borderRadius: 8, color: "var(--ink-mute)" }}>
                <Icon name="logout" size={18} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Sidebar */}
      <aside
        className="app-sidebar"
        style={{
          width: 260,
          flexShrink: 0,
          background: "var(--paper)",
          borderRight: "1px solid var(--line-soft)",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div
          style={{
            padding: "0 8px 24px",
            borderBottom: "1px solid var(--line-soft)",
            marginBottom: 16,
          }}
        >
          <div
            onClick={() => navigate("landing")}
            style={{ cursor: "pointer" }}
          >
            <Logo size={36} lang={lang} />
          </div>
        </div>

        <nav
          style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}
        >
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => navigate(it.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: 12,
                background:
                  current === it.id ? "var(--green-50)" : "transparent",
                color:
                  current === it.id ? "var(--green-900)" : "var(--ink-soft)",
                fontWeight: current === it.id ? 600 : 500,
                fontSize: 14.5,
                textAlign: "left",
                position: "relative",
                transition: "all .12s",
              }}
            >
              {current === it.id && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 8,
                    bottom: 8,
                    width: 3,
                    background: "var(--green-700)",
                    borderRadius: 2,
                  }}
                />
              )}
              <Icon
                name={it.icon}
                size={19}
                color={
                  current === it.id ? "var(--green-700)" : "var(--ink-mute)"
                }
              />
              <span
                style={{
                  fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
                }}
              >
                {lang === "ur" ? it.ur : it.en}
              </span>
            </button>
          ))}
        </nav>

        <div
          style={{ borderTop: "1px solid var(--line-soft)", paddingTop: 14 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 12,
              background: "var(--green-50)",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--green-700)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {(user?.name || "U")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: "var(--green-900)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.name || "Farmer"}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-mute)" }}>
                {user?.phone || "+92 3xx xxxxxxx"}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <LangToggle lang={lang} setLang={setLang} />
            <button
              onClick={() => navigate("landing")}
              style={{ padding: 8, borderRadius: 8, color: "var(--ink-mute)" }}
            >
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main" style={{ flex: 1, minWidth: 0, overflow: "auto" }}>{children}</main>
    </div>
  );
};

// ============================================================
// DASHBOARD
// ============================================================
const Dashboard = ({ user, lang, navigate }) => {
  const [now, setNow] = useS_D(new Date());
  useE_D(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const greeting = (() => {
    const h = now.getHours();
    if (lang === "ur") {
      if (h < 12) return "صبح بخیر";
      if (h < 17) return "دوپہر بخیر";
      return "شام بخیر";
    }
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="dashboard-container" style={{ padding: "32px 40px", maxWidth: 1320, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              color: "var(--ink-mute)",
              fontWeight: 600,
              fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
            }}
          >
            {greeting},{" "}
            {now.toLocaleDateString("en-PK", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          <h1
            style={{
              margin: "4px 0 0",
              fontSize: 34,
              fontWeight: 800,
              color: "var(--green-900)",
              letterSpacing: "-0.02em",
              fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
              direction: lang === "ur" ? "rtl" : "ltr",
            }}
          >
            {lang === "ur" ? (
              <>
                السلام علیکم،{" "}
                <span style={{ color: "var(--green-500)" }}>
                  {user?.name?.split(" ")[0] || "کسان"}
                </span>{" "}
                🌾
              </>
            ) : (
              <>
                Hello {user?.name?.split(" ")[0] || "Farmer"}{" "}
                <span style={{ color: "var(--green-500)" }}>👋</span>
              </>
            )}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-secondary btn-sm"
            title="View disease alerts"
            style={{ position: "relative" }}
            onClick={() => navigate("history")}
          >
            <Icon name="bell" size={17} />
            <span
              style={{
                position: "absolute",
                top: 6,
                right: 8,
                width: 8,
                height: 8,
                background: "var(--amber)",
                borderRadius: "50%",
              }}
            />
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("analyze")}
          >
            <Icon name="camera" size={17} color="#fff" />
            {lang === "ur" ? (
              <span className="urdu-inline">نئی تشخیص</span>
            ) : (
              "New diagnosis"
            )}
          </button>
        </div>
      </div>

       {/* Big actions */}
       <div
         className="action-cards-row"
         style={{
           display: "grid",
           gridTemplateColumns: "1.4fr 1fr",
           gap: 18,
           marginBottom: 18,
         }}
       >
        {/* Analyze hero card */}
        <div
          onClick={() => navigate("analyze")}
          style={{
            background:
              "linear-gradient(135deg, var(--green-700) 0%, var(--green-900) 100%)",
            borderRadius: 24,
            padding: 32,
            color: "#fff",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            minHeight: 220,
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -30,
              top: -30,
              opacity: 0.12,
            }}
          >
            <Icon name="leaf-fill" size={260} color="#fff" />
          </div>
          <div
            className="tag"
            style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
          >
            <Icon name="sparkles" size={12} /> Vision AI
          </div>
          <h2
            style={{
              margin: "16px 0 6px",
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              maxWidth: 380,
              fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
              direction: lang === "ur" ? "rtl" : "ltr",
            }}
          >
            {lang === "ur"
              ? "پتے کی تصویر کھینچیں — بیماری پہچانیں"
              : "Snap a leaf, diagnose disease."}
          </h2>
          <p
            style={{
              margin: "0 0 24px",
              fontSize: 15,
              opacity: 0.85,
              maxWidth: 420,
              fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
              direction: lang === "ur" ? "rtl" : "ltr",
            }}
          >
            {lang === "ur"
              ? "صرف ۵ سیکنڈ میں دوا کا نام، قیمت اور مقدار حاصل کریں۔"
              : "Get the exact pesticide, PKR price, and dosage in 5 seconds."}
          </p>
          <button className="btn btn-amber">
            <Icon name="camera" size={16} />
            {lang === "ur" ? (
              <span className="urdu-inline">تصویر لیں</span>
            ) : (
              "Take photo"
            )}
          </button>
        </div>

        {/* Voice card */}
        <div
          onClick={() => navigate("voice")}
          style={{
            background: "var(--cream)",
            borderRadius: 24,
            padding: 28,
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            border: "1px solid #EAD9A8",
          }}
        >
          <div className="tag tag-amber" style={{ marginBottom: 14 }}>
            <Icon name="mic" size={12} /> Audio AI
          </div>
          <h3
            style={{
              margin: "0 0 6px",
              fontSize: 22,
              fontWeight: 800,
              color: "var(--green-900)",
            }}
          >
            {lang === "ur" ? (
              <span className="urdu-inline">آواز سے سوال کریں</span>
            ) : (
              "Ask in your voice"
            )}
          </h3>
          <p
            className="urdu-inline"
            style={{
              margin: 0,
              fontSize: 16,
              color: "var(--ink-soft)",
              display: "block",
            }}
          >
            "میرے گندم کے پتے کیوں سوکھ رہے ہیں؟"
          </p>
          <div
            style={{
              position: "absolute",
              right: 20,
              bottom: 20,
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--amber)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 24px rgba(244,166,42,0.4)",
              animation: "pulseRing 2s infinite",
            }}
          >
            <Icon name="mic" size={32} color="#fff" />
          </div>
        </div>
      </div>

       {/* 3-col strip */}
       <div
         className="three-col-strip"
         style={{
           display: "grid",
           gridTemplateColumns: "1fr 1fr 1fr",
           gap: 18,
           marginBottom: 24,
         }}
       >
        <WeatherCard lang={lang} user={user} />
        <AlertCard lang={lang} user={user} />
        <FarmHealthCard lang={lang} />
      </div>

       {/* Recent + suggestions */}
       <div
         className="recent-suggestions-row"
         style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }}
       >
        <RecentScans lang={lang} navigate={navigate} />
        <QuickAsk lang={lang} navigate={navigate} />
      </div>
    </div>
  );
};

const WeatherCard = ({ lang, user }) => {
  const [w, setW] = useS_D(null);
  const [loading, setLoading] = useS_D(true);
  useE_D(() => {
    (async () => {
      try {
        const data = await window.API.getWeather(
          null,
          null,
          user?.region || "Multan",
        );
        setW(data);
      } catch {
        setW(null);
      }
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="card" style={{ padding: 22, minHeight: 160 }}>
        <div
          style={{
            background: "var(--line-soft)",
            borderRadius: 8,
            height: 18,
            width: "60%",
            marginBottom: 12,
          }}
        />
        <div
          style={{
            background: "var(--line-soft)",
            borderRadius: 8,
            height: 38,
            width: "40%",
            marginBottom: 8,
          }}
        />
        <div
          style={{
            background: "var(--line-soft)",
            borderRadius: 8,
            height: 14,
            width: "50%",
          }}
        />
      </div>
    );

  if (!w)
    return (
      <div
        className="card"
        style={{
          padding: 22,
          textAlign: "center",
          color: "var(--ink-mute)",
          fontSize: 13,
        }}
      >
        <Icon name="cloud-sun" size={32} color="var(--ink-mute)" />
        <div style={{ marginTop: 8 }}>Weather unavailable</div>
      </div>
    );

  return (
    <div
      className="card"
      style={{ padding: 22, position: "relative", overflow: "hidden" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-mute)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <Icon name="pin" size={11} /> {w.city || user?.region || "Unknown"}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "var(--green-900)",
              marginTop: 6,
              letterSpacing: "-0.02em",
            }}
          >
            {w.temp}°
            <span
              style={{
                fontSize: 18,
                color: "var(--ink-mute)",
                fontWeight: 600,
              }}
            >
              C
            </span>
          </div>
          <div
            style={{ fontSize: 13, color: "var(--ink-soft)", fontWeight: 500 }}
          >
            {w.condition}
          </div>
        </div>
        <Icon name="cloud-sun" size={48} color="#F4A62A" />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 16,
          paddingTop: 14,
          borderTop: "1px solid var(--line-soft)",
        }}
      >
        {[
          { i: "droplet", v: (w.humidity || 0) + "%", l: "Humidity" },
          { i: "wind", v: (w.wind_speed || 0) + " km/h", l: "Wind" },
          { i: "rain", v: w.source === "mock" ? "N/A" : "—", l: "Rain" },
        ].map((m, i) => (
          <div key={i} style={{ textAlign: "center", flex: 1 }}>
            <Icon name={m.i} size={16} color="var(--green-500)" />
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--green-900)",
                marginTop: 4,
              }}
            >
              {m.v}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--ink-mute)" }}>
              {m.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AlertCard = ({ lang, user }) => {
  const [alerts, setAlerts] = useS_D(null);
  const [loading, setLoading] = useS_D(true);
  useE_D(() => {
    (async () => {
      try {
        if (window.API.isLoggedIn()) {
          const data = await window.API.getAlerts(user?.region);
          setAlerts(data.alerts || []);
        } else {
          setAlerts([]);
        }
      } catch {
        setAlerts([]);
      }
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div
        style={{
          padding: 22,
          borderRadius: 22,
          background: "var(--line-soft)",
          minHeight: 160,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            height: 18,
            width: "60%",
            marginBottom: 12,
          }}
        />
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            height: 24,
            width: "80%",
            marginBottom: 8,
          }}
        />
      </div>
    );

  const alert = alerts && alerts.length > 0 ? alerts[0] : null;

  if (!alert)
    return (
      <div
        style={{
          padding: 22,
          borderRadius: 22,
          background: "var(--green-50)",
          border: "1px solid var(--line-soft)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="check-circle" size={28} color="var(--green-500)" />
        <div
          style={{
            marginTop: 10,
            fontSize: 15,
            fontWeight: 700,
            color: "var(--green-900)",
          }}
        >
          {lang === "ur"
            ? "آپ کے علاقے میں کوئی الرٹ نہیں"
            : "No alerts in your region"}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 4 }}>
          All clear ✓
        </div>
      </div>
    );

  return (
    <div
      style={{
        padding: 22,
        borderRadius: 22,
        background: "linear-gradient(135deg, #FFF4DE 0%, #FCD58A 100%)",
        border: "1px solid #EAB87A",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="tag tag-amber" style={{ background: "#fff" }}>
        <Icon name="bell" size={11} color="#F4A62A" /> Regional alert
      </div>
      <h4
        style={{
          margin: "12px 0 6px",
          fontSize: 17,
          fontWeight: 800,
          color: "#5A3A00",
          letterSpacing: "-0.01em",
        }}
      >
        {alert.disease} on {alert.crop} — {alert.region}
      </h4>
      <p style={{ margin: 0, fontSize: 13, color: "#704800", lineHeight: 1.5 }}>
        {alert.pressure_level} pressure · {alert.farm_count || 0} farms affected
      </p>
    </div>
  );
};

const FarmHealthCard = ({ lang }) => {
  const [health, setHealth] = useS_D(null);
  const [loading, setLoading] = useS_D(true);
  useE_D(() => {
    (async () => {
      try {
        if (window.API.isLoggedIn()) {
          const data = await window.API.getHealthScore();
          setHealth(data);
        }
      } catch {
        setHealth(null);
      }
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="card" style={{ padding: 22, minHeight: 160 }}>
        <div
          style={{
            background: "var(--line-soft)",
            borderRadius: 8,
            height: 18,
            width: "60%",
            marginBottom: 12,
          }}
        />
        <div
          style={{
            background: "var(--line-soft)",
            borderRadius: 8,
            height: 38,
            width: "30%",
          }}
        />
      </div>
    );

  const score = health?.score ?? null;
  const trend = health?.trend || "stable";
  const timeline = health?.timeline || [];

  if (score === null)
    return (
      <div
        className="card"
        style={{
          padding: 22,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="chart" size={28} color="var(--ink-mute)" />
        <div
          style={{
            marginTop: 10,
            fontSize: 14,
            fontWeight: 600,
            color: "var(--green-900)",
          }}
        >
          Not enough data
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 4 }}>
          Scan your first crop to see your farm health score
        </div>
      </div>
    );

  // Build sparkline from timeline
  const maxS = Math.max(...timeline.map((t) => t.score), 100);
  const minS = Math.min(...timeline.map((t) => t.score), 0);
  const points = timeline
    .map((t, i) => {
      const x = (i / Math.max(timeline.length - 1, 1)) * 200;
      const y = 50 - ((t.score - minS) / Math.max(maxS - minS, 1)) * 42;
      return `${x} ${y}`;
    })
    .join(" L");
  const fillPath = points ? `M${points} L200 50 L0 50 Z` : "";
  const linePath = points ? `M${points}` : "";

  return (
    <div className="card" style={{ padding: 22 }}>
      <div
        style={{
          fontSize: 12,
          color: "var(--ink-mute)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Farm health · 30d
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginTop: 8,
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: "var(--green-700)",
            letterSpacing: "-0.02em",
          }}
        >
          {score}
        </div>
        <div style={{ fontSize: 14, color: "var(--ink-mute)" }}>/100</div>
        <div
          className={`tag ${trend === "up" ? "tag-green" : "tag-amber"}`}
          style={{ marginLeft: "auto" }}
        >
          <Icon name="trend" size={11} /> {trend === "up" ? "+" : "="}
        </div>
      </div>
      {timeline.length > 1 && (
        <svg
          viewBox="0 0 200 50"
          style={{ width: "100%", height: 50, marginTop: 12 }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#66A64F" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#66A64F" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={fillPath} fill="url(#spark)" />
          <path
            d={linePath}
            fill="none"
            stroke="#66A64F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
        {trend === "up" ? "Trending healthier" : "Stable"}
      </div>
    </div>
  );
};

const RecentScans = ({ lang, navigate }) => {
  const [scans, setScans] = useS_D(null);
  const [loading, setLoading] = useS_D(true);
  useE_D(() => {
    (async () => {
      try {
        if (window.API.isLoggedIn()) {
          const data = await window.API.getRecentScans(4);
          setScans(data.scans || []);
        } else {
          setScans([]);
        }
      } catch {
        setScans([]);
      }
      setLoading(false);
    })();
  }, []);

  const sevColor = {
    None: "#66A64F",
    Low: "#66A64F",
    Moderate: "#F4A62A",
    High: "#D04E2C",
    Critical: "#8B0000",
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return days === 1 ? "Yesterday" : `${days} days ago`;
  };

  return (
    <div className="card" style={{ padding: 22 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: "var(--green-900)",
            fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
          }}
        >
          {lang === "ur" ? (
            <span className="urdu-inline">حالیہ تشخیصیں</span>
          ) : (
            "Recent scans"
          )}
        </h3>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate("history")}
        >
          {lang === "ur" ? (
            <span className="urdu-inline">سب دیکھیں</span>
          ) : (
            "See all"
          )}{" "}
          <Icon name="arrow-right" size={13} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "var(--line-soft)",
                borderRadius: 12,
                height: 52,
              }}
            />
          ))}
        </div>
      ) : !scans || scans.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: "var(--ink-mute)",
          }}
        >
          <Icon name="camera" size={32} color="var(--ink-mute)" />
          <div style={{ marginTop: 10, fontSize: 14, fontWeight: 600 }}>
            {lang === "ur" ? "ابھی تک کوئی تشخیص نہیں" : "No scans yet"}
          </div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            {lang === "ur" ? "پہلی تشخیص کریں!" : "Try your first diagnosis!"}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {scans.map((s, i) => (
            <div
              key={s.id || i}
              onClick={() => navigate("analyze")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 8px",
                borderRadius: 12,
                cursor: "pointer",
                borderTop: i > 0 ? "1px solid var(--line-soft)" : "none",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${sevColor[s.severity] || "#66A64F"}33 0%, ${sevColor[s.severity] || "#66A64F"}11 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CropGlyph crop={s.crop_type} size={28} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--green-900)",
                  }}
                >
                  {s.crop_type} · {s.disease_name || "Healthy ✓"}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                  {s.confidence
                    ? `${Math.round(s.confidence)}% confidence`
                    : ""}
                  {s.severity && s.severity !== "None"
                    ? ` · ${s.severity}`
                    : ""}{" "}
                  · {timeAgo(s.created_at)}
                </div>
              </div>
              {s.confidence && (
                <div
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    background: (sevColor[s.severity] || "#66A64F") + "22",
                    color: sevColor[s.severity] || "#66A64F",
                  }}
                >
                  {Math.round(s.confidence)}%
                </div>
              )}
              <Icon name="arrow-right" size={16} color="var(--ink-mute)" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CropGlyph = ({ crop, size = 24 }) => {
  // Simple emoji-ish glyph using SVG
  const map = {
    Tomato: { c: "#D04E2C", e: "🍅" },
    Cotton: { c: "#9DCB7C", e: "🌾" },
    Wheat: { c: "#E8B85B", e: "🌾" },
    Potato: { c: "#A37A4F", e: "🥔" },
    Rice: { c: "#C8B775", e: "🌾" },
    Mango: { c: "#F4A62A", e: "🥭" },
  };
  const m = map[crop] || { c: "#66A64F", e: "🌱" };
  return <div style={{ fontSize: size }}>{m.e}</div>;
};

const QuickAsk = ({ lang, navigate }) => {
  const suggestions = [
    { en: "When should I water my wheat?", ur: "گندم کب پانی دینا چاہیے؟" },
    { en: "Best fertilizer for cotton?", ur: "کاٹن کے لیے بہترین کھاد؟" },
    { en: "How to prevent fungus on tomato?", ur: "ٹماٹر پر فنگس سے بچاؤ؟" },
    { en: "When to harvest mango?", ur: "آم کب توڑنا چاہیے؟" },
  ];
  return (
    <div className="card" style={{ padding: 22 }}>
      <h3
        style={{
          margin: "0 0 14px",
          fontSize: 18,
          fontWeight: 700,
          color: "var(--green-900)",
          fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
        }}
      >
        {lang === "ur" ? (
          <span className="urdu-inline">جلدی پوچھیں</span>
        ) : (
          "Quick ask"
        )}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {suggestions.map((q, i) => (
          <button
            key={i}
            onClick={() => {
              const text = lang === "ur" ? q.ur : q.en;
              sessionStorage.setItem("zarii_quick_ask", text);
              navigate("voice");
            }}
            style={{
              padding: "12px 14px",
              textAlign: "left",
              background: "var(--green-50)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              transition: "background .15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--green-100)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--green-50)")
            }
          >
            <span
              style={{
                fontSize: 13.5,
                color: "var(--green-900)",
                fontWeight: 500,
                fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
                direction: lang === "ur" ? "rtl" : "ltr",
              }}
            >
              {lang === "ur" ? q.ur : q.en}
            </span>
            <Icon name="arrow-right" size={14} color="var(--green-700)" />
          </button>
        ))}
      </div>
    </div>
  );
};

window.AppShell = AppShell;
window.Dashboard = Dashboard;
window.CropGlyph = CropGlyph;
