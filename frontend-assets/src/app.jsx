/* global React, ReactDOM */
/* global Landing, Onboarding, AppShell, Dashboard, Analyze, Voice, History, Analytics, WhatsAppView, AdminConsole, AdminLogin, WhatsAppComingSoon */

const { useState: useS_App, useEffect: useE_App } = React;

const App = () => {
  const [screen, setScreen]           = useS_App('landing');
  const [lang, setLang]               = useS_App('en');
  const [user, setUser]               = useS_App(null);

  // Admin auth: null = unknown (verifying), false = not auth'd, object = admin info
  const [adminAuth, setAdminAuth]     = useS_App(null); // null = verifying, false = not auth, object = admin
  const [adminVerifying, setAdminVerifying] = useS_App(true);


  // ─── Verify admin token server-side on every load ───────────
  useE_App(() => {
    const token = localStorage.getItem('zarii_admin_token');
    if (!token) {
      setAdminAuth(false);
      setAdminVerifying(false);
      return;
    }
    setAdminVerifying(true);
    window.API.adminMe()
      .then(data => setAdminAuth(data.admin))
      .catch(() => {
        // Token invalid/expired — clear it
        localStorage.removeItem('zarii_admin_token');
        setAdminAuth(false);
      })
      .finally(() => setAdminVerifying(false));
  }, []);

  // ─── Farmer token restore ────────────────────────────────────
  useE_App(() => {
    const token = localStorage.getItem('zarii_token');
    if (token) {
      window.API.getMe()
        .then(me => { setUser(me); setLang(me.lang || 'en'); })
        .catch(() => localStorage.removeItem('zarii_token'));
    }

    const validScreens = ['landing', 'onboarding', 'dashboard', 'analyze', 'voice', 'history', 'analytics', 'whatsapp', 'whatsapp-coming-soon', 'admin'];
    const fromHash = window.location.hash.replace('#', '');
    if (fromHash && validScreens.includes(fromHash.split('-')[0])) {
      setScreen(fromHash);
    }

    const onHash = () => {
      const h = window.location.hash.replace('#', '') || 'landing';
      // Basic 404 check: if hash is not empty and not a valid screen prefix
      if (h !== 'landing' && !validScreens.includes(h.split('-')[0])) {
        setScreen('404');
      } else {
        setScreen(h);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);


  const navigate = (s) => {
    setScreen(s);
    window.location.hash = s;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleLogin = (userData, token) => {
    if (window.API) window.API.saveToken(token);
    setUser(userData);
    setLang(userData.lang || 'en');
    navigate('dashboard');
  };

  const handleLogout = () => {
    if (window.API) window.API.clearToken();
    setUser(null);
    navigate('landing');
  };

  const handleAdminLogin = (adminData, token) => {
    localStorage.setItem('zarii_admin_token', token);
    setAdminAuth(adminData);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('zarii_admin_token');
    setAdminAuth(false);
  };

  const effectiveUser = user || { name: 'Muhammad Aslam', phone: '', lang: lang };
  const inApp = ['dashboard','analyze','voice','history','analytics','whatsapp', 'whatsapp-coming-soon'].includes(screen);

  let content;

  if (screen === 'landing') {
    content = <Landing lang={lang} setLang={setLang} navigate={navigate} />;

  } else if (screen === 'onboarding') {
    content = <Onboarding lang={lang} setLang={setLang} navigate={navigate} setUser={handleLogin} />;

  } else if (screen === 'admin') {
    if (adminVerifying || !window.AdminLogin) {
      // Show loading screen if verifying or script not yet ready
      content = (
        <div style={{
          minHeight: '100vh', background: '#0F2A1A',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#9DCB7C', fontSize: 16, gap: 16
        }}>
          <Logo size={48} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="spinner-sm" style={{ width: 18, height: 18, border: '2px solid rgba(157,203,124,0.2)', borderTopColor: '#9DCB7C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Verifying secure access…
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    } else if (!adminAuth) {
      content = React.createElement(window.AdminLogin, { onAuth: handleAdminLogin, navigate });
    } else {
      content = React.createElement(window.AdminConsole, { navigate, admin: adminAuth, onLogout: handleAdminLogout });
    }

  } else if (screen === '404') {
    content = (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', textAlign: 'center', padding: 20 }}>
        <Icon name="alert-circle" size={80} color="#D04E2C" />
        <h1 style={{ fontSize: 48, fontWeight: 800, color: '#1F4A2C', margin: '20px 0 10px' }}>404</h1>
        <p style={{ fontSize: 18, color: '#5A5A5A', marginBottom: 30 }}>Oops! This page doesn't exist or you don't have access.</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('landing')}>Take Me Home</button>
      </div>
    );

  } else if (inApp) {
    let inner;
    if (screen === 'dashboard') inner = <Dashboard user={effectiveUser} lang={lang} navigate={navigate} />;
    else if (screen === 'analyze') inner = <Analyze lang={lang} navigate={navigate} user={effectiveUser} />;
    else if (screen === 'voice')   inner = <Voice lang={lang} navigate={navigate} user={effectiveUser} />;
    else if (screen === 'history') inner = <History lang={lang} navigate={navigate} user={effectiveUser} />;
    else if (screen === 'analytics') inner = <Analytics lang={lang} navigate={navigate} user={effectiveUser} />;
    else if (screen === 'whatsapp') inner = <WhatsAppView lang={lang} navigate={navigate} user={effectiveUser} />;
    else if (screen === 'whatsapp-coming-soon') inner = <WhatsAppComingSoon lang={lang} navigate={navigate} />;
    else {
      // Fallback if inApp but screen unknown
      setScreen('404');
      return null;
    }
    content = (
      <AppShell user={effectiveUser} lang={lang} setLang={setLang} navigate={navigate} current={screen} onLogout={handleLogout}>
        {inner}
      </AppShell>
    );
  } else {
    content = <Landing lang={lang} setLang={setLang} navigate={navigate} />;
  }

  return (
    <div data-screen-label={`ZARii · ${screen}`}>
      {content}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
