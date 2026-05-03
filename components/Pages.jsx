/* global React, Icon, CropGlyph */
const { useState: useS_V, useEffect: useE_V, useRef: useR_V } = React;

// ============================================================
// VOICE ASSISTANT
// ============================================================
const Voice = ({ lang, navigate }) => {
  const [state, setState] = useS_V('idle'); // idle, listening, thinking, speaking
  const [conversation, setConversation] = useS_V([
    { role: 'assistant', en: 'Salaam! Hold the mic and ask me anything about your crops.', ur: 'السلام علیکم! مائیک دبا کر اپنی فصل کے بارے میں کچھ بھی پوچھیں۔' },
  ]);
  const [transcript, setTranscript] = useS_V('');

  const sampleAsks = lang === 'ur'
    ? ['میرے گندم کے پتے پیلے کیوں ہیں؟','کاٹن پر سفید مکھی کا علاج؟','آلو کب لگانا چاہیے؟']
    : ['Why are my wheat leaves yellow?','How to treat whitefly on cotton?','When should I plant potatoes?'];

  const sampleAnswers = {
    en: 'Yellowing wheat leaves usually means nitrogen deficiency. Apply Urea at 1 bag per acre, and water lightly. If yellowing is on lower leaves only, it\'s a clear nitrogen sign. Want me to recommend a brand?',
    ur: 'گندم کے پیلے پتے عام طور پر نائٹروجن کی کمی کا اشارہ ہیں۔ فی ایکڑ ایک بوری یوریا ڈالیں اور ہلکا پانی دیں۔ اگر صرف نچلے پتے پیلے ہیں تو یہ یقینی نائٹروجن کی کمی ہے۔'
  };

  const startListen = () => {
    setState('listening');
    setTimeout(() => {
      const t = sampleAsks[0];
      setTranscript(t);
      setState('thinking');
      setTimeout(() => {
        setConversation(c => [...c, { role: 'user', en: 'Why are my wheat leaves yellow?', ur: sampleAsks[0] }]);
        setTimeout(() => {
          setConversation(c => [...c, { role: 'assistant', en: sampleAnswers.en, ur: sampleAnswers.ur }]);
          setState('speaking');
          setTimeout(() => { setState('idle'); setTranscript(''); }, 3000);
        }, 600);
      }, 1500);
    }, 2200);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('dashboard')}>
          <Icon name="arrow-left" size={16} /> Dashboard
        </button>
        <div style={{ height: 14, width: 1, background: 'var(--line)' }} />
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--green-900)', letterSpacing: '-0.02em',
          fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit' }}>
          {lang === 'ur' ? <span className="urdu-inline">آواز معاون</span> : 'Voice assistant'}
        </h1>
      </div>

      {/* Conversation */}
      <div className="card" style={{ flex: 1, padding: 28, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 16, minHeight: 360 }}>
        {conversation.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', gap: 12, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '78%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: msg.role === 'user' ? 'var(--amber)' : 'var(--green-700)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13,
            }}>
              {msg.role === 'user' ? 'You' : <img src="assets/farmer-badge.png" width={36} height={36} style={{ borderRadius: '50%' }} />}
            </div>
            <div style={{
              padding: '12px 16px', borderRadius: 16,
              background: msg.role === 'user' ? 'var(--amber)' : 'var(--green-50)',
              color: msg.role === 'user' ? '#fff' : 'var(--ink)',
              fontSize: 15, lineHeight: 1.5,
              fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
              direction: lang === 'ur' ? 'rtl' : 'ltr',
              borderTopLeftRadius: msg.role === 'user' ? 16 : 4,
              borderTopRightRadius: msg.role === 'user' ? 4 : 16,
            }}>
              {lang === 'ur' ? msg.ur : msg.en}
              {msg.role === 'assistant' && i > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button className="btn btn-sm" style={{ background: 'var(--paper)', color: 'var(--green-700)', padding: '4px 10px', fontSize: 11 }}>
                    <Icon name="speaker" size={12} /> Replay
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {state === 'thinking' && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--ink-mute)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden' }}>
              <img src="assets/farmer-badge.png" width={36} height={36} />
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%', background: 'var(--green-500)',
                  animation: 'mic-bar 1s infinite', animationDelay: `${i * 0.15}s`,
                }}/>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mic */}
      <div className="card" style={{ padding: 28, display: 'flex', alignItems: 'center', gap: 24 }}>
        <button onClick={startListen} disabled={state !== 'idle'}
          style={{
            width: 88, height: 88, borderRadius: '50%',
            background: state === 'listening' ? 'var(--amber)' : 'var(--green-700)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: state === 'idle' ? 'pointer' : 'default',
            transition: 'all .2s',
            animation: state === 'listening' ? 'pulseRing 1.5s infinite' : 'none',
            boxShadow: state === 'idle' ? '0 10px 24px rgba(46,107,63,0.32)' : '0 10px 24px rgba(244,166,42,0.4)',
            flexShrink: 0,
          }}>
          {state === 'listening'
            ? <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{
                    width: 4, height: 32, background: '#fff', borderRadius: 2,
                    animation: `mic-bar 0.8s infinite`, animationDelay: `${i*0.1}s`,
                    transformOrigin: 'center',
                  }}/>
                ))}
              </div>
            : <Icon name="mic" size={42} color="#fff" />}
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {state === 'listening' ? 'Listening...' :
             state === 'thinking'  ? 'Thinking...' :
             state === 'speaking'  ? 'Speaking...' :
             'Tap & speak'}
          </div>
          <div style={{
            fontSize: 17, fontWeight: 600, color: 'var(--green-900)', marginTop: 4, minHeight: 24,
            fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
            direction: lang === 'ur' ? 'rtl' : 'ltr',
          }}>
            {transcript || (lang === 'ur' ? 'مائیک دبائیں اور سوال پوچھیں…' : 'Hold the mic and ask anything…')}
          </div>

          {/* sample chips */}
          {state === 'idle' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              {sampleAsks.map((q, i) => (
                <button key={i} onClick={startListen} style={{
                  padding: '6px 12px', borderRadius: 999,
                  background: 'var(--green-50)', color: 'var(--green-900)', fontSize: 12.5, fontWeight: 500,
                  fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
                }}>
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-secondary btn-sm">
          <Icon name="globe" size={14} /> {lang === 'ur' ? 'اردو' : 'English'}
        </button>
      </div>
    </div>
  );
};

// ============================================================
// HISTORY
// ============================================================
const History = ({ lang, navigate }) => {
  const [filter, setFilter] = useS_V('all');

  const items = [
    { type: 'scan', crop: 'Tomato', issue: 'Early Blight', sev: 'Moderate', conf: 94, date: 'Today, 2:14 PM', color: '#F4A62A' },
    { type: 'scan', crop: 'Cotton', issue: 'Whitefly infestation', sev: 'High', conf: 89, date: 'Yesterday, 10:32 AM', color: '#D04E2C' },
    { type: 'voice', crop: '—', issue: 'Wheat yellowing question', date: '2 days ago', color: '#9DCB7C' },
    { type: 'scan', crop: 'Wheat', issue: 'Healthy', sev: 'None', conf: 97, date: '3 days ago', color: '#66A64F' },
    { type: 'scan', crop: 'Potato', issue: 'Late Blight', sev: 'Moderate', conf: 91, date: '1 week ago', color: '#F4A62A' },
    { type: 'voice', crop: '—', issue: 'Best mango fertilizer?', date: '1 week ago', color: '#9DCB7C' },
    { type: 'scan', crop: 'Rice', issue: 'Bacterial Leaf Blight', sev: 'Moderate', conf: 88, date: '2 weeks ago', color: '#F4A62A' },
    { type: 'scan', crop: 'Mango', issue: 'Anthracnose', sev: 'Low', conf: 86, date: '3 weeks ago', color: '#F4A62A' },
  ];

  const filtered = items.filter(i => filter === 'all' || i.type === filter);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1240, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--green-900)', letterSpacing: '-0.02em',
            fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit' }}>
            {lang === 'ur' ? <span className="urdu-inline">آپ کی تاریخ</span> : 'Your history'}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ink-soft)' }}>
            {items.length} saved diagnoses · synced with WhatsApp
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--paper)', borderRadius: 999, border: '1px solid var(--line)' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'scan', label: 'Scans', icon: 'camera' },
              { id: 'voice', label: 'Voice', icon: 'mic' },
            ].map(t => (
              <button key={t.id} onClick={() => setFilter(t.id)}
                style={{
                  padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                  background: filter === t.id ? 'var(--green-700)' : 'transparent',
                  color: filter === t.id ? '#fff' : 'var(--ink-soft)',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {filtered.map((it, i) => (
          <div key={i} className="card" onClick={() => navigate('analyze')}
            style={{ padding: 20, cursor: 'pointer', display: 'flex', gap: 16, transition: 'transform .12s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{
              width: 76, height: 76, borderRadius: 14, flexShrink: 0,
              background: `linear-gradient(135deg, ${it.color}33 0%, ${it.color}11 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {it.type === 'voice'
                ? <Icon name="mic" size={32} color={it.color} />
                : <CropGlyph crop={it.crop} size={36} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className={'tag ' + (it.type === 'voice' ? 'tag-cream' : it.sev === 'None' ? 'tag-green' : it.sev === 'High' ? 'tag-red' : 'tag-amber')}>
                  {it.type === 'voice' ? <><Icon name="mic" size={11} />Voice</> : <><Icon name="camera" size={11} />{it.crop}</>}
                </span>
                {it.conf && <span style={{ fontSize: 11.5, color: 'var(--ink-mute)', fontWeight: 600 }}>{it.conf}% conf.</span>}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--green-900)', letterSpacing: '-0.01em' }}>{it.issue}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-mute)', marginTop: 2 }}>{it.date}</div>
            </div>
            <Icon name="arrow-right" size={18} color="var(--ink-mute)" />
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// ANALYTICS
// ============================================================
const Analytics = ({ lang, navigate }) => {
  return (
    <div style={{ padding: '32px 40px', maxWidth: 1320, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--green-900)', letterSpacing: '-0.02em',
          fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit' }}>
          {lang === 'ur' ? <span className="urdu-inline">آپ کے کھیت کی بصیرت</span> : 'Your farm insights'}
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ink-soft)' }}>
          Personal stats · regional outbreak trends · last 90 days
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 18 }}>
        {[
          { v: '38', l: 'Total scans', delta: '+12', icon: 'camera', color: '#2E6B3F' },
          { v: '6', l: 'Diseases found', delta: '-2', icon: 'flask', color: '#F4A62A' },
          { v: '87', l: 'Farm health score', delta: '+6', icon: 'sprout', color: '#66A64F' },
          { v: '₨ 4,200', l: 'Saved on pesticides', delta: '+14%', icon: 'pkr', color: '#9DCB7C' },
        ].map((k, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: k.color + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={k.icon} size={20} color={k.color} />
              </div>
              <span className={'tag ' + (k.delta.startsWith('-') ? 'tag-amber' : 'tag-green')}>
                <Icon name="trend" size={11} /> {k.delta}
              </span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--green-900)', marginTop: 14, letterSpacing: '-0.02em' }}>{k.v}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 2 }}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 18 }}>
        {/* Timeline chart */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--green-900)' }}>Farm health timeline</h3>
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--green-50)', borderRadius: 999 }}>
              {['7d','30d','90d'].map((p, i) => (
                <button key={i} style={{
                  padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: p === '90d' ? 'var(--paper)' : 'transparent',
                  color: p === '90d' ? 'var(--green-900)' : 'var(--ink-mute)',
                  boxShadow: p === '90d' ? 'var(--shadow-sm)' : 'none',
                }}>{p}</button>
              ))}
            </div>
          </div>

          <svg viewBox="0 0 600 240" style={{ width: '100%', height: 240 }}>
            <defs>
              <linearGradient id="healthGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#66A64F" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#66A64F" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {/* Grid */}
            {[0,60,120,180].map(y => (
              <line key={y} x1="40" x2="590" y1={y+20} y2={y+20} stroke="#F1ECDD" strokeWidth="1" />
            ))}
            {/* Y labels */}
            {[100,75,50,25].map((v,i) => (
              <text key={i} x="32" y={i*60+24} textAnchor="end" fontSize="10" fill="#7E7E7E">{v}</text>
            ))}
            {/* Area */}
            <path d="M40 130 L100 110 L160 90 L220 96 L280 78 L340 70 L400 86 L460 60 L520 52 L580 40 L580 220 L40 220 Z" fill="url(#healthGrad)" />
            <path d="M40 130 L100 110 L160 90 L220 96 L280 78 L340 70 L400 86 L460 60 L520 52 L580 40" stroke="#66A64F" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dots */}
            {[[40,130],[100,110],[160,90],[220,96],[280,78],[340,70],[400,86],[460,60],[520,52],[580,40]].map(([cx,cy],i) => (
              <circle key={i} cx={cx} cy={cy} r="4" fill="#66A64F" stroke="#fff" strokeWidth="2" />
            ))}
            {/* Disease markers */}
            <circle cx="160" cy="90" r="9" fill="none" stroke="#F4A62A" strokeWidth="2"/>
            <circle cx="280" cy="78" r="9" fill="none" stroke="#F4A62A" strokeWidth="2"/>
            <circle cx="460" cy="60" r="9" fill="none" stroke="#F4A62A" strokeWidth="2"/>
            {/* X labels */}
            {['Feb','Mar','Apr','May'].map((m, i) => (
              <text key={i} x={40 + i*180} y="234" fontSize="11" fill="#7E7E7E" textAnchor="middle">{m}</text>
            ))}
          </svg>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--ink-mute)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#66A64F' }}/> Health score
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #F4A62A' }}/> Disease detected
            </span>
          </div>
        </div>

        {/* Top issues */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 700, color: 'var(--green-900)' }}>Most-asked diseases</h3>
          {[
            { name: 'Whitefly', count: 12, pct: 100 },
            { name: 'Early Blight', count: 9, pct: 75 },
            { name: 'Yellow Rust', count: 7, pct: 58 },
            { name: 'Anthracnose', count: 5, pct: 42 },
            { name: 'Late Blight', count: 4, pct: 33 },
          ].map((d, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: 'var(--green-900)' }}>{d.name}</span>
                <span style={{ color: 'var(--ink-mute)' }}>{d.count}</span>
              </div>
              <div style={{ height: 8, background: 'var(--green-50)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${d.pct}%`,
                  background: `linear-gradient(90deg, var(--green-500), var(--green-700))`,
                  borderRadius: 4,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional outbreak map */}
      <div className="card" style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--green-900)' }}>Regional outbreak trends</h3>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--ink-mute)' }}>Anonymized data from ZARii users · Pakistan</p>
          </div>
          <div className="tag tag-amber"><Icon name="trend" size={11} /> Whitefly rising in Multan</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
          {/* Faux Pakistan map */}
          <div style={{
            position: 'relative', background: 'var(--green-50)', borderRadius: 14,
            padding: 16, height: 320,
          }}>
            <svg viewBox="0 0 400 320" style={{ width: '100%', height: '100%' }}>
              {/* Stylized Pakistan outline */}
              <path d="M 80 60 L 140 40 L 200 55 L 250 75 L 290 100 L 320 130 L 340 175 L 320 220 L 280 250 L 240 270 L 200 280 L 160 270 L 130 240 L 100 200 L 80 160 L 60 120 L 70 80 Z"
                fill="#9DCB7C33" stroke="#66A64F" strokeWidth="1.5" />
              {/* Province dots/regions */}
              {[
                { x: 200, y: 130, name: 'Punjab', cases: 'High', size: 32, color: '#D04E2C' },
                { x: 270, y: 220, name: 'Sindh', cases: 'Moderate', size: 22, color: '#F4A62A' },
                { x: 130, y: 110, name: 'KPK', cases: 'Low', size: 14, color: '#66A64F' },
                { x: 160, y: 200, name: 'Balochistan', cases: 'Low', size: 14, color: '#66A64F' },
              ].map((r, i) => (
                <g key={i}>
                  <circle cx={r.x} cy={r.y} r={r.size} fill={r.color} opacity="0.18" />
                  <circle cx={r.x} cy={r.y} r={r.size * 0.5} fill={r.color} opacity="0.4" />
                  <circle cx={r.x} cy={r.y} r={5} fill={r.color} />
                  <text x={r.x} y={r.y - r.size - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1F4A2C">{r.name}</text>
                  <text x={r.x} y={r.y + r.size + 14} textAnchor="middle" fontSize="10" fill="#7E7E7E">{r.cases}</text>
                </g>
              ))}
            </svg>
            <div style={{
              position: 'absolute', bottom: 12, left: 16, right: 16,
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: 'var(--ink-mute)',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#66A64F' }}/> Low
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F4A62A' }}/> Moderate
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#D04E2C' }}/> High
              </span>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-mute)' }}>
              Trending nearby
            </h4>
            {[
              { region: 'Multan, Punjab', issue: 'Whitefly on Cotton', trend: '+47%', cases: '320 farms', color: '#D04E2C' },
              { region: 'Faisalabad', issue: 'Yellow Rust on Wheat', trend: '+18%', cases: '180 farms', color: '#F4A62A' },
              { region: 'Hyderabad, Sindh', issue: 'Anthracnose on Mango', trend: '+12%', cases: '95 farms', color: '#F4A62A' },
              { region: 'Sahiwal', issue: 'Bollworm on Cotton', trend: '-8%', cases: '60 farms', color: '#66A64F' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i > 0 ? '1px solid var(--line-soft)' : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-900)' }}>{t.issue}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{t.region} · {t.cases}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.color }}>{t.trend}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Most asked + community */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 700, color: 'var(--green-900)' }}>Most asked questions in Pakistan</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {[
            { q: 'How to prevent whitefly on cotton?', count: '4,210' },
            { q: 'Best fertilizer for wheat?', count: '3,560' },
            { q: 'When to spray for yellow rust?', count: '2,840' },
            { q: 'How much water for tomato?', count: '2,310' },
            { q: 'Mango anthracnose treatment?', count: '1,720' },
            { q: 'Sugarcane red rot prevention?', count: '1,210' },
          ].map((q, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px', background: 'var(--green-50)', borderRadius: 10,
            }}>
              <span style={{ fontSize: 13.5, color: 'var(--green-900)', fontWeight: 500 }}>{q.q}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600 }}>
                <Icon name="users" size={11} /> {q.count}
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
    <div style={{ padding: '32px 40px', maxWidth: 1240, margin: '0 auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('dashboard')}>
          <Icon name="arrow-left" size={16} /> Dashboard
        </button>
        <div style={{ height: 14, width: 1, background: 'var(--line)' }} />
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--green-900)', letterSpacing: '-0.02em' }}>
          ZARii on WhatsApp
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
        {/* Left: explanation */}
        <div>
          <div className="tag tag-green" style={{ marginBottom: 14 }}>
            <Icon name="whatsapp" size={12} /> Alternative path
          </div>
          <h2 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800, color: 'var(--green-900)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            For farmers who live on WhatsApp.
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            No app to download. No login. Just save the number, send a leaf photo or voice note, and ZARii replies in seconds — Urdu or English.
          </p>

          <div className="card" style={{ padding: 18, marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Save this number
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: '#25D366',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="whatsapp" size={22} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green-900)' }}>+92 300 ZARii AI</div>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Available 24/7 · Free</div>
              </div>
            </div>
            <button className="btn btn-wa" style={{ width: '100%', marginTop: 14 }}>
              <Icon name="whatsapp" size={16} /> Open WhatsApp
            </button>
          </div>

          <h3 style={{ margin: '20px 0 10px', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-mute)' }}>
            How it works
          </h3>
          {[
            { i: 1, t: 'Send "Salaam" to start' },
            { i: 2, t: 'Pick language (1 for English, 2 for Urdu)' },
            { i: 3, t: 'Send a photo or voice note of the issue' },
            { i: 4, t: 'Get diagnosis + Pakistani treatment in seconds' },
            { i: 5, t: 'Your history syncs with the web app automatically' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0' }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', background: 'var(--green-700)',
                color: '#fff', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{s.i}</div>
              <div style={{ fontSize: 14, color: 'var(--ink)', paddingTop: 3 }}>{s.t}</div>
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
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <div style={{
      width: 380, background: '#1a2a1f',
      borderRadius: 44, padding: 10,
      boxShadow: '0 24px 50px rgba(31,74,44,0.24)',
    }}>
      <div style={{
        position: 'relative', borderRadius: 36, overflow: 'hidden',
        background: '#ECE5DD',
        height: 720,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* WA Header */}
        <div style={{ background: '#075E54', color: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="arrow-left" size={20} color="#fff" />
          <img src="assets/farmer-badge.png" width={40} height={40} style={{ borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>ZARii AI <span style={{ fontSize: 11, opacity: 0.85 }}>✓ Verified</span></div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>online</div>
          </div>
          <Icon name="phone" size={20} color="#fff" />
        </div>

        {/* Chat */}
        <div style={{ flex: 1, padding: '14px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8,
          backgroundImage: 'radial-gradient(circle, #d8d2c2 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundColor: '#ECE5DD',
        }}>
          <DateChip>Today</DateChip>

          <Bubble side="user">Salaam</Bubble>
          <Bubble side="bot">
            🌱 السلام علیکم! ZARii AI میں خوش آمدید۔<br/><br/>
            Hi! Welcome to ZARii AI.<br/><br/>
            Reply with:<br/>
            <strong>1</strong> for English<br/>
            <strong>2</strong> اردو کے لیے
          </Bubble>
          <Bubble side="user">2</Bubble>
          <Bubble side="bot">
            <span className="urdu-inline">شکریہ! اب آپ مجھے:</span><br/>
            <span className="urdu-inline">📸 پتے کی تصویر بھیجیں</span><br/>
            <span className="urdu-inline">🎙️ یا وائس نوٹ ریکارڈ کریں</span><br/>
            <span className="urdu-inline">میں فوراً جواب دوں گا۔</span>
          </Bubble>

          {/* Image bubble */}
          <Bubble side="user" noPad>
            <div style={{ width: 200, height: 200, borderRadius: 8, overflow: 'hidden', position: 'relative',
              background: 'linear-gradient(135deg, #4a7c3a 0%, #2E6B3F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="80%" height="80%" viewBox="0 0 200 200">
                <path d="M30 170 Q40 50 170 30 Q160 130 60 165 Q40 175 30 170Z" fill="#9DCB7C" />
                <circle cx="90" cy="90" r="8" fill="#8a5d2a" />
                <circle cx="120" cy="70" r="6" fill="#7a4d22" />
              </svg>
            </div>
            <div style={{ padding: '6px 8px', fontSize: 11, color: '#888' }}>2:14 PM ✓✓</div>
          </Bubble>

          <Bubble side="bot">
            <span style={{ fontSize: 13 }}>
              <strong>🔍 تشخیص: ابتدائی جھلساؤ (Early Blight)</strong><br/>
              <span style={{ color: '#888' }}>اعتماد: 94%</span><br/><br/>
              <strong>💊 علاج:</strong><br/>
              Antracol 70 WP (Bayer)<br/>
              قیمت: ₨ 1,180 / kg<br/>
              مقدار: 2g فی لیٹر پانی<br/>
              ہر 7 دن، 3 بار اسپرے<br/><br/>
              <strong>🛡️ بچاؤ:</strong> پتوں پر پانی نہ ڈالیں، صبح کی دھوپ لگنے دیں
            </span>
          </Bubble>

          {/* Voice bubble */}
          <Bubble side="bot" noPad>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, minWidth: 200 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: '#25D366',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="play" size={14} color="#fff" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                {[3,5,7,4,8,6,5,7,3,5,8,4,6,3,5].map((h, i) => (
                  <div key={i} style={{ width: 3, height: h * 2, background: '#25D366', borderRadius: 2 }}/>
                ))}
              </div>
              <span style={{ fontSize: 11, color: '#888' }}>0:18</span>
            </div>
          </Bubble>
        </div>

        {/* Input */}
        <div style={{ background: '#F0F0F0', padding: '8px 10px', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: 999, padding: '10px 14px', fontSize: 13, color: '#888' }}>
            Type a message…
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#075E54', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="mic" size={18} color="#fff" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DateChip = ({ children }) => (
  <div style={{ alignSelf: 'center', background: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#888', boxShadow: '0 1px 1px rgba(0,0,0,0.04)' }}>{children}</div>
);

const Bubble = ({ side, children, noPad }) => (
  <div style={{
    alignSelf: side === 'user' ? 'flex-end' : 'flex-start',
    maxWidth: '80%',
    background: side === 'user' ? '#DCF8C6' : '#fff',
    borderRadius: 8,
    borderTopRightRadius: side === 'user' ? 2 : 8,
    borderTopLeftRadius: side === 'user' ? 8 : 2,
    padding: noPad ? 4 : '8px 12px',
    fontSize: 13.5, lineHeight: 1.5,
    boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
    color: '#222',
  }}>{children}</div>
);

window.Voice = Voice;
window.History = History;
window.Analytics = Analytics;
window.WhatsAppView = WhatsAppView;
