// ZARii AI — Frontend API bridge
// Loaded by the HTML before app.jsx so all components can call window.API.*

(function () {
  // In production (deployed), API is served from the same origin.
  // In local dev with split servers, override via ZARII_API_BASE meta tag or falls back to same origin.
  const metaBase = document.querySelector('meta[name="zarii-api-base"]');
  const BASE = metaBase ? metaBase.content : '';

  function getToken() { return localStorage.getItem('zarii_token'); }
  function getAdminToken() { return localStorage.getItem('zarii_admin_token'); }

  async function request(path, options = {}, useAdmin = false) {
    const token = useAdmin ? getAdminToken() : getToken();
    const res = await fetch(BASE + path, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(!options.body || options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || 'API error'), { status: res.status, data });
    return data;
  }

  function get(path, params, admin) {
    const qs = params ? '?' + new URLSearchParams(params) : '';
    return request(path + qs, { method: 'GET' }, admin);
  }
  function post(path, body, admin, asForm) {
    if (asForm) return request(path, { method: 'POST', body }, admin);
    return request(path, { method: 'POST', body: JSON.stringify(body) }, admin);
  }
  function patch(path, body, admin) {
    return request(path, { method: 'PATCH', body: JSON.stringify(body) }, admin);
  }
  function del(path, admin) {
    return request(path, { method: 'DELETE' }, admin);
  }

  window.API = {
    BASE,

    // ── Auth ──────────────────────────────────────────────────
    sendOTP: (phone) => post('/api/auth/send-otp', { phone }),
    verifyOTP: (phone, code, name, lang, region, crops) =>
      post('/api/auth/verify-otp', { phone, code, name, lang, region, crops }),
    refreshToken: (token) => post('/api/auth/refresh', { token }),

    // ── User ──────────────────────────────────────────────────
    getMe: () => get('/api/users/me'),
    updateMe: (data) => patch('/api/users/me', data),
    getHealthScore: () => get('/api/users/me/health-score'),

    // ── Diagnose ──────────────────────────────────────────────
    diagnose: (formData) => post('/api/diagnose', formData, false, true),
    submitFeedback: (scanId, feedback) => post('/api/diagnose/' + scanId + '/feedback', { feedback }),

    // ── History ───────────────────────────────────────────────
    getHistory: (params) => get('/api/history', params),
    getRecentScans: (limit) => get('/api/history/recent', { limit: limit || 4 }),
    getAnalytics: () => get('/api/history/analytics'),

    // ── Voice ─────────────────────────────────────────────────
    transcribeAudio: (formData) => post('/api/voice/stt', formData, false, true),
    askQuestion: (text, lang) => post('/api/voice/ask', { text, lang }),
    textToSpeech: (text, lang, queryId) => post('/api/voice/tts', { text, lang, query_id: queryId }),

    // ── Dashboard ─────────────────────────────────────────────
    getWeather: (lat, lon, city) => get('/api/weather', { lat, lon, city }),
    getAlerts: (region) => get('/api/alerts', { region }),
    getPlatformStats: () => get('/api/platform-stats'),

    // ── Health ────────────────────────────────────────────────
    healthCheck: () => get('/api/health'),

    // ── Admin Auth ────────────────────────────────────────────
    adminLogin: (email, password) => post('/api/admin/auth/login', { email, password }),
    adminMe: () => get('/api/admin/auth/me', null, true),

    // ── Admin Overview ────────────────────────────────────────
    adminOverview: () => get('/api/admin/overview', null, true),

    // ── Admin Users ───────────────────────────────────────────
    adminUsers: (params) => get('/api/admin/users', params, true),
    adminUserDetail: (id) => get('/api/admin/users/' + id, null, true),

    // ── Admin Diagnoses ───────────────────────────────────────
    adminDiagnoses: (params) => get('/api/admin/diagnoses', params, true),
    adminFlagDiagnosis: (id) => post('/api/admin/diagnoses/' + id + '/flag', {}, true),
    adminAccuracyChart: () => get('/api/admin/diagnoses/meta/accuracy-chart', null, true),

    // ── Admin Outbreaks ───────────────────────────────────────
    adminOutbreaks: () => get('/api/admin/outbreaks', null, true),
    adminAdvisories: () => get('/api/admin/outbreaks/advisories', null, true),
    adminSendAdvisory: (data) => post('/api/admin/outbreaks/advisories', data, true),

    // ── Admin Sponsors ────────────────────────────────────────
    adminSponsors: () => get('/api/admin/sponsors', null, true),
    adminAddSponsor: (data) => post('/api/admin/sponsors', data, true),
    adminUpdateSponsor: (id, data) => patch('/api/admin/sponsors/' + id, data, true),
    adminSponsoredProducts: () => get('/api/admin/sponsors/products', null, true),
    adminAddSponsoredProduct: (data) => post('/api/admin/sponsors/products', data, true),
    adminUpdateSponsoredProduct: (id, data) => patch('/api/admin/sponsors/products/' + id, data, true),

    // ── Admin Revenue ─────────────────────────────────────────
    adminRevenue: () => get('/api/admin/revenue', null, true),

    // ── Admin Catalog ─────────────────────────────────────────
    adminCatalog: (params) => get('/api/admin/catalog', params, true),
    adminAddProduct: (data) => post('/api/admin/catalog', data, true),
    adminUpdateProduct: (id, data) => patch('/api/admin/catalog/' + id, data, true),
    adminDeleteProduct: (id) => del('/api/admin/catalog/' + id, true),
    adminBulkRefreshPrices: () => post('/api/admin/catalog/bulk-refresh', {}, true),

    // ── Admin API Keys ────────────────────────────────────────
    adminApiKeys: () => get('/api/admin/api-keys', null, true),
    adminAddApiKey: (data) => post('/api/admin/api-keys', data, true),
    adminUpdateApiKey: (id, data) => patch('/api/admin/api-keys/' + id, data, true),
    adminDeleteApiKey: (id) => del('/api/admin/api-keys/' + id, true),
    adminTestApiKey: (id) => post('/api/admin/api-keys/' + id + '/test', {}, true),
    adminFailoverLog: () => get('/api/admin/api-keys/failovers', null, true),

    // ── Admin WhatsApp ────────────────────────────────────────
    adminWaQueue: () => get('/api/admin/whatsapp/queue', null, true),
    adminWaTakeover: (convId) => post('/api/admin/whatsapp/takeover', { conversation_id: convId }, true),
    adminWaSend: (phone, msg, convId) => post('/api/admin/whatsapp/send', { wa_phone: phone, message: msg, conversation_id: convId }, true),

    // ── Admin Team & Audit ────────────────────────────────────
    adminTeam: () => get('/api/admin/team', null, true),
    adminInvite: (data) => post('/api/admin/team/invite', data, true),
    adminChangeRole: (id, role) => patch('/api/admin/team/' + id + '/role', { role }, true),
    adminAuditLog: (params) => get('/api/admin/team/audit-log', params, true),

    // ── Local token helpers ───────────────────────────────────
    saveToken: (token) => localStorage.setItem('zarii_token', token),
    saveAdminToken: (token) => localStorage.setItem('zarii_admin_token', token),
    clearToken: () => { localStorage.removeItem('zarii_token'); localStorage.removeItem('zarii_admin_token'); },
    isLoggedIn: () => !!getToken(),
    isAdminLoggedIn: () => !!getAdminToken(),
  };

  console.log('[ZARii API] Bridge ready → ' + BASE);
})();
