/* global React, Icon, CropGlyph */
const { useState: useS_V, useEffect: useE_V, useRef: useR_V } = React;

// ============================================================
// VOICE ASSISTANT
// ============================================================
const Voice = ({ lang, navigate }) => {
  console.log("Voice component rendered, lang:", lang);
  const [state, setState] = useS_V("idle"); // idle, listening, thinking, speaking
  const [conversation, setConversation] = useS_V([
    {
      role: "assistant",
      en: "Salaam! Hold the mic and ask me anything about your crops.",
      ur: "السلام علیکم! مائیک دبا کر اپنی فصل کے بارے میں کچھ بھی پوچھیں۔",
    },
  ]);
  const [transcript, setTranscript] = useS_V("");
  const [pendingAsk, setPendingAsk] = useS_V(() => {
    const q = sessionStorage.getItem("zarii_quick_ask");
    if (q) {
      sessionStorage.removeItem("zarii_quick_ask");
      return q;
    }
    return null;
  });

  const sampleAsks =
    lang === "ur"
      ? [
          "میرے گندم کے پتے پیلے کیوں ہیں؟",
          "کاٹن پر سفید مکھی کا علاج؟",
          "آلو کب لگانا چاہیے؟",
        ]
      : [
          "Why are my wheat leaves yellow?",
          "How to treat whitefly on cotton?",
          "When should I plant potatoes?",
        ];

  const sampleAnswers = {
    en: "Yellowing wheat leaves usually means nitrogen deficiency. Apply Urea at 1 bag per acre, and water lightly. If yellowing is on lower leaves only, it's a clear nitrogen sign. Want me to recommend a brand?",
    ur: "گندم کے پیلے پتے عام طور پر نائٹروجن کی کمی کا اشارہ ہیں۔ فی ایکڑ ایک بوری یوریا ڈالیں اور ہلکا پانی دیں۔ اگر صرف نچلے پتے پیلے ہیں تو یہ یقینی نائٹروجن کی کمی ہے۔",
  };

  const mediaRecorder = useR_V(null);
  const chunks = useR_V([]);
  const voiceAudio = useR_V(null);

  const getAudioDuration = (blob) => {
    return new Promise((resolve) => {
      const audio = new Audio(URL.createObjectURL(blob));
      audio.onloadedmetadata = () => resolve(Math.round(audio.duration));
      audio.onerror = () => resolve(0);
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startListen = async () => {
    console.log("Mic clicked, state:", state);
    if (state === "listening") {
      stopListen();
      return;
    }
    try {
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted");
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      mediaRecorder.current.onstop = () => {
        console.log("Recording stopped, processing audio...");
        processAudio(stream);
      };
      mediaRecorder.current.start();
      setState("listening");
      console.log("Now listening...");
      
      // Auto-stop after 15 seconds
      setTimeout(() => {
        if (state === "listening") {
          console.log("Auto-stopping after 15 seconds");
          stopListen();
        }
      }, 15000);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Microphone error: " + err.message);
    }
  };

  const stopListen = async () => {
    console.log("stopListen called, recorder state:", mediaRecorder.current?.state);
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
      // Stop stream tracks immediately after stopping recorder
      setTimeout(() => {
        if (mediaRecorder.current && mediaRecorder.current.stream) {
          mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
        }
      }, 100);
    } else if (!mediaRecorder.current || mediaRecorder.current.state === "inactive") {
      // If recorder not active, process whatever we have
      if (chunks.current.length > 0) {
        processAudio(null);
      }
    }
  };

  const processAudio = async (stream) => {
    console.log("processAudio called");
    // Stop the stream tracks
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    
    if (chunks.current.length === 0) {
      console.log("No audio recorded");
      setState("idle");
      return;
    }
    
    setState("thinking");
    console.log("Creating audio blob...");
    const blob = new Blob(chunks.current, { type: "audio/webm" });
    
    // Create audio URL for playback (like WhatsApp voice message)
    const audioUrl = URL.createObjectURL(blob);
    const audioDuration = await getAudioDuration(blob);
    
    // Show user's voice message in chat immediately (like WhatsApp)
    setConversation((c) => [...c, { 
      role: "user", 
      en: "🎤 Voice message", 
      ur: "🎤 آواز کا پیغام",
      isVoice: true,
      audioUrl: audioUrl,
      duration: audioDuration
    }]);

    const formData = new FormData();
    formData.append("audio", blob, "audio.webm");
    formData.append("lang", lang);

    try {
      console.log("Calling STT API...");
      const { transcript: t } = await window.API.transcribeAudio(formData);
      console.log("STT result:", t);
      if (!t) throw new Error("No transcript");
      setTranscript(t);
      
      // Update the voice message with actual transcript
      setConversation((c) => c.map((msg, i) => 
        i === c.length - 1 ? { ...msg, en: t, ur: t, isVoice: false } : msg
      ));

      console.log("Calling AI...");
      const { answer, query_id } = await window.API.askQuestion(t, lang);
      console.log("AI answer:", answer);
      setConversation((c) => [
        ...c,
        { role: "assistant", en: answer, ur: answer },
      ]);

      console.log("Calling TTS...");
      const { audio_url } = await window.API.textToSpeech(
        answer,
        lang,
        query_id,
      );
      console.log("TTS result:", audio_url);
      if (audio_url) {
        const audio = new Audio(audio_url);
        audio.onended = () => {
          console.log("Audio finished playing");
          setState("idle");
          setTranscript("");
        };
        audio.onerror = (e) => {
          console.error("Audio play error:", e);
          setState("idle");
          setTranscript("");
        };
        audio.play();
        setState("speaking");
      } else {
        console.log("No audio URL, showing text only");
        setState("idle");
        setTranscript("");
      }
    } catch (err) {
      console.error("Voice error:", err);
      setState("idle");
    }
  };

  const askDirectly = async (text) => {
    setState("thinking");
    setTranscript(text);
    setConversation((c) => [...c, { role: "user", en: text, ur: text }]);
    try {
      const { answer, query_id } = await window.API.askQuestion(text, lang);
      setConversation((c) => [
        ...c,
        { role: "assistant", en: answer, ur: answer },
      ]);
      const { audio_url } = await window.API.textToSpeech(
        answer,
        lang,
        query_id,
      );
      if (audio_url) {
        const audio = new Audio(audio_url);
        audio.onended = () => {
          setState("idle");
          setTranscript("");
        };
        audio.play();
        setState("speaking");
      } else {
        setState("idle");
      }
    } catch (err) {
      setState("idle");
    }
  };

  useE_V(() => {
    if (pendingAsk) {
      setPendingAsk(null);
      askDirectly(pendingAsk);
    }
  }, [pendingAsk]);

  return (
    <div
      className="voice-page-container"
      style={{
        padding: "32px 40px",
        maxWidth: 1100,
        margin: "0 auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          marginBottom: 16,
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
            <span className="urdu-inline">آواز معاون</span>
          ) : (
            "Voice assistant"
          )}
        </h1>
      </div>

      {/* Conversation */}
        <div
          className="card conversation-container"
          style={{
            flex: 1,
            padding: 28,
            marginBottom: 18,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            minHeight: 360,
          }}
        >
        {conversation.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "78%",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                flexShrink: 0,
                background:
                  msg.role === "user" ? "var(--amber)" : "var(--green-700)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {msg.role === "user" ? (
                "You"
              ) : (
                <img
                  src="assets/farmer-badge.png"
                  width={36}
                  height={36}
                  style={{ borderRadius: "50%" }}
                />
              )}
            </div>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 16,
                background:
                  msg.role === "user" ? "var(--amber)" : "var(--green-50)",
                color: msg.role === "user" ? "#fff" : "var(--ink)",
                fontSize: 15,
                lineHeight: 1.5,
                fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
                direction: lang === "ur" ? "rtl" : "ltr",
                borderTopLeftRadius: msg.role === "user" ? 16 : 4,
                borderTopRightRadius: msg.role === "user" ? 4 : 16,
              }}
            >
              {msg.isVoice && msg.audioUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 200 }}>
                  <button
                    onClick={() => {
                      if (voiceAudio.current) {
                        if (voiceAudio.current.paused) {
                          voiceAudio.current.play();
                        } else {
                          voiceAudio.current.pause();
                        }
                      } else {
                        voiceAudio.current = new Audio(msg.audioUrl);
                        voiceAudio.current.onended = () => {};
                        voiceAudio.current.play();
                      }
                    }}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.3)', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0
                    }}
                  >
                    <Icon name="play" size={16} color="#fff" />
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      height: 24, display: 'flex', alignItems: 'center', gap: 2,
                      background: 'rgba(255,255,255,0.2)', borderRadius: 4, padding: '4px 8px'
                    }}>
                      {[...Array(12)].map((_, j) => (
                        <div key={j} style={{
                          width: 3, height: 8 + Math.random() * 12,
                          background: 'rgba(255,255,255,0.7)', borderRadius: 2
                        }} />
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, opacity: 0.8 }}>{formatDuration(msg.duration)}</span>
                </div>
              ) : (
                <>
                  {lang === "ur" ? msg.ur : msg.en}
                </>
              )}
            </div>
          </div>
        ))}
        {state === "thinking" && (
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              color: "var(--ink-mute)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                overflow: "hidden",
              }}
            >
              <img src="assets/farmer-badge.png" width={36} height={36} />
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--green-500)",
                    animation: "mic-bar 1s infinite",
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

       {/* Mic */}
       <div
         className="card voice-input-area"
         style={{ padding: 28, display: 'flex', alignItems: 'center', gap: 24 }}
       >
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); console.log("Button clicked! state:", state); startListen(); }}
          className="mic-btn"
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: state === "listening" ? "var(--amber)" : state === "thinking" ? "var(--gray-400)" : "var(--green-700)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "none",
            transition: "all .2s",
            animation: state === "listening" ? "pulseRing 1.5s infinite" : "none",
            boxShadow: "0 10px 24px rgba(46,107,63,0.32)",
            flexShrink: 0,
            position: "relative",
            zIndex: 10,
            opacity: state === "thinking" || state === "speaking" ? 0.6 : 1
          }}
        >
          {state === "listening" ? (
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 4,
                    height: 32,
                    background: "#fff",
                    borderRadius: 2,
                    animation: `mic-bar 0.8s infinite`,
                    animationDelay: `${i * 0.1}s`,
                    transformOrigin: "center",
                  }}
                />
              ))}
            </div>
          ) : (
            <Icon name="mic" size={42} color="#fff" />
          )}
        </button>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-mute)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {state === "listening"
              ? "Listening..."
              : state === "thinking"
                ? "Thinking..."
                : state === "speaking"
                  ? "Speaking..."
                  : "Tap & speak"}
          </div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: "var(--green-900)",
              marginTop: 4,
              minHeight: 24,
              fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
              direction: lang === "ur" ? "rtl" : "ltr",
            }}
          >
            {transcript ||
              (lang === "ur"
                ? "مائیک دبائیں اور سوال پوچھیں…"
                : "Hold the mic and ask anything…")}
          </div>

          {/* sample chips */}
          {state === "idle" && (
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 14,
                flexWrap: "wrap",
              }}
            >
              {sampleAsks.map((q, i) => (
                <button
                  key={i}
                  onClick={() => askDirectly(q)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "var(--green-50)",
                    color: "var(--green-900)",
                    fontSize: 12.5,
                    fontWeight: 500,
                    fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// ============================================================
// HISTORY
// ============================================================
const History = ({ lang, navigate }) => {
  const [filter, setFilter] = useS_V("all");
  const [items, setItems] = useS_V([]);
  const [loading, setLoading] = useS_V(true);

  useE_V(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await window.API.getHistory({ type: filter });
        setItems(res.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter]);

  const getColor = (sev) => {
    if (sev === "None") return "#66A64F";
    if (sev === "Low" || sev === "Moderate") return "#F4A62A";
    if (sev === "High" || sev === "Critical") return "#D04E2C";
    return "#9DCB7C";
  };

  const formatDate = (ds) => {
    const d = new Date(ds);
    return (
      d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
      ", " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const filtered = items.filter((i) => filter === "all" || i.type === filter);

  return (
    <div className="history-page-container" style={{ padding: "32px 40px", maxWidth: 1240, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              color: "var(--green-900)",
              letterSpacing: "-0.02em",
              fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
            }}
          >
            {lang === "ur" ? (
              <span className="urdu-inline">آپ کی تاریخ</span>
            ) : (
              "Your history"
            )}
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 14,
              color: "var(--ink-soft)",
            }}
          >
            {items.length} saved diagnoses · WhatsApp sync coming soon
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 4,
              background: "var(--paper)",
              borderRadius: 999,
              border: "1px solid var(--line)",
            }}
          >
            {[
              { id: "all", label: "All" },
              { id: "scan", label: "Scans", icon: "camera" },
              { id: "voice", label: "Voice", icon: "mic" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  background:
                    filter === t.id ? "var(--green-700)" : "transparent",
                  color: filter === t.id ? "#fff" : "var(--ink-soft)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {t.icon && <Icon name={t.icon} size={13} />}
                {t.label}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm">
            <Icon name="search" size={14} />
          </button>
        </div>
      </div>

      <div
        className="history-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
        }}
      >
        {loading ? (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              padding: 40,
              color: "var(--ink-mute)",
            }}
          >
            Loading history...
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              padding: 40,
              color: "var(--ink-mute)",
            }}
          >
            No history found.
          </div>
        ) : (
          items.map((it, i) => (
            <div
              key={i}
              className="card history-item"
              onClick={() =>
                it.type === "scan" && navigate("analyze", { scanId: it.id })
              }
              style={{
                padding: 20,
                cursor: it.type === "scan" ? "pointer" : "default",
                display: "flex",
                gap: 16,
                transition: "transform .12s",
              }}
              onMouseEnter={(e) =>
                it.type === "scan" &&
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                it.type === "scan" &&
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 14,
                  flexShrink: 0,
                  background: `linear-gradient(135deg, ${getColor(it.severity)}33 0%, ${getColor(it.severity)}11 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {it.type === "voice" ? (
                  <Icon name="mic" size={32} color={getColor(it.severity)} />
                ) : (
                  <CropGlyph crop={it.crop_type} size={36} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    className={
                      "tag " +
                      (it.type === "voice"
                        ? "tag-cream"
                        : it.severity === "None"
                          ? "tag-green"
                          : it.severity === "High" || it.severity === "Critical"
                            ? "tag-red"
                            : "tag-amber")
                    }
                  >
                    {it.type === "voice" ? (
                      <>
                        <Icon name="mic" size={11} />
                        Voice
                      </>
                    ) : (
                      <>
                        <Icon name="camera" size={11} />
                        {it.crop_type}
                      </>
                    )}
                  </span>
                  {it.confidence && (
                    <span
                      style={{
                        fontSize: 11.5,
                        color: "var(--ink-mute)",
                        fontWeight: 600,
                      }}
                    >
                      {it.confidence}% conf.
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--green-900)",
                    letterSpacing: "-0.01em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {it.type === "voice"
                    ? it.transcript
                    : lang === "ur"
                      ? it.disease_name_ur
                      : it.disease_name}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--ink-mute)",
                    marginTop: 2,
                  }}
                >
                  {formatDate(it.created_at)}
                </div>
              </div>
              {it.type === "scan" && (
                <Icon name="arrow-right" size={18} color="var(--ink-mute)" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================
// ANALYTICS
// ============================================================
const Analytics = ({ lang, navigate }) => {
  const [data, setData] = useS_V(null);
  const [loading, setLoading] = useS_V(true);
  const [period, setPeriod] = useS_V("7d");

  useE_V(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await window.API.getAnalytics(period);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  if (loading || !data)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Loading insights...
      </div>
    );

  const kpis = [
    {
      v: data.total_scans,
      l: "Total scans",
      delta: data.total_scans > 0 ? "+" + data.total_scans : null,
      icon: "camera",
      color: "#2E6B3F",
    },
    {
      v: data.unique_diseases,
      l: "Unique diseases found",
      delta: data.unique_diseases > 0 ? data.unique_diseases + " types" : null,
      icon: "flask",
      color: "#F4A62A",
    },
    {
      v: data.health_score + "/100",
      l: "Farm health score",
      delta:
        data.health_score >= 70
          ? "Good"
          : data.health_score >= 40
            ? "Fair"
            : "At risk",
      icon: "sprout",
      color: "#66A64F",
    },
    {
      v: "₨ " + (data.money_saved || 0).toLocaleString(),
      l: "Est. savings on pesticides",
      delta: data.total_scans > 0 ? "via AI guidance" : null,
      icon: "pkr",
      color: "#9DCB7C",
    },
  ];

  return (
    <div className="analytics-page-container" style={{ padding: "32px 40px", maxWidth: 1320, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 800,
            color: "var(--green-900)",
            letterSpacing: "-0.02em",
            fontFamily: lang === "ur" ? "var(--font-ur)" : "inherit",
          }}
        >
          {lang === "ur" ? (
            <span className="urdu-inline">آپ کے کھیت کی بصیرت</span>
          ) : (
            "Your farm insights"
          )}
        </h1>
        <p
          style={{ margin: "4px 0 0", fontSize: 14, color: "var(--ink-soft)" }}
        >
          Personal stats · regional outbreak trends · last 90 days
        </p>
      </div>

      {/* KPI cards */}
      <div
        className="analytics-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 18,
        }}
      >
        {kpis.map((k, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: k.color + "22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name={k.icon} size={20} color={k.color} />
              </div>
              {k.delta != null && (
                <span
                  className={
                    "tag " +
                    (typeof k.delta === "string" && k.delta.startsWith("-")
                      ? "tag-amber"
                      : "tag-green")
                  }
                >
                  <Icon name="trend" size={11} /> {k.delta}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: "var(--green-900)",
                marginTop: 14,
                letterSpacing: "-0.02em",
              }}
            >
              {k.v}
            </div>
            <div
              style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 2 }}
            >
              {k.l}
            </div>
          </div>
        ))}
      </div>

      <div
        className="analytics-split-view"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: 16,
          marginBottom: 18,
        }}
      >
        {/* Timeline chart */}
        <div className="card" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: "var(--green-900)",
              }}
            >
              Farm health timeline
            </h3>
            <div
              style={{
                display: "flex",
                gap: 4,
                padding: 3,
                background: "var(--green-50)",
                borderRadius: 999,
              }}
            >
              {["7d", "30d", "90d"].map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPeriod(p)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    background: period === p ? "var(--paper)" : "transparent",
                    color:
                      period === p ? "var(--green-900)" : "var(--ink-mute)",
                    boxShadow: period === p ? "var(--shadow-sm)" : "none",
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <svg viewBox="0 0 600 240" style={{ width: "100%", height: 240 }}>
            <defs>
              <linearGradient id="healthGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#66A64F" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#66A64F" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid */}
            {[0, 60, 120, 180].map((y) => (
              <line
                key={y}
                x1="40"
                x2="590"
                y1={y + 20}
                y2={y + 20}
                stroke="#F1ECDD"
                strokeWidth="1"
              />
            ))}
            {/* Y labels */}
            {[100, 75, 50, 25].map((v, i) => (
              <text
                key={i}
                x="32"
                y={i * 60 + 24}
                textAnchor="end"
                fontSize="10"
                fill="#7E7E7E"
              >
                {v}
              </text>
            ))}
            {/* Area */}
            <path
              d={`M${data.weekly_activity.map((d, i) => `${40 + i * (540 / (data.weekly_activity.length - 1))} ${220 - d.health * 1.8}`).join(" L")} L${580} 220 L40 220 Z`}
              fill="url(#healthGrad)"
            />
            <path
              d={`M${data.weekly_activity.map((d, i) => `${40 + i * (540 / (data.weekly_activity.length - 1))} ${220 - d.health * 1.8}`).join(" L")}`}
              stroke="#66A64F"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dots */}
            {data.weekly_activity.map((d, i) => {
              const x = 40 + i * (540 / (data.weekly_activity.length - 1));
              const y = 220 - d.health * 1.8;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#66A64F"
                  stroke="#fff"
                  strokeWidth="2"
                />
              );
            })}
            {/* X labels */}
            {data.weekly_activity
              .filter((_, i) => i % 2 === 0)
              .map((d, i) => (
                <text
                  key={i}
                  x={40 + i * 2 * (540 / (data.weekly_activity.length - 1))}
                  y="234"
                  fontSize="11"
                  fill="#7E7E7E"
                  textAnchor="middle"
                >
                  {new Date(d.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </text>
              ))}
          </svg>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 8,
              fontSize: 12,
              color: "var(--ink-mute)",
            }}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#66A64F",
                }}
              />{" "}
              Health score
            </span>
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  border: "2px solid #F4A62A",
                }}
              />{" "}
              Disease detected
            </span>
          </div>
        </div>

        {/* Top issues */}
        <div className="card" style={{ padding: 24 }}>
          <h3
            style={{
              margin: "0 0 14px",
              fontSize: 17,
              fontWeight: 700,
              color: "var(--green-900)",
            }}
          >
            Most-asked diseases
          </h3>
          {data.top_diseases.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--ink-mute)" }}>
              No disease data yet.
            </div>
          ) : (
            data.top_diseases.map((d, i) => {
              const maxCount = data.top_diseases[0].count || 1;
              const pct = (d.count / maxCount) * 100;
              return (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{ fontWeight: 600, color: "var(--green-900)" }}
                    >
                      {d.disease_name}
                    </span>
                    <span style={{ color: "var(--ink-mute)" }}>{d.count}</span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "var(--green-50)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, var(--green-500), var(--green-700))`,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Regional outbreak map */}
      <div className="card" style={{ padding: 24, marginBottom: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: "var(--green-900)",
              }}
            >
              Regional outbreak trends
            </h3>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 13,
                color: "var(--ink-mute)",
              }}
            >
              Anonymized data from ZARii users · Pakistan
            </p>
          </div>
          <div className="tag tag-amber">
            <Icon name="trend" size={11} /> Whitefly rising in Multan
          </div>
        </div>

        <div
          className="analytics-map-grid"
          style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}
        >
          {/* Faux Pakistan map */}
          <div
            style={{
              position: "relative",
              background: "var(--green-50)",
              borderRadius: 14,
              padding: 16,
              height: 320,
            }}
          >
            <svg
              viewBox="0 0 400 320"
              style={{ width: "100%", height: "100%" }}
            >
              {/* Stylized Pakistan outline */}
              <path
                d="M 80 60 L 140 40 L 200 55 L 250 75 L 290 100 L 320 130 L 340 175 L 320 220 L 280 250 L 240 270 L 200 280 L 160 270 L 130 240 L 100 200 L 80 160 L 60 120 L 70 80 Z"
                fill="#9DCB7C33"
                stroke="#66A64F"
                strokeWidth="1.5"
              />
              {/* Province dots/regions */}
              {[
                {
                  x: 200,
                  y: 130,
                  name: "Punjab",
                  cases: "High",
                  size: 32,
                  color: "#D04E2C",
                },
                {
                  x: 270,
                  y: 220,
                  name: "Sindh",
                  cases: "Moderate",
                  size: 22,
                  color: "#F4A62A",
                },
                {
                  x: 130,
                  y: 110,
                  name: "KPK",
                  cases: "Low",
                  size: 14,
                  color: "#66A64F",
                },
                {
                  x: 160,
                  y: 200,
                  name: "Balochistan",
                  cases: "Low",
                  size: 14,
                  color: "#66A64F",
                },
              ].map((r, i) => (
                <g key={i}>
                  <circle
                    cx={r.x}
                    cy={r.y}
                    r={r.size}
                    fill={r.color}
                    opacity="0.18"
                  />
                  <circle
                    cx={r.x}
                    cy={r.y}
                    r={r.size * 0.5}
                    fill={r.color}
                    opacity="0.4"
                  />
                  <circle cx={r.x} cy={r.y} r={5} fill={r.color} />
                  <text
                    x={r.x}
                    y={r.y - r.size - 6}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#1F4A2C"
                  >
                    {r.name}
                  </text>
                  <text
                    x={r.x}
                    y={r.y + r.size + 14}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#7E7E7E"
                  >
                    {r.cases}
                  </text>
                </g>
              ))}
            </svg>
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 16,
                right: 16,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "var(--ink-mute)",
              }}
            >
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#66A64F",
                  }}
                />{" "}
                Low
              </span>
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#F4A62A",
                  }}
                />{" "}
                Moderate
              </span>
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#D04E2C",
                  }}
                />{" "}
                High
              </span>
            </div>
          </div>

          <div>
            <h4
              style={{
                margin: "0 0 12px",
                fontSize: 13,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--ink-mute)",
              }}
            >
              Trending nearby
            </h4>
            {(data.top_diseases && data.top_diseases.length > 0
              ? data.top_diseases.slice(0, 4).map((d, i) => ({
                  region: "Pakistan",
                  issue: d.disease_name,
                  trend: "+" + d.count + " scans",
                  cases: d.count + (d.count === 1 ? " farm" : " farms"),
                  color: i === 0 ? "#D04E2C" : i === 1 ? "#F4A62A" : "#66A64F",
                }))
              : [
                  {
                    region: "No data yet",
                    issue: "Scan crops to see regional trends",
                    trend: "",
                    cases: "",
                    color: "var(--ink-mute)",
                  },
                ]
            ).map((t, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderTop: i > 0 ? "1px solid var(--line-soft)" : "none",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: t.color,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--green-900)",
                    }}
                  >
                    {t.issue}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                    {t.region} · {t.cases}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.color }}>
                  {t.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Most asked + community */}
      <div className="card" style={{ padding: 24 }}>
        <h3
          style={{
            margin: "0 0 14px",
            fontSize: 17,
            fontWeight: 700,
            color: "var(--green-900)",
          }}
        >
          Most asked questions in Pakistan
        </h3>
         <div
           className="analytics-top-questions-grid"
           style={{
             display: "grid",
             gridTemplateColumns: "repeat(2, 1fr)",
             gap: 10,
           }}
         >
          {(data.top_diseases && data.top_diseases.length > 0
            ? data.top_diseases.map((d) => ({
                q: "How to treat " + d.disease_name + "?",
                count: d.count.toLocaleString(),
              }))
            : [
                {
                  q: "No diagnoses yet — scan a crop leaf to get started!",
                  count: "0",
                },
              ]
          ).map((q, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 14px",
                background: "var(--green-50)",
                borderRadius: 10,
              }}
            >
              <span
                style={{
                  fontSize: 13.5,
                  color: "var(--green-900)",
                  fontWeight: 500,
                }}
              >
                {q.q}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--ink-mute)",
                  fontWeight: 600,
                }}
              >
                <Icon name="camera" size={11} /> {q.count} scans
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// WHATSAPP BOT MOCK
// ============================================================
const WhatsAppView = ({ lang, navigate, user }) => {
  return (
    <div className="whatsapp-page-container" style={{ padding: "32px 40px", maxWidth: 1240, margin: "0 auto" }}>
      <div
        style={{
          marginBottom: 16,
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
          }}
        >
          ZARii on WhatsApp
        </h1>
      </div>

      <div
        className="whatsapp-layout"
        style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24 }}
      >
        {/* Left: explanation */}
        <div>
          <div className="tag tag-green" style={{ marginBottom: 14 }}>
            <Icon name="whatsapp" size={12} /> Alternative path
          </div>
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: 28,
              fontWeight: 800,
              color: "var(--green-900)",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            For farmers who live on WhatsApp.
          </h2>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 15,
              color: "var(--ink-soft)",
              lineHeight: 1.6,
            }}
          >
            No app to download. No login. Just save the number, send a leaf
            photo or voice note, and ZARii replies in seconds — Urdu or English.
          </p>

          <div className="card" style={{ padding: 18, marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--ink-mute)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 8,
              }}
            >
              WhatsApp Bot
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#25D366",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="whatsapp" size={22} color="#fff" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "var(--green-900)",
                  }}
                >
                  Number coming soon
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                  Available 24/7 · Free
                </div>
              </div>
            </div>
            <div
              className="btn btn-wa"
              style={{
                width: "100%",
                marginTop: 14,
                cursor: "default",
                opacity: 0.8,
                pointerEvents: "none",
              }}
            >
              <Icon name="whatsapp" size={16} /> Coming Soon
            </div>
          </div>

          <h3
            style={{
              margin: "20px 0 10px",
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--ink-mute)",
            }}
          >
            How it works
          </h3>
          {[
            { i: 1, t: 'Send "Salaam" to start' },
            { i: 2, t: "Pick language (1 for English, 2 for Urdu)" },
            { i: 3, t: "Send a photo or voice note of the issue" },
            { i: 4, t: "Get diagnosis + Pakistani treatment in seconds" },
            { i: 5, t: "Your history syncs with the web app automatically" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "10px 0",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "var(--green-700)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {s.i}
              </div>
              <div style={{ fontSize: 14, color: "var(--ink)", paddingTop: 3 }}>
                {s.t}
              </div>
            </div>
          ))}
        </div>

        {/* Right: phone */}
        <WhatsAppPhone lang={lang} user={user} />
      </div>
    </div>
  );
};

const WhatsAppPhone = ({ lang, user }) => (
  <div style={{ display: "flex", justifyContent: "center" }}>
    <div
      className="whatsapp-phone-mock"
      style={{
        width: 380,
        background: "#1a2a1f",
        borderRadius: 44,
        padding: 10,
        boxShadow: "0 24px 50px rgba(31,74,44,0.24)",
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 36,
          overflow: "hidden",
          background: "#ECE5DD",
          height: 720,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* WA Header */}
        <div
          style={{
            background: "#075E54",
            color: "#fff",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Icon name="arrow-left" size={20} color="#fff" />
          <img
            src="assets/farmer-badge.png"
            width={40}
            height={40}
            style={{
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              ZARii AI{" "}
              <span style={{ fontSize: 11, opacity: 0.85 }}>✓ Verified</span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>online</div>
          </div>
          <Icon name="phone" size={20} color="#fff" />
        </div>

        {/* Chat */}
        <div
          style={{
            flex: 1,
            padding: "14px 12px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            backgroundImage:
              "radial-gradient(circle, #d8d2c2 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            backgroundColor: "#ECE5DD",
          }}
        >
          <DateChip>Today</DateChip>

          <Bubble side="user">Salaam</Bubble>
          <Bubble side="bot">
            🌱 السلام علیکم! ZARii AI میں خوش آمدید۔
            <br />
            <br />
            Hi! Welcome to ZARii AI.
            <br />
            <br />
            Reply with:
            <br />
            <strong>1</strong> for English
            <br />
            <strong>2</strong> اردو کے لیے
          </Bubble>
          <Bubble side="user">2</Bubble>
          <Bubble side="bot">
            <span className="urdu-inline">شکریہ! اب آپ مجھے:</span>
            <br />
            <span className="urdu-inline">📸 پتے کی تصویر بھیجیں</span>
            <br />
            <span className="urdu-inline">🎙️ یا وائس نوٹ ریکارڈ کریں</span>
            <br />
            <span className="urdu-inline">میں فوراً جواب دوں گا۔</span>
          </Bubble>

          {/* Image bubble */}
          <Bubble side="user" noPad>
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: 8,
                overflow: "hidden",
                position: "relative",
                background: "linear-gradient(135deg, #4a7c3a 0%, #2E6B3F 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="80%" height="80%" viewBox="0 0 200 200">
                <path
                  d="M30 170 Q40 50 170 30 Q160 130 60 165 Q40 175 30 170Z"
                  fill="#9DCB7C"
                />
                <circle cx="90" cy="90" r="8" fill="#8a5d2a" />
                <circle cx="120" cy="70" r="6" fill="#7a4d22" />
              </svg>
            </div>
            <div style={{ padding: "6px 8px", fontSize: 11, color: "#888" }}>
              2:14 PM ✓✓
            </div>
          </Bubble>

          <Bubble side="bot">
            <span style={{ fontSize: 13 }}>
              <strong>🔍 تشخیص: ابتدائی جھلساؤ (Early Blight)</strong>
              <br />
              <span style={{ color: "#888" }}>اعتماد: 94%</span>
              <br />
              <br />
              <strong>💊 علاج:</strong>
              <br />
              Antracol 70 WP (Bayer)
              <br />
              قیمت: ₨ 1,180 / kg
              <br />
              مقدار: 2g فی لیٹر پانی
              <br />
              ہر 7 دن، 3 بار اسپرے
              <br />
              <br />
              <strong>🛡️ بچاؤ:</strong> پتوں پر پانی نہ ڈالیں، صبح کی دھوپ لگنے
              دیں
            </span>
          </Bubble>

          {/* Voice bubble */}
          <Bubble side="bot" noPad>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: 10,
                minWidth: 200,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#25D366",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="play" size={14} color="#fff" />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flex: 1,
                }}
              >
                {[3, 5, 7, 4, 8, 6, 5, 7, 3, 5, 8, 4, 6, 3, 5].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: 3,
                      height: h * 2,
                      background: "#25D366",
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 11, color: "#888" }}>0:18</span>
            </div>
          </Bubble>
        </div>

        {/* Input */}
        <div
          style={{
            background: "#F0F0F0",
            padding: "8px 10px",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "#fff",
              borderRadius: 999,
              padding: "10px 14px",
              fontSize: 13,
              color: "#888",
            }}
          >
            Type a message…
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#075E54",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="mic" size={18} color="#fff" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DateChip = ({ children }) => (
  <div
    style={{
      alignSelf: "center",
      background: "#fff",
      borderRadius: 6,
      padding: "4px 10px",
      fontSize: 11,
      color: "#888",
      boxShadow: "0 1px 1px rgba(0,0,0,0.04)",
    }}
  >
    {children}
  </div>
);

const Bubble = ({ side, children, noPad }) => (
  <div
    style={{
      alignSelf: side === "user" ? "flex-end" : "flex-start",
      maxWidth: "80%",
      background: side === "user" ? "#DCF8C6" : "#fff",
      borderRadius: 8,
      borderTopRightRadius: side === "user" ? 2 : 8,
      borderTopLeftRadius: side === "user" ? 8 : 2,
      padding: noPad ? 4 : "8px 12px",
      fontSize: 13.5,
      lineHeight: 1.5,
      boxShadow: "0 1px 1px rgba(0,0,0,0.06)",
      color: "#222",
    }}
  >
    {children}
  </div>
);

window.Voice = Voice;
window.History = History;
window.Analytics = Analytics;
window.WhatsAppView = WhatsAppView;
