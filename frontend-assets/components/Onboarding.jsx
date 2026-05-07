/* global React, Icon, T, Logo, LangToggle, LeafDeco */
const { useState: useS_O, useEffect: useE_O, useRef: useR_O } = React;

const Onboarding = ({ lang, setLang, navigate, setUser }) => {
  const [step, setStep] = useS_O(0);
  const [name, setName] = useS_O("");
  const [phone, setPhone] = useS_O("");
  const [otp, setOtp] = useS_O(["", "", "", ""]);
  const [loading, setLoading] = useS_O(false);
  const [error, setError] = useS_O("");
  const [devCode, setDevCode] = useS_O("");
  const otpRefs = [useR_O(), useR_O(), useR_O(), useR_O()];

  const valid = name.trim().length > 1 && phone.replace(/\D/g, "").length >= 10;

  const handleSendOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const fullPhone = "+92" + phone.replace(/\D/g, "");
      const result = await window.API.sendOTP(fullPhone);
      if (result.dev_code) setDevCode(result.dev_code);
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 4) return;
    setLoading(true);
    setError("");
    try {
      const fullPhone = "+92" + phone.replace(/\D/g, "");
      const result = await window.API.verifyOTP(
        fullPhone,
        code,
        name.trim(),
        lang,
      );
      setStep(3);
      setTimeout(() => {
        setUser(result.user, result.token);
      }, 1400);
    } catch (err) {
      setError(err.message || "Invalid code. Please try again.");
      setLoading(false);
    }
  };

  const stepLabels = ["Language", "Profile", "Verify", "Ready"];

   return (
     <div
       className="onboarding-container"
       style={{
         minHeight: "100vh",
         display: "flex",
         background:
           "linear-gradient(135deg, #F1F7E9 0%, #FBFAF4 50%, #FCD58A22 100%)",
         position: "relative",
         overflow: "hidden",
       }}
     >
      <LeafDeco
        style={{
          position: "absolute",
          top: -40,
          left: -40,
          transform: "rotate(-20deg)",
        }}
        opacity={0.15}
      />
      <LeafDeco
        style={{
          position: "absolute",
          bottom: -60,
          right: -60,
          transform: "rotate(120deg)",
        }}
        opacity={0.13}
        color="#66A64F"
      />

      {/* Left brand panel */}
      <div
        className="onboarding-left"
        style={{
          flex: "1 1 50%",
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(160deg, var(--green-900) 0%, var(--green-700) 100%)",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{ position: "absolute", right: -80, top: -80, opacity: 0.1 }}
        >
          <Icon name="leaf-fill" size={420} color="#fff" />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            position: "relative",
          }}
        >
          <img
            src="assets/farmer-badge.png"
            width={48}
            height={48}
            style={{ borderRadius: "50%" }}
          />
          <div
            style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            ZARii<span style={{ color: "var(--green-300)" }}>.</span>
            <span
              style={{
                color: "var(--green-300)",
                fontSize: 12,
                marginLeft: 4,
                verticalAlign: "super",
              }}
            >
              AI
            </span>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <div
            className="tag"
            style={{
              background: "rgba(255,255,255,0.14)",
              color: "#fff",
              marginBottom: 20,
            }}
          >
            <Icon name="sparkles" size={14} /> Welcome to ZARii
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 42,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            Two minutes to set up.
            <br />
            <span style={{ color: "var(--amber)" }}>
              A lifetime healthier crops.
            </span>
          </h1>
          <p
            className="urdu"
            style={{
              marginTop: 22,
              fontSize: 22,
              color: "rgba(255,255,255,0.85)",
              maxWidth: 480,
            }}
          >
            دو منٹ کی رجسٹریشن، عمر بھر صحت مند فصل۔
          </p>

          <div
            style={{
              marginTop: 40,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {[
              {
                i: "shield",
                en: "No spam. WhatsApp number is just for verification.",
                ur: "کوئی اسپام نہیں۔ نمبر صرف تصدیق کے لیے۔",
              },
              {
                i: "whatsapp",
                en: "WhatsApp support coming soon.",
                ur: "واٹس ایپ سپورٹ جلد آ رہی ہے۔",
              },
              {
                i: "globe",
                en: "Use Urdu, English — or both.",
                ur: "اردو، انگریزی، یا دونوں استعمال کریں۔",
              },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  opacity: 0.92,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={f.i} size={18} color="#fff" />
                </div>
                <div
                  style={{
                    fontSize: 14.5,
                    fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
                    direction: lang === "ur" ? "rtl" : "ltr",
                  }}
                >
                  {lang === "ur" ? f.ur : f.en}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", fontSize: 13, opacity: 0.65 }}>
          🌱 ZARii AI · Made for Pakistani farmers · 2026
        </div>
      </div>

      {/* Right form panel */}
      <div
        className="onboarding-right"
        style={{
          flex: "1 1 50%",
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate("landing")}
          >
            <Icon name="arrow-left" size={16} /> Back
          </button>
          <LangToggle lang={lang} setLang={setLang} />
        </div>

        {/* Stepper */}
        <div
          className="stepper"
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {stepLabels.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: i <= step ? "var(--green-700)" : "var(--line)",
                    color: i <= step ? "#fff" : "var(--ink-mute)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {i < step ? (
                    <Icon name="check" size={14} color="#fff" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: i <= step ? "var(--green-900)" : "var(--ink-mute)",
                  }}
                >
                  {s}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div
                  style={{
                    width: 24,
                    height: 2,
                    background: i < step ? "var(--green-700)" : "var(--line)",
                    borderRadius: 1,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: 460,
          }}
        >
          {/* Error banner */}
          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: "12px 16px",
                background: "#FFF2F0",
                border: "1px solid #FFCCC7",
                borderRadius: 10,
                fontSize: 13,
                color: "#D04E2C",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Icon name="bell" size={14} color="#D04E2C" /> {error}
            </div>
          )}

          {step === 0 && (
            <div style={{ animation: "fadeUp .3s" }}>
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: 32,
                  color: "var(--green-900)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                Pick your language
              </h2>
              <p
                className="urdu"
                style={{
                  margin: "0 0 28px",
                  fontSize: 18,
                  color: "var(--ink-soft)",
                }}
              >
                اپنی زبان منتخب کریں
              </p>
               <div
                 className="lang-options"
                 style={{
                   display: "grid",
                   gridTemplateColumns: "1fr 1fr",
                   gap: 14,
                 }}
               >
                {[
                  {
                    code: "en",
                    t: "English",
                    sub: "Use ZARii in English",
                    flag: "🇬🇧",
                  },
                  {
                    code: "ur",
                    t: "اردو",
                    sub: "زرعی AI اردو میں استعمال کریں",
                    flag: "🇵🇰",
                  },
                ].map((o) => (
                  <button
                    key={o.code}
                    onClick={() => setLang(o.code)}
                    style={{
                      padding: 24,
                      borderRadius: 18,
                      textAlign: "left",
                      background:
                        lang === o.code ? "var(--green-700)" : "var(--paper)",
                      color: lang === o.code ? "#fff" : "var(--ink)",
                      border:
                        "2px solid " +
                        (lang === o.code ? "var(--green-700)" : "var(--line)"),
                      transition: "all .15s",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>
                      {o.flag}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        fontFamily:
                          o.code === "ur" ? "var(--font-ur)" : "inherit",
                      }}
                    >
                      {o.t}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        marginTop: 4,
                        opacity: 0.7,
                        fontFamily:
                          o.code === "ur" ? "var(--font-ur)" : "inherit",
                        direction: o.code === "ur" ? "rtl" : "ltr",
                      }}
                    >
                      {o.sub}
                    </div>
                  </button>
                ))}
              </div>
              <button
                className="btn btn-primary btn-lg"
                style={{ marginTop: 32, width: "100%", minHeight: 52, justifyContent: "center" }}
                onClick={() => setStep(1)}
              >
                Continue <Icon name="arrow-right" size={18} />
              </button>
            </div>
          )}

          {step === 1 && (
            <div style={{ animation: "fadeUp .3s" }}>
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: 32,
                  color: "var(--green-900)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                {lang === "ur" ? (
                  <span className="urdu-inline">اپنا تعارف</span>
                ) : (
                  "Tell us about you"
                )}
              </h2>
              <p
                style={{
                  margin: "0 0 28px",
                  fontSize: 16,
                  color: "var(--ink-soft)",
                  fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
                  direction: lang === "ur" ? "rtl" : "ltr",
                }}
              >
                {lang === "ur"
                  ? "صرف نام اور واٹس ایپ نمبر — بس اتنا چاہیے۔"
                  : "Just your name and WhatsApp number — that's all we need."}
              </p>

              <OField
                label={lang === "ur" ? "پورا نام" : "Full name"}
                lang={lang}
                input={
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      lang === "ur" ? "مثلاً: محمد اسلم" : "e.g. Muhammad Aslam"
                    }
                    style={inputStyle}
                  />
                }
              />
              <OField
                label={lang === "ur" ? "واٹس ایپ نمبر" : "WhatsApp number"}
                lang={lang}
                hint={
                  lang === "ur"
                    ? "تصدیق کے لیے OTP بھیجیں گے"
                    : "We'll send a one-time code via WhatsApp"
                }
                input={
                  <div style={{ display: "flex", gap: 10 }}>
                    <div
                      style={{
                        ...inputStyle,
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: 110,
                        fontWeight: 600,
                      }}
                    >
                      🇵🇰 +92
                    </div>
                    <input
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="3xx xxxxxxx"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                  </div>
                }
              />

              <div className="onboarding-btn-row" style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => setStep(0)}
                >
                  <Icon name="arrow-left" size={16} /> Back
                </button>
                <button
                  className="btn btn-primary btn-lg"
                  disabled={!valid || loading}
                  style={{
                    flex: 1,
                    minHeight: 52,
                    opacity: valid && !loading ? 1 : 0.5,
                    cursor: valid && !loading ? "pointer" : "not-allowed",
                  }}
                  onClick={handleSendOTP}
                >
                  {loading ? (
                    "Sending…"
                  ) : lang === "ur" ? (
                    <span className="urdu-inline">OTP بھیجیں</span>
                  ) : (
                    "Send code"
                  )}{" "}
                  {!loading && <Icon name="arrow-right" size={18} />}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: "fadeUp .3s" }}>
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: 32,
                  color: "var(--green-900)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                {lang === "ur" ? (
                  <span className="urdu-inline">تصدیقی کوڈ درج کریں</span>
                ) : (
                  "Enter the 4-digit code"
                )}
              </h2>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: 15,
                  color: "var(--ink-soft)",
                  fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
                  direction: lang === "ur" ? "rtl" : "ltr",
                }}
              >
                {lang === "ur" ? (
                  <>
                    <strong>+92 {phone}</strong> پر کوڈ بھیجا گیا
                  </>
                ) : (
                  <>
                    Sent via WhatsApp to{" "}
                    <strong style={{ color: "var(--green-900)" }}>
                      +92 {phone}
                    </strong>
                  </>
                )}
              </p>

              {/* ── Dev-mode WhatsApp notice ── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 24,
                  padding: "12px 14px",
                  background: "#fffbeb",
                  border: "1px solid #f59e0b",
                  borderRadius: 12,
                  fontSize: 13,
                  color: "#92400e",
                  boxShadow: "0 2px 8px rgba(245,158,11,.15)",
                  animation: "fadeUp .3s",
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    lineHeight: 1,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  ⚠️
                </span>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 3 }}>
                    {lang === "ur" ? (
                      <span className="urdu-inline">
                        واٹس ایپ تصدیق عارضی طور پر بند ہے
                      </span>
                    ) : (
                      "WhatsApp verification temporarily unavailable"
                    )}
                  </div>
                  <div style={{ lineHeight: 1.5 }}>
                    {lang === "ur" ? (
                      <span className="urdu-inline">
                        براہ کرم تصدیقی کوڈ{" "}
                        <strong
                          style={{
                            fontFamily: "monospace",
                            fontSize: 15,
                            letterSpacing: 2,
                          }}
                        >
                          1234
                        </strong>{" "}
                        استعمال کریں۔
                      </span>
                    ) : (
                      <>
                        Due to technical reasons WhatsApp OTP delivery is not
                        working right now. Please use{" "}
                        <strong
                          style={{
                            fontFamily: "monospace",
                            fontSize: 15,
                            letterSpacing: 2,
                            color: "#78350f",
                          }}
                        >
                          1234
                        </strong>{" "}
                        as your verification code.
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="otp-inputs"
                style={{ display: "flex", gap: 12, justifyContent: "center" }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    value={otp[i]}
                    maxLength={1}
                    inputMode="numeric"
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 1);
                      const o = [...otp];
                      o[i] = v;
                      setOtp(o);
                      if (v && i < 3) otpRefs[i + 1].current.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0)
                        otpRefs[i - 1].current.focus();
                    }}
                    style={{
                      width: 64,
                      height: 72,
                      fontSize: 28,
                      fontWeight: 700,
                      textAlign: "center",
                      borderRadius: 14,
                      border:
                        "2px solid " +
                        (otp[i] ? "var(--green-500)" : "var(--line)"),
                      background: "var(--paper)",
                      color: "var(--green-900)",
                      outline: "none",
                      transition: "all .15s",
                    }}
                  />
                ))}
              </div>

              {devCode && (
                <div
                  style={{
                    marginTop: 14,
                    padding: 12,
                    background: "var(--green-50)",
                    borderRadius: 10,
                    fontSize: 13,
                    color: "var(--green-900)",
                    textAlign: "center",
                    border: "1px dashed var(--green-300)",
                  }}
                >
                  💡 <strong>Dev mode OTP:</strong>{" "}
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {devCode}
                  </span>
                </div>
              )}

              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  color: "var(--ink-mute)",
                  textAlign: "center",
                }}
              >
                Didn't get it?{" "}
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--green-700)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setStep(1);
                    setOtp(["", "", "", ""]);
                    setDevCode("");
                  }}
                >
                  Go back
                </button>
              </div>

              <div className="onboarding-btn-row" style={{ display: "flex", gap: 12, marginTop: 28 }}>
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => {
                    setStep(1);
                    setOtp(["", "", "", ""]);
                    setDevCode("");
                  }}
                >
                  <Icon name="arrow-left" size={16} /> Back
                </button>
                <button
                  className="btn btn-primary btn-lg"
                  style={{
                    flex: 1,
                    minHeight: 52,
                    opacity: otp.join("").length === 4 && !loading ? 1 : 0.5,
                  }}
                  disabled={otp.join("").length !== 4 || loading}
                  onClick={handleVerifyOTP}
                >
                  {loading ? "Verifying…" : "Verify"}{" "}
                  {!loading && <Icon name="check" size={18} />}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ animation: "fadeUp .3s", textAlign: "center" }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: "var(--green-500)",
                  margin: "0 auto 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "pulseRingGreen 1.4s infinite",
                }}
              >
                <Icon name="check" size={48} color="#fff" stroke={3} />
              </div>
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: 32,
                  color: "var(--green-900)",
                  fontWeight: 800,
                }}
              >
                {lang === "ur" ? (
                  <span className="urdu-inline">
                    خوش آمدید، {name.split(" ")[0]}!
                  </span>
                ) : (
                  `Welcome, ${name.split(" ")[0]}!`
                )}
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--ink-soft)",
                  fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
                }}
              >
                {lang === "ur"
                  ? "آپ کا اکاؤنٹ تیار ہے۔"
                  : "Your account is ready. Taking you to your dashboard…"}
              </p>
            </div>
          )}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "var(--ink-mute)",
            textAlign: "center",
          }}
        >
          By continuing you agree to our{" "}
          <a href="#" style={{ color: "var(--green-700)" }}>
            Terms
          </a>{" "}
          &{" "}
          <a href="#" style={{ color: "var(--green-700)" }}>
            Privacy
          </a>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "14px 18px",
  fontSize: 16,
  borderRadius: 12,
  border: "1.5px solid var(--line)",
  background: "var(--paper)",
  color: "var(--ink)",
  outline: "none",
  transition: "all .15s",
};

const OField = ({ label, hint, input, lang }) => (
  <div style={{ marginBottom: 18, direction: lang === "ur" ? "rtl" : "ltr" }}>
    <label
      style={{
        display: "block",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--green-900)",
        marginBottom: 8,
        fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
      }}
    >
      {label}
    </label>
    {input}
    {hint && (
      <div
        style={{
          marginTop: 6,
          fontSize: 12,
          color: "var(--ink-mute)",
          fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
        }}
      >
        {hint}
      </div>
    )}
  </div>
);

window.Onboarding = Onboarding;
