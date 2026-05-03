const { useState: useS_Adm2, useEffect: useE_Adm2, useMemo: useM_Adm2 } = React;
// We'll access window.AdminCard etc inside components to avoid race conditions during script loading


// ============================================================
// SPONSORS & ADS
// ============================================================
const SponsorsTab = ({ demoMode }) => {
  const [liveData, setLiveData] = useS_Adm2(null);
  useE_Adm2(() => {
    if (!demoMode) {
      Promise.all([window.API.adminSponsors(), window.API.adminSponsoredProducts()])
        .then(([s, p]) => setLiveData({ sponsors: s.sponsors || [], products: p.products || [], summary: s.summary || {} }))
        .catch(() => setLiveData(null));
    } else {
      setLiveData(null);
    }
  }, [demoMode]);

  const demoSponsors = [
    { name: 'Bayer Pakistan', logo: '🧪', contract: 'Jan 2026 – Dec 2026', model: 'CPM ₨480', spend: '₨ 820k', status: 'Active', products_count: 4, ctr: '4.8%' },
    { name: 'Syngenta', logo: '🌱', contract: 'Mar 2026 – Mar 2027', model: 'Flat ₨350k/mo', spend: '₨ 1.05M', status: 'Active', products_count: 3, ctr: '6.2%' },
    { name: 'Ali Akbar Group', logo: '🌾', contract: 'Feb 2026 – Aug 2026', model: 'CPC ₨18', spend: '₨ 380k', status: 'Active', products_count: 6, ctr: '5.1%' },
    { name: 'FMC Pakistan', logo: '🧴', contract: 'Apr 2026 – Apr 2027', model: 'CPM ₨420', spend: '₨ 240k', status: 'Active', products_count: 2, ctr: '3.9%' },
    { name: 'Engro Fertilizers', logo: '🌿', contract: 'Pending Q3', model: 'TBD', spend: '—', status: 'Pending', products_count: 0, ctr: '—' },
    { name: 'FFC', logo: '🪴', contract: 'Jan 2025 – Jan 2026', model: 'Flat ₨180k/mo', spend: '₨ 540k', status: 'Ended', products_count: 0, ctr: '4.2%' },
  ];
  const demoProducts = [
    { name: 'Antracol 70 WP', sponsor: 'Bayer Pakistan', boost_weight: 9, regions: 'Punjab, Sindh', crops: 'Cotton, Tomato', daily_cap: 8000, impressions_today: 6420, status: 'Active' },
    { name: 'Confidor 200 SL', sponsor: 'Bayer Pakistan', boost_weight: 8, regions: 'Punjab', crops: 'Cotton', daily_cap: 6000, impressions_today: 4180, status: 'Active' },
    { name: 'Actara 25 WG', sponsor: 'Syngenta', boost_weight: 9, regions: 'All Pakistan', crops: 'Cotton, Veg', daily_cap: 10000, impressions_today: 8240, status: 'Active' },
    { name: 'Karate 2.5 EC', sponsor: 'Syngenta', boost_weight: 7, regions: 'Sindh, Balochistan', crops: 'Cotton', daily_cap: 5000, impressions_today: 2010, status: 'Active' },
    { name: 'Sarbex 5G', sponsor: 'Ali Akbar Group', boost_weight: 6, regions: 'Punjab', crops: 'Sugarcane, Rice', daily_cap: 4000, impressions_today: 3120, status: 'Active' },
    { name: 'Nominee Gold', sponsor: 'Ali Akbar Group', boost_weight: 5, regions: 'Sindh', crops: 'Rice', daily_cap: 3000, impressions_today: 480, status: 'Paused' },
  ];

  const sponsors = liveData ? liveData.sponsors.map(s => ({
    name: s.name, logo: '🏢',
    contract: s.contract_start && s.contract_end ? `${s.contract_start?.slice(0,7)} – ${s.contract_end?.slice(0,7)}` : s.status === 'Pending' ? 'Pending' : '—',
    model: s.pricing_model || '—',
    spend: s.monthly_budget ? `₨ ${(s.monthly_budget/1000).toFixed(0)}k` : '—',
    status: s.status || 'Active',
    products_count: s.products_count || 0,
    ctr: s.ctr || '—',
  })) : demoSponsors;

  const products = liveData ? liveData.products.map(p => ({
    name: p.product_name || p.name || 'Product',
    sponsor: p.sponsor_name || '—',
    boost_weight: p.boost_weight || 0,
    regions: Array.isArray(p.target_regions) ? p.target_regions.join(', ') : '—',
    crops: Array.isArray(p.target_crops) ? p.target_crops.join(', ') : '—',
    daily_cap: p.daily_cap || 0,
    impressions_today: p.impressions_today || 0,
    status: p.status || 'Active',
  })) : demoProducts;

  const summary = liveData?.summary || {};

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <window.AdminStat label="Sponsor revenue · MTD" value={summary.revenue_mtd ? `₨ ${(summary.revenue_mtd/1000000).toFixed(2)}M` : '₨ 2.49M'} delta="+24%" icon="pkr" color="#F4A62A"/>
        <window.AdminStat label="Active sponsors" value={summary.active_sponsors ?? 4} delta="+1" icon="shield" color="#2E6B3F"/>
        <window.AdminStat label="Sponsored impressions · 7d" value={summary.impressions_7d ? summary.impressions_7d.toLocaleString() : '184,210'} delta="+15%" icon="trend" color="#9DCB7C"/>
        <window.AdminStat label="Avg CTR" value="5.2%" delta="+0.4pp" icon="star" color="#66A64F" sub="industry avg 1.8%"/>
      </div>

      {/* Outbreak Intelligence for Sponsors */}
      <window.AdminCard style={{ padding: 22, marginBottom: 16, borderLeft: '4px solid #D04E2C' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F4A2C' }}>Active Outbreaks · Regional Intelligence</h3>
            <div style={{ fontSize: 13, color: '#5A5A5A', marginTop: 4 }}>Live intelligence for hyper-local product placement.</div>
          </div>
          <window.AdminPill tone="red">🚨 3 Critical Spikes</window.AdminPill>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { region: 'Multan', disease: 'Cotton Whitefly', pressure: 'Critical', trend: '+420%', sponsor_match: 'Antracol 70 WP' },
            { region: 'Rahim Yar Khan', disease: 'Wheat Rust', pressure: 'High', trend: '+180%', sponsor_match: 'Ridomil Gold' },
            { region: 'Sargodha', disease: 'Citrus Canker', pressure: 'Moderate', trend: '+45%', sponsor_match: 'Confidor 200' },
          ].map((o, i) => (
            <div key={i} style={{ background: '#FAF7EC', padding: 14, borderRadius: 12, border: '1px solid #F1ECDD' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7E7E7E', textTransform: 'uppercase' }}>{o.region}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: o.pressure==='Critical'?'#D04E2C':'#F4A62A' }}>{o.pressure}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1F4A2C' }}>{o.disease}</div>
              <div style={{ fontSize: 12, color: '#D04E2C', fontWeight: 600, marginTop: 4 }}>{o.trend} trend <Icon name="trend" size={12} color="#D04E2C"/></div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #E6E0D1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, color: '#7E7E7E' }}>Recommended: <br/><b style={{ color: '#1F4A2C' }}>{o.sponsor_match}</b></div>
                <button className="btn btn-ghost btn-sm" style={{ color: '#66A64F', padding: 0 }}>Boost →</button>
              </div>
            </div>
          ))}
        </div>
      </window.AdminCard>

      {/* Compliance settings */}
      <window.AdminCard style={{ padding: 22, marginBottom: 16, background: '#FFFCF1', borderColor: '#F4D88E' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F4A62A22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="shield" size={18} color="#F4A62A"/>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F4A2C' }}>Compliance & disclosure rules</h3>
            <div style={{ fontSize: 13, color: '#5A5A5A', marginTop: 4, marginBottom: 12 }}>Trust-first defaults. Farmers always see why a product is being recommended.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: '#7E7E7E', fontWeight: 600, textTransform: 'uppercase' }}>Max sponsored items per diagnosis</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1F4A2C', marginTop: 4 }}>1 of 3 <span style={{ fontSize: 12, color: '#7E7E7E', fontWeight: 500 }}>alternatives</span></div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#7E7E7E', fontWeight: 600, textTransform: 'uppercase' }}>"Sponsored" tag required</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1F4A2C', marginTop: 4 }}>Yes <span style={{ fontSize: 12, color: '#66A64F', fontWeight: 600 }}>· always shown</span></div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#7E7E7E', fontWeight: 600, textTransform: 'uppercase' }}>Agronomist-vetted only</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1F4A2C', marginTop: 4 }}>Required <span style={{ fontSize: 12, color: '#66A64F', fontWeight: 600 }}>· no exceptions</span></div>
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm">Edit policy</button>
        </div>
      </window.AdminCard>

      {/* Sponsors table */}
      <window.AdminCard style={{ marginBottom: 16 }}>
        <div style={{ padding: 16, display: 'flex', alignItems: 'center', borderBottom: '1px solid #F1ECDD' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F4A2C' }}>Sponsor companies</h3>
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>+ Add sponsor</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#FAF7EC' }}>
            <tr>{['Sponsor','Contract','Model','Spend MTD','CTR','Products','Status',''].map((h,i)=>(
              <th key={i} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#7E7E7E', textTransform: 'uppercase' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>{sponsors.map((s, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #F4F1E5' }}>
              <td style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F7E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{s.logo}</div>
                  <div style={{ fontWeight: 600, color: '#1F4A2C' }}>{s.name}</div>
                </div>
              </td>
              <td style={{ padding: '12px 14px', color: '#5A5A5A', fontSize: 12 }}>{s.contract}</td>
              <td style={{ padding: '12px 14px', color: '#5A5A5A' }}>{s.model}</td>
              <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1F4A2C' }}>{s.spend}</td>
              <td style={{ padding: '12px 14px', color: '#5A5A5A' }}>{s.ctr}</td>
              <td style={{ padding: '12px 14px', color: '#5A5A5A' }}>{s.products_count}</td>
              <td style={{ padding: '12px 14px' }}><window.AdminPill tone={s.status==='Active'?'green':s.status==='Pending'?'amber':'gray'}>{s.status}</window.AdminPill></td>
              <td style={{ padding: '12px 14px' }}><button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>Manage →</button></td>
            </tr>
          ))}</tbody>
        </table>
      </window.AdminCard>

      {/* Sponsored products */}
      <window.AdminCard>
        <div style={{ padding: 16, display: 'flex', alignItems: 'center', borderBottom: '1px solid #F1ECDD' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F4A2C' }}>Sponsored products & boost weights</h3>
          <div style={{ marginLeft: 12, fontSize: 12, color: '#7E7E7E' }}>Boost 1–10. Higher boost = more likely to surface as recommended treatment.</div>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>+ Boost product</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#FAF7EC' }}>
            <tr>{['Product','Sponsor','Boost','Targeting','Daily cap','Used today','Status',''].map((h,i)=>(
              <th key={i} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#7E7E7E', textTransform: 'uppercase' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>{products.map((p, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #F4F1E5' }}>
              <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1F4A2C' }}>{p.name}</td>
              <td style={{ padding: '12px 14px', color: '#5A5A5A' }}>{p.sponsor}</td>
              <td style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[...Array(10)].map((_,j) => <div key={j} style={{ width: 4, height: 12, background: j < p.boost_weight ? '#F4A62A' : '#F1ECDD', borderRadius: 1 }}/>)}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{p.boost_weight}</span>
                </div>
              </td>
              <td style={{ padding: '12px 14px', fontSize: 12, color: '#5A5A5A' }}>{p.regions}<br/><span style={{ color: '#A0A0A0' }}>{p.crops}</span></td>
              <td style={{ padding: '12px 14px', color: '#5A5A5A' }}>{(p.daily_cap||0).toLocaleString()}</td>
              <td style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 60, height: 5, background: '#F1ECDD', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${p.daily_cap ? Math.min((p.impressions_today/p.daily_cap)*100, 100) : 0}%`, height: '100%', background: p.daily_cap && (p.impressions_today/p.daily_cap) > 0.85 ? '#F4A62A' : '#66A64F' }}/>
                  </div>
                  <span style={{ fontSize: 11, color: '#7E7E7E' }}>{(p.impressions_today||0).toLocaleString()}</span>
                </div>
              </td>
              <td style={{ padding: '12px 14px' }}><window.AdminPill tone={p.status==='Active'?'green':'gray'}>{p.status}</window.AdminPill></td>
              <td style={{ padding: '12px 14px' }}><button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>Edit</button></td>
            </tr>
          ))}</tbody>
        </table>
      </window.AdminCard>
    </div>
  );
};

// ============================================================
// API INTEGRATIONS
// ============================================================
const ApiKeysTab = () => {
  const [pool, setPool] = useS_Adm2('vision');
  const [data, setData] = useS_Adm2(null);
  const [loading, setLoading] = useS_Adm2(true);
  const [error, setError] = useS_Adm2(null);
  
  // Modal state
  const [modalMode, setModalMode] = useS_Adm2(null); // 'add' | 'edit' | null
  const [editKey, setEditKey] = useS_Adm2(null);
  const [formData, setFormData] = useS_Adm2({ provider: '', api_key: '', model_id: '', base_url: '', priority: 1, weight: 50, quota: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await window.API.adminApiKeys();
      setData(res);
      setError(null);
    } catch (err) {
      console.error('[ApiKeysTab] Fetch error:', err);
      setError(err.message || 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  useE_Adm2(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await window.API.adminAddApiKey({ pool, ...formData });
      } else if (modalMode === 'edit' && editKey) {
        await window.API.adminUpdateApiKey(editKey.id, formData);
      }
      setModalMode(null);
      fetchData();
    } catch (err) {
      alert('Error saving API key: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    try {
      await window.API.adminDeleteApiKey(id);
      fetchData();
    } catch (err) {
      alert('Error deleting API key: ' + err.message);
    }
  };

  const openAdd = () => {
    setFormData({ provider: '', api_key: '', model_id: '', base_url: '', priority: 1, weight: 50, quota: '' });
    setModalMode('add');
  };

  const openEdit = (k) => {
    setEditKey(k);
    setFormData({ provider: k.provider, api_key: '', model_id: k.model_id || '', base_url: k.base_url || '', priority: k.priority, weight: k.weight, quota: k.daily_quota || '' });
    setModalMode('edit');
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading API Configuration...</div>;
  if (error) return <div style={{ padding: 40, color: 'red' }}>Error: {error}</div>;

  const poolData = data?.pools?.[pool] || [];
  
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <window.AdminStat label="Total API Keys" value={data?.summary?.total_keys || 0} icon="sparkles" color="#2E6B3F"/>
        <window.AdminStat label="Healthy keys" value={data?.summary?.healthy || 0} icon="shield" color="#66A64F" />
        <window.AdminStat label="Degraded keys" value={data?.summary?.degraded || 0} icon="alert-triangle" color="#F4A62A" />
        <window.AdminStat label="Down keys" value={data?.summary?.down || 0} icon="x-circle" color="#D04E2C" />
      </div>

      <window.AdminCard style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #F1ECDD' }}>
          {[
            { id: 'vision', label: 'Vision AI (Google AI Studio)', icon: 'camera' },
            { id: 'voice', label: 'Voice (STT Groq + TTS ElevenLabs)', icon: 'mic' },
            { id: 'weather', label: 'Weather', icon: 'sun' },
          ].map(p => {
             const count = (data?.pools?.[p.id] || []).length;
             return (
               <button key={p.id} onClick={()=>setPool(p.id)} style={{
                 padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10,
                 borderBottom: pool === p.id ? '2px solid #2E6B3F' : '2px solid transparent',
                 color: pool === p.id ? '#1F4A2C' : '#7E7E7E',
                 fontWeight: pool === p.id ? 700 : 500, fontSize: 14,
               }}>
                 <Icon name={p.icon} size={16} color={pool === p.id ? '#2E6B3F' : '#7E7E7E'}/>
                 {p.label}
                 <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: pool === p.id ? '#E4F0D8' : '#F1ECDD', color: '#5A5A5A' }}>{count}</span>
               </button>
             );
          })}
        </div>

        <div style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16, background: '#FBFAF4' }}>
          <div>
            <div style={{ fontSize: 14, color: '#1F4A2C', fontWeight: 600 }}>Active Pool: {pool.toUpperCase()}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add key to {pool}</button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#FAF7EC' }}>
            <tr>{['Provider','Model ID','Key','Priority','Weight','Used','Status','Actions'].map((h,i)=>(
              <th key={i} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#7E7E7E', textTransform: 'uppercase' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>{poolData.length === 0 ? <tr><td colSpan="8" style={{ padding: 20, textAlign: 'center', color: '#7E7E7E' }}>No keys configured for this pool. Using fallback env variables.</td></tr> : poolData.map((k, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #F4F1E5' }}>
              <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1F4A2C' }}>{k.provider}</td>
              <td style={{ padding: '12px 14px', color: '#5A5A5A' }}>{k.model_id || '—'}</td>
              <td style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  <span style={{ background: '#F1ECDD', padding: '2px 6px', borderRadius: 4, color: '#5A5A5A' }}>{k.key_masked}</span>
                </div>
              </td>
              <td style={{ padding: '12px 14px', fontWeight: 600 }}>P{k.priority}</td>
              <td style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 40, height: 4, background: '#F1ECDD', borderRadius: 99 }}><div style={{ width: `${k.weight}%`, height: '100%', background: '#66A64F', borderRadius: 99 }}/></div>
                  <span style={{ fontSize: 11 }}>{k.weight}%</span>
                </div>
              </td>
              <td style={{ padding: '12px 14px', color: '#5A5A5A' }}>{k.calls_today}</td>
              <td style={{ padding: '12px 14px' }}>
                <window.AdminPill tone={k.status==='healthy'?'green':k.status==='degraded'?'amber':k.status==='down'?'red':'gray'}>
                  {k.status}
                </window.AdminPill>
              </td>
              <td style={{ padding: '12px 14px', display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(k)} style={{ fontSize: 11 }}>Edit</button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(k.id)} style={{ fontSize: 11, color: '#D04E2C' }}>Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </window.AdminCard>

      {/* Modal */}
      {modalMode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, width: 400 }}>
            <h3 style={{ margin: '0 0 16px', color: '#1F4A2C' }}>{modalMode === 'add' ? 'Add API Key' : 'Edit API Key'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={formData.provider} onChange={e=>setFormData({...formData, provider: e.target.value})} placeholder="Provider Name (e.g. Google AI Studio, Groq)" required style={{ padding: 10, borderRadius: 6, border: '1px solid #E6E0D1' }}/>
              <input value={formData.model_id} onChange={e=>setFormData({...formData, model_id: e.target.value})} placeholder="Model ID (e.g. gemini-1.5-pro, whisper-large-v3)" style={{ padding: 10, borderRadius: 6, border: '1px solid #E6E0D1' }}/>
              <input value={formData.base_url} onChange={e=>setFormData({...formData, base_url: e.target.value})} placeholder="Base URL (optional override)" style={{ padding: 10, borderRadius: 6, border: '1px solid #E6E0D1' }}/>
              <input value={formData.api_key} onChange={e=>setFormData({...formData, api_key: e.target.value})} placeholder={modalMode === 'edit' ? "API Key (leave blank to keep existing)" : "API Key"} required={modalMode === 'add'} type="password" style={{ padding: 10, borderRadius: 6, border: '1px solid #E6E0D1' }}/>
              <div style={{ display: 'flex', gap: 10 }}>
                <input value={formData.priority} onChange={e=>setFormData({...formData, priority: +e.target.value})} placeholder="Priority (1 = highest)" type="number" min="1" required style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #E6E0D1' }}/>
                <input value={formData.weight} onChange={e=>setFormData({...formData, weight: +e.target.value})} placeholder="Weight (0-100)" type="number" min="0" max="100" required style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #E6E0D1' }}/>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" onClick={() => setModalMode(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// REVENUE
// ============================================================
const RevenueTab = ({ demoMode }) => {
  const [liveData, setLiveData] = useS_Adm2(null);
  useE_Adm2(() => {
    if (!demoMode) {
      window.API.adminRevenue()
        .then(d => setLiveData(d))
        .catch(() => setLiveData(null));
    } else {
      setLiveData(null);
    }
  }, [demoMode]);

  const s = liveData?.summary || {};
  const mix = liveData?.revenue_mix || {};
  const affiliates = liveData?.affiliate_attribution || [
    { partner: 'Bayer Pakistan', clicks: 38420, conv_rate: '12.4%', conversions: 4764, sales: '₨ 14.2M', commission: '₨ 1.42M' },
    { partner: 'Syngenta', clicks: 24180, conv_rate: '14.1%', conversions: 3409, sales: '₨ 9.8M', commission: '₨ 980k' },
    { partner: 'Ali Akbar Group', clicks: 18940, conv_rate: '9.8%', conversions: 1856, sales: '₨ 4.2M', commission: '₨ 420k' },
    { partner: 'FMC Pakistan', clicks: 11200, conv_rate: '8.2%', conversions: 918, sales: '₨ 2.1M', commission: '₨ 210k' },
  ];

  return (
  <div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
      <window.AdminStat label="MRR" value={s.mrr ? `₨ ${(s.mrr/1000000).toFixed(1)}M` : '₨ 4.8M'} delta="+18%" icon="pkr" color="#2E6B3F"/>
      <window.AdminStat label="Sponsor revenue" value={s.sponsor_revenue ? `₨ ${(s.sponsor_revenue/1000000).toFixed(2)}M` : '₨ 2.49M'} delta="+24%" icon="trend" color="#F4A62A"/>
      <window.AdminStat label="Premium subscriptions" value={s.premium_subscriptions ? s.premium_subscriptions.toLocaleString() : '2,140'} delta="+312" icon="star" color="#66A64F" sub="₨ 299/mo each"/>
      <window.AdminStat label="Affiliate clicks · 7d" value={s.affiliate_clicks_7d ? s.affiliate_clicks_7d.toLocaleString() : '14,820'} delta="+9%" icon="leaf" color="#9DCB7C"/>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 16 }}>
      <window.AdminCard style={{ padding: 22 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#1F4A2C' }}>Revenue · 12 months</h3>
        <svg viewBox="0 0 600 220" style={{ width: '100%', height: 220 }}>
          {[0,40,80,120,160].map(y => <line key={y} x1="40" x2="590" y1={y+10} y2={y+10} stroke="#F1ECDD" strokeWidth="1"/>)}
          {[60,80,90,110,140,165,180,160,180,200,210,230].map((v, i) => (
            <g key={i}>
              <rect x={50 + i*44} y={210 - v*0.8} width="14" height={v*0.8} fill="#2E6B3F" rx="2"/>
              <rect x={66 + i*44} y={210 - v*0.4} width="14" height={v*0.4} fill="#F4A62A" rx="2"/>
            </g>
          ))}
          {['M','J','J','A','S','O','N','D','J','F','M','A'].map((m, i) => <text key={i} x={56+i*44} y={224} fontSize="10" fill="#7E7E7E">{m}</text>)}
        </svg>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#7E7E7E', marginTop: 6 }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#2E6B3F', borderRadius: 2, marginRight: 6 }}/>Subscriptions</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#F4A62A', borderRadius: 2, marginRight: 6 }}/>Sponsors & affiliate</span>
        </div>
      </window.AdminCard>

      <window.AdminCard style={{ padding: 22 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#1F4A2C' }}>Revenue mix</h3>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <svg width="160" height="160" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#F1ECDD" strokeWidth="6"/>
            <circle cx="18" cy="18" r="14" fill="none" stroke="#2E6B3F" strokeWidth="6" strokeDasharray="48 88" strokeDashoffset="0" transform="rotate(-90 18 18)"/>
            <circle cx="18" cy="18" r="14" fill="none" stroke="#F4A62A" strokeWidth="6" strokeDasharray="32 88" strokeDashoffset="-48" transform="rotate(-90 18 18)"/>
            <circle cx="18" cy="18" r="14" fill="none" stroke="#66A64F" strokeWidth="6" strokeDasharray="8 88" strokeDashoffset="-80" transform="rotate(-90 18 18)"/>
          </svg>
        </div>
        {[
          { label: 'Subscriptions', val: '55%', amt: '₨ 2.64M', c: '#2E6B3F' },
          { label: 'Sponsors', val: '36%', amt: '₨ 1.73M', c: '#F4A62A' },
          { label: 'Affiliate', val: '9%', amt: '₨ 432k', c: '#66A64F' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
            <span style={{ width: 10, height: 10, background: s.c, borderRadius: 2 }}/>
            <span style={{ fontSize: 13, color: '#1F4A2C', fontWeight: 500 }}>{s.label}</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#7E7E7E' }}>{s.amt}</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{s.val}</span>
          </div>
        ))}
      </window.AdminCard>
    </div>

    <window.AdminCard style={{ padding: 22 }}>
      <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#1F4A2C' }}>Affiliate attribution · last 30 days</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead><tr style={{ borderBottom: '2px solid #F1ECDD' }}>{['Partner','Clicks','Conv. rate','Conversions','Attributed sales','Commission'].map((h,i)=>(
          <th key={i} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#7E7E7E', textTransform: 'uppercase' }}>{h}</th>
        ))}</tr></thead>
          <tbody>
          {affiliates.map((a, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #F4F1E5' }}>
              <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1F4A2C' }}>{a.partner}</td>
              <td style={{ padding: '12px 14px', color: '#1F4A2C' }}>{typeof a.clicks === 'number' ? a.clicks.toLocaleString() : a.clicks}</td>
              <td style={{ padding: '12px 14px', color: '#1F4A2C' }}>{a.conv_rate}</td>
              <td style={{ padding: '12px 14px', color: '#1F4A2C' }}>{typeof a.conversions === 'number' ? a.conversions.toLocaleString() : a.conversions}</td>
              <td style={{ padding: '12px 14px', color: '#1F4A2C' }}>{a.sales}</td>
              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2E6B3F' }}>{a.commission}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </window.AdminCard>
  </div>
  );
};

// ============================================================
// CATALOG
// ============================================================
const CatalogTab = ({ demoMode }) => {
  const [liveData, setLiveData] = useS_Adm2(null);
  useE_Adm2(() => {
    if (!demoMode) {
      window.API.adminCatalog()
        .then(d => setLiveData(d))
        .catch(() => setLiveData(null));
    } else {
      setLiveData(null);
    }
  }, [demoMode]);

  const demoItems = [
    { name: 'Antracol 70 WP', category: 'Fungicide', company: 'Bayer', pkr_price: 1180, unit: '500g', dosage: '2.5 g/L water', last_price_refresh: null, is_sponsored: true, is_banned: false },
    { name: 'Confidor 200 SL', category: 'Insecticide', company: 'Bayer', pkr_price: 980, unit: '250ml', dosage: '0.5 ml/L', last_price_refresh: null, is_sponsored: true, is_banned: false },
    { name: 'Actara 25 WG', category: 'Insecticide', company: 'Syngenta', pkr_price: 2200, unit: '100g', dosage: '0.4 g/L', last_price_refresh: null, is_sponsored: true, is_banned: false },
    { name: 'Ridomil Gold MZ', category: 'Fungicide', company: 'Syngenta', pkr_price: 1650, unit: '500g', dosage: '2 g/L', last_price_refresh: null, is_sponsored: false, is_banned: false },
    { name: 'Karate 2.5 EC', category: 'Insecticide', company: 'Syngenta', pkr_price: 720, unit: '250ml', dosage: '0.8 ml/L', last_price_refresh: null, is_sponsored: true, is_banned: false },
    { name: 'Sarbex 5G', category: 'Insecticide', company: 'Ali Akbar', pkr_price: 480, unit: '1kg', dosage: '20 kg/acre', last_price_refresh: null, is_sponsored: true, is_banned: false },
    { name: 'Endosulfan 35 EC', category: 'Insecticide', company: 'Generic', pkr_price: null, unit: null, dosage: '—', last_price_refresh: null, is_sponsored: false, is_banned: true },
    { name: 'Urea (46% N)', category: 'Fertilizer', company: 'Engro', pkr_price: 4200, unit: '50kg bag', dosage: '50 kg/acre', last_price_refresh: null, is_sponsored: false, is_banned: false },
    { name: 'DAP', category: 'Fertilizer', company: 'FFC', pkr_price: 11200, unit: '50kg bag', dosage: '50 kg/acre', last_price_refresh: null, is_sponsored: false, is_banned: false },
  ];
  const demoPrmopts = [
    { name: 'Cotton · disease diagnosis v3', category: 'Cotton', traffic_pct: 70, accuracy: '94.2%', status: 'champion' },
    { name: 'Cotton · disease diagnosis v4 (test)', category: 'Cotton', traffic_pct: 30, accuracy: '95.8%', status: 'experiment' },
    { name: 'Wheat · rust diagnosis v2', category: 'Wheat', traffic_pct: 100, accuracy: '92.1%', status: 'champion' },
    { name: 'Mango · anthracnose diagnosis v1', category: 'Mango', traffic_pct: 100, accuracy: '88.4%', status: 'champion' },
  ];

  const items = liveData ? liveData.items.map(i => ({
    name: i.name, category: i.category, company: i.company,
    pkr_price: i.pkr_price, unit: i.unit, dosage: i.dosage,
    last_price_refresh: i.last_price_refresh,
    is_sponsored: i.is_sponsored, is_banned: i.is_banned,
  })) : demoItems;
  const prompts = liveData ? (liveData.prompts || []) : demoPrmopts;
  const catalogSummary = liveData?.summary || {};

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <window.AdminStat label="Catalog items" value={catalogSummary.total ?? 284} delta="+12 this month" icon="leaf" color="#2E6B3F"/>
        <window.AdminStat label="Sponsored" value={catalogSummary.sponsored ?? 42} icon="shield" color="#F4A62A"/>
        <window.AdminStat label="Price last refreshed" value="< 24h" icon="refresh" color="#66A64F" sub="auto + manual"/>
        <window.AdminStat label="Banned / restricted" value={catalogSummary.banned ?? 8} icon="bell" color="#D04E2C"/>
      </div>

      <window.AdminCard>
        <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #F1ECDD' }}>
          <input placeholder="Search products…" style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E6E0D1', fontSize: 13, background: '#FBFAF4', flex: 1, maxWidth: 320 }}/>
          <select style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E6E0D1', fontSize: 13, background: '#FBFAF4' }}>
            <option>All categories</option><option>Fungicide</option><option>Insecticide</option><option>Fertilizer</option><option>Herbicide</option>
          </select>
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>+ Add product</button>
          <button className="btn btn-secondary btn-sm">Bulk price refresh</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#FAF7EC' }}><tr>{['Product','Category','Company','Pakistan price','Dosage','Last updated','Tags',''].map((h,i)=>(
            <th key={i} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#7E7E7E', textTransform: 'uppercase' }}>{h}</th>
          ))}</tr></thead>
          <tbody>{items.map((p, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #F4F1E5', background: p.is_banned ? '#FFF6F2' : 'transparent' }}>
              <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1F4A2C' }}>{p.name}</td>
              <td style={{ padding: '12px 14px' }}><window.AdminPill tone="gray">{p.category}</window.AdminPill></td>
              <td style={{ padding: '12px 14px', color: '#5A5A5A' }}>{p.company}</td>
              <td style={{ padding: '12px 14px', fontWeight: 600 }}>{p.pkr_price ? `₨ ${p.pkr_price.toLocaleString()} / ${p.unit}` : '—'}</td>
              <td style={{ padding: '12px 14px', color: '#5A5A5A', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.dosage || '—'}</td>
              <td style={{ padding: '12px 14px', color: '#7E7E7E', fontSize: 12 }}>{p.last_price_refresh ? new Date(p.last_price_refresh).toLocaleDateString() : '—'}</td>
              <td style={{ padding: '12px 14px' }}>
                {p.is_sponsored && <window.AdminPill tone="amber">Sponsored</window.AdminPill>}
                {p.is_banned && <window.AdminPill tone="red">Banned</window.AdminPill>}
              </td>
              <td style={{ padding: '12px 14px' }}><button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>Edit</button></td>
            </tr>
          ))}</tbody>
        </table>
      </window.AdminCard>

      <window.AdminCard style={{ padding: 22, marginTop: 16 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#1F4A2C' }}>Treatment prompts library · A/B versions</h3>
        {prompts.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderTop: i > 0 ? '1px solid #F1ECDD' : 'none' }}>
            <Icon name="sparkles" size={16} color="#F4A62A"/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1F4A2C' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: '#7E7E7E' }}>{p.traffic_pct || p.traffic}% traffic · accuracy {p.accuracy || p.acc || '—'}</div>
            </div>
            <window.AdminPill tone={p.status==='champion'?'green':'amber'}>{p.status}</window.AdminPill>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>View prompt</button>
          </div>
        ))}
      </window.AdminCard>
    </div>
  );
};

// ============================================================
// WHATSAPP OPS
// ============================================================
const WhatsAppOps = ({ demoMode }) => {
  const [liveData, setLiveData] = useS_Adm2(null);
  useE_Adm2(() => {
    if (!demoMode) {
      window.API.adminWaQueue()
        .then(d => setLiveData(d))
        .catch(() => setLiveData(null));
    } else {
      setLiveData(null);
    }
  }, [demoMode]);

  const demoConvos = [
    { user: 'Aslam M.', last: 'Sent leaf photo · awaiting AI', mode: 'auto', wait: '8s', unread: 0 },
    { user: 'Fatima B.', last: '"Mere tomato par kaale dhabbe…"', mode: 'auto', wait: '14s', unread: 0 },
    { user: 'Tariq M.', last: '"Yeh treatment kaam nahi kar raha"', mode: 'human', wait: '4m', unread: 1 },
    { user: 'Sara K.', last: 'Voice note received (24s)', mode: 'auto', wait: '22s', unread: 0 },
    { user: 'Rashid A.', last: '"Confidor 200 ka rate?"', mode: 'auto', wait: '18s', unread: 0 },
    { user: 'Bilal H.', last: '"Wapas paisa chahiye"', mode: 'human', wait: '12m', unread: 2 },
  ];
  const demoTemplates = [
    { name: 'welcome_urdu', category: 'Marketing', sends: 14820, status: 'Approved' },
    { name: 'diagnosis_ready_urdu', category: 'Utility', sends: 38200, status: 'Approved' },
    { name: 'outbreak_alert_punjab', category: 'Marketing', sends: 124000, status: 'Approved' },
    { name: 'reorder_reminder', category: 'Marketing', sends: 0, status: 'In review' },
  ];

  const convos = liveData ? (liveData.queue || []) : demoConvos;
  const templates = liveData ? (liveData.templates || demoTemplates) : demoTemplates;
  const waSummary = liveData?.summary || {};

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <window.AdminStat label="Active conversations" value={waSummary.active_conversations ? waSummary.active_conversations.toLocaleString() : '1,284'} delta="+8%" icon="whatsapp" color="#25D366"/>
        <window.AdminStat label="Auto-resolved" value={waSummary.auto_resolved_pct ? waSummary.auto_resolved_pct + '%' : '92.4%'} delta="+1.4pp" icon="sparkles" color="#66A64F"/>
        <window.AdminStat label="Awaiting human" value={waSummary.awaiting_human ?? 14} icon="bell" color="#F4A62A"/>
        <window.AdminStat label="Avg response" value={waSummary.avg_response_s ? waSummary.avg_response_s + 's' : '9.4s'} delta="-2s" deltaType="down" icon="trend" color="#2E6B3F" sub="SLO < 30s"/>
      </div>

      <window.AdminCard style={{ marginBottom: 16 }}>
        <div style={{ padding: 16, display: 'flex', alignItems: 'center', borderBottom: '1px solid #F1ECDD' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F4A2C' }}>Live conversation queue</h3>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>Manage canned replies</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#FAF7EC' }}><tr>{['User','Last message','Mode','Wait','New',''].map((h,i)=>(
            <th key={i} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#7E7E7E', textTransform: 'uppercase' }}>{h}</th>
          ))}</tr></thead>
          <tbody>{convos.map((c, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #F4F1E5' }}>
              <td style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#25D36622', color: '#1F4A2C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{(c.user||'?').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                  <div style={{ fontWeight: 600 }}>{c.user}</div>
                </div>
              </td>
              <td style={{ padding: '12px 14px', color: '#5A5A5A', fontSize: 13 }}>{c.last}</td>
              <td style={{ padding: '12px 14px' }}><window.AdminPill tone={c.mode==='auto'?'green':'amber'}>{c.mode === 'auto' ? '🤖 auto' : '👤 human'}</window.AdminPill></td>
              <td style={{ padding: '12px 14px', color: '#5A5A5A' }}>{c.wait || '—'}</td>
              <td style={{ padding: '12px 14px' }}>{(c.unread || c.new) > 0 && <span style={{ background: '#D04E2C', color: '#fff', fontSize: 11, padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>{c.unread || c.new}</span>}</td>
              <td style={{ padding: '12px 14px' }}>
                <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>Take over</button>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, marginLeft: 4 }}>Open →</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </window.AdminCard>

      <window.AdminCard style={{ padding: 22 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#1F4A2C' }}>Meta-approved templates</h3>
        {templates.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderTop: i>0?'1px solid #F1ECDD':'none' }}>
            <code style={{ background: '#F1F7E9', padding: '4px 8px', borderRadius: 6, fontSize: 12, color: '#1F4A2C' }}>{t.name}</code>
            <window.AdminPill tone="gray">{t.category || t.cat}</window.AdminPill>
            <span style={{ fontSize: 12, color: '#7E7E7E' }}>{(t.sends || t.uses || 0).toLocaleString()} sends</span>
            <window.AdminPill tone={t.status==='Approved'?'green':'amber'} style={{ marginLeft: 'auto' }}>{t.status}</window.AdminPill>
          </div>
        ))}
      </window.AdminCard>
    </div>
  );
};

// ============================================================
// TEAM & AUDIT
// ============================================================
const TeamTab = ({ demoMode }) => {
  const [liveData, setLiveData] = useS_Adm2(null);
  useE_Adm2(() => {
    if (!demoMode) {
      window.API.adminTeam()
        .then(d => setLiveData(d))
        .catch(() => setLiveData(null));
    } else {
      setLiveData(null);
    }
  }, [demoMode]);

  const demoMembers = [
    { name: 'Hamza Ali', email: 'hamza@zarii.ai', role: 'Owner', tfa_enabled: true, last_active: null, _last: '2m ago' },
    { name: 'Saira Khan', email: 'saira@zarii.ai', role: 'Ops', tfa_enabled: true, last_active: null, _last: '14m ago' },
    { name: 'Dr. Asad Mahmood', email: 'asad@zarii.ai', role: 'Agronomist', tfa_enabled: true, last_active: null, _last: '1h ago' },
    { name: 'Bilal Ahmad', email: 'bilal@zarii.ai', role: 'Agronomist', tfa_enabled: true, last_active: null, _last: '3h ago' },
    { name: 'Mariam Iqbal', email: 'mariam@zarii.ai', role: 'Support', tfa_enabled: true, last_active: null, _last: '8h ago' },
    { name: 'Tahir Rauf', email: 'tahir@zarii.ai', role: 'Support', tfa_enabled: false, last_active: null, _last: '2d ago' },
  ];
  const demoAudit = [
    { admin_name: 'Hamza Ali', action: 'rotated API key', target: 'Gemini Vision (priority 1)', ip_address: '203.130.x.x', created_at: null, _when: '2m ago' },
    { admin_name: 'Saira Khan', action: 'updated boost weight', target: 'Antracol 70 WP · 8 → 9', ip_address: '203.130.x.x', created_at: null, _when: '24m ago' },
    { admin_name: 'Dr. Asad Mahmood', action: 'reviewed flagged diagnosis', target: 'D-39279', ip_address: '182.184.x.x', created_at: null, _when: '1h ago' },
    { admin_name: 'Hamza Ali', action: 'sent advisory', target: 'Whitefly preventive · Cotton belt', ip_address: '203.130.x.x', created_at: null, _when: '2d ago' },
    { admin_name: 'Saira Khan', action: 'added sponsor', target: 'Engro Fertilizers (Pending)', ip_address: '203.130.x.x', created_at: null, _when: '3d ago' },
    { admin_name: 'Bilal Ahmad', action: 'banned product', target: 'Endosulfan 35 EC', ip_address: '182.184.x.x', created_at: null, _when: '5d ago' },
  ];
  const demoMatrix = [
    { capability: 'View users', Owner: true, Ops: true, Agronomist: true, Support: true },
    { capability: 'Edit catalog', Owner: true, Ops: true, Agronomist: true, Support: false },
    { capability: 'Manage sponsors', Owner: true, Ops: true, Agronomist: false, Support: false },
    { capability: 'Rotate API keys', Owner: true, Ops: true, Agronomist: false, Support: false },
    { capability: 'Send advisories', Owner: true, Ops: true, Agronomist: true, Support: false },
    { capability: 'Take over WhatsApp', Owner: true, Ops: true, Agronomist: true, Support: true },
    { capability: 'Invite members', Owner: true, Ops: false, Agronomist: false, Support: false },
    { capability: 'Billing & contracts', Owner: true, Ops: false, Agronomist: false, Support: false },
  ];

  const members = liveData ? (liveData.members || []) : demoMembers;
  const auditLog = liveData ? (liveData.audit_log || []) : demoAudit;
  const permMatrix = liveData ? (liveData.permission_matrix || demoMatrix) : demoMatrix;
  const teamSummary = liveData?.summary || {};

  return (
  <div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
      <window.AdminStat label="Team members" value={teamSummary.total ?? members.length} icon="users" color="#2E6B3F"/>
      <window.AdminStat label="Roles defined" value="4" icon="shield" color="#66A64F"/>
      <window.AdminStat label="Audit events · 7d" value={teamSummary.audit_events_7d ?? 1284} icon="trend" color="#F4A62A"/>
      <window.AdminStat label="Pending invites" value={teamSummary.pending_invites ?? 2} icon="bell" color="#9DCB7C"/>
    </div>

    <window.AdminCard style={{ marginBottom: 16 }}>
      <div style={{ padding: 16, display: 'flex', borderBottom: '1px solid #F1ECDD' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F4A2C' }}>Team</h3>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>+ Invite member</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead style={{ background: '#FAF7EC' }}><tr>{['Member','Email','Role','2FA','Last active',''].map((h,i)=>(
          <th key={i} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#7E7E7E', textTransform: 'uppercase' }}>{h}</th>
        ))}</tr></thead>
        <tbody>{members.map((m, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #F4F1E5' }}>
            <td style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: ['#9DCB7C','#F4A62A','#66A64F','#2E6B3F'][i%4], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{(m.name||'?').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                <div style={{ fontWeight: 600 }}>{m.name}</div>
              </div>
            </td>
            <td style={{ padding: '12px 14px', color: '#5A5A5A' }}>{m.email}</td>
            <td style={{ padding: '12px 14px' }}><window.AdminPill tone={m.role==='Owner'?'green':m.role==='Ops'?'blue':'gray'}>{m.role}</window.AdminPill></td>
            <td style={{ padding: '12px 14px' }}><window.AdminPill tone={m.tfa_enabled?'green':'amber'}>{m.tfa_enabled?'enabled':'off'}</window.AdminPill></td>
            <td style={{ padding: '12px 14px', color: '#7E7E7E', fontSize: 12 }}>{m._last || (m.last_active ? new Date(m.last_active).toLocaleString() : '—')}</td>
            <td style={{ padding: '12px 14px' }}><button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>Manage</button></td>
          </tr>
        ))}</tbody>
      </table>
    </window.AdminCard>

    <window.AdminCard style={{ marginBottom: 16, padding: 22 }}>
      <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#1F4A2C' }}>Permission matrix</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead><tr style={{ borderBottom: '2px solid #F1ECDD' }}>{['Capability','Owner','Ops','Agronomist','Support'].map((h,i)=>(
          <th key={i} style={{ textAlign: i === 0 ? 'left' : 'center', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#7E7E7E', textTransform: 'uppercase' }}>{h}</th>
        ))}</tr></thead>
        <tbody>{permMatrix.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #F4F1E5' }}>
            <td style={{ padding: '8px 14px', color: '#1F4A2C' }}>{row.capability}</td>
            {['Owner','Ops','Agronomist','Support'].map(role => (
              <td key={role} style={{ padding: '8px 14px', textAlign: 'center', color: row[role] ? '#2E6B3F' : '#C0C0C0', fontWeight: row[role] ? 700 : 400, fontSize: row[role] ? 14 : 13 }}>{row[role] ? '✓' : '—'}</td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </window.AdminCard>

    <window.AdminCard style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1F4A2C' }}>Audit log</h3>
        <button className="btn btn-secondary btn-sm">Export 90 days</button>
      </div>
      {auditLog.map((a, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i > 0 ? '1px solid #F1ECDD' : 'none', fontSize: 13 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#F1F7E9', color: '#1F4A2C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{(a.admin_name||'?').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
          <span style={{ fontWeight: 600, color: '#1F4A2C' }}>{a.admin_name}</span>
          <span style={{ color: '#5A5A5A' }}>{a.action}</span>
          <code style={{ fontSize: 11, color: '#1F4A2C', background: '#F1F7E9', padding: '2px 6px', borderRadius: 4 }}>{a.target}</code>
          <span style={{ fontSize: 11, color: '#A0A0A0', fontFamily: 'var(--font-mono)' }}>{a.ip_address}</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#A0A0A0' }}>{a._when || (a.created_at ? new Date(a.created_at).toLocaleString() : '—')}</span>
        </div>
      ))}
    </window.AdminCard>
  </div>
  );
};

// Export everything
Object.assign(window, {
  SponsorsTab, ApiKeysTab, RevenueTab, CatalogTab, WhatsAppOps, TeamTab,
});
