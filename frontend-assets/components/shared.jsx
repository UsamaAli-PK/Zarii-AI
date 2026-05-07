/* global React, ReactDOM */

// ---------- Icons (stroke-based, brand-friendly) ----------
const Icon = ({
  name,
  size = 22,
  stroke = 1.7,
  color = "currentColor",
  style,
  ...rest
}) => {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style,
    ...rest,
  };
  switch (name) {
    case "leaf":
      return (
        <svg {...props}>
          <path d="M11 20A7 7 0 0 1 4 13c0-7 6-9 16-9 0 8-2 16-9 16Z" />
          <path d="M4 21c2-6 6-9 13-12" />
        </svg>
      );
    case "leaf-fill":
      return (
        <svg {...props} fill={color} stroke="none">
          <path
            d="M11 20A7 7 0 0 1 4 13c0-7 6-9 16-9 0 8-2 16-9 16Z"
            opacity=".15"
          />
          <path
            d="M11 20A7 7 0 0 1 4 13c0-7 6-9 16-9 0 8-2 16-9 16Z"
            stroke={color}
            strokeWidth="1.7"
            fill="none"
          />
          <path d="M4 21c2-6 6-9 13-12" stroke={color} strokeWidth="1.7" />
        </svg>
      );
    case "camera":
      return (
        <svg {...props}>
          <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h2L9 4h6l1.5 2h2A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-9Z" />
          <circle cx="12" cy="13" r="3.6" />
        </svg>
      );
    case "mic":
      return (
        <svg {...props}>
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <path d="M12 18v3" />
        </svg>
      );
    case "cloud-sun":
      return (
        <svg {...props}>
          <circle cx="7.5" cy="9" r="3" />
          <path d="M7.5 3v1.5M3 9h1.5M11.5 5l-1 1M3.5 13l1-1" />
          <path d="M9 17h8a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5" />
        </svg>
      );
    case "history":
      return (
        <svg {...props}>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 4v4h4" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "chart":
      return (
        <svg {...props}>
          <path d="M4 20V8M10 20V4M16 20v-7M22 20H2" />
        </svg>
      );
    case "home":
      return (
        <svg {...props}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v9h5v-5h4v5h5v-9" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...props}>
          <path d="M3 21l1.7-5.1A8.5 8.5 0 1 1 8.5 19L3 21Z" />
          <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.5-1.5-2-1-1 1c-1 0-2-1-2-2l1-1-1-2L9.5 8c0 0-.5.5-.5 1.5Z" />
        </svg>
      );
    case "globe":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...props}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "arrow-left":
      return (
        <svg {...props}>
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="M5 12.5 10 17l9-10" />
        </svg>
      );
    case "check-circle":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5 11 15.5 16 9.5" />
        </svg>
      );
    case "x":
      return (
        <svg {...props}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case "plus":
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "upload":
      return (
        <svg {...props}>
          <path d="M12 16V4M7 9l5-5 5 5" />
          <path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" />
        </svg>
      );
    case "image":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <circle cx="9" cy="10" r="2" />
          <path d="m4 18 5-5 4 4 3-3 4 4" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...props}>
          <path d="M12 4v4M12 16v4M4 12h4M16 12h4M7 7l2 2M15 15l2 2M17 7l-2 2M9 15l-2 2" />
        </svg>
      );
    case "play":
      return (
        <svg {...props} fill={color} stroke="none">
          <path d="M7 5v14l12-7L7 5Z" />
        </svg>
      );
    case "pause":
      return (
        <svg {...props} fill={color} stroke="none">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      );
    case "bell":
      return (
        <svg {...props}>
          <path d="M6 17h12l-1.5-2.5V11a4.5 4.5 0 1 0-9 0v3.5L6 17Z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      );
    case "menu":
      return (
        <svg {...props}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "pkr":
      return (
        <svg {...props}>
          <path d="M7 4h6a4 4 0 0 1 0 8H7" />
          <path d="M7 4v16M4 12h11M4 16h13" />
        </svg>
      );
    case "droplet":
      return (
        <svg {...props}>
          <path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z" />
        </svg>
      );
    case "thermometer":
      return (
        <svg {...props}>
          <path d="M14 14V5a2 2 0 1 0-4 0v9a4 4 0 1 0 4 0Z" />
        </svg>
      );
    case "wind":
      return (
        <svg {...props}>
          <path d="M3 8h12a3 3 0 1 0-3-3M3 12h17a3 3 0 1 1-3 3M3 16h9" />
        </svg>
      );
    case "pin":
      return (
        <svg {...props}>
          <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "phone":
      return (
        <svg {...props}>
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case "logout":
      return (
        <svg {...props}>
          <path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2" />
          <path d="M21 12H9M17 8l4 4-4 4" />
        </svg>
      );
    case "flask":
      return (
        <svg {...props}>
          <path d="M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3" />
          <path d="M7.5 13h9" />
        </svg>
      );
    case "sprout":
      return (
        <svg {...props}>
          <path d="M12 21v-7" />
          <path d="M12 14a5 5 0 0 0-5-5H4a5 5 0 0 0 5 5h3Z" />
          <path d="M12 14a5 5 0 0 1 5-5h3a5 5 0 0 1-5 5h-3Z" />
        </svg>
      );
    case "sun":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.5 1.5M17 17l1.5 1.5M5.5 18.5 7 17M17 7l1.5-1.5" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...props}>
          <path d="M7 18h10a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5A4 4 0 0 0 7 18Z" />
        </svg>
      );
    case "rain":
      return (
        <svg {...props}>
          <path d="M7 14h10a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5A4 4 0 0 0 7 14Z" />
          <path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3" />
        </svg>
      );
    case "edit":
      return (
        <svg {...props}>
          <path d="M4 20h4l10-10-4-4L4 16v4Z" />
          <path d="m13.5 6.5 4 4" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...props}>
          <path d="M6 3h12v18l-6-4-6 4V3Z" />
        </svg>
      );
    case "trend":
      return (
        <svg {...props}>
          <path d="M3 17 9 11l4 4 8-8" />
          <path d="M14 4h7v7" />
        </svg>
      );
    case "users":
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2 20a7 7 0 0 1 14 0" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M22 19a5 5 0 0 0-7-4.5" />
        </svg>
      );
    case "speaker":
      return (
        <svg {...props}>
          <path d="M5 9h3l5-4v14l-5-4H5V9Z" />
          <path d="M16 9a4 4 0 0 1 0 6" />
        </svg>
      );
    case "star":
      return (
        <svg {...props} fill={color} stroke="none">
          <path d="M12 3l2.7 6 6.3.7-4.7 4.4 1.3 6.4L12 17.5 6.4 20.5l1.3-6.4L3 9.7l6.3-.7L12 3Z" />
        </svg>
      );
    case "wifi-off":
      return (
        <svg {...props}>
          <path d="M2 8a14 14 0 0 1 4-2.6M22 8a14 14 0 0 0-9-3M5 12a9 9 0 0 1 4-2.5M19 12a9 9 0 0 0-3.5-2.2M9 16a4 4 0 0 1 6 0" />
          <path d="M12 20h.01" />
          <path d="M3 3l18 18" />
        </svg>
      );
    default:
      return null;
  }
};

// ---------- Bilingual text ----------
const T = ({ en, ur, lang, as: As = "span", urClass = "", ...rest }) => {
  if (lang === "ur")
    return (
      <As className={"urdu-inline " + urClass} {...rest}>
        {ur}
      </As>
    );
  return <As {...rest}>{en}</As>;
};

// ---------- Logo lockup ----------
const Logo = ({ size = 36, withWordmark = true, lang = "en" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <img
      src="assets/farmer-badge.png"
      alt="ZARii"
      width={size}
      height={size}
      style={{
        borderRadius: "50%",
        objectFit: "cover",
        boxShadow: "0 2px 6px rgba(31,74,44,0.18)",
      }}
    />
    {withWordmark && (
      <div style={{ lineHeight: 1 }}>
        <div
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: size * 0.62,
            color: "var(--green-900)",
            letterSpacing: "-0.02em",
          }}
        >
          ZARii<span style={{ color: "var(--green-500)" }}>.</span>
          <span
            style={{
              fontSize: size * 0.34,
              marginLeft: 4,
              color: "var(--green-500)",
              fontWeight: 700,
              verticalAlign: "super",
            }}
          >
            AI
          </span>
        </div>
        {size >= 36 && (
          <div
            className="urdu-inline"
            style={{
              fontSize: size * 0.28,
              color: "var(--ink-mute)",
              marginTop: 2,
            }}
          >
            آپ کے فصلوں کا ذہین ساتھی
          </div>
        )}
      </div>
    )}
  </div>
);

// ---------- Language toggle ----------
const LangToggle = ({ lang, setLang }) => (
  <div
    style={{
      display: "inline-flex",
      background: "var(--paper)",
      border: "1px solid var(--line)",
      borderRadius: 999,
      padding: 3,
      boxShadow: "var(--shadow-sm)",
    }}
  >
    {[
      { code: "en", label: "EN", font: "var(--font-en)" },
      { code: "ur", label: "اردو", font: "var(--font-ur)" },
    ].map((l) => (
      <button
        key={l.code}
        onClick={() => setLang(l.code)}
        style={{
          padding: "6px 12px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
          background: lang === l.code ? "var(--green-700)" : "transparent",
          color: lang === l.code ? "#fff" : "var(--ink-soft)",
          fontFamily: l.font,
          transition: "all .15s ease",
        }}
      >
        {l.label}
      </button>
    ))}
  </div>
);

// ---------- Decorative leaf SVG ----------
const LeafDeco = ({ style, color = "#9DCB7C", opacity = 0.3 }) => (
  <svg style={style} width="180" height="180" viewBox="0 0 180 180" fill="none">
    <path
      d="M30 150 Q40 60 150 30 Q145 100 70 145 Q50 155 30 150Z"
      fill={color}
      opacity={opacity}
    />
    <path
      d="M30 150 Q90 90 150 30"
      stroke={color}
      strokeWidth="1.5"
      opacity={opacity * 1.6}
      fill="none"
    />
  </svg>
);

// ---------- Tabular Section heading ----------
const SectionTitle = ({ eyebrow, en, ur, lang, align = "left" }) => (
  <div style={{ textAlign: align, marginBottom: 18 }}>
    {eyebrow && (
      <div
        style={{
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontSize: 12,
          fontWeight: 700,
          color: "var(--green-500)",
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </div>
    )}
    <h2
      style={{
        margin: 0,
        fontSize: 32,
        fontWeight: 800,
        lineHeight: 1.15,
        color: "var(--green-900)",
        letterSpacing: "-0.02em",
        fontFamily: lang === "ur" ? "var(--font-ur)" : "var(--font-en)",
        direction: lang === "ur" ? "rtl" : "ltr",
      }}
    >
      {lang === "ur" ? ur : en}
    </h2>
  </div>
);

// expose to other scripts
Object.assign(window, { Icon, T, Logo, LangToggle, LeafDeco, SectionTitle });
