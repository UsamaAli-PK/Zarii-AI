const router = require('express').Router();
const multer = require('multer');
const supabase = require('../supabase');
const auth = require('../middleware/auth');
const { diagnoseImage } = require('../services/aiRouter');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/diagnose
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { crop_type, lang, image_url } = req.body;
    const userId = req.user.id;

    let imageBase64 = null;
    let finalImageUrl = image_url || null;

    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
      const filename = `scan-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from('scans')
        .upload(`images/${filename}`, req.file.buffer, {
          contentType: req.file.mimetype || 'image/jpeg',
          upsert: false,
        });
      if (!uploadErr) {
        const { data: signed } = await supabase.storage.from('scans').createSignedUrl(`images/${filename}`, 86400 * 30);
        finalImageUrl = signed?.signedUrl || null;
      }
    }

    if (!imageBase64 && !image_url) {
      return res.status(400).json({ error: 'Image file or image_url required' });
    }

    const diagnosis = await diagnoseImage({
      imageBase64,
      imageUrl: image_url,
      cropType: crop_type,
      lang: lang || 'ur',
      userId,
    });

    const { data: sponsoredProducts } = await supabase
      .from('sponsored_products')
      .select('*, catalog(name, company, pkr_price, dosage), sponsors(name)')
      .eq('status', 'Active')
      .order('boost_weight', { ascending: false })
      .limit(1);

    const { data: scanRow } = await supabase.from('scans').insert({
      user_id: userId,
      crop_type: crop_type || null,
      image_url: finalImageUrl,
      disease_name: diagnosis.disease_name,
      disease_name_ur: diagnosis.disease_name_ur,
      pathogen: diagnosis.pathogen,
      confidence: diagnosis.confidence,
      severity: diagnosis.severity,
      symptoms: diagnosis.symptoms || [],
      prevention: diagnosis.prevention || [],
      ai_provider: diagnosis.ai_provider,
      processing_ms: diagnosis.processing_ms,
    }).select('id').single();

    const scanId = scanRow?.id;

    if (scanId) {
      await supabase.from('treatments').insert({
        scan_id: scanId,
        catalog_id: null,
        is_primary: true,
        dosage: diagnosis.primary_treatment?.dosage,
        schedule: diagnosis.primary_treatment?.schedule,
        is_sponsored: false,
      });
    }

    if (sponsoredProducts && sponsoredProducts.length > 0) {
      await supabase.from('sponsored_products')
        .update({ impressions_today: (sponsoredProducts[0].impressions_today || 0) + 1 })
        .eq('id', sponsoredProducts[0].id);
    }

    const altTreatments = (diagnosis.alt_treatments || []).map(t => {
      const sponsored = (sponsoredProducts || []).find(sp =>
        sp.catalog?.name?.toLowerCase().includes(t.name?.toLowerCase().split(' ')[0])
      );
      return { ...t, is_sponsored: !!sponsored, sponsor_name: sponsored?.sponsors?.name };
    });

    res.json({
      scan_id: scanId,
      disease: {
        name: diagnosis.disease_name,
        name_ur: diagnosis.disease_name_ur,
        pathogen: diagnosis.pathogen,
        confidence: diagnosis.confidence,
        severity: diagnosis.severity,
      },
      symptoms: diagnosis.symptoms || [],
      prevention: diagnosis.prevention || [],
      treatment: {
        primary: { ...diagnosis.primary_treatment, is_sponsored: false },
        alternatives: altTreatments,
      },
      ai_provider: diagnosis.ai_provider,
      processing_ms: diagnosis.processing_ms,
      image_url: finalImageUrl,
    });
  } catch (err) {
    console.error('diagnose error:', err);
    res.status(500).json({ error: 'Diagnosis failed: ' + err.message });
  }
});

// POST /api/diagnose/:id/feedback
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { feedback } = req.body;
    if (!['positive', 'negative', 'neutral'].includes(feedback)) {
      return res.status(400).json({ error: 'feedback must be positive|negative|neutral' });
    }
    const { data: scan } = await supabase.from('scans').select('id').eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    await supabase.from('scans').update({ user_feedback: feedback }).eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('feedback error:', err);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

module.exports = router;
