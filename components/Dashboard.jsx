/* global React, Icon, Logo, LangToggle, LeafDeco */
const { useState: useS_D, useEffect: useE_D, useRef: useR_D } = React;

// Shared app shell with sidebar
const AppShell = ({ user, lang, setLang, navigate, current, children }) => {
  const items = [
    { id: 'dashboard', en: 'Dashboard', ur: 'ڈیش بورڈ', icon: 'home' },
    { id: 'analyze',   en: 'Analyze crop', ur: 'فصل کی تشخیص', icon: 'camera' },
    { id: 'voice',     en: 'Voice assistant', ur: 'آواز معاون', icon: 'mic' },
    { id: 'history',   en: 'History', ur: 'تاریخ', icon: 'history' },
    { id: 'analytics', en: 'Insights', ur: 'تجزیات', icon: 'chart' },
    { id: 'whatsapp',  en: 'WhatsApp bot', ur: 'واٹس ایپ بوٹ', icon: 'whatsapp' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260, flexShrink: 0,
        background: 'var(--paper)',
        borderRight: '1px solid var(--line-soft)',
        padding: '24px 16px',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '0 8px 24px', borderBottom: '1px solid var(--line-soft)', marginBottom: 16 }}>
          <div onClick={() => navigate('landing')} style={{ cursor: 'pointer' }}>
            <Logo size={36} lang={lang} />
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {items.map(it => (
            <button key={it.id} onClick={() => navigate(it.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 12,
                background: current === it.id ? 'var(--green-50)' : 'transparent',
                color: current === it.id ? 'var(--green-900)' : 'var(--ink-soft)',
                fontWeight: current === it.id ? 600 : 500, fontSize: 14.5,
                textAlign: 'left', position: 'relative',
                transition: 'all .12s',
              }}>
              {current === it.id && (
                <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, background: 'var(--green-700)', borderRadius: 2 }} />
              )}
              <Icon name={it.icon} size={19} color={current === it.id ? 'var(--green-700)' : 'var(--ink-mute)'} />
              <span style={{
                fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
              }}>{lang === 'ur' ? it.ur : it.en}</span>
            </button>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 14 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            borderRadius: 12, background: 'var(--green-50)', marginBottom: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--green-700)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14,
            }}>{(user?.name || 'U').split(' ').map(n => n[0]).slice(0,2).join('')}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--green-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Farmer'}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-mute)' }}>{user?.phone || '+92 3xx xxxxxxx'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <LangToggle lang={lang} setLang={setLang} />
            <button onClick={() => navigate('landing')} style={{ padding: 8, borderRadius: 8, color: 'var(--ink-mute)' }}>
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

// ============================================================
// DASHBOARD
// ============================================================
const Dashboard = ({ user, lang, navigate }) => {
  const [now, setNow] = useS_D(new Date());
  useE_D(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  const greeting = (() => {
    const h = now.getHours();
    if (lang === 'ur') {
      if (h < 12) return 'صبح بخیر';
      if (h < 17) return 'دوپہر بخیر';
      return 'شام بخیر';
    }
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1320, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-mute)', fontWeight: 600,
            fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit' }}>
            {greeting}, {now.toLocaleDateString('en-PK', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 style={{
            margin: '4px 0 0', fontSize: 34, fontWeight: 800, color: 'var(--green-900)',
            letterSpacing: '-0.02em',
            fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
            direction: lang === 'ur' ? 'rtl' : 'ltr',
          }}>
            {lang === 'ur'
              ? <>السلام علیکم، <span style={{ color: 'var(--green-500)' }}>{user?.name?.split(' ')[0] || 'کسان'}</span> 🌾</>
              : <>Hello {user?.name?.split(' ')[0] || 'Farmer'} <span style={{ color: 'var(--green-500)' }}>👋</span></>}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" style={{ position: 'relative' }}>
            <Icon name="bell" size={17} />
            <span style={{ position: 'absolute', top: 6, right: 8, width: 8, height: 8, background: 'var(--amber)', borderRadius: '50%' }} />
          </button>
          <button className="btn btn-primary" onClick={() => navigate('analyze')}>
            <Icon name="camera" size={17} color="#fff" />
            {lang === 'ur' ? <span className="urdu-inline">نئی تشخیص</span> : 'New diagnosis'}
          </button>
        </div>
      </div>

      {/* Big actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginBottom: 18 }}>
        {/* Analyze hero card */}
        <div onClick={() => navigate('analyze')}
          style={{
            background: 'linear-gradient(135deg, var(--green-700) 0%, var(--green-900) 100%)',
            borderRadius: 24, padding: 32, color: '#fff',
            position: 'relative', overflow: 'hidden', cursor: 'pointer',
            minHeight: 220,
          }}>
          <div style={{ position: 'absolute', right: -30, top: -30, opacity: 0.12 }}>
            <Icon name="leaf-fill" size={260} color="#fff" />
          </div>
          <div className="tag" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}>
            <Icon name="sparkles" size={12} /> Vision AI
          </div>
          <h2 style={{
            margin: '16px 0 6px', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', maxWidth: 380,
            fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
            direction: lang === 'ur' ? 'rtl' : 'ltr',
          }}>
            {lang === 'ur' ? 'پتے کی تصویر کھینچیں — بیماری پہچانیں' : 'Snap a leaf, diagnose disease.'}
          </h2>
          <p style={{
            margin: '0 0 24px', fontSize: 15, opacity: 0.85, maxWidth: 420,
            fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
            direction: lang === 'ur' ? 'rtl' : 'ltr',
          }}>
            {lang === 'ur'
              ? 'صرف ۵ سیکنڈ میں دوا کا نام، قیمت اور مقدار حاصل کریں۔'
              : 'Get the exact pesticide, PKR price, and dosage in 5 seconds.'}
          </p>
          <button className="btn btn-amber">
            <Icon name="camera" size={16} />
            {lang === 'ur' ? <span className="urdu-inline">تصویر لیں</span> : 'Take photo'}
          </button>
        </div>

        {/* Voice card */}
        <div onClick={() => navigate('voice')}
          style={{
            background: 'var(--cream)', borderRadius: 24, padding: 28,
            position: 'relative', overflow: 'hidden', cursor: 'pointer',
            border: '1px solid #EAD9A8',
          }}>
          <div className="tag tag-amber" style={{ marginBottom: 14 }}>
            <Icon name="mic" size={12} /> Audio AI
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: 'var(--green-900)' }}>
            {lang === 'ur' ? <span className="urdu-inline">آواز سے سوال کریں</span> : 'Ask in your voice'}
          </h3>
          <p className="urdu-inline" style={{ margin: 0, fontSize: 16, color: 'var(--ink-soft)', display: 'block' }}>
            "میرے گندم کے پتے کیوں سوکھ رہے ہیں؟"
          </p>
          <div style={{
            position: 'absolute', right: 20, bottom: 20,
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 24px rgba(244,166,42,0.4)',
            animation: 'pulseRing 2s infinite',
          }}>
            <Icon name="mic" size={32} color="#fff" />
          </div>
        </div>
      </div>

      {/* 3-col strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 24 }}>
        <WeatherCard lang={lang} />
        <AlertCard lang={lang} />
        <FarmHealthCard lang={lang} />
      </div>

      {/* Recent + suggestions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }}>
        <RecentScans lang={lang} navigate={navigate} />
        <QuickAsk lang={lang} navigate={navigate} />
      </div>
    </div>
  );
};

const WeatherCard = ({ lang }) => (
  <div className="card" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <Icon name="pin" size={11} /> Multan, Punjab
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--green-900)', marginTop: 6, letterSpacing: '-0.02em' }}>
          32°<span style={{ fontSize: 18, color: 'var(--ink-mute)', fontWeight: 600 }}>C</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 500 }}>Partly cloudy</div>
      </div>
      <Icon name="cloud-sun" size={48} color="#F4A62A" />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line-soft)' }}>
      {[
        { i: 'droplet', v: '62%', l: 'Humidity' },
        { i: 'wind', v: '12 km/h', l: 'Wind' },
        { i: 'rain', v: '20%', l: 'Rain' },
      ].map((m, i) => (
        <div key={i} style={{ textAlign: 'center', flex: 1 }}>
          <Icon name={m.i} size={16} color="var(--green-500)" />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-900)', marginTop: 4 }}>{m.v}</div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-mute)' }}>{m.l}</div>
        </div>
      ))}
    </div>
  </div>
);

const AlertCard = ({ lang }) => (
  <div style={{
    padding: 22, borderRadius: 22,
    background: 'linear-gradient(135deg, #FFF4DE 0%, #FCD58A 100%)',
    border: '1px solid #EAB87A', position: 'relative', overflow: 'hidden',
  }}>
    <div className="tag tag-amber" style={{ background: '#fff' }}>
      <Icon name="bell" size={11} color="#F4A62A" /> Regional alert
    </div>
    <h4 style={{ margin: '12px 0 6px', fontSize: 17, fontWeight: 800, color: '#5A3A00', letterSpacing: '-0.01em' }}>
      {lang === 'ur'
        ? <span className="urdu-inline">اگلے ہفتے سفید مکھی کا خطرہ</span>
        : 'High whitefly risk next week'}
    </h4>
    <p style={{ margin: 0, fontSize: 13, color: '#704800', lineHeight: 1.5,
      fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
      direction: lang === 'ur' ? 'rtl' : 'ltr',
    }}>
      {lang === 'ur'
        ? 'پنجاب کے کاٹن بیلٹ میں۔ ابھی سے روک تھام شروع کریں۔'
        : 'Cotton belt, southern Punjab. Start preventive spray this week.'}
    </p>
    <button className="btn btn-sm" style={{ marginTop: 14, background: '#5A3A00', color: '#fff' }}>
      View advisory <Icon name="arrow-right" size={13} color="#fff" />
    </button>
  </div>
);

const FarmHealthCard = ({ lang }) => (
  <div className="card" style={{ padding: 22 }}>
    <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      Farm health · 30d
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
      <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--green-700)', letterSpacing: '-0.02em' }}>87</div>
      <div style={{ fontSize: 14, color: 'var(--ink-mute)' }}>/100</div>
      <div className="tag tag-green" style={{ marginLeft: 'auto' }}>
        <Icon name="trend" size={11} /> +6
      </div>
    </div>
    {/* mini sparkline */}
    <svg viewBox="0 0 200 50" style={{ width: '100%', height: 50, marginTop: 12 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#66A64F" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#66A64F" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d="M0 38 L20 32 L40 36 L60 28 L80 22 L100 26 L120 18 L140 22 L160 12 L180 14 L200 8 L200 50 L0 50 Z" fill="url(#spark)" />
      <path d="M0 38 L20 32 L40 36 L60 28 L80 22 L100 26 L120 18 L140 22 L160 12 L180 14 L200 8" fill="none" stroke="#66A64F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
      Trending healthier · last scan 2 days ago
    </div>
  </div>
);

const RecentScans = ({ lang, navigate }) => {
  const scans = [
    { crop: 'Tomato', issue: 'Early Blight', conf: 94, sev: 'Moderate', when: '2h ago', color: '#F4A62A' },
    { crop: 'Cotton', issue: 'Whitefly', conf: 89, sev: 'High', when: 'Yesterday', color: '#D04E2C' },
    { crop: 'Wheat',  issue: 'Healthy ✓', conf: 97, sev: 'None', when: '3 days ago', color: '#66A64F' },
    { crop: 'Potato', issue: 'Late Blight', conf: 91, sev: 'Moderate', when: '1 week ago', color: '#F4A62A' },
  ];

  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--green-900)',
          fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit' }}>
          {lang === 'ur' ? <span className="urdu-inline">حالیہ تشخیصیں</span> : 'Recent scans'}
        </h3>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('history')}>
          {lang === 'ur' ? <span className="urdu-inline">سب دیکھیں</span> : 'See all'} <Icon name="arrow-right" size={13} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {scans.map((s, i) => (
          <div key={i} onClick={() => navigate('analyze')} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
            borderTop: i > 0 ? '1px solid var(--line-soft)' : 'none',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: `linear-gradient(135deg, ${s.color}33 0%, ${s.color}11 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <CropGlyph crop={s.crop} size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--green-900)' }}>{s.crop} · {s.issue}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>
                {s.conf}% confidence · {s.sev !== 'None' ? `${s.sev} severity` : 'Crop healthy'} · {s.when}
              </div>
            </div>
            <div style={{
              padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: s.color + '22', color: s.color === '#66A64F' ? 'var(--green-900)' : s.color,
            }}>{s.conf}%</div>
            <Icon name="arrow-right" size={16} color="var(--ink-mute)" />
          </div>
        ))}
      </div>
    </div>
  );
};

const CropGlyph = ({ crop, size = 24 }) => {
  // Simple emoji-ish glyph using SVG
  const map = {
    Tomato:  { c: '#D04E2C', e: '🍅' },
    Cotton:  { c: '#9DCB7C', e: '🌾' },
    Wheat:   { c: '#E8B85B', e: '🌾' },
    Potato:  { c: '#A37A4F', e: '🥔' },
    Rice:    { c: '#C8B775', e: '🌾' },
    Mango:   { c: '#F4A62A', e: '🥭' },
  };
  const m = map[crop] || { c: '#66A64F', e: '🌱' };
  return <div style={{ fontSize: size }}>{m.e}</div>;
};

const QuickAsk = ({ lang, navigate }) => {
  const suggestions = [
    { en: 'When should I water my wheat?', ur: 'گندم کب پانی دینا چاہیے؟' },
    { en: 'Best fertilizer for cotton?', ur: 'کاٹن کے لیے بہترین کھاد؟' },
    { en: 'How to prevent fungus on tomato?', ur: 'ٹماٹر پر فنگس سے بچاؤ؟' },
    { en: 'When to harvest mango?', ur: 'آم کب توڑنا چاہیے؟' },
  ];
  return (
    <div className="card" style={{ padding: 22 }}>
      <h3 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 700, color: 'var(--green-900)',
        fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit' }}>
        {lang === 'ur' ? <span className="urdu-inline">جلدی پوچھیں</span> : 'Quick ask'}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {suggestions.map((q, i) => (
          <button key={i} onClick={() => navigate('voice')} style={{
            padding: '12px 14px', textAlign: 'left',
            background: 'var(--green-50)', borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            transition: 'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--green-100)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--green-50)'}>
            <span style={{
              fontSize: 13.5, color: 'var(--green-900)', fontWeight: 500,
              fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
              direction: lang === 'ur' ? 'rtl' : 'ltr',
            }}>{lang === 'ur' ? q.ur : q.en}</span>
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
