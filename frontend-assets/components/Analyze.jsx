/* global React, Icon, CropGlyph */
const {
  useState: useS_A,
  useEffect: useE_A,
  useRef: useR_A,
  useCallback: useC_A,
} = React;

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function getFileExtension(name) {
  if (!name || typeof name !== "string") return "";
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex < 0) return "";
  return name.slice(dotIndex).toLowerCase();
}

function isAllowedImageFile(file) {
  if (!file) return false;
  const mime = (file.type || "").toLowerCase();
  const ext = getFileExtension(file.name);
  return (
    ALLOWED_IMAGE_MIME_TYPES.includes(mime) &&
    ALLOWED_IMAGE_EXTENSIONS.includes(ext)
  );
}

// ============================================================
// ANALYZE CROP
// ============================================================
const Analyze = ({ lang, navigate, user }) => {
  const [stage, setStage] = useS_A("upload");
  const [crop, setCrop] = useS_A("Tomato");
  const [selectedFile, setSelectedFile] = useS_A(null);
  const [previewUrl, setPreviewUrl] = useS_A(null);
  const [diagnosis, setDiagnosis] = useS_A(null);
  const [scanId, setScanId] = useS_A(null);
  const [error, setError] = useS_A("");
  const fileRef = useR_A();

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!isAllowedImageFile(file)) {
      setError(
        lang === "ur"
          ? "صرف JPG, JPEG, PNG یا WEBP فائل اپلوڈ کریں۔ لنک/URL قابل قبول نہیں۔"
          : "Upload image file only (JPG, JPEG, PNG, WEBP). Links/URLs are not allowed.",
      );
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const startAnalysis = async () => {
    setStage("analyzing");
    setError("");
    try {
      let result;
      if (selectedFile && window.API && window.API.isLoggedIn()) {
        const fd = new FormData();
        fd.append("image", selectedFile);
        fd.append("crop_type", crop);
        fd.append("lang", lang);
        result = await window.API.diagnose(fd);

        // Handle reupload needed
        if (result.reupload_needed) {
          setError(result.reupload_message || "Please upload a clearer image.");
          setDiagnosis(null);
          setStage("upload");
          return;
        }

        setDiagnosis(result);
        setScanId(result.scan_id);
      } else {
        // Demo mode — show example result clearly labelled
        await new Promise((r) => setTimeout(r, 2800));
        setDiagnosis({ _isDemo: true });
      }
      setStage("result");
    } catch (err) {
      console.error("Diagnosis error:", err);
      setError(err.message || "Analysis failed. Please try again.");
      setDiagnosis(null);
      setStage("result");
    }
  };

  const reset = () => {
    setStage("upload");
    setSelectedFile(null);
    setPreviewUrl(null);
    setDiagnosis(null);
    setScanId(null);
    setError("");
  };

  return (
    <div className="analyze-page-container" style={{ padding: "32px 40px", maxWidth: 1240, margin: "0 auto" }}>
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate("dashboard")}
        >
          <Icon name="arrow-left" size={16} /> Dashboard
        </button>
        <div style={{ height: 14, width: 1, background: "var(--line)" }} />
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 800,
            color: "var(--green-900)",
            letterSpacing: "-0.02em",
            fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
          }}
        >
          {lang === "ur" ? (
            <span className="urdu-inline">فصل کی تشخیص</span>
          ) : (
            "Analyze your crop"
          )}
        </h1>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 16px",
            background: "#FFF8F2",
            border: "1px solid #F4A62A",
            borderRadius: 10,
            fontSize: 13,
            color: "#8a5d00",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icon name="bell" size={14} color="#F4A62A" /> {error}
        </div>
      )}

      {stage === "upload" && (
        <div
          className="analyze-upload-row"
          style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}
        >
          <div className="card" style={{ padding: 32 }}>
            <h2
              style={{
                margin: "0 0 6px",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--green-900)",
                fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
              }}
            >
              {lang === "ur" ? (
                <span className="urdu-inline">پتے کی تصویر اپلوڈ کریں</span>
              ) : (
                "Upload a leaf photo"
              )}
            </h2>
            <p
              style={{
                margin: "0 0 20px",
                fontSize: 14,
                color: "var(--ink-soft)",
                fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
                direction: lang === "ur" ? "rtl" : "ltr",
              }}
            >
              {lang === "ur"
                ? "متاثرہ پتا اچھی روشنی میں قریب سے کھینچیں۔"
                : "Take a close-up of the affected leaf in good daylight for the best result."}
            </p>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              ref={fileRef}
              style={{ display: "none" }}
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />

            <div
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileSelect(e.dataTransfer.files[0]);
              }}
              style={{
                border: "2px dashed var(--green-300)",
                borderRadius: 18,
                padding: previewUrl ? 0 : 56,
                background: "var(--green-50)",
                textAlign: "center",
                cursor: "pointer",
                transition: "all .15s",
                overflow: "hidden",
                minHeight: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                if (!previewUrl) {
                  e.currentTarget.style.background = "var(--green-100)";
                  e.currentTarget.style.borderColor = "var(--green-500)";
                }
              }}
              onMouseLeave={(e) => {
                if (!previewUrl) {
                  e.currentTarget.style.background = "var(--green-50)";
                  e.currentTarget.style.borderColor = "var(--green-300)";
                }
              }}
            >
              {previewUrl ? (
                <div style={{ position: "relative", width: "100%" }}>
                  <img
                    src={previewUrl}
                    style={{
                      width: "100%",
                      maxHeight: 300,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <div style={{ position: "absolute", top: 10, right: 10 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        reset();
                      }}
                      style={{ background: "rgba(255,255,255,0.9)" }}
                    >
                      <Icon name="plus" size={14} /> Change
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "var(--paper)",
                      margin: "0 auto 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <Icon name="upload" size={32} color="var(--green-700)" />
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--green-900)",
                    }}
                  >
                    {lang === "ur" ? (
                      <span className="urdu-inline">
                        یہاں تصویر چھوڑیں یا کلک کریں
                      </span>
                    ) : (
                      "Drop a photo here, or click to browse"
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--ink-mute)",
                      marginTop: 6,
                    }}
                  >
                    JPG, JPEG, PNG, WEBP only · up to 10MB
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                marginTop: 16,
              }}
            >
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  fileRef.current.click();
                }}
              >
                <Icon name="camera" size={16} />{" "}
                {lang === "ur" ? (
                  <span className="urdu-inline">تصویر منتخب کریں</span>
                ) : (
                  "Select photo"
                )}
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={
                  previewUrl
                    ? startAnalysis
                    : () =>
                        setError(
                          lang === "ur"
                            ? "پہلے پتے کی تصویر اپلوڈ کریں"
                            : "Please upload a leaf photo first",
                        )
                }
                style={{
                  background: previewUrl ? "var(--green-700)" : "#9DCB7C",
                  opacity: previewUrl ? 1 : 0.65,
                }}
              >
                <Icon name="sparkles" size={16} color="#fff" />
                {lang === "ur" ? (
                  <span className="urdu-inline">تجزیہ شروع کریں</span>
                ) : (
                  "Analyze now"
                )}
              </button>
            </div>

            <div style={{ marginTop: 22 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--green-900)",
                  marginBottom: 10,
                }}
              >
                {lang === "ur" ? (
                  <span className="urdu-inline">فصل منتخب کریں (اختیاری)</span>
                ) : (
                  "Crop type (optional, helps accuracy)"
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  "Tomato",
                  "Cotton",
                  "Wheat",
                  "Potato",
                  "Rice",
                  "Mango",
                  "Sugarcane",
                  "Other",
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCrop(c)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      background:
                        crop === c ? "var(--green-700)" : "var(--paper)",
                      color: crop === c ? "#fff" : "var(--ink-soft)",
                      border:
                        "1.5px solid " +
                        (crop === c ? "var(--green-700)" : "var(--line)"),
                    }}
                  >
                    {c === "Tomato" && "🍅 "}
                    {c === "Cotton" && "🌿 "}
                    {c === "Wheat" && "🌾 "}
                    {c === "Potato" && "🥔 "}
                    {c === "Rice" && "🌾 "}
                    {c === "Mango" && "🥭 "}
                    {c === "Sugarcane" && "🎋 "}
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div
            className="card"
            style={{ padding: 28, background: "var(--cream-50)" }}
          >
            <h3
              style={{
                margin: "0 0 14px",
                fontSize: 17,
                fontWeight: 700,
                color: "var(--green-900)",
                fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
              }}
            >
              {lang === "ur" ? (
                <span className="urdu-inline">اچھی تصویر کے لیے</span>
              ) : (
                "📸 For best results"
              )}
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: lang === "ur" ? 0 : 20,
                paddingRight: lang === "ur" ? 20 : 0,
                direction: lang === "ur" ? "rtl" : "ltr",
                fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
              }}
            >
              {(lang === "ur"
                ? [
                    "دن کی روشنی میں تصویر لیں",
                    "متاثرہ حصہ فریم کے بیچ ہو",
                    "پتے کے قریب جا کر تصویر لیں",
                    "فلیش استعمال نہ کریں",
                  ]
                : [
                    "Use natural daylight",
                    "Frame the affected area in the center",
                    "Get close — fill the frame with the leaf",
                    "Avoid using flash",
                  ]
              ).map((t, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 14,
                    color: "var(--ink-soft)",
                    lineHeight: 1.7,
                    marginBottom: 4,
                  }}
                >
                  {t}
                </li>
              ))}
            </ul>
            <div
              style={{
                marginTop: 22,
                padding: 14,
                background: "var(--paper)",
                borderRadius: 12,
                border: "1px solid var(--line)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ink-mute)",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                DEMO MODE
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="sparkles" size={18} color="var(--green-700)" />
                <div
                  style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.4 }}
                >
                  Not logged in? You can still try a demo diagnosis — log in to
                  save your results and history.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === "analyzing" && <AnalyzingView lang={lang} crop={crop} />}
      {stage === "result" && (
        <ResultView
          lang={lang}
          crop={crop}
          reset={reset}
          navigate={navigate}
          diagnosis={diagnosis}
          scanId={scanId}
          previewUrl={previewUrl}
          error={error}
        />
      )}
    </div>
  );
};

const AnalyzingView = ({ lang, crop }) => {
  const [step, setStep] = useS_A(0);
  // Step 0: detecting disease (Step 1 AI)
  // Step 1: finding solution (Step 2 AI)
  // Step 2: almost done
  const stages = [
    {
      en: `Analyzing ${crop || "crop"} leaf image…`,
      ur: `${crop || "فصل"} کے پتے کا تجزیہ ہو رہا ہے…`,
      sub_en: "Step 1 of 2 · Disease Detection AI",
      sub_ur: "مرحلہ 1 از 2 · بیماری کی شناخت",
    },
    {
      en: "Disease identified. Finding best treatment…",
      ur: "بیماری پہچانی گئی۔ بہترین علاج تلاش ہو رہا ہے…",
      sub_en: "Step 2 of 2 · Solution AI · Checking sponsored products",
      sub_ur: "مرحلہ 2 از 2 · حل AI · اسپانسرڈ مصنوعات چیک ہو رہی ہیں",
    },
    {
      en: "Preparing your personalised plan…",
      ur: "آپ کا ذاتی پلان تیار ہو رہا ہے…",
      sub_en: "Almost done",
      sub_ur: "تقریباً مکمل",
    },
  ];
  useE_A(() => {
    const t1 = setTimeout(() => setStep(1), 2200);
    const t2 = setTimeout(() => setStep(2), 4800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const s = stages[step];
  const isUrLike = lang === "ur";
  const txt = lang === "ur" ? s.ur : s.en;
  const sub = lang === "ur" ? s.sub_ur : s.sub_en;

  return (
    <div
      style={{
        padding: "60px 24px",
        textAlign: "center",
        maxWidth: 520,
        margin: "0 auto",
      }}
    >
      {/* Animated scan frame */}
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: 24,
          margin: "0 auto 28px",
          background: "var(--green-50)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 3,
            background: "var(--green-500)",
            animation: "scanLine 1.6s ease-in-out infinite",
            boxShadow: "0 0 8px var(--green-400)",
          }}
        />
        {/* Corner brackets */}
        {[
          {
            top: 8,
            left: 8,
            borderTop: "3px solid var(--green-700)",
            borderLeft: "3px solid var(--green-700)",
            borderTopLeftRadius: 6,
          },
          {
            top: 8,
            right: 8,
            borderTop: "3px solid var(--green-700)",
            borderRight: "3px solid var(--green-700)",
            borderTopRightRadius: 6,
          },
          {
            bottom: 8,
            left: 8,
            borderBottom: "3px solid var(--green-700)",
            borderLeft: "3px solid var(--green-700)",
            borderBottomLeftRadius: 6,
          },
          {
            bottom: 8,
            right: 8,
            borderBottom: "3px solid var(--green-700)",
            borderRight: "3px solid var(--green-700)",
            borderBottomRightRadius: 6,
          },
        ].map((corner, i) => (
          <div
            key={i}
            style={{ position: "absolute", width: 18, height: 18, ...corner }}
          />
        ))}
        <Icon name="leaf" size={52} color="var(--green-300)" />
      </div>

      {/* Step indicator dots */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {stages.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i <= step ? "var(--green-700)" : "var(--line)",
              transition: "all .3s ease",
            }}
          />
        ))}
      </div>

      <h2
        style={{
          margin: "0 0 8px",
          fontSize: 20,
          fontWeight: 700,
          color: "var(--green-900)",
          letterSpacing: "-0.01em",
          fontFamily: isUrLike ? "var(--font-ur)" : "inherit",
          direction: isUrLike ? "rtl" : "ltr",
          minHeight: 52,
          transition: "all .3s",
        }}
      >
        {txt}
      </h2>

      <p
        style={{
          fontSize: 13,
          color: "var(--ink-mute)",
          fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
          direction: lang === "ur" ? "rtl" : "ltr",
        }}
      >
        {sub}
      </p>

      <style>{`
        @keyframes scanLine {
          0%   { top: 8px; }
          50%  { top: calc(100% - 11px); }
          100% { top: 8px; }
        }
      `}</style>
    </div>
  );
};

const ResultView = ({
  lang,
  crop,
  reset,
  navigate,
  diagnosis,
  scanId,
  previewUrl,
  error: diagError,
}) => {
  const [feedback, setFeedback] = useS_A(null);

  // Error state — no diagnosis and no demo
  if (!diagnosis && diagError) {
    const isSystemDown = diagError.toLowerCase().includes("temporarily unavailable") || 
                         diagError.toLowerCase().includes("system");
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          {isSystemDown ? "🛑" : "⚠️"}
        </div>
        <h3 style={{ color: "var(--green-900)", marginBottom: 8 }}>
          {isSystemDown 
            ? (lang === "ur" ? "سسٹم بند ہے" : "System down")
            : (lang === "ur" ? "تجزیہ ناکام ہو گیا" : "Analysis Failed")}
        </h3>
        <p
          style={{
            color: "var(--ink-mute)",
            marginBottom: 24,
            maxWidth: 340,
            margin: "0 auto 24px",
          }}
        >
          {isSystemDown
            ? (lang === "ur"
                ? "براہ کرم بعد میں کوشش کریں۔"
                : "System down - please try later")
            : diagError ||
              (lang === "ur"
                ? "براہ کرم دوبارہ کوشش کریں۔"
                : "We couldn't analyse your photo right now. Please try again.")}
        </p>
        <button
          onClick={reset}
          style={{
            padding: "14px 32px",
            borderRadius: 12,
            border: "none",
            background: "var(--green-500)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {lang === "ur" ? "دوبارہ کوشش کریں" : "Try Again"}
        </button>
      </div>
    );
  }

  const isDemo = diagnosis?._isDemo;
  const dx =
    diagnosis && !isDemo
      ? {
          name: diagnosis.disease?.name || "Unknown",
          nameUr: diagnosis.disease?.name_ur || "نامعلوم",
          pathogen: diagnosis.disease?.pathogen || "Unknown",
          confidence: diagnosis.disease?.confidence || 0,
          severity: diagnosis.disease?.severity || "Unknown",
          crop: crop,
        }
      : {
          name: "Early Blight",
          nameUr: "ابتدائی جھلساؤ",
          pathogen: "Alternaria solani",
          confidence: 94,
          severity: "Moderate",
          crop: crop,
        };

  const symptoms = (!isDemo && diagnosis?.symptoms) || [
    "Concentric brown rings on lower leaves",
    "Yellow halo around lesions",
    "Lesion size 4–12mm · advancing",
  ];
  const prevention = (!isDemo && diagnosis?.prevention) || [
    { i: "droplet", en: "Water at base, not on leaves" },
    { i: "sun", en: "Allow morning sun to dry leaves" },
    { i: "sprout", en: "Rotate crops every 2 seasons" },
    { i: "wind", en: 'Space plants 18" apart' },
  ];

  const primaryTx = (!isDemo && diagnosis?.treatment?.primary) || {
    name: "Antracol 70 WP",
    company: "Bayer",
    price: "1,180",
    unit: "per kg",
    dosage: "2g per L water",
    schedule: "Every 7 days · 3 sprays",
  };
  const altTx = (!isDemo && diagnosis?.treatment?.alternatives) || [
    {
      name: "Mancozeb 75 WP",
      company: "Ali Akbar",
      price: "760",
      unit: "per kg",
      is_sponsored: false,
    },
    {
      name: "Score 250 EC",
      company: "Syngenta",
      price: "2,400",
      unit: "per L",
      is_sponsored: false,
    },
  ];

  const sendFeedback = async (type) => {
    setFeedback(type);
    if (scanId && window.API?.isLoggedIn()) {
      try {
        await window.API.submitFeedback(scanId, type);
      } catch {}
    }
  };

   return (
     <div
       className="split-view"
       style={{
         display: 'grid',
         gridTemplateColumns: '1fr 1.4fr',
         gap: 18,
         animation: 'fadeUp .4s',
       }}
     >
      {isDemo && (
        <div
          style={{
            gridColumn: "1 / -1",
            background: "linear-gradient(90deg, #FFF3CD, #FFEEBA)",
            borderRadius: 12,
            padding: "10px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
            color: "#856404",
          }}
        >
          <span style={{ fontSize: 18 }}>💡</span>
          {lang === "ur"
            ? "یہ ایک نمونہ نتیجہ ہے — لاگ ان کریں تاکہ اصل تشخیص حاصل کریں"
            : "Example result — Log in for real AI diagnosis"}
        </div>
      )}
      {/* Weather context strip — shown if weather data returned with diagnosis */}
      {diagnosis?.weather && (
        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "10px 16px",
            background: "linear-gradient(90deg, #EBF4FF, #F0F9FF)",
            border: "1px solid #BFD7ED",
            borderRadius: 12,
            fontSize: 13,
            color: "#1a3a5c",
          }}
        >
          <Icon name="cloud-sun" size={22} color="#3B82F6" />
          <div>
            <span style={{ fontWeight: 600 }}>
              {diagnosis.weather.city} · {diagnosis.weather.temp}°C ·{" "}
              {diagnosis.weather.humidity}% humidity
            </span>
            <span style={{ marginLeft: 8, opacity: 0.75 }}>
              {diagnosis.weather.condition}
            </span>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, opacity: 0.65 }}>
            📍 Weather at time of diagnosis
          </div>
        </div>
      )}
      {/* Left: image + diagnosis */}
      <div className="card" style={{ padding: 24 }}>
        <div
          style={{
            width: "100%",
            aspectRatio: "1",
            borderRadius: 18,
            background:
              "linear-gradient(135deg, #4a7c3a 0%, #2E6B3F 60%, #1a4525 100%)",
            position: "relative",
            overflow: "hidden",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <svg width="80%" height="80%" viewBox="0 0 200 200">
              <path
                d="M30 170 Q40 50 170 30 Q160 130 60 165 Q40 175 30 170Z"
                fill="#9DCB7C"
              />
              <circle cx="90" cy="90" r="10" fill="#8a5d2a" />
              <circle cx="125" cy="70" r="7" fill="#7a4d22" />
              <circle cx="70" cy="130" r="6" fill="#8a5d2a" />
            </svg>
          )}
          <div
            style={{
              position: "absolute",
              top: "32%",
              left: "34%",
              width: 56,
              height: 56,
              border: "2.5px solid #F4A62A",
              borderRadius: "50%",
              boxShadow: "0 0 0 4px rgba(244,166,42,0.18)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(32% + 60px)",
              left: "calc(34% - 8px)",
              background: "#F4A62A",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 8px",
              borderRadius: 6,
            }}
          >
            Lesion detected
          </div>
        </div>

        <div className="tag tag-amber" style={{ marginBottom: 10 }}>
          <Icon name="shield" size={12} /> {dx.confidence}% confidence
          {diagnosis?.ai_provider && (
            <span style={{ marginLeft: 8, opacity: 0.7, fontSize: 10 }}>
              🔍 {diagnosis.ai_provider}
              {diagnosis.solution_provider &&
              diagnosis.solution_provider !== diagnosis.ai_provider
                ? ` · 💊 ${diagnosis.solution_provider}`
                : ""}
              {diagnosis.used_fallback
                ? " · ⚠ fallback mode"
                : diagnosis.diagnosis_status === "real_ai"
                  ? " · ✅ real AI"
                  : ""}
            </span>
          )}
        </div>
        <h2
          style={{
            margin: "0 0 4px",
            fontSize: 26,
            fontWeight: 800,
            color: "var(--green-900)",
            letterSpacing: "-0.02em",
          }}
        >
          {lang === "ur" ? (
            <span className="urdu-inline">{dx.nameUr}</span>
          ) : (
            dx.name
          )}
        </h2>
        <div
          style={{
            fontSize: 14,
            color: "var(--ink-mute)",
            fontStyle: "italic",
          }}
        >
          {dx.pathogen} · on {dx.crop}
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 14,
            background: "var(--cream-50)",
            borderRadius: 12,
            border: "1px solid var(--line)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-mute)",
              fontWeight: 600,
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {lang === "ur" ? "علامات" : "Symptoms detected"}
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              fontSize: 13.5,
              color: "var(--ink)",
              lineHeight: 1.6,
            }}
          >
            {symptoms.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 16,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--ink-mute)" }}>
            Was this accurate?
          </span>
          {[
            {
              type: "positive",
              label: "👍",
              color: feedback === "positive" ? "#2E6B3F" : undefined,
            },
            {
              type: "negative",
              label: "👎",
              color: feedback === "negative" ? "#D04E2C" : undefined,
            },
          ].map((f) => (
            <button
              key={f.type}
              onClick={() => sendFeedback(f.type)}
              style={{
                padding: "6px 12px",
                borderRadius: 99,
                border: "1.5px solid var(--line)",
                background:
                  feedback === f.type
                    ? f.type === "positive"
                      ? "#F1F7E9"
                      : "#FFF2F0"
                    : "var(--paper)",
                fontSize: 16,
                cursor: "pointer",
                fontWeight: feedback === f.type ? 700 : 400,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: treatment plan */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Primary recommendation */}
        <div
          className="card"
          style={{
            padding: 24,
            background:
              "linear-gradient(135deg, var(--green-50) 0%, var(--paper) 60%)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <div className="tag tag-green">
              <Icon name="flask" size={12} />{" "}
              {lang === "ur" ? "تجویز کردہ علاج" : "Recommended treatment"}
            </div>
            <div className="tag tag-cream">
              <Icon name="pin" size={12} /> Pakistani market
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 4px",
                  fontSize: 24,
                  fontWeight: 800,
                  color: "var(--green-900)",
                  letterSpacing: "-0.02em",
                }}
              >
                {primaryTx.name}
              </h3>
              <div style={{ fontSize: 14, color: "var(--ink-mute)" }}>
                by {primaryTx.company}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "var(--amber)",
                  letterSpacing: "-0.02em",
                }}
              >
                ₨ {primaryTx.price}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                {primaryTx.unit}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 16,
            }}
          >
            <div
              style={{
                padding: 12,
                background: "var(--paper)",
                borderRadius: 10,
                border: "1px solid var(--line-soft)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-mute)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                Dosage
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--green-900)",
                  marginTop: 2,
                }}
              >
                {primaryTx.dosage}
              </div>
            </div>
            <div
              style={{
                padding: 12,
                background: "var(--paper)",
                borderRadius: 10,
                border: "1px solid var(--line-soft)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-mute)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                Schedule
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--green-900)",
                  marginTop: 2,
                }}
              >
                {primaryTx.schedule}
              </div>
            </div>
          </div>
        </div>

        {/* Alternatives */}
        <div className="card" style={{ padding: 22 }}>
          <h4
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--green-900)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {lang === "ur" ? (
              <span className="urdu-inline">دیگر متبادل</span>
            ) : (
              "Alternative products"
            )}
          </h4>
          <div className="alternatives-list" style={{ display: "flex", flexDirection: "column" }}>
            {altTx.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderTop: i > 0 ? "1px solid var(--line-soft)" : "none",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: "var(--green-900)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {a.name}
                    {a.is_sponsored && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#8a5d00",
                          background: "#FFF3CD",
                          border: "1px solid #F4A62A",
                          borderRadius: 6,
                          padding: "2px 7px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <Icon name="shield" size={10} color="#8a5d00" />{" "}
                        Sponsored
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                    {a.company}
                  </div>
                </div>
                <div
                  style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}
                >
                  ₨ {a.price}{" "}
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--ink-mute)",
                      fontWeight: 500,
                    }}
                  >
                    {a.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prevention */}
        <div className="card" style={{ padding: 22 }}>
          <h4
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--green-900)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {lang === "ur" ? (
              <span className="urdu-inline">آئندہ سے بچاؤ</span>
            ) : (
              "Prevent it next time"
            )}
          </h4>
          <div
            className="prevention-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 0 }}
          >
            {(typeof prevention[0] === "string"
              ? prevention.map((p) => ({ i: "sprout", en: p }))
              : prevention
            ).map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 10,
                  background: "var(--green-50)",
                  borderRadius: 10,
                }}
              >
                <Icon
                  name={p.i || "sprout"}
                  size={18}
                  color="var(--green-700)"
                />
                <span style={{ fontSize: 13, color: "var(--green-900)" }}>
                  {p.en || p}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-secondary btn-lg"
            onClick={reset}
            style={{ flex: 1 }}
          >
            <Icon name="plus" size={16} />{" "}
            {lang === "ur" ? (
              <span className="urdu-inline">نئی تشخیص</span>
            ) : (
              "New diagnosis"
            )}
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("history")}
            style={{ flex: 1 }}
          >
            <Icon name="bookmark" size={16} color="#fff" />{" "}
            {lang === "ur" ? (
              <span className="urdu-inline">تاریخ</span>
            ) : (
              "View history"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

window.Analyze = Analyze;
