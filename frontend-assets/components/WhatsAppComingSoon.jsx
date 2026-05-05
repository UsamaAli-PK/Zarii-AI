/* global React */
/* global Logo, Icon */

const { useState } = React;

const WhatsAppComingSoon = ({ lang, navigate }) => {
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const t = {
    en: {
      title: "WhatsApp Bot — Coming Soon",
      sub: "We're building AI-powered crop diagnosis over WhatsApp for Pakistani farmers. You'll be the first to know.",
      placeholder: "Enter phone or email",
      btn: "Join Waitlist",
      back: "Back to App",
      thanks: "You're on the list! We'll notify you soon."
    },
    ur: {
      title: "واٹس ایپ بوٹ — جلد آ رہا ہے",
      sub: "ہم پاکستانی کسانوں کے لیے واٹس ایپ پر اے آئی کے ذریعے فصلوں کی تشخیص بنا رہے ہیں۔ آپ کو سب سے پہلے معلوم ہوگا۔",
      placeholder: "فون یا ای میل درج کریں",
      btn: "ویٹ لسٹ میں شامل ہوں",
      back: "ایپ پر واپس جائیں",
      thanks: "آپ فہرست میں شامل ہیں! ہم آپ کو جلد مطلع کریں گے۔"
    }
  }[lang || 'en'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contact) return;
    setLoading(true);
    
    window.API.joinWaitlist(null, 'whatsapp', contact)
      .then(() => {
        setSuccess(true);
      })
      .catch(err => {
        console.error("Waitlist error:", err);
        // Fallback to success for demo/now
        setSuccess(true);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="coming-soon-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F2A1A 0%, #1A3C2A 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      textAlign: 'center',
      color: '#FFFFFF'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: 32,
        padding: '48px 32px',
        maxWidth: 480,
        width: '100%',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        <div style={{ marginBottom: 32 }}>
          <Logo size={64} />
        </div>

        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 10px 20px rgba(37, 211, 102, 0.3)'
        }}>
          <Icon name="message-circle" size={40} color="#FFF" />
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: '#9DCB7C' }}>
          {t.title}
        </h1>
        
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', marginBottom: 32 }}>
          {t.sub}
        </p>

        {!success ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              className="input-field"
              placeholder={t.placeholder}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: '16px 20px',
                color: '#FFF',
                fontSize: 16,
                textAlign: 'center'
              }}
            />
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{
                background: '#25D366',
                borderColor: '#25D366',
                color: '#FFF',
                fontWeight: 700,
                borderRadius: 16,
                height: 56
              }}
            >
              {loading ? "..." : t.btn}
            </button>
          </form>
        ) : (
          <div style={{ 
            padding: 20, 
            background: 'rgba(157,203,124,0.1)', 
            borderRadius: 16, 
            border: '1px solid rgba(157,203,124,0.2)',
            color: '#9DCB7C',
            fontWeight: 600
          }}>
            {t.thanks}
          </div>
        )}

        <button 
          onClick={() => navigate('dashboard')}
          style={{
            marginTop: 32,
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {t.back}
        </button>
      </div>
    </div>
  );
};

window.WhatsAppComingSoon = WhatsAppComingSoon;
