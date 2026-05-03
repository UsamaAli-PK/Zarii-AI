/* global React, Icon, Logo */
const { useState: useS_Adm, useEffect: useE_Adm, useMemo: useM_Adm } = React;

// ============================================================
// CMD PALETTE (Moved up for TDZ)
// ============================================================
const CmdPalette = ({ tabs, onPick, onClose }) => {
  const [q, setQ] = useS_Adm('');
  const filt = tabs.filter(t => t.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,42,26,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '12vh' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width: 560, background: '#fff', borderRadius: 14, boxShadow: '0 30px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #F1ECDD', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="search" size={16} color="#7E7E7E"/>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Jump to…" style={{ flex: 1, fontSize: 15, border: 'none', outline: 'none' }}/>
          <span style={{ fontSize: 11, color: '#A0A0A0', padding: '2px 6px', background: '#F1ECDD', borderRadius: 4 }}>ESC</span>
        </div>
        <div style={{ maxHeight: 360, overflow: 'auto', padding: 8 }}>
          {filt.map(t => (
            <button key={t.id} onClick={() => onPick(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14, color: '#1F4A2C' }}
              onMouseEnter={e=>e.currentTarget.style.background='#F1F7E9'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <Icon name={t.icon} size={16} color="#66A64F"/>
              {t.label}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#7E7E7E' }}>{t.group}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// ADMIN LOGIN (Moved up for TDZ)
// ============================================================
const AdminLogin = ({ onAuth, navigate }) => {
  const [loading, setLoading] = useS_Adm(false);
  const [error, setError] = useS_Adm('');
  const [email, setEmail] = useS_Adm('');
  const [pass, setPass] = useS_Adm('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        window.API.saveAdminToken(data.token);
        onAuth(data.admin, data.token);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F2A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', padding: 32, borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, background: '#F1F7E9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Icon name="shield" size={24} color="#2E6B3F" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1F4A2C', margin: 0 }}>ZARii AI Console</h2>
          <p style={{ color: '#7E7E7E', fontSize: 13, marginTop: 4 }}>Please sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#7E7E7E', marginBottom: 6, textTransform: 'uppercase' }}>Email Address</label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@zarii.ai" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #E6E0D1', fontSize: 14 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#7E7E7E', marginBottom: 6, textTransform: 'uppercase' }}>Password</label>
            <input type="password" required value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #E6E0D1', fontSize: 14 }} />
          </div>
          {error && <div style={{ color: '#D04E2C', fontSize: 13, fontWeight: 600, background: '#FFF6F2', padding: '10px 14px', borderRadius: 10 }}>{error}</div>}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ height: 48, fontSize: 15 }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        <button onClick={() => navigate('dashboard')} style={{ width: '100%', background: 'none', border: 'none', color: '#7E7E7E', fontSize: 13, marginTop: 24, cursor: 'pointer' }}>
          Back to Farmer App
        </button>
      </div>
    </div>
  );
};

// ============================================================
// INTERNAL COMPONENTS (Moved to top to fix TDZ)
// ============================================================

const Card = ({ children, style, ...r }) => (
  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E6E0D1', boxShadow: '0 1px 2px rgba(31,74,44,0.04)', ...style }} {...r}>{children}</div>
);

const Stat = ({ label, value, delta, deltaType = 'up', icon, color = '#2E6B3F', sub }) => (
  <Card style={{ padding: 18 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} color={color} />
      </div>
      {delta && <span className={'tag ' + (deltaType === 'up' ? 'tag-green' : 'tag-red')} style={{ fontSize: 11 }}>{delta}</span>}
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color: '#1F4A2C', marginTop: 12, letterSpacing: '-0.02em' }}>{value}</div>
    <div style={{ fontSize: 12.5, color: '#7E7E7E' }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: '#A0A0A0', marginTop: 4 }}>{sub}</div>}
  </Card>
);

const Pill = ({ tone = 'gray', children }) => {
  const tones = {
    green: { bg: '#E4F0D8', fg: '#1F4A2C' },
    amber: { bg: '#FDE9C2', fg: '#6E4A00' },
    red:   { bg: '#FCDFD9', fg: '#8A2A1B' },
    gray:  { bg: '#F1ECDD', fg: '#5A5A5A' },
    blue:  { bg: '#DCEAF7', fg: '#1F4A6B' },
    sponsored: { bg: '#FDE9C2', fg: '#6E4A00' },
  };
  const c = tones[tone];
  return <span style={{ background: c.bg, color: c.fg, padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>{children}</span>;
};

const AdminTopbar = ({ tab, demoMode, setDemoMode, onLogout, admin, liveError }) => {
  const titles = {
    overview: ['Overview', 'Live snapshot of ZARii AI · last refreshed just now'],
    users: ['Users', 'All farmers across web app and WhatsApp'],
    diagnoses: ['Diagnoses & quality', 'Every scan, with confidence and feedback'],
    outbreaks: ['Outbreak intelligence', 'Regional disease pressure across Pakistan'],
    whatsapp: ['WhatsApp operations', 'Live conversations, templates, takeover'],
    sponsors: ['Sponsors & Ads', 'Sponsor companies, boosted products, performance'],
    revenue: ['Revenue', 'MRR, partner attribution, conversion'],
    catalog: ['Catalog', 'Pesticide & fertilizer database'],
    api: ['API integrations', 'Vision, Voice, and Weather provider rotation'],
    team: ['Team & audit', 'Roles, permissions, and admin action log'],
  };
  const [t, sub] = titles[tab] || [];
  return (
    <div style={{
      padding: '20px 32px', background: '#fff',
      borderBottom: '1px solid #E6E0D1',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1F4A2C', letterSpacing: '-0.02em' }}>{t}</h1>
        <div style={{ fontSize: 12.5, color: '#7E7E7E', marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', background: '#F4F2EA', padding: 3, borderRadius: 8, marginRight: 8 }}>
          <button onClick={() => setDemoMode(true)} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, fontWeight: 600, border: 'none', background: demoMode ? '#fff' : 'transparent', color: demoMode ? '#1F4A2C' : '#7E7E7E', boxShadow: demoMode ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>Demo</button>
          <button onClick={() => setDemoMode(false)} style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, fontWeight: 600, border: 'none', background: !demoMode ? '#2E6B3F' : 'transparent', color: !demoMode ? '#fff' : '#7E7E7E', boxShadow: !demoMode ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>Live</button>
        </div>

        <span className="tag tag-green" style={{ fontSize: 11 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#66A64F', display: 'inline-block' }}/> All systems operational
        </span>
        <button className="btn btn-secondary btn-sm"><Icon name="bell" size={14}/> Alerts <span style={{ background:'#F4A62A', color:'#fff', fontSize:10, padding:'1px 6px', borderRadius:99, marginLeft:4 }}>3</span></button>
        <button onClick={onLogout} style={{ width: 36, height: 36, borderRadius: '50%', background: '#2E6B3F', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, cursor: 'pointer', flexShrink: 0 }} title={`Logout (${admin?.email || 'Admin'})`}>
          {admin?.name ? admin.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : 'AD'}
        </button>
      </div>
    </div>
  );
};

// ============================================================
// ADMIN SHELL
// ============================================================
const AdminConsole = ({ navigate, onLogout, admin }) => {
  const [tab, setTab] = useS_Adm('overview');
  const [cmdOpen, setCmdOpen] = useS_Adm(false);
  const [demoMode, setDemoMode] = useS_Adm(true);
  const [realData, setRealData] = useS_Adm({ stats: null, users: [], scans: [] });
  const [liveError, setLiveError] = useS_Adm(null);

  useE_Adm(() => {
    if (!demoMode) fetchRealData();
  }, [demoMode]);

  const fetchRealData = async () => {
    setLiveError(null);
    try {
      // Use the window.API bridge — it handles zarii_admin_token automatically
      const [users, scansData] = await Promise.all([
        window.API.adminUsers(),
        window.API.adminDiagnoses()
      ]);
      setRealData({
        users: users.users || users || [],
        scans: scansData.diagnoses || scansData || []
      });
    } catch (err) {
      console.error('[Admin] Live fetch failed:', err);
      setLiveError(err.message || 'Failed to load live data');
      setDemoMode(true); // Fallback to demo
    }
  };

  useE_Adm(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setCmdOpen(true);
      }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const tabs = [
    { id: 'overview',   label: 'Overview',     icon: 'home', group: 'Operate' },
    { id: 'users',      label: 'Users',        icon: 'users', group: 'Operate' },
    { id: 'diagnoses',  label: 'Diagnoses',    icon: 'flask', group: 'Operate' },
    { id: 'outbreaks',  label: 'Outbreak intel', icon: 'pin', group: 'Operate' },
    { id: 'whatsapp',   label: 'WhatsApp ops', icon: 'whatsapp', group: 'Operate' },
    { id: 'sponsors',   label: 'Sponsors & Ads', icon: 'pkr', group: 'Monetize' },
    { id: 'revenue',    label: 'Revenue',      icon: 'trend', group: 'Monetize' },
    { id: 'catalog',    label: 'Catalog',      icon: 'leaf', group: 'Content' },
    { id: 'api',        label: 'API Integrations', icon: 'sparkles', group: 'System' },
    { id: 'team',       label: 'Team & Audit', icon: 'shield', group: 'System' },
  ];

  const groups = [...new Set(tabs.map(t => t.group))];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F4F2EA' }}>
      {/* Dark sidebar */}
      <aside style={{
        width: 248, flexShrink: 0,
        background: '#0F2A1A', color: 'rgba(255,255,255,0.78)',
        padding: '20px 14px', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '4px 8px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="assets/farmer-badge.png" width={36} height={36} style={{ borderRadius: '50%' }} />
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>ZARii Console</div>
              <div style={{ fontSize: 11, color: '#9DCB7C' }}>Owner · Operator view</div>
            </div>
          </div>
        </div>

        <button onClick={() => setCmdOpen(true)} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
          background: 'rgba(255,255,255,0.06)', borderRadius: 10,
          color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 14,
        }}>
          <Icon name="search" size={14} /> Quick jump
          <span style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 6px', background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>⌘K</span>
        </button>

        {groups.map(g => (
          <div key={g} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', padding: '0 12px 6px' }}>{g}</div>
            {tabs.filter(t => t.group === g).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11, width: '100%',
                  padding: '9px 12px', borderRadius: 8,
                  background: tab === t.id ? 'rgba(102,166,79,0.18)' : 'transparent',
                  color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.7)',
                  fontWeight: tab === t.id ? 600 : 500, fontSize: 13.5,
                  textAlign: 'left', position: 'relative',
                }}>
                {tab === t.id && <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, background: '#9DCB7C', borderRadius: 2 }}/>}
                <Icon name={t.icon} size={16} color={tab === t.id ? '#9DCB7C' : 'rgba(255,255,255,0.55)'} />
                {t.label}
              </button>
            ))}
          </div>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => navigate('dashboard')} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '9px 12px', borderRadius: 8,
            color: 'rgba(255,255,255,0.6)', fontSize: 13,
          }}>
            <Icon name="arrow-left" size={14} /> Back to farmer app
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <AdminTopbar tab={tab} demoMode={demoMode} setDemoMode={setDemoMode} onLogout={onLogout} admin={admin} liveError={liveError} />
        <div style={{ padding: '20px 32px 60px' }}>
          {tab === 'overview'  && <Overview data={demoMode ? null : realData} />}
          {tab === 'users'     && <UsersTable data={demoMode ? null : realData.users} />}
          {tab === 'diagnoses' && <DiagnosesTab data={demoMode ? null : realData.scans} />}
          {tab === 'outbreaks' && <OutbreaksTab />}
          {tab === 'whatsapp'  && <WhatsAppOps />}
          {tab === 'sponsors'  && <SponsorsTab />}
          {tab === 'revenue'   && <RevenueTab />}
          {tab === 'catalog'   && <CatalogTab />}
          {tab === 'api'       && <ApiKeysTab />}
          {tab === 'team'      && <TeamTab />}
        </div>
      </main>

      {cmdOpen && <CmdPalette tabs={tabs} onPick={(id) => { setTab(id); setCmdOpen(false); }} onClose={() => setCmdOpen(false)} />}
    </div>
  );
};

// ============================================================
// ADMIN LOGIN
// ============================================================
// AdminLogin moved up

// Card, Stat, Pill moved to top

// ============================================================
// OVERVIEW
// ============================================================
const Overview = ({ data }) => {
  const isLive = !!data;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 16 }}>
        <Stat label="Daily active users" value={isLive ? data.users.length : "14,328"} delta="+8.2%" icon="users" color="#2E6B3F" sub="vs. yesterday"/>
        <Stat label="Scans today" value={isLive ? data.scans.length : "3,210"} delta="+12%" icon="camera" color="#66A64F" sub="9.4× peak this hour"/>
        <Stat label="Diagnoses · 7d" value={isLive ? data.scans.length : "42,180"} delta="+18%" icon="flask" color="#F4A62A"/>
        <Stat label="Avg. confidence" value="92.4%" delta="+1.1pp" icon="shield" color="#9DCB7C"/>
        <Stat label="Burn · 24h" value="$184" delta="-6%" deltaType="down" icon="pkr" color="#1F4A6B" sub="API costs"/>
      </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 16 }}>
      <Card style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F4A2C' }}>Activity · last 7 days</h3>
          <div style={{ display: 'flex', gap: 4, padding: 3, background: '#F1F7E9', borderRadius: 99 }}>
            {['Scans','Voice','WhatsApp'].map((s, i) => (
              <span key={i} style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: i===0 ? '#fff' : 'transparent', color: i===0 ? '#1F4A2C' : '#7E7E7E', boxShadow: i===0 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}>{s}</span>
            ))}
          </div>
        </div>
        <svg viewBox="0 0 600 200" style={{ width: '100%', height: 200 }}>
          <defs>
            <linearGradient id="ovGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#66A64F" stopOpacity="0.32"/>
              <stop offset="100%" stopColor="#66A64F" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {[0,40,80,120,160].map(y => <line key={y} x1="40" x2="590" y1={y+10} y2={y+10} stroke="#F1ECDD" strokeWidth="1"/>)}
          <path d="M40 130 L120 110 L200 80 L280 90 L360 60 L440 50 L520 35 L590 45 L590 180 L40 180 Z" fill="url(#ovGrad)"/>
          <path d="M40 130 L120 110 L200 80 L280 90 L360 60 L440 50 L520 35 L590 45" stroke="#66A64F" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => <text key={i} x={40+i*92} y={196} fontSize="10" fill="#7E7E7E">{d}</text>)}
        </svg>
      </Card>

      <Card style={{ padding: 22 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#1F4A2C' }}>System health</h3>
        {[
          { name: 'Vision AI (Gemini)', status: 'healthy', lat: '1.4s p95', err: 0.2 },
          { name: 'Voice STT (Whisper)', status: 'healthy', lat: '0.8s p95', err: 0.1 },
          { name: 'Voice TTS (ElevenLabs)', status: 'degraded', lat: '2.6s p95', err: 4.1 },
          { name: 'Weather (OpenWeather)', status: 'healthy', lat: '180ms p95', err: 0.0 },
          { name: 'WhatsApp webhook', status: 'healthy', lat: '210ms', err: 0.0 },
          { name: 'Supabase (DB)', status: 'healthy', lat: '40ms', err: 0.0 },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? '1px solid #F1ECDD' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: s.status==='healthy' ? '#66A64F' : s.status==='degraded' ? '#F4A62A' : '#D04E2C', boxShadow: '0 0 0 3px ' + (s.status==='healthy' ? 'rgba(102,166,79,0.18)' : 'rgba(244,166,42,0.18)') }}/>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1F4A2C' }}>{s.name}</span>
            </div>
            <div style={{ fontSize: 12, color: '#7E7E7E' }}>{s.lat} · {s.err}% err</div>
          </div>
        ))}
      </Card>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
      <Card style={{ padding: 22 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#1F4A2C' }}>Auto-flagged anomalies</h3>
        {[
          { sev: 'high', text: 'Whitefly query spike: Bahawalpur +312% in 4h', when: '23m ago' },
          { sev: 'med',  text: 'TTS latency p95 above 2s SLO for 18m', when: '1h ago' },
          { sev: 'low',  text: 'New disease class detected: 14 unmatched scans tagged "leaf curl"', when: '3h ago' },
          { sev: 'med',  text: 'Sponsor budget at 84% for Bayer · Antracol — review pacing', when: '5h ago' },
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderTop: i > 0 ? '1px solid #F1ECDD' : 'none' }}>
            <span style={{ marginTop: 4, width: 8, height: 8, borderRadius: 99, background: a.sev==='high'?'#D04E2C':a.sev==='med'?'#F4A62A':'#9DCB7C', flexShrink: 0 }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, color: '#1F4A2C', fontWeight: 500 }}>{a.text}</div>
              <div style={{ fontSize: 11.5, color: '#7E7E7E', marginTop: 2 }}>{a.when}</div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>Investigate →</button>
          </div>
        ))}
      </Card>

      <Card style={{ padding: 22 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#1F4A2C' }}>Live activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { who: 'Aslam, Multan', what: 'scanned cotton · whitefly detected', when: '2s' },
            { who: 'Fatima, Faisalabad', what: 'voice query in Urdu · "wheat yellowing"', when: '8s' },
            { who: 'Tariq, Bahawalpur', what: 'WhatsApp · sent leaf photo', when: '14s' },
            { who: 'Sara, Lahore', what: 'tapped sponsored: Antracol 70 WP', when: '22s' },
            { who: 'Rashid, Hyderabad', what: 'saved diagnosis to history', when: '38s' },
            { who: 'Imran, Sahiwal', what: 'completed onboarding', when: '52s' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <div style={{ width: 6, height: 6, borderRadius: 99, background: '#9DCB7C', flexShrink: 0 }}/>
              <span style={{ fontWeight: 600, color: '#1F4A2C' }}>{a.who}</span>
              <span style={{ color: '#5A5A5A' }}>{a.what}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#A0A0A0' }}>{a.when} ago</span>
            </div>
          ))}
        </div>
      </Card>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
      <Stat label="Sponsor revenue · MTD" value="₨ 2.1M" delta="+24%" icon="pkr" color="#F4A62A"/>
      <Stat label="Active sponsors" value="7" delta="+2" icon="shield" color="#2E6B3F"/>
      <Stat label="Sponsored impressions · 7d" value="184k" delta="+15%" icon="trend" color="#9DCB7C"/>
    </div>
  </div>
);

// ============================================================
// USERS
// ============================================================
const UsersTable = ({ data }) => {
  const demoUsers = [
    { name: 'Muhammad Aslam', phone: '+92 300 1234567', region: 'Multan, Punjab', crops: 'Cotton, Wheat', scans: 38, lastSeen: '2h ago', channel: 'Web + WA', lang: 'ur', cohort: 'Mar 2026', risk: 'low' },
    { name: 'Fatima Bibi', phone: '+92 321 2345678', region: 'Faisalabad', crops: 'Tomato, Chili', scans: 24, lastSeen: '4h ago', channel: 'Web', lang: 'ur', cohort: 'Feb 2026', risk: 'low' },
    { name: 'Tariq Mehmood', phone: '+92 333 3456789', region: 'Bahawalpur', crops: 'Wheat, Sugarcane', scans: 19, lastSeen: '1d ago', channel: 'WA', lang: 'ur', cohort: 'Jan 2026', risk: 'low' },
    { name: 'Sara Khan', phone: '+92 345 4567890', region: 'Lahore', crops: 'Mango, Citrus', scans: 12, lastSeen: '5h ago', channel: 'Web', lang: 'en', cohort: 'Apr 2026', risk: 'low' },
    { name: 'Rashid Ahmad', phone: '+92 312 5678901', region: 'Hyderabad, Sindh', crops: 'Rice', scans: 31, lastSeen: '15m ago', channel: 'Web + WA', lang: 'ur', cohort: 'Dec 2025', risk: 'med' },
    { name: 'Imran Ali', phone: '+92 301 6789012', region: 'Sahiwal', crops: 'Cotton', scans: 8, lastSeen: '3d ago', channel: 'WA', lang: 'ur', cohort: 'Apr 2026', risk: 'med' },
    { name: 'Ayesha Malik', phone: '+92 322 7890123', region: 'Sialkot', crops: 'Rice, Wheat', scans: 22, lastSeen: '6h ago', channel: 'Web', lang: 'en', cohort: 'Mar 2026', risk: 'low' },
    { name: 'Bilal Hussain', phone: '+92 334 8901234', region: 'Sukkur, Sindh', crops: 'Sugarcane, Banana', scans: 16, lastSeen: '12h ago', channel: 'Web + WA', lang: 'ur', cohort: 'Feb 2026', risk: 'high' },
  ];

  const displayUsers = data ? data.map(u => ({
    name: u.full_name || 'Farmer',
    phone: u.phone,
    region: u.location || 'Unknown',
    crops: 'Common crops',
    scans: 0,
    lastSeen: new Date(u.last_active).toLocaleDateString(),
    channel: 'Web',
    lang: u.language || 'ur',
    cohort: new Date(u.created_at).toLocaleDateString(),
    risk: 'low'
  })) : demoUsers;

  const [q, setQ] = useS_Adm('');
  const [region, setRegion] = useS_Adm('all');
  const filtered = displayUsers.filter(u => (q === '' || u.name.toLowerCase().includes(q.toLowerCase()) || u.phone.includes(q)) && (region === 'all' || u.region.includes(region)));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <Stat label="Total users" value="184,210" delta="+1,420 this week" icon="users" color="#2E6B3F"/>
        <Stat label="WAU" value="68,440" delta="+5.4%" icon="trend" color="#66A64F"/>
        <Stat label="Retention · D30" value="42%" delta="+3pp" icon="bookmark" color="#F4A62A"/>
        <Stat label="Avg scans / user" value="6.8" delta="+0.6" icon="camera" color="#9DCB7C"/>
      </div>

      <Card>
        <div style={{ padding: 16, display: 'flex', gap: 10, borderBottom: '1px solid #F1ECDD', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <Icon name="search" size={14} style={{ position: 'absolute', left: 12, top: 11, color: '#7E7E7E' }}/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name or phone…" style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: 8, border: '1px solid #E6E0D1', fontSize: 13, background: '#FBFAF4' }}/>
          </div>
          <select value={region} onChange={e=>setRegion(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E6E0D1', fontSize: 13, background: '#FBFAF4' }}>
            <option value="all">All regions</option>
            <option value="Punjab">Punjab</option>
            <option value="Sindh">Sindh</option>
            <option value="Lahore">Lahore</option>
            <option value="Multan">Multan</option>
          </select>
          <button className="btn btn-secondary btn-sm"><Icon name="upload" size={13}/> Export CSV</button>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#7E7E7E' }}>{filtered.length} of {displayUsers.length}</div>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ background: '#FAF7EC', borderBottom: '1px solid #E6E0D1' }}>
              <tr>
                {['Name','Region','Crops','Scans','Last seen','Channel','Lang','Cohort','Churn risk',''].map((h,i) => (
                  <th key={i} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#7E7E7E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F4F1E5' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: ['#9DCB7C','#F4A62A','#66A64F','#2E6B3F'][i%4], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{u.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1F4A2C' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: '#7E7E7E' }}>{u.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#5A5A5A' }}>{u.region}</td>
                  <td style={{ padding: '12px 14px', color: '#5A5A5A' }}>{u.crops}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{u.scans}</td>
                  <td style={{ padding: '12px 14px', color: '#5A5A5A' }}>{u.lastSeen}</td>
                  <td style={{ padding: '12px 14px' }}><Pill tone={u.channel.includes('+') ? 'green' : u.channel === 'WA' ? 'blue' : 'gray'}>{u.channel}</Pill></td>
                  <td style={{ padding: '12px 14px' }}><Pill tone="gray">{u.lang.toUpperCase()}</Pill></td>
                  <td style={{ padding: '12px 14px', color: '#5A5A5A' }}>{u.cohort}</td>
                  <td style={{ padding: '12px 14px' }}><Pill tone={u.risk==='low'?'green':u.risk==='med'?'amber':'red'}>{u.risk}</Pill></td>
                  <td style={{ padding: '12px 14px' }}><button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>View →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ============================================================
// DIAGNOSES
// ============================================================
const DiagnosesTab = ({ data }) => {
  const demoScans = [
    { id: 'D-39281', user: 'Aslam M.', crop: 'Cotton', dx: 'Whitefly', conf: 89, fb: '👍', when: '2m ago', sev: 'high' },
    { id: 'D-39280', user: 'Fatima B.', crop: 'Tomato', dx: 'Early Blight', conf: 94, fb: '👍', when: '4m ago', sev: 'med' },
    { id: 'D-39279', user: 'Tariq M.', crop: 'Wheat', dx: 'Yellow Rust', conf: 78, fb: '?', when: '6m ago', sev: 'med', flag: true },
    { id: 'D-39278', user: 'Sara K.', crop: 'Mango', dx: 'Anthracnose', conf: 86, fb: '👍', when: '9m ago', sev: 'low' },
    { id: 'D-39277', user: 'Rashid A.', crop: 'Rice', dx: 'Bacterial Leaf Blight', conf: 88, fb: '👎', when: '12m ago', sev: 'med', flag: true },
    { id: 'D-39276', user: 'Imran A.', crop: 'Cotton', dx: 'Bollworm', conf: 92, fb: '👍', when: '15m ago', sev: 'high' },
    { id: 'D-39275', user: 'Ayesha M.', crop: 'Wheat', dx: 'Healthy', conf: 97, fb: '👍', when: '18m ago', sev: 'none' },
    { id: 'D-39274', user: 'Bilal H.', crop: 'Sugarcane', dx: 'Red Rot', conf: 67, fb: '👎', when: '22m ago', sev: 'med', flag: true },
  ];

  const displayScans = data ? data.map(s => ({
    id: s.id.slice(0, 8),
    user: s.phone || 'User',
    crop: s.crop_type || 'Unknown',
    dx: s.disease_name || 'AI Analyzing',
    conf: Math.round(s.confidence_score * 100) || 0,
    fb: s.user_feedback === 'positive' ? '👍' : s.user_feedback === 'negative' ? '👎' : '?',
    when: new Date(s.created_at).toLocaleTimeString(),
    sev: s.severity || 'low',
    flag: s.confidence_score < 0.6
  })) : demoScans;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <Stat label="Diagnoses · today" value="3,210" delta="+12%" icon="flask" color="#2E6B3F"/>
        <Stat label="Avg confidence" value="92.4%" delta="+1.1pp" icon="shield" color="#66A64F"/>
        <Stat label="Low-confidence queue" value="42" delta="-8" deltaType="down" icon="bell" color="#F4A62A" sub="awaiting agronomist"/>
        <Stat label="User feedback +ve" value="91%" delta="+0.6pp" icon="star" color="#9DCB7C"/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 16 }}>
        <Card style={{ padding: 22 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#1F4A2C' }}>Detection accuracy · 30d</h3>
          <svg viewBox="0 0 600 200" style={{ width: '100%', height: 200 }}>
            {[0,40,80,120,160].map(y => <line key={y} x1="40" x2="590" y1={y+10} y2={y+10} stroke="#F1ECDD" strokeWidth="1"/>)}
            <path d="M40 80 L100 75 L160 70 L220 65 L280 62 L340 55 L400 50 L460 48 L520 42 L590 38" stroke="#66A64F" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M40 110 L100 105 L160 100 L220 92 L280 88 L340 80 L400 78 L460 72 L520 70 L590 68" stroke="#F4A62A" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="4 3"/>
          </svg>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#7E7E7E', marginTop: 4 }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#66A64F', borderRadius: 99, marginRight: 6 }}/>Confidence avg</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#F4A62A', borderRadius: 99, marginRight: 6 }}/>User-validated accuracy</span>
          </div>
        </Card>
        <Card style={{ padding: 22 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#1F4A2C' }}>Confusion-prone pairs</h3>
          {[
            { a: 'Early Blight', b: 'Late Blight', count: 34 },
            { a: 'Yellow Rust', b: 'Brown Rust', count: 28 },
            { a: 'Whitefly', b: 'Aphid', count: 19 },
            { a: 'Anthracnose', b: 'Powdery Mildew', count: 12 },
          ].map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: i>0 ? '1px solid #F1ECDD' : 'none' }}>
              <div style={{ fontSize: 13, color: '#1F4A2C' }}>{p.a} <span style={{ color: '#7E7E7E' }}>↔</span> {p.b}</div>
              <Pill tone="amber">{p.count} confusions</Pill>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <div style={{ padding: 16, display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid #F1ECDD' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F4A2C' }}>Recent diagnoses</h3>
          <div style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
            {['All','Flagged','Low confidence','Negative feedback'].map((t, i) => (
              <button key={i} style={{ padding: '5px 10px', fontSize: 12, fontWeight: 600, borderRadius: 99, background: i===0 ? '#1F4A2C' : 'transparent', color: i===0 ? '#fff' : '#5A5A5A' }}>{t}</button>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>Send to agronomist queue</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#FAF7EC' }}>
            <tr>
              {['','ID','Image','User','Crop','Diagnosis','Confidence','Severity','Feedback','When',''].map((h,i) => (
                <th key={i} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#7E7E7E', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayScans.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F4F1E5', background: s.flag ? '#FFFCF1' : 'transparent' }}>
                <td style={{ padding: '12px 14px' }}><input type="checkbox"/></td>
                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5A5A5A' }}>{s.id}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: 'linear-gradient(135deg, #4a7c3a, #2E6B3F)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 200 200"><path d="M30 170 Q40 50 170 30 Q160 130 60 165 Q40 175 30 170Z" fill="#9DCB7C"/></svg>
                  </div>
                </td>
                <td style={{ padding: '12px 14px', fontWeight: 500, color: '#1F4A2C' }}>{s.user}</td>
                <td style={{ padding: '12px 14px', color: '#5A5A5A' }}>{s.crop}</td>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1F4A2C' }}>{s.dx}{s.flag && <span style={{ marginLeft: 8 }}><Pill tone="amber">⚑ flagged</Pill></span>}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 50, height: 5, background: '#F1ECDD', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${s.conf}%`, height: '100%', background: s.conf > 85 ? '#66A64F' : s.conf > 70 ? '#F4A62A' : '#D04E2C' }}/>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{s.conf}%</span>
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}><Pill tone={s.sev==='high'?'red':s.sev==='med'?'amber':s.sev==='low'?'gray':'green'}>{s.sev}</Pill></td>
                <td style={{ padding: '12px 14px', fontSize: 16 }}>{s.fb}</td>
                <td style={{ padding: '12px 14px', color: '#7E7E7E', fontSize: 12 }}>{s.when}</td>
                <td style={{ padding: '12px 14px' }}><button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>Review →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ============================================================
// OUTBREAK INTEL
// ============================================================
const OutbreaksTab = () => {
  const [day, setDay] = useS_Adm(60);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <Stat label="Active outbreaks" value="14" delta="+3" icon="bell" color="#D04E2C"/>
        <Stat label="Districts on alert" value="22" delta="+5" icon="pin" color="#F4A62A"/>
        <Stat label="Advisories sent · 7d" value="6" icon="bell" color="#2E6B3F"/>
        <Stat label="Avg reach" value="84k farmers" icon="users" color="#66A64F"/>
      </div>

      <Card style={{ padding: 22, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F4A2C' }}>Pakistan disease pressure map</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select style={{ padding: '6px 10px', fontSize: 12, borderRadius: 8, border: '1px solid #E6E0D1' }}>
              <option>All diseases</option><option>Whitefly</option><option>Yellow Rust</option><option>Anthracnose</option>
            </select>
            <button className="btn btn-primary btn-sm">+ Send advisory</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          <div style={{ background: '#F1F7E9', borderRadius: 14, padding: 16, position: 'relative', minHeight: 380 }}>
            <svg viewBox="0 0 400 360" style={{ width: '100%', height: 360 }}>
              <path d="M 80 60 L 140 40 L 200 55 L 250 75 L 290 100 L 320 130 L 340 175 L 320 220 L 280 250 L 240 270 L 200 280 L 160 270 L 130 240 L 100 200 L 80 160 L 60 120 L 70 80 Z"
                fill="#9DCB7C44" stroke="#66A64F" strokeWidth="1.5"/>
              {[
                { x: 200, y: 110, label: 'Punjab N', cases: 'High', size: 28, c: '#D04E2C' },
                { x: 220, y: 145, label: 'Multan', cases: 'Critical', size: 36, c: '#A11F0E' },
                { x: 175, y: 160, label: 'Sahiwal', cases: 'High', size: 22, c: '#D04E2C' },
                { x: 240, y: 195, label: 'Bahawalpur', cases: 'High', size: 26, c: '#D04E2C' },
                { x: 270, y: 230, label: 'Sukkur', cases: 'Moderate', size: 18, c: '#F4A62A' },
                { x: 290, y: 270, label: 'Hyderabad', cases: 'Moderate', size: 22, c: '#F4A62A' },
                { x: 130, y: 105, label: 'KPK', cases: 'Low', size: 12, c: '#66A64F' },
                { x: 150, y: 200, label: 'Quetta', cases: 'Low', size: 14, c: '#66A64F' },
              ].map((r, i) => (
                <g key={i}>
                  <circle cx={r.x} cy={r.y} r={r.size} fill={r.c} opacity="0.18"/>
                  <circle cx={r.x} cy={r.y} r={r.size * 0.5} fill={r.c} opacity="0.42"/>
                  <circle cx={r.x} cy={r.y} r={5} fill={r.c}/>
                  <text x={r.x} y={r.y - r.size - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1F4A2C">{r.label}</text>
                </g>
              ))}
            </svg>
            <div style={{ display: 'flex', gap: 12, marginTop: 14, fontSize: 11, color: '#7E7E7E' }}>
              {[['Critical','#A11F0E'],['High','#D04E2C'],['Moderate','#F4A62A'],['Low','#66A64F']].map(([l,c],i) => (
                <span key={i}><span style={{ display: 'inline-block', width: 10, height: 10, background: c, borderRadius: 99, marginRight: 4, verticalAlign: 'middle' }}/>{l}</span>
              ))}
            </div>

            {/* Time scrubber */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: '#7E7E7E', fontWeight: 600, marginBottom: 6 }}>Day -{90 - day} of last 90</div>
              <input type="range" min="0" max="90" value={day} onChange={e=>setDay(+e.target.value)} style={{ width: '100%', accentColor: '#2E6B3F' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#A0A0A0', marginTop: 2 }}>
                <span>90d ago</span><span>60d</span><span>30d</span><span>Today</span>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#7E7E7E', textTransform: 'uppercase' }}>Top outbreaks</h4>
            {[
              { region: 'Multan, Punjab', issue: 'Whitefly · Cotton', trend: '+312%', cases: '1,840 farms', sev: 'critical' },
              { region: 'Bahawalpur', issue: 'Whitefly · Cotton', trend: '+210%', cases: '920 farms', sev: 'high' },
              { region: 'Sahiwal', issue: 'Bollworm · Cotton', trend: '+88%', cases: '420 farms', sev: 'high' },
              { region: 'Faisalabad', issue: 'Yellow Rust · Wheat', trend: '+45%', cases: '380 farms', sev: 'med' },
              { region: 'Hyderabad', issue: 'Anthracnose · Mango', trend: '+24%', cases: '180 farms', sev: 'med' },
              { region: 'Sukkur', issue: 'Bacterial Leaf Blight · Rice', trend: '+12%', cases: '95 farms', sev: 'low' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: i > 0 ? '1px solid #F1ECDD' : 'none' }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: t.sev==='critical'?'#A11F0E':t.sev==='high'?'#D04E2C':t.sev==='med'?'#F4A62A':'#66A64F' }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1F4A2C' }}>{t.issue}</div>
                  <div style={{ fontSize: 11, color: '#7E7E7E' }}>{t.region} · {t.cases}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: t.sev==='critical'?'#A11F0E':t.sev==='high'?'#D04E2C':t.sev==='med'?'#F4A62A':'#66A64F' }}>{t.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1F4A2C' }}>Sent advisories</h3>
          <button className="btn btn-secondary btn-sm">+ New advisory</button>
        </div>
        {[
          { title: 'Whitefly preventive spray · Cotton belt', regions: 'Multan, Bahawalpur, Sahiwal', sent: '2d ago', reach: '124,000', engaged: '38%', status: 'Active' },
          { title: 'Yellow Rust early warning · Wheat', regions: 'Faisalabad, Sialkot', sent: '5d ago', reach: '88,000', engaged: '42%', status: 'Active' },
          { title: 'Mango anthracnose seasonal alert', regions: 'Hyderabad, Sukkur', sent: '12d ago', reach: '34,000', engaged: '29%', status: 'Closed' },
        ].map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: i > 0 ? '1px solid #F1ECDD' : 'none' }}>
            <Icon name="bell" size={18} color="#F4A62A"/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1F4A2C' }}>{a.title}</div>
              <div style={{ fontSize: 12, color: '#7E7E7E' }}>{a.regions} · sent {a.sent}</div>
            </div>
            <div style={{ fontSize: 12, color: '#5A5A5A', textAlign: 'right' }}>
              <div>{a.reach} reached</div>
              <div style={{ color: '#66A64F', fontWeight: 600 }}>{a.engaged} engaged</div>
            </div>
            <Pill tone={a.status === 'Active' ? 'green' : 'gray'}>{a.status}</Pill>
          </div>
        ))}
      </Card>
    </div>
  );
};

window.AdminConsole = AdminConsole;
window.AdminLogin = AdminLogin;
window.AdminCard = Card;
window.AdminPill = Pill;
window.AdminStat = Stat;

// ============================================================
// COMMAND PALETTE
// ============================================================
// CmdPalette moved up
