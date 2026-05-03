'use strict';

const { slug } = require('./ssrShell');

const DISEASES = [
  {
    name: 'Yellow Rust',
    slug: 'yellow-rust-wheat',
    crop: 'Wheat',
    pathogen: 'Puccinia striiformis f. sp. tritici',
    type: 'Fungal',
    regions: ['Faisalabad', 'Sahiwal', 'Lahore', 'Gujranwala', 'Punjab'],
    season: 'November to March (Rabi)',
    symptoms: [
      'Yellow to orange stripe-like pustules along leaf veins',
      'Premature leaf death reducing photosynthesis',
      'Severe lodging and grain shriveling at high pressure',
      'Pustules turn dark brown (uredinia) at maturity',
    ],
    causes: 'Cool, moist weather (10–15°C) with high humidity or dew. Wind-dispersed spores spread across fields rapidly.',
    yield_loss: 'Up to 70% in susceptible varieties under severe infection',
    treatment: [
      { product: 'Tilt 250 EC (Propiconazole)', rate: '0.5 ml/L water', timing: 'At first sign of infection' },
      { product: 'Amistar (Azoxystrobin)', rate: '1 ml/L water', timing: 'Preventive or early curative' },
      { product: 'Score 250 EC (Difenoconazole)', rate: '0.5 ml/L water', timing: 'Curative, up to 14 DAI' },
    ],
    prevention: [
      'Plant resistant varieties (Pakistan AARI recommends Faisalabad-2008, Sehar-2006)',
      'Apply nitrogen in split doses — excessive N increases susceptibility',
      'Scout fields weekly from November through March',
      'Remove volunteer wheat plants that harbour spores off-season',
    ],
    faqs: [
      {
        q: 'How do I identify Yellow Rust on wheat in Pakistan?',
        a: 'Yellow Rust appears as bright yellow-orange powdery stripes running parallel to leaf veins. Rub your finger across the stripe — if yellow powder transfers, it is Yellow Rust (also called Stripe Rust). It first appears on the youngest, uppermost leaves.',
      },
      {
        q: 'When is Yellow Rust season in Punjab, Pakistan?',
        a: 'Yellow Rust is most active from November to March during Pakistan\'s Rabi (winter crop) season. Cool temperatures between 10–15°C and morning dew create ideal conditions for spore germination and spread.',
      },
      {
        q: 'Which fungicide works best against Yellow Rust in Pakistan?',
        a: 'Propiconazole (Tilt 250 EC) and Tebuconazole are the most widely used and recommended fungicides for Yellow Rust in Pakistan. Apply at the first sign of infection at 0.5 ml per litre of water. Azoxystrobin (Amistar) works well as a preventive spray.',
      },
      {
        q: 'How much yield loss does Yellow Rust cause?',
        a: 'Yellow Rust can cause 20–70% yield loss in susceptible wheat varieties under high disease pressure. Faisalabad, Gujranwala, and Sahiwal districts in Punjab are most at risk. Early detection and spray reduces losses to under 5%.',
      },
    ],
    urdu_name: 'گندم کا پیلا زنگ',
    stats: { affected_farms: '380+', regions_affected: '5 Punjab districts', yield_loss_avg: '20–70%', season_months: 'Nov–Mar' },
  },
  {
    name: 'Cotton Whitefly',
    slug: 'whitefly-cotton',
    crop: 'Cotton',
    pathogen: 'Bemisia tabaci',
    type: 'Insect Pest',
    regions: ['Multan', 'Bahawalpur', 'Rahim Yar Khan', 'Sahiwal', 'Vehari', 'Punjab', 'Sindh'],
    season: 'June to October (Kharif)',
    symptoms: [
      'Sticky honeydew secretion on leaves causing sooty mold',
      'Yellowing (chlorosis) and curling of leaves',
      'Premature leaf drop reducing boll development',
      'Transmission of Cotton Leaf Curl Virus (CLCuV)',
    ],
    causes: 'Hot, dry conditions (35–40°C) accelerate whitefly reproduction. Each female lays 150–300 eggs. Heavy pesticide use kills natural predators, causing population explosions.',
    yield_loss: '30–80% in severe outbreaks; entire crop failure possible when CLCuV transmission occurs',
    treatment: [
      { product: 'Confidor 200 SL (Imidacloprid)', rate: '0.5 ml/L water', timing: 'At 10–15 adults per leaf' },
      { product: 'Actara 25 WG (Thiamethoxam)', rate: '0.4 g/L water', timing: 'Rotate after 2 sprays to avoid resistance' },
      { product: 'Karate 2.5 EC (Lambda-cyhalothrin)', rate: '0.8 ml/L water', timing: 'Evening application preferred' },
    ],
    prevention: [
      'Monitor using yellow sticky traps — 1 trap per acre',
      'Avoid excessive nitrogen fertilization which promotes soft, susceptible growth',
      'Preserve natural enemies: lady beetles, lacewings, parasitic wasps',
      'Use reflective mulches to deter whitefly landing on young plants',
      'Plant resistant/tolerant varieties certified by Pakistan\'s CCRI',
    ],
    faqs: [
      {
        q: 'How do I know if my cotton has whitefly?',
        a: 'Shake a cotton leaf gently — if tiny white insects fly up in a cloud, you have whitefly. Check the undersides of leaves for white waxy insects and yellow eggs. Sticky, shiny honeydew residue on leaves and black sooty mold are secondary signs.',
      },
      {
        q: 'Is whitefly in cotton related to Cotton Leaf Curl Virus?',
        a: 'Yes. Bemisia tabaci whitefly is the primary vector of Cotton Leaf Curl Virus (CLCuV), the most damaging cotton disease in Pakistan. A single viruliferous whitefly can infect a plant. Controlling whitefly populations below threshold (10–15 per leaf) is the only effective way to limit CLCuV spread.',
      },
      {
        q: 'Which districts in Punjab have the worst whitefly outbreak in 2026?',
        a: 'Multan and Bahawalpur districts currently show Critical pressure — 1,840 and 920 farms affected respectively according to ZARii AI outbreak monitoring data as of May 2026. Sahiwal (Bollworm co-infection), Rahim Yar Khan, and Vehari are also High-pressure zones.',
      },
      {
        q: 'When should I spray for whitefly on cotton?',
        a: 'Spray when you count 10–15 adult whiteflies on the underside of 3 leaves per plant, sampled from 10 plants per acre. Spray in the evening when temperatures are below 35°C for best insecticide efficacy. Rotate chemical classes every 2 sprays to prevent resistance.',
      },
    ],
    urdu_name: 'کپاس کی سفید مکھی',
    stats: { affected_farms: '1,840+ (Multan)', regions_affected: '6+ Punjab districts', yield_loss_avg: '30–80%', season_months: 'Jun–Oct' },
  },
  {
    name: 'Bollworm',
    slug: 'bollworm-cotton',
    crop: 'Cotton',
    pathogen: 'Helicoverpa armigera / Pectinophora gossypiella',
    type: 'Insect Pest',
    regions: ['Sahiwal', 'Faisalabad', 'Multan', 'Punjab'],
    season: 'July to October (Kharif)',
    symptoms: [
      'Entry holes in cotton bolls with frass (excrement) visible',
      'Premature boll opening with damaged lint',
      'Larvae inside bolls feeding on seeds and fiber',
      'Square (flower bud) shedding from young plant attack',
    ],
    causes: 'Helicoverpa moth lays eggs on tender parts; larvae bore into bolls within 48 hours of hatching. Pectinophora (Pink Bollworm) lays eggs inside bolls — harder to detect.',
    yield_loss: '20–60% depending on infestation timing and variety',
    treatment: [
      { product: 'Karate 2.5 EC (Lambda-cyhalothrin)', rate: '0.8 ml/L water', timing: 'At first egg mass sighting' },
      { product: 'Sarbex 5G (Carbofuran)', rate: '20 kg/acre soil application', timing: 'At transplanting for soil-borne larvae' },
      { product: 'Bacillus thuringiensis (Bt) sprays', rate: '1–2 g/L water', timing: 'Preventive, every 7–10 days' },
    ],
    prevention: [
      'Use pheromone traps — 5 per acre for Helicoverpa monitoring',
      'Plant Bt cotton varieties (Bollgard II) approved by Punjab government',
      'Avoid late-season nitrogen application which extends crop vulnerability period',
      'Destroy crop residue immediately after harvest to eliminate pupae',
    ],
    faqs: [
      {
        q: 'How do I identify bollworm damage in cotton?',
        a: 'Look for round entry holes in green bolls with moist frass (dark granular excrement) at the hole entrance. Cut open affected bolls — you will find cream to brown caterpillars (8–40mm long). Pink Bollworm damage appears as "rosette" flowers that fail to open properly.',
      },
      {
        q: 'What is the economic threshold for bollworm spray?',
        a: 'In Pakistan, the economic threshold for Helicoverpa is when 10% of cotton squares (flower buds) or bolls show fresh damage, or when pheromone traps catch more than 8 moths per trap per night for 3 consecutive nights. Do not spray below threshold.',
      },
    ],
    urdu_name: 'گلابی سنڈی',
    stats: { affected_farms: '420+ (Sahiwal)', regions_affected: '4 Punjab districts', yield_loss_avg: '20–60%', season_months: 'Jul–Oct' },
  },
  {
    name: 'Mango Anthracnose',
    slug: 'anthracnose-mango',
    crop: 'Mango',
    pathogen: 'Colletotrichum gloeosporioides',
    type: 'Fungal',
    regions: ['Multan', 'Hyderabad', 'Mirpur Khas', 'Sindh', 'Southern Punjab'],
    season: 'March to June (flowering and harvest)',
    symptoms: [
      'Black to brown irregular spots on leaves, flowers, and fruit',
      'Blossom blight causing flower cluster death before fruit set',
      'Sunken dark lesions on developing and ripe mango fruit',
      'Post-harvest fruit rot in storage — spreads rapidly at 25–30°C',
    ],
    causes: 'Colletotrichum spores spread in rain splash and wind. Warm temperatures (25–30°C) with high humidity trigger infection. Infection begins at flowering; symptoms appear later.',
    yield_loss: '20–50% at flowering; up to 80% post-harvest losses in wet years',
    treatment: [
      { product: 'Antracol 70 WP (Propineb)', rate: '2.5 g/L water', timing: 'At 5% flowering, repeat every 10 days' },
      { product: 'Score 250 EC (Difenoconazole)', rate: '0.5 ml/L water', timing: 'Curative: apply within 4 days of infection' },
      { product: 'Ridomil Gold MZ', rate: '2 g/L water', timing: 'Tank-mix with Score for broad-spectrum control' },
    ],
    prevention: [
      'Prune dead wood and improve canopy air circulation before flowering',
      'Apply copper-based sprays (Copper Oxychloride 50 WP) during dormancy',
      'Hot water treatment (52°C for 5 minutes) for harvested fruit before storage',
      'Handle harvested fruit carefully — wounds are anthracnose entry points',
    ],
    faqs: [
      {
        q: 'Why do my mangoes have black spots in Pakistan?',
        a: 'Black spots on Pakistani mangoes are almost always Anthracnose (Colletotrichum gloeosporioides). The fungus infects during humid flowering season and symptoms appear on ripening fruit. Mangoes from Multan and Hyderabad districts are most commonly affected, especially in years with heavy March–April rainfall.',
      },
      {
        q: 'How do I prevent anthracnose on Sindhri and Chaunsa mango varieties?',
        a: 'Begin Propineb (Antracol 70 WP) sprays at 5% flowering and continue every 10 days until harvest. Both Sindhri and Chaunsa are moderately susceptible. Improve canopy airflow through annual pruning. In wet years, add Difenoconazole (Score 250 EC) as a curative spray within 4 days of rainfall.',
      },
    ],
    urdu_name: 'آم کا اینتھریکنوز',
    stats: { affected_farms: '180+ (Hyderabad)', regions_affected: 'Sindh & Southern Punjab', yield_loss_avg: '20–80%', season_months: 'Mar–Jun' },
  },
  {
    name: 'Rice Bacterial Leaf Blight',
    slug: 'bacterial-leaf-blight-rice',
    crop: 'Rice',
    pathogen: 'Xanthomonas oryzae pv. oryzae',
    type: 'Bacterial',
    regions: ['Sukkur', 'Larkana', 'Sheikhupura', 'Gujranwala', 'Sindh'],
    season: 'July to October (Kharif)',
    symptoms: [
      'Water-soaked lesions on leaf margins that turn yellow then white',
      '"Kresek" phase: wilting of young seedlings that rapidly die',
      'Cream-coloured bacterial ooze visible on cut stems in morning dew',
      'Leaf drying from tips progressing towards midrib',
    ],
    causes: 'Xanthomonas bacteria spread through water, infected seeds, and wounds from wind or insects. Flood irrigation and cyclone damage create mass infection events.',
    yield_loss: '20–50% in susceptible varieties; near 100% in Kresek-affected nurseries',
    treatment: [
      { product: 'Copper Oxychloride 50 WP', rate: '2.5 g/L water', timing: 'At first symptom, repeat every 10–14 days' },
      { product: 'Streptomycin Sulphate + Tetracycline', rate: '0.5 g/L water', timing: 'Early infection only; avoid over-use' },
    ],
    prevention: [
      'Use certified disease-free seed treated with hot water (52°C for 10 min)',
      'Plant resistant varieties: IR-64, Basmati 2000, Super Basmati (moderate resistance)',
      'Avoid excessive nitrogen — nitrogen-rich plants are far more susceptible',
      'Drain and dry fields periodically to reduce Xanthomonas survival',
    ],
    faqs: [
      {
        q: 'How is Bacterial Leaf Blight different from blast in rice?',
        a: 'Bacterial Leaf Blight starts at leaf margins and spreads inward, creating a wavy yellow-white border. Rice Blast creates diamond-shaped lesions with grey centres and dark brown borders anywhere on the leaf. BLB produces bacterial ooze visible in morning dew; Blast produces visible grey fungal sporulation in humid conditions.',
      },
      {
        q: 'Can I treat Bacterial Leaf Blight with fungicides?',
        a: 'No. Bacterial Leaf Blight is caused by bacteria (Xanthomonas), not a fungus. Fungicides will not work. Use copper-based bactericides (Copper Oxychloride) or streptomycin-based products. Resistant varieties and good water management are the most effective long-term controls.',
      },
    ],
    urdu_name: 'چاول کا جراثیمی پتہ جھلساؤ',
    stats: { affected_farms: '95+ (Sukkur)', regions_affected: 'Sindh & Gujranwala', yield_loss_avg: '20–50%', season_months: 'Jul–Oct' },
  },
];

module.exports = { DISEASES };
