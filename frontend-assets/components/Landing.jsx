/* global React, Icon, T, Logo, LangToggle, LeafDeco */
const { useState: useS_L, useEffect: useE_L } = React;

const Landing = ({ lang, setLang, navigate }) => {
  const [menuOpen, setMenuOpen] = useS_L(false);

  const features = [
    {
      icon: 'camera',
      en: { title: 'Snap a leaf, get a diagnosis',
            body: 'Point your camera at any affected crop. Our vision AI spots diseases, pests, and deficiencies in seconds — and explains it like a friend.' },
      ur: { title: 'پتے کی تصویر لیں، فوراً تشخیص پائیں',
            body: 'کسی بھی متاثرہ فصل پر کیمرہ کریں۔ ہمارا AI لمحوں میں بیماری، کیڑے یا کمی پہچان لیتا ہے — اور آسان زبان میں سمجھاتا ہے۔' }
    },
    {
      icon: 'mic',
      en: { title: 'Talk to ZARii in Urdu',
            body: 'Hold the mic, ask anything: "میرے آلو کے پتے پیلے کیوں ہیں؟" — get a spoken answer back, instantly.' },
      ur: { title: 'زرعی AI سے اردو میں بات کریں',
            body: 'مائیک دبائیں اور سوال پوچھیں — مثلاً "میرے آلو کے پتے پیلے کیوں ہیں؟" — جواب فوراً آواز میں ملے گا۔' }
    },
    {
      icon: 'pkr',
      en: { title: 'Pakistan-specific pesticides & PKR prices',
            body: 'Get exact product names, companies, and bazaar prices in PKR — what to buy, where, and how much to mix.' },
      ur: { title: 'پاکستانی برانڈز اور قیمتیں',
            body: 'دوا کا اصل نام، کمپنی، روپے میں قیمت اور درست مقدار — وہی جو آپ کے بازار میں ملے گی۔' }
    },
    {
      icon: 'cloud-sun',
      en: { title: 'Weather alerts before disease hits',
            body: 'Whitefly risk in Punjab next week? Frost coming? Get heads-up alerts, not bad news.' },
      ur: { title: 'بیماری سے پہلے موسم کی وارننگ',
            body: 'پنجاب میں سفید مکھی کا خطرہ؟ پالا آنے والا ہے؟ پہلے سے اطلاع — نہ کہ نقصان کے بعد۔' }
    },
  ];

  const stats = [
    { num: '40,000+', en: 'farmers helped', ur: 'کسانوں نے استعمال کیا' },
    { num: '120+',    en: 'crop diseases detected', ur: 'بیماریاں پہچانتا ہے' },
    { num: 'حلال',    en: 'Pakistan-built', ur: 'پاکستان میں بنایا گیا' },
    { num: '<5s',     en: 'avg. diagnosis time', ur: 'اوسط تشخیص وقت' },
  ];

  const testimonials = [
    {
      name: 'Muhammad Aslam',
      role: 'Cotton farmer, Multan',
      en: '"Last year I lost two acres to whitefly because I didn\'t know. This year ZARii warned me three days early. Saved my whole field."',
      ur: '"پچھلے سال سفید مکھی نے دو ایکڑ تباہ کر دیے۔ اس بار زرعی نے تین دن پہلے بتا دیا، پوری فصل بچ گئی۔"',
      rating: 5,
    },
    {
      name: 'Fatima Bibi',
      role: 'Vegetable grower, Faisalabad',
      en: '"I just talk to it in Urdu. It tells me exactly which spray to buy from Rafhan market. Like having a free agronomist."',
      ur: '"میں اردو میں بات کرتی ہوں۔ یہ بتاتا ہے رفحان مارکیٹ سے کون سا اسپرے لینا ہے۔ مفت ماہر زراعت کی طرح ہے۔"',
      rating: 5,
    },
    {
      name: 'Tariq Mehmood',
      role: 'Wheat farmer, Bahawalpur',
      en: '"WhatsApp pe photo bhejta hoon, jawab milta hai. Internet bohat slow ho to bhi chalta hai."',
      ur: '"واٹس ایپ پر تصویر بھیجتا ہوں، جواب ملتا ہے۔ انٹرنیٹ سست ہو تب بھی کام کرتا ہے۔"',
      rating: 5,
    },
  ];

  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* Top Nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(251, 250, 244, 0.85)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--line-soft)',
      }}>
        <div className="landing-header-inner">
          <Logo size={42} lang={lang} />
          <nav className="landing-nav" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <a href="#how" style={{ color: 'var(--ink-soft)', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>
              {lang === 'ur' ? <span className="urdu-inline">طریقہ کار</span> : 'How it works'}
            </a>
            <a href="#features" style={{ color: 'var(--ink-soft)', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>
              {lang === 'ur' ? <span className="urdu-inline">خصوصیات</span> : 'Features'}
            </a>
            <a href="#farmers" style={{ color: 'var(--ink-soft)', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>
              {lang === 'ur' ? <span className="urdu-inline">کسان</span> : 'Farmers'}
            </a>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('onboarding')}>
              {lang === 'ur' ? <span className="urdu-inline">شروع کریں</span> : 'Get started'}
              <Icon name="arrow-right" size={16} />
            </button>
            {/* Hamburger — shown only on mobile via CSS */}
            <button className="hamburger-btn" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
              {menuOpen ? '✕' : '☰'}
            </button>
          </nav>
          {/* Mobile dropdown nav */}
          {menuOpen && (
            <div className="mobile-nav-dropdown">
              <a href="#how" onClick={() => setMenuOpen(false)}>
                {lang === 'ur' ? <span className="urdu-inline">طریقہ کار</span> : 'How it works'}
              </a>
              <a href="#features" onClick={() => setMenuOpen(false)}>
                {lang === 'ur' ? <span className="urdu-inline">خصوصیات</span> : 'Features'}
              </a>
              <a href="#farmers" onClick={() => setMenuOpen(false)}>
                {lang === 'ur' ? <span className="urdu-inline">کسان</span> : 'Farmers'}
              </a>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <LangToggle lang={lang} setLang={setLang} />
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { navigate('onboarding'); setMenuOpen(false); }}>
                  {lang === 'ur' ? <span className="urdu-inline">شروع کریں</span> : 'Get started'}
                  <Icon name="arrow-right" size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
       {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <LeafDeco style={{ position: 'absolute', top: -40, right: -20, transform: 'rotate(10deg)' }} opacity={0.18} />
        <LeafDeco style={{ position: 'absolute', bottom: 40, left: -60, transform: 'scaleX(-1) rotate(15deg)' }} opacity={0.14} color="#66A64F" />

        <div className="hero-grid" style={{
          maxWidth: 1240, margin: '0 auto', padding: '48px 20px 40px',
          display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 40, alignItems: 'center',
        }}>
          <div>
            <div className="tag tag-cream" style={{ marginBottom: 16 }}>
              <Icon name="sparkles" size={14} color="#F4A62A" />
              {lang === 'ur'
                ? <span className="urdu-inline">پاکستان کے کسانوں کے لیے بنایا گیا</span>
                : 'Built for Pakistani farmers'}
            </div>

            <h1 className="hero-title" style={{
              margin: '0 0 8px', fontSize: 56, lineHeight: 1.1,
              fontWeight: 800, color: 'var(--green-900)', letterSpacing: '-0.02em',
            }}>
              {lang === 'ur' ? (
                <span className="urdu-inline" style={{ fontSize: 44, lineHeight: 1.6 }}>
                  آپ کے فصلوں کا<br/>
                  <span style={{ color: 'var(--green-500)' }}>ذہین ساتھی</span>
                </span>
              ) : (
                <>Your crop's <br/>
                  <span style={{ color: 'var(--green-500)' }}>smartest friend.</span>
                </>
              )}
            </h1>

            <p className="hero-desc" style={{
              fontSize: 16, lineHeight: 1.6, color: 'var(--ink-soft)',
              marginTop: 16,
              fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
              direction: lang === 'ur' ? 'rtl' : 'ltr',
            }}>
              {lang === 'ur'
                ? 'پتے کی تصویر کھینچیں یا اردو میں سوال کریں — ZARii AI لمحوں میں بیماری پہچانتا ہے'
                : 'Snap a leaf or ask in Urdu — ZARii AI diagnoses disease in seconds'}
            </p>

            <div className="hero-buttons" style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('onboarding')} style={{ flex: '1 1 auto', minWidth: '200px' }}>
                <Icon name="leaf" size={18} />
                {lang === 'ur' ? <span className="urdu-inline">ابھی چیک کریں</span> : 'Check crop now'}
              </button>
              <button className="btn btn-wa btn-lg" onClick={() => navigate('whatsapp-coming-soon')} style={{ flex: '1 1 auto', minWidth: '200px' }}>
                <Icon name="whatsapp" size={18} />
                {lang === 'ur' ? <span className="urdu-inline">واٹس ایپ</span> : 'WhatsApp'}
              </button>
            </div>

            <div className="hero-stats" style={{ display: 'flex', gap: 14, marginTop: 24, alignItems: 'center', color: 'var(--ink-mute)', fontSize: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: ['#F4A62A','#66A64F','#9DCB7C','#2E6B3F'][i-1],
                    border: '2px solid var(--bg)', marginLeft: i > 1 ? -8 : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                  }}>{['MA','FB','TM','SK'][i-1]}</div>
                ))}
              </div>
              <span style={{ fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit' }}>
                {lang === 'ur'
                  ? <span className="urdu-inline">1,200+ کسانوں نے چیک کیا</span>
                  : '1,200+ farmers checked their crops this week'}
              </span>
            </div>
          </div>

          {/* Hero visual: phone mock with diagnosis */}
          <HeroVisual lang={lang} />
        </div>

        {/* Stats strip */}
        <div style={{ maxWidth: 1240, margin: '32px auto 0', padding: '0 20px' }}>
          <div className="stats-grid" style={{
            background: 'var(--green-700)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 24px',
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 20, color: '#fff',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: -40, top: -40, opacity: 0.08 }}>
              <Icon name="leaf-fill" size={160} color="#fff" />
            </div>
            {stats.map((s, i) => (
              <div key={i} style={{ position: 'relative', borderLeft: i > 1 ? 'none' : i > 0 ? '1px solid rgba(255,255,255,0.18)' : 'none', paddingLeft: i > 0 && i < 2 ? 16 : 0 }}>
                <div style={{
                  fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em',
                  fontFamily: typeof s.num === 'string' && /[\u0600-\u06FF]/.test(s.num) ? 'var(--font-ur)' : 'inherit',
                }}>{s.num}</div>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4,
                  fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
                  direction: lang === 'ur' ? 'rtl' : 'ltr',
                }}>{lang === 'ur' ? s.ur : s.en}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '48px 20px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, gap: 20, flexWrap: 'wrap' }}>
          <SectionTitle
            eyebrow={lang === 'ur' ? 'تین قدم' : 'Three steps'}
            en={'From "I think it\'s sick" to "Here\'s exactly what to spray."'}
            ur={'"شاید بیماری ہے" سے "بالکل یہ دوا چھڑکیں" تک'}
            lang={lang}
          />
        </div>
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          {[
            { n: '01', icon: 'camera',
              en: { t: 'Snap or speak', d: 'Take a photo of the affected leaf, or hold the mic and just describe it in Urdu.' },
              ur: { t: 'تصویر یا آواز', d: 'متاثرہ پتے کی تصویر لیں، یا مائیک دبا کر اردو میں بتائیں۔' }, color: '#9DCB7C' },
            { n: '02', icon: 'sparkles',
              en: { t: 'AI looks closely', d: 'Our model trained on Pakistani crops examines the image and your symptoms together.' },
              ur: { t: 'AI غور سے دیکھتا ہے', d: 'پاکستانی فصلوں پر تربیت یافتہ ماڈل تصویر اور علامات دونوں دیکھتا ہے۔' }, color: '#66A64F' },
            { n: '03', icon: 'flask',
              en: { t: 'Get a real plan', d: 'Disease name, exact pesticide brand, PKR price, dosage, and what to do this week — saved to your history.' },
              ur: { t: 'مکمل پلان', d: 'بیماری کا نام، دوا کا برانڈ، روپے میں قیمت، مقدار اور اس ہفتے کیا کرنا ہے — سب محفوظ۔' }, color: '#2E6B3F' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 28, position: 'relative' }}>
              <div style={{
                position: 'absolute', top: 20, right: 24,
                fontFamily: 'var(--font-mono)', fontSize: 13,
                color: 'var(--ink-mute)', letterSpacing: '0.1em',
              }}>{s.n}</div>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20, color: '#fff',
                boxShadow: `0 8px 18px ${s.color}55`,
              }}>
                <Icon name={s.icon} size={28} color="#fff" />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 20, color: 'var(--green-900)', fontWeight: 700,
                fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
                direction: lang === 'ur' ? 'rtl' : 'ltr',
              }}>{lang === 'ur' ? s.ur.t : s.en.t}</h3>
              <p style={{ margin: 0, color: 'var(--ink-soft)', lineHeight: 1.55, fontSize: 14.5,
                fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
                direction: lang === 'ur' ? 'rtl' : 'ltr',
              }}>{lang === 'ur' ? s.ur.d : s.en.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features-section-wrapper">
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <SectionTitle
            eyebrow={lang === 'ur' ? 'ایک ساتھی، چار سپر پاور' : 'One companion, four superpowers'}
            en={'Designed for the field — not the office.'}
            ur={'دفتر کے لیے نہیں — کھیت کے لیے۔'}
            lang={lang}
          />
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginTop: 32 }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{
                padding: 28, display: 'flex', gap: 20,
                background: i % 2 === 0 ? 'var(--paper)' : 'var(--green-50)',
                border: '1px solid ' + (i % 2 === 0 ? 'var(--line-soft)' : 'var(--green-100)'),
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: 'var(--green-700)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={f.icon} size={24} color="#fff" />
                </div>
                <div style={{ direction: lang === 'ur' ? 'rtl' : 'ltr', textAlign: lang === 'ur' ? 'right' : 'left' }}>
                  <h3 style={{
                    margin: '0 0 8px', fontSize: 19, fontWeight: 700,
                    color: 'var(--green-900)',
                    fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
                  }}>{lang === 'ur' ? f.ur.title : f.en.title}</h3>
                  <p style={{
                    margin: 0, color: 'var(--ink-soft)', lineHeight: 1.55, fontSize: 14.5,
                    fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
                  }}>{lang === 'ur' ? f.ur.body : f.en.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="farmers" className="testimonials-section-wrapper">
         <SectionTitle
           eyebrow={lang === 'ur' ? 'کسانوں کی زبانی' : 'From the field'}
           en={"What farmers across Pakistan are saying."}
           ur={"پاکستان بھر کے کسان کیا کہتے ہیں۔"}
           lang={lang}
         />
         <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 32 }}>
           {testimonials.map((t, i) => (
             <div key={i} className="card" style={{ padding: 28 }}>
               <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                 {[...Array(t.rating)].map((_, j) => <Icon key={j} name="star" size={14} color="#F4A62A" />)}
               </div>
               <p style={{
                 margin: '0 0 20px', fontSize: 16, lineHeight: 1.6, color: 'var(--ink)',
                 fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
                 direction: lang === 'ur' ? 'rtl' : 'ltr',
               }}>{lang === 'ur' ? t.ur : t.en}</p>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
                 <div style={{
                   width: 40, height: 40, borderRadius: '50%',
                   background: ['#9DCB7C','#F4A62A','#66A64F'][i],
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   color: '#fff', fontWeight: 700,
                 }}>{t.name.split(' ').map(n => n[0]).slice(0,2).join('')}</div>
                 <div>
                   <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--green-900)' }}>{t.name}</div>
                   <div style={{ fontSize: 12.5, color: 'var(--ink-mute)' }}>{t.role}</div>
                 </div>
               </div>
             </div>
           ))}
         </div>
       </section>

       {/* CTA strip */}
       <section className="cta-section-wrapper">
        <div className="cta-grid" style={{
          maxWidth: 1240, margin: '0 auto',
          background: 'linear-gradient(135deg, var(--green-900) 0%, var(--green-700) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '60px 56px',
          color: '#fff', position: 'relative', overflow: 'hidden',
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', alignItems: 'center', gap: 40,
        }}>
          <div style={{ position: 'absolute', right: -60, top: -60, opacity: 0.10 }}>
            <Icon name="leaf-fill" size={320} color="#fff" />
          </div>
          <div>
            <h2 style={{
              margin: 0, fontSize: 40, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1,
              fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
              direction: lang === 'ur' ? 'rtl' : 'ltr',
            }}>
              {lang === 'ur'
                ? 'آج ہی اپنی فصل کی تشخیص کریں۔'
                : <>Diagnose your crop in <span style={{ color: 'var(--amber)' }}>30 seconds.</span></>}
            </h2>
            <p style={{
              margin: '14px 0 0', fontSize: 17, opacity: 0.85, maxWidth: 480,
              fontFamily: lang === 'ur' ? 'var(--font-ur)' : 'inherit',
              direction: lang === 'ur' ? 'rtl' : 'ltr',
            }}>
              {lang === 'ur'
                ? 'مفت۔ اردو اور انگریزی میں۔ صرف فون نمبر کافی ہے۔'
                : 'Free. Available in Urdu and English. All you need is a phone number.'}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn btn-amber btn-lg" onClick={() => navigate('onboarding')} style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <Icon name="leaf" size={18} />
                {lang === 'ur' ? <span className="urdu-inline">شروع کریں</span> : 'Get started — it\'s free'}
              </span>
              <Icon name="arrow-right" size={18} />
            </button>
            <button className="btn btn-wa btn-lg" onClick={() => navigate('whatsapp-coming-soon')} style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <Icon name="whatsapp" size={18} />
                {lang === 'ur' ? <span className="urdu-inline">واٹس ایپ پر چیٹ کریں</span> : 'Chat on WhatsApp'}
              </span>
              <Icon name="arrow-right" size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '48px 32px 36px', background: 'var(--green-900)', color: 'rgba(255,255,255,0.75)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          {/* SEO link columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Disease Guides</div>
              {[
                { href: '/diseases', label: 'All Diseases' },
                { href: '/diseases/cotton-whitefly-pakistan', label: 'Cotton Whitefly' },
                { href: '/diseases/wheat-yellow-rust-pakistan', label: 'Wheat Yellow Rust' },
                { href: '/diseases/tomato-early-blight-pakistan', label: 'Tomato Early Blight' },
                { href: '/diseases/mango-anthracnose-pakistan', label: 'Mango Anthracnose' },
              ].map(l => (
                <a key={l.href} href={l.href} style={{ display: 'block', color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 8, textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.65)'}>{l.label}</a>
              ))}
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pesticides</div>
              {[
                { href: '/pesticides', label: 'All Pesticides' },
                { href: '/pesticides/antracol-70-wp', label: 'Antracol 70 WP' },
                { href: '/pesticides/confidor-200-sl', label: 'Confidor 200 SL' },
                { href: '/pesticides/mancozeb-75-wp', label: 'Mancozeb 75 WP' },
                { href: '/pesticides/urea-46-n', label: 'Urea (46% N)' },
              ].map(l => (
                <a key={l.href} href={l.href} style={{ display: 'block', color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 8, textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.65)'}>{l.label}</a>
              ))}
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Farmers by Region</div>
              {[
                { href: '/farmers', label: 'All Regions' },
                { href: '/farmers/punjab-farmers', label: 'Punjab' },
                { href: '/farmers/sindh-farmers', label: 'Sindh' },
                { href: '/farmers/kpk-farmers', label: 'Khyber Pakhtunkhwa' },
                { href: '/farmers/balochistan-farmers', label: 'Balochistan' },
              ].map(l => (
                <a key={l.href} href={l.href} style={{ display: 'block', color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 8, textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.65)'}>{l.label}</a>
              ))}
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Learn</div>
              {[
                { href: '/learn', label: 'Crop Science Glossary' },
                { href: '/learn/ipm', label: 'What is IPM?' },
                { href: '/learn/economic-threshold', label: 'Economic Threshold' },
                { href: '/learn/systemic-fungicide', label: 'Systemic Fungicides' },
                { href: '/learn/neonicotinoid', label: 'Neonicotinoids' },
              ].map(l => (
                <a key={l.href} href={l.href} style={{ display: 'block', color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 8, textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.65)'}>{l.label}</a>
              ))}
            </div>
          </div>
           {/* Bottom bar */}
           <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
               <img src="assets/farmer-badge.png" alt="" width={32} height={32} style={{ borderRadius: '50%' }} />
               <div>
                 <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>ZARii AI</div>
                 <div style={{ fontSize: 11.5, opacity: 0.6 }}>© 2026 · Made with 🌱 in Lahore</div>
               </div>
             </div>
             <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
               <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
               <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
               <a href="/sitemap.xml" style={{ color: 'inherit', textDecoration: 'none' }}>Sitemap</a>
             </div>
           </div>
         </div>
       </footer>
     </div>
   );
};

const HeroVisual = ({ lang }) => {
  const [stage, setStage] = useS_L(0); // 0 = upload, 1 = analyzing, 2 = result
  useE_L(() => {
    const t1 = setTimeout(() => setStage(1), 1500);
    const t2 = setTimeout(() => setStage(2), 3500);
    const t3 = setTimeout(() => setStage(0), 8500);
    const loop = setInterval(() => {
      setStage(0);
      setTimeout(() => setStage(1), 1500);
      setTimeout(() => setStage(2), 3500);
    }, 9000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearInterval(loop); };
  }, []);

  return (
    <div style={{ position: 'relative', height: 580, display: 'flex', justifyContent: 'center' }}>
      {/* Ambient blob */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 60% 50%, rgba(157,203,124,0.35) 0%, transparent 60%)',
        filter: 'blur(40px)',
      }} />

      {/* Phone */}
      <div style={{
        position: 'relative',
        width: 320, height: 580,
        background: '#1a2a1f',
        borderRadius: 44,
        padding: 10,
        boxShadow: '0 30px 60px rgba(31,74,44,0.30), 0 12px 24px rgba(31,74,44,0.18)',
        animation: 'float 6s ease-in-out infinite',
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          width: 100, height: 26, background: '#0d1612', borderRadius: 999, zIndex: 5,
        }} />
        <div style={{
          width: '100%', height: '100%', borderRadius: 36,
          background: 'var(--bg)', overflow: 'hidden', position: 'relative',
        }}>
          {/* Status bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', fontSize: 12, fontWeight: 600, color: 'var(--green-900)' }}>
            <span>9:41</span>
            <span>●●● ◉ 100%</span>
          </div>
          {/* Header */}
          <div style={{ padding: '6px 18px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="arrow-left" size={18} color="var(--green-900)" />
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--green-900)' }}>Analyze crop</div>
          </div>

          {/* Image area */}
          <div style={{
            margin: '0 18px', height: 200, borderRadius: 18,
            background: 'linear-gradient(135deg, #4a7c3a 0%, #2E6B3F 60%, #1a4525 100%)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Faux leaf */}
            <svg width="160" height="160" viewBox="0 0 200 200" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
              <path d="M30 170 Q40 50 170 30 Q160 130 60 165 Q40 175 30 170Z" fill="#9DCB7C" />
              <path d="M30 170 Q100 100 170 30" stroke="#4a7c3a" strokeWidth="2" fill="none" />
              {/* spot lesions */}
              <circle cx="90" cy="90" r="8" fill="#8a5d2a" opacity="0.85" />
              <circle cx="120" cy="70" r="6" fill="#7a4d22" opacity="0.85" />
              <circle cx="70" cy="130" r="5" fill="#8a5d2a" opacity="0.7" />
            </svg>
            {/* Scan line */}
            {stage === 1 && (
              <div style={{
                position: 'absolute', left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, transparent, #F4A62A, transparent)',
                animation: 'scanline 1.5s linear infinite',
                boxShadow: '0 0 14px #F4A62A',
              }} />
            )}
            {/* Scan grid corners */}
            {[[8,8],[8,'auto',8],['auto',8,8],['auto',8,'auto',8]].map((c,i) => {
              const [t,r,b,l] = [c[0], c[1], c[2], c[3]];
              return <div key={i} style={{
                position: 'absolute', width: 18, height: 18,
                top: t === 'auto' ? 'auto' : t, right: r === 'auto' ? 'auto' : r,
                bottom: b === 'auto' ? 'auto' : b, left: l === 'auto' ? 'auto' : l,
                borderTop: t !== 'auto' ? '2.5px solid #F4A62A' : 'none',
                borderBottom: b !== 'auto' ? '2.5px solid #F4A62A' : 'none',
                borderLeft: l !== 'auto' ? '2.5px solid #F4A62A' : 'none',
                borderRight: r !== 'auto' ? '2.5px solid #F4A62A' : 'none',
              }} />;
            })}
          </div>

          {/* Result panel */}
          <div style={{ padding: 18 }}>
            {stage === 0 && (
              <div style={{ animation: 'fadeUp .3s' }}>
                <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 6 }}>Step 1 of 3</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--green-900)', marginBottom: 12 }}>Tap to capture or upload a leaf photo</div>
                <button style={{
                  width: '100%', padding: 14, background: 'var(--green-700)', color: '#fff',
                  borderRadius: 12, fontWeight: 600, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <Icon name="camera" size={18} color="#fff" /> Take photo
                </button>
              </div>
            )}
            {stage === 1 && (
              <div style={{ animation: 'fadeUp .3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green-700)', fontSize: 13, fontWeight: 600 }}>
                  <span style={{
                    width: 14, height: 14, border: '2px solid var(--green-300)',
                    borderTopColor: 'var(--green-700)', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}/>
                  ZARii is analyzing the leaf…
                </div>
                <div className="skeleton" style={{ height: 12, marginTop: 14, width: '90%' }} />
                <div className="skeleton" style={{ height: 12, marginTop: 8, width: '70%' }} />
                <div className="skeleton" style={{ height: 12, marginTop: 8, width: '80%' }} />
              </div>
            )}
            {stage === 2 && (
              <div style={{ animation: 'fadeUp .3s' }}>
                <div className="tag tag-amber" style={{ marginBottom: 8 }}>
                  <Icon name="shield" size={12} /> Diagnosis · 94% confidence
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-900)' }}>Early Blight</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-mute)', marginTop: 4 }}>Alternaria solani · on Tomato</div>
                <div style={{ marginTop: 12, padding: 10, background: 'var(--green-50)', borderRadius: 10, fontSize: 12.5 }}>
                  <div style={{ fontWeight: 600, color: 'var(--green-900)' }}>💊 Spray: Antracol 70 WP</div>
                  <div style={{ color: 'var(--ink-soft)', marginTop: 2 }}>Bayer · ₨ 1,180/kg · 2g per L water</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating chip - urdu */}
      <div style={{
        position: 'absolute', top: 60, left: -10,
        background: 'var(--paper)', padding: '12px 16px',
        borderRadius: 16, boxShadow: 'var(--shadow)',
        display: 'flex', alignItems: 'center', gap: 10,
        animation: 'float 5s ease-in-out infinite',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--amber)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="mic" size={16} color="#fff" />
        </div>
        <div className="urdu-inline" style={{ fontSize: 14, color: 'var(--green-900)', fontWeight: 500 }}>
          آلو کے پتے پیلے کیوں ہیں؟
        </div>
      </div>

      {/* Floating chip - PKR */}
      <div style={{
        position: 'absolute', bottom: 90, right: -20,
        background: 'var(--paper)', padding: '12px 16px',
        borderRadius: 16, boxShadow: 'var(--shadow)',
        display: 'flex', alignItems: 'center', gap: 10,
        animation: 'float 5.5s ease-in-out infinite 0.4s',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--green-500)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="pkr" size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600 }}>Antracol 70 WP</div>
          <div style={{ fontSize: 14, color: 'var(--green-900)', fontWeight: 700 }}>₨ 1,180/kg</div>
        </div>
      </div>
    </div>
  );
};

window.Landing = Landing;
