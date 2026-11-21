const articles = [
  {
    category: 'crop_cultivation',
    crop_name: 'Rice',
    title: 'Rice Cultivation Guide for Indian Farmers',
    title_hi: 'भारतीय किसानों के लिए धान की खेती गाइड',
    content: `## Rice Cultivation Guide

### Land Preparation
- Plough the field 2-3 times with a gap of 7 days between each ploughing
- Level the field using a laser land leveler for uniform water distribution
- Apply FYM (Farm Yard Manure) at 10-12 tonnes per hectare during last ploughing
- Puddle the field for transplanted rice by flooding and ploughing

### Seed Selection & Treatment
- Use certified seeds from authorized dealers
- Recommended varieties: Pusa Basmati 1121, Pusa 44, Swarna, IR-64, Samba Mahsuri
- Seed rate: 20-25 kg/hectare for transplanting, 80-100 kg/hectare for direct seeding
- Treat seeds with Carbendazim 2g/kg or Trichoderma viride 4g/kg

### Nursery Management
- Prepare raised nursery beds of 1m width and convenient length
- Sow pre-germinated seeds uniformly
- Maintain thin film of water initially, increase depth gradually
- Seedlings ready for transplanting in 20-25 days

### Transplanting
- Transplant 2-3 seedlings per hill at 20x15 cm spacing
- Maintain 2-3 cm water depth after transplanting
- Best time: Kharif - June to July (varies by region)

### Fertilizer Management
- Basal dose: 60 kg P2O5 + 40 kg K2O per hectare at transplanting
- First top dressing: 40 kg N/ha at tillering (21 days)
- Second top dressing: 40 kg N/ha at panicle initiation (45 days)
- Use Leaf Colour Chart (LCC) for need-based N application

### Water Management
- Maintain 5 cm water during tillering
- Drain field at maximum tillering for 2-3 days
- Maintain continuous flooding during flowering
- Drain 15 days before harvest

### Common Diseases
- Blast: Brown spots on leaves; spray Tricyclazole 75WP
- Bacterial Leaf Blight: Yellow-orange stripes; use resistant varieties
- Sheath Blight: Greenish-grey lesions; spray Hexaconazole

### Harvesting
- Harvest when 80% grains turn golden yellow
- Optimal grain moisture: 20-22%
- Dry to 14% moisture for safe storage

Source: ICAR-Indian Institute of Rice Research, Hyderabad`,
    content_hi: 'धान की खेती का विस्तृत मार्गदर्शन - भूमि तैयारी, बीज चयन, नर्सरी प्रबंधन, रोपाई, उर्वरक, सिंचाई, कीट-रोग प्रबंधन और कटाई।',
    source: 'ICAR-Indian Institute of Rice Research'
  },
  {
    category: 'crop_cultivation',
    crop_name: 'Wheat',
    title: 'Wheat Cultivation Best Practices',
    title_hi: 'गेहूं की खेती की सर्वोत्तम प्रथाएं',
    content: `## Wheat Cultivation Guide

### Climate & Soil
- Wheat requires cool and moist weather during growth, warm and dry weather during harvest
- Ideal temperature: 20-25°C during growth, 25-30°C at maturity
- Grows best in well-drained loamy to clay-loam soils with pH 6.0-7.5
- Does not tolerate waterlogging

### Varieties
- Timely sown (November): HD-2967, HD-3086, PBW-725, DBW-187
- Late sown (December): HD-3059, PBW-752, WH-1124
- Irrigated conditions: HD-2967, DBW-17
- Rainfed conditions: C-306, Lok-1

### Sowing
- Optimal sowing: November 1-25 (North India)
- Seed rate: 100 kg/hectare for timely sowing, 125 kg/ha for late sowing
- Row spacing: 20-22.5 cm
- Seed depth: 4-5 cm
- Seed treatment: Carboxin + Thiram (Vitavax Power) 2.5g/kg

### Fertilizer Schedule
- Basal (at sowing): 60 kg N + 60 kg P2O5 + 40 kg K2O per hectare
- First irrigation (21 days): 60 kg N per hectare
- With ZnSO4: 25 kg/ha as basal in zinc-deficient soils

### Irrigation (Critical Stages)
1. Crown Root Initiation (CRI): 20-25 DAS - MOST CRITICAL
2. Tillering: 40-45 DAS
3. Late Jointing: 60-65 DAS
4. Flowering: 80-85 DAS
5. Dough stage: 100-105 DAS
6. Grain filling: 115-120 DAS
- Minimum 4 irrigations: CRI, tillering, flowering, grain filling

### Disease Management
- Yellow rust: Yellow pustules on leaves; spray Propiconazole 25EC
- Karnal bunt: Black powder in grains; use resistant varieties
- Loose smut: Seed treatment with Vitavax

### Harvesting
- Harvest when grains are hard and golden
- Grain moisture: 12-14%
- Use combine harvester for large fields
- Expected yield: 45-55 quintals/hectare (irrigated)

Source: ICAR-Indian Institute of Wheat & Barley Research, Karnal`,
    content_hi: 'गेहूं की उन्नत खेती - जलवायु, किस्में, बुवाई, उर्वरक, सिंचाई, रोग प्रबंधन और कटाई का मार्गदर्शन।',
    source: 'ICAR-IIWBR Karnal'
  },
  {
    category: 'fertilizer',
    crop_name: null,
    title: 'Fertilizer Basics for Indian Farming',
    title_hi: 'भारतीय खेती के लिए उर्वरक की मूल बातें',
    content: `## Understanding Fertilizers

### Primary Nutrients (NPK)
- **Nitrogen (N)**: Promotes leaf and stem growth, green color. Deficiency causes yellowing of older leaves.
- **Phosphorus (P)**: Root development, flowering, seed formation. Deficiency causes purple/dark green leaves.
- **Potassium (K)**: Overall plant vigor, disease resistance, fruit quality. Deficiency causes leaf edge browning.

### Common Fertilizers Available in India
| Fertilizer | N% | P% | K% | Usage |
|-----------|-----|-----|-----|-------|
| Urea | 46 | 0 | 0 | Top dressing for nitrogen |
| DAP | 18 | 46 | 0 | Basal application |
| MOP (Muriate of Potash) | 0 | 0 | 60 | Basal + top dressing |
| NPK Complex (10:26:26) | 10 | 26 | 26 | Basal application |
| SSP (Single Super Phosphate) | 0 | 16 | 0 | Basal, also provides Sulphur |
| Ammonium Sulphate | 20.6 | 0 | 0 | Sulphur-deficient soils |

### Micronutrients
- **Zinc**: Most deficient micronutrient in Indian soils. Apply ZnSO4 25 kg/ha
- **Boron**: Important for flower/fruit crops. Apply Borax 10 kg/ha
- **Iron**: Deficiency in alkaline soils. Apply FeSO4 as foliar spray

### Soil Testing
- Get soil tested every 2-3 years from nearest Soil Testing Lab or KVK
- Collect soil samples from 15-20 cm depth, from multiple spots in the field
- Apply fertilizers as per Soil Health Card recommendations
- Use Soil Health Card portal: soilhealth.dac.gov.in

### Best Practices
1. Always apply phosphorus and potash as basal (at sowing)
2. Split nitrogen application into 2-3 doses
3. Apply fertilizers when soil is moist
4. Never mix urea with SSP or lime
5. Use neem-coated urea for slow release
6. Practice Integrated Nutrient Management (INM)
7. Apply FYM/compost along with chemical fertilizers

### Organic Alternatives
- Vermicompost: 2-3 tonnes/hectare
- Green manuring: Dhaincha, Sesbania
- Biofertilizers: Rhizobium (pulses), Azotobacter (cereals), PSB (all crops)

Source: ICAR Fertilizer Recommendations & Soil Health Card Scheme`,
    content_hi: 'उर्वरकों की मूल बातें - NPK, सामान्य उर्वरक, सूक्ष्म पोषक तत्व, मृदा परीक्षण और सर्वोत्तम प्रथाएं।',
    source: 'ICAR & Soil Health Card Scheme'
  },
  {
    category: 'irrigation',
    crop_name: null,
    title: 'Irrigation Techniques for Small Farmers',
    title_hi: 'छोटे किसानों के लिए सिंचाई तकनीक',
    content: `## Irrigation Methods for Indian Farmers

### Surface Irrigation
- **Flood Irrigation**: Traditional method, water flows across entire field. Simple but wastes 40-50% water.
- **Furrow Irrigation**: Water runs through channels between crop rows. Better for row crops like sugarcane, maize.
- **Border Strip**: Field divided into strips, water flows down slope. Good for wheat, fodder crops.

### Drip Irrigation
- Water delivered directly to plant roots through emitters
- Saves 30-50% water compared to flood irrigation
- Ideal for: Vegetables, fruits, cotton, sugarcane
- Government subsidy: 55% for small farmers, 45% for others under PMKSY
- Cost: ₹40,000-80,000 per hectare (before subsidy)
- Benefits: Less weed growth, uniform moisture, fertigation possible

### Sprinkler Irrigation
- Water sprayed like rain through sprinklers
- Saves 25-35% water
- Good for: Wheat, groundnut, pulses, vegetables
- Types: Portable (rain gun), Semi-permanent
- Subsidy: Up to 55% for small farmers under PMKSY

### Micro-Sprinkler
- Fine spray at low pressure near plant base
- Good for closely spaced crops and orchards
- Saves 20-30% water

### Water Management Tips
1. **Schedule irrigation** based on crop's critical stages, not fixed calendar
2. **Morning irrigation** reduces evaporation loss
3. **Mulching** (straw/plastic) reduces water requirement by 20-25%
4. **Laser leveling** ensures uniform water distribution, saves 25% water
5. **Measure soil moisture** - tensiometer or feel method
6. **Rainwater harvesting**: Build farm ponds for supplemental irrigation
7. **Alternate Wetting and Drying (AWD)** for rice saves 20-30% water

### PMKSY (Pradhan Mantri Krishi Sinchayee Yojana)
- 'Per Drop More Crop' component promotes micro irrigation
- Apply through state agriculture department
- Contact local agriculture officer for application

Source: ICAR-Indian Institute of Water Management`,
    content_hi: 'सिंचाई की विभिन्न विधियां - बाढ़, ड्रिप, स्प्रिंकलर, माइक्रो-स्प्रिंकलर और जल प्रबंधन युक्तियां।',
    source: 'ICAR-IIWM & PMKSY'
  },
  {
    category: 'government_schemes',
    crop_name: null,
    title: 'Government Schemes for Indian Farmers - Overview',
    title_hi: 'भारतीय किसानों के लिए सरकारी योजनाएं - अवलोकन',
    content: `## Major Government Schemes for Farmers

### PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)
- **Benefit**: ₹6,000 per year in 3 installments of ₹2,000 each
- **Eligibility**: All landholding farmer families
- **Apply**: Through local CSC center or pmkisan.gov.in
- **Documents**: Aadhaar card, bank account, land records

### PMFBY (Pradhan Mantri Fasal Bima Yojana)
- **Benefit**: Crop insurance at subsidized premium
- **Premium**: 2% for Kharif, 1.5% for Rabi, 5% for horticulture
- **Coverage**: Natural calamities, pest/disease damage
- **Apply**: Through bank at time of crop loan, or CSC center
- **Important**: Apply before sowing deadline for each season

### KCC (Kisan Credit Card)
- **Benefit**: Easy credit for crop production at 7% interest (4% with timely repayment)
- **Limit**: Based on land holding and crop
- **Apply**: Through any bank branch with land records
- **Additional**: Now includes animal husbandry and fisheries

### PMKSY (Pradhan Mantri Krishi Sinchayee Yojana)
- **Benefit**: Subsidy on micro-irrigation (drip/sprinkler)
- **Subsidy**: 55% for small/marginal farmers, 45% for others
- **Apply**: Through state agriculture department

### Soil Health Card Scheme
- **Benefit**: Free soil testing and fertilizer recommendations
- **Apply**: Contact local agriculture office or KVK
- **Portal**: soilhealth.dac.gov.in

### e-NAM (National Agriculture Market)
- **Benefit**: Online trading platform for agricultural produce
- **Purpose**: Better price discovery, transparent bidding
- **Register**: Through local APMC mandi

### PM Kisan Maan Dhan Yojana
- **Benefit**: ₹3,000/month pension after age 60
- **Contribution**: ₹55-200/month based on age of entry (18-40 years)
- **Apply**: Through CSC center

### Important Contacts
- Kisan Call Centre: 1800-180-1551 (Toll Free)
- PM-KISAN Helpline: 155261
- PMFBY Helpline: 1800-200-7710

**Note**: Scheme details may change. Always verify current terms with local agriculture office or official websites.

Source: Department of Agriculture & Farmers Welfare, Government of India`,
    content_hi: 'किसानों के लिए प्रमुख सरकारी योजनाएं - PM-KISAN, PMFBY, KCC, PMKSY और अन्य।',
    source: 'Department of Agriculture, GoI'
  },
  {
    category: 'pest_management',
    crop_name: null,
    title: 'Integrated Pest Management (IPM) for Indian Crops',
    title_hi: 'भारतीय फसलों के लिए एकीकृत कीट प्रबंधन (IPM)',
    content: `## Integrated Pest Management Guide

### What is IPM?
IPM combines biological, cultural, physical, and chemical methods to manage pests with minimal environmental impact. It aims to reduce pesticide use while maintaining crop protection.

### Cultural Practices
1. **Crop Rotation**: Alternate crops to break pest cycles
2. **Resistant Varieties**: Use pest-resistant varieties from ICAR/SAU recommendations
3. **Clean Cultivation**: Remove crop residues and weeds that harbor pests
4. **Proper Spacing**: Adequate spacing improves air circulation
5. **Timely Sowing**: Avoid peak pest periods
6. **Trap Crops**: Plant border rows to attract pests away from main crop

### Biological Control
- **Trichogramma cards**: For bollworm in cotton, stem borer in rice/sugarcane (8 cards/hectare)
- **Lady beetles**: Natural predator for aphids
- **Neem-based products**: Neem oil 3% or Azadirachtin 300ppm for sucking pests
- **NPV (Nuclear Polyhedrosis Virus)**: For Helicoverpa (pod borer) in chickpea/tomato
- **Trichoderma viride**: Soil application for root diseases (2.5 kg/ha with FYM)
- **Pseudomonas fluorescens**: Seed treatment for bacterial diseases

### Mechanical/Physical Methods
- **Pheromone traps**: Monitor and mass-trap specific pests (5 traps/hectare)
- **Yellow sticky traps**: For whiteflies, aphids (12-15 traps/hectare)
- **Light traps**: For monitoring moth populations (1 trap/5 hectare)
- **Hand picking**: For large caterpillars, egg masses
- **Bird perches**: Install T-shaped perches for predatory birds (20/hectare)

### Common Pests & Solutions
| Pest | Crops | IPM Solution |
|------|-------|-------------|
| Stem borer | Rice | Trichogramma cards, light traps, neem spray |
| Aphids | Wheat, Mustard | Lady beetles, neem oil spray, yellow traps |
| Bollworm | Cotton | Bt cotton, Trichogramma, NPV, pheromone traps |
| Fruit borer | Tomato | NPV, neem spray, pheromone traps |
| Pod borer | Chickpea | NPV, bird perches, intercropping |

### When to Use Chemical Pesticides
- Only when pest population crosses Economic Threshold Level (ETL)
- Use recommended pesticides at recommended dose
- Follow waiting period before harvest
- Rotate pesticide groups to prevent resistance
- Spray in morning (before 10 AM) or evening (after 4 PM)
- Wear protective gear while spraying
- Dispose empty containers safely

### Safety Rules
1. Never spray against the wind
2. Never eat, drink or smoke while handling pesticides
3. Wash hands and face thoroughly after spraying
4. Store pesticides away from food and children
5. Follow label instructions strictly

Source: ICAR-NCIPM (National Centre for Integrated Pest Management)`,
    content_hi: 'एकीकृत कीट प्रबंधन - सांस्कृतिक, जैविक, भौतिक और रासायनिक विधियां।',
    source: 'ICAR-NCIPM'
  },
  {
    category: 'crop_cultivation',
    crop_name: 'Tomato',
    title: 'Tomato Cultivation Guide',
    title_hi: 'टमाटर की खेती गाइड',
    content: `## Tomato Cultivation Guide

### Climate & Season
- Grows well in temperature 20-25°C
- Rabi season: September-October sowing (most regions)
- Kharif season: June-July (needs rain protection)
- Cannot tolerate frost or waterlogging

### Varieties
- Hybrid: Arka Rakshak, Arka Samrat (disease resistant)
- Open-pollinated: Pusa Ruby, Pusa Early Dwarf, Arka Vikas
- Cherry tomato: Arka Abhijit

### Nursery & Transplanting
- Raise seedlings in nursery for 25-30 days
- Seed rate: 400-500g per hectare
- Treat seeds with Trichoderma viride 4g/kg
- Transplant at 60x45 cm spacing
- Transplant in evening or on cloudy days

### Fertilizer
- FYM: 25 tonnes/hectare
- Basal: 60 kg N + 80 kg P2O5 + 60 kg K2O per hectare
- Top dressing: 60 kg N/ha at 30 and 60 days after transplanting
- Micronutrients: Boron and calcium sprays during flowering

### Irrigation
- Drip irrigation recommended (saves 40% water)
- Critical stages: transplanting, flowering, fruit development
- Avoid overhead irrigation (increases disease)
- Mulching with black polythene reduces water need

### Common Problems
- **Early Blight**: Brown spots with concentric rings. Spray Mancozeb
- **Late Blight**: Water-soaked patches. Spray Metalaxyl + Mancozeb
- **Leaf Curl Virus**: Upward curling of leaves. Control whitefly vector
- **Fruit Borer**: Spray NPV or neem-based pesticides
- **Blossom End Rot**: Calcium deficiency. Spray CaCl2

### Staking
- Support plants with stakes or trellises
- Improves fruit quality and reduces disease
- Makes harvesting easier

### Harvesting
- Start harvesting 60-70 days after transplanting
- Pick at turning stage (green to pink) for distant markets
- Pick at red-ripe stage for local markets
- Handle carefully to avoid bruising
- Expected yield: 25-40 tonnes/hectare

Source: ICAR-Indian Institute of Vegetable Research, Varanasi`,
    content_hi: 'टमाटर की उन्नत खेती - जलवायु, किस्में, नर्सरी, उर्वरक, सिंचाई, रोग प्रबंधन और कटाई।',
    source: 'ICAR-IIVR Varanasi'
  },
  {
    category: 'crop_cultivation',
    crop_name: 'Potato',
    title: 'Potato Cultivation Guide',
    title_hi: 'आलू की खेती गाइड',
    content: `## Potato Cultivation Guide

### Climate & Soil
- Cool season crop: 15-25°C ideal
- Sowing: October-November (North India), November-December (Central India)
- Well-drained sandy loam to loamy soil
- pH 5.5-6.5 ideal
- Cannot tolerate waterlogging or frost

### Varieties
- Early (70-80 days): Kufri Ashoka, Kufri Pukhraj, Kufri Surya
- Medium (90-100 days): Kufri Jyoti, Kufri Bahar, Kufri Badshah
- Late (100-120 days): Kufri Sindhuri, Kufri Dewa
- Processing: Kufri Chipsona, Kufri Himsona

### Seed Preparation
- Use certified seed tubers (25-40g size)
- Seed rate: 25-30 quintals/hectare
- Treat seed tubers with Mancozeb 0.25% for 10 minutes
- Pre-sprouting improves uniform emergence

### Planting
- Ridge planting: 60 cm between ridges, 20 cm between tubers
- Plant at 5-7 cm depth
- Earthing up at 30 and 45 days after planting

### Fertilizer
- FYM: 25-30 tonnes/hectare
- Basal: 120 kg N + 80 kg P2O5 + 80 kg K2O per hectare
- Apply half N as basal, half at first earthing up
- Full P and K as basal

### Irrigation
- First irrigation immediately after planting (light)
- Interval: 7-10 days depending on soil and weather
- Critical stages: Stolon formation, tuber initiation, tuber bulking
- Stop irrigation 10 days before harvesting
- Total 8-12 irrigations needed

### Major Diseases
- **Late Blight**: Most destructive. Brown water-soaked patches. Spray Mancozeb + Metalaxyl
- **Early Blight**: Brown spots with concentric rings. Spray Mancozeb
- **Black Scurf**: Black masses on tubers. Seed treatment with Boric acid 3%

### Harvesting & Storage
- Harvest when plant foliage turns yellow and dries
- Cut foliage 10-12 days before harvesting (skin hardening)
- Avoid harvesting in rain or wet soil
- Cure tubers for 10-15 days in shade
- Store in cold storage (2-4°C) or country stores with diffused light
- Expected yield: 25-35 tonnes/hectare

Source: ICAR-Central Potato Research Institute, Shimla`,
    content_hi: 'आलू की उन्नत खेती - जलवायु, किस्में, बीज, रोपण, उर्वरक, सिंचाई, रोग और भंडारण।',
    source: 'ICAR-CPRI Shimla'
  },
  {
    category: 'organic_farming',
    crop_name: null,
    title: 'Introduction to Organic Farming',
    title_hi: 'जैविक खेती का परिचय',
    content: `## Organic Farming Guide

### What is Organic Farming?
Organic farming avoids synthetic chemicals and uses natural inputs to maintain soil health and produce safe food. India has the highest number of organic farmers globally (over 15 lakh).

### Key Principles
1. Maintain soil health through compost and green manure
2. Use biological pest control methods
3. Practice crop rotation and mixed cropping
4. Conserve water and natural resources
5. Avoid GMOs and synthetic chemicals

### Organic Nutrient Management
- **FYM (Farm Yard Manure)**: 10-15 tonnes/hectare
- **Vermicompost**: 3-5 tonnes/hectare
- **Green Manuring**: Dhaincha, Sesbania, Sunhemp (ploughed under at 45 days)
- **Compost**: Nadep method, NADEP composting
- **Panchagavya**: Fermented mixture for foliar spray (3% solution)
- **Jeevamrut**: Soil application for microbial enrichment (500 litres/hectare)
- **Biofertilizers**: Rhizobium, Azotobacter, PSB, Mycorrhiza

### Organic Pest Management
- Neem oil spray (3-5 ml/litre)
- Dashparni Ark (10 plant extract mixture)
- Pheromone traps and yellow sticky traps
- Trichogramma cards for borers
- Beauveria bassiana for soil insects
- Companion planting (marigold with vegetables)

### Certification
- **PGS (Participatory Guarantee System)**: Group certification for local markets
- **Third Party Certification**: For export and premium markets (NPOP standards)
- **Transition Period**: 2-3 years from conventional to certified organic
- Register at: pgsindia-ncof.gov.in

### Government Support
- **Paramparagat Krishi Vikas Yojana (PKVY)**: ₹50,000/hectare over 3 years for clusters of farmers
- **Mission Organic Value Chain (MOVCDNER)**: For NE states
- Apply through local agriculture office

### Marketing
- Organic produce commands 20-30% premium
- Sell through: organic mandis, online platforms, farmer markets
- Platforms: jaivikkheti.in, organic stores

Source: ICAR-NPOF (National Project on Organic Farming) & NCOF`,
    content_hi: 'जैविक खेती - सिद्धांत, जैविक पोषण, कीट प्रबंधन, प्रमाणीकरण और सरकारी सहायता।',
    source: 'ICAR-NPOF & NCOF'
  },
  {
    category: 'soil_management',
    crop_name: null,
    title: 'Soil Types and Management in India',
    title_hi: 'भारत में मिट्टी के प्रकार और प्रबंधन',
    content: `## Understanding Indian Soils

### Major Soil Types

#### 1. Alluvial Soil
- **Location**: Indo-Gangetic plains, river valleys (UP, Punjab, Haryana, Bihar, WB)
- **Properties**: Rich in potash, low in phosphorus and nitrogen
- **pH**: 6.5-8.4
- **Suitable Crops**: Rice, wheat, sugarcane, maize, pulses, vegetables
- **Management**: Add phosphatic fertilizers, practice crop rotation

#### 2. Black Soil (Regur/Cotton Soil)
- **Location**: Deccan Plateau (Maharashtra, MP, Gujarat, AP, Karnataka)
- **Properties**: High clay content, retains moisture, cracks when dry
- **pH**: 7.2-8.5
- **Suitable Crops**: Cotton, soybean, jowar, wheat, groundnut, citrus
- **Management**: Avoid waterlogging, add gypsum for sodic conditions, deep ploughing in summer

#### 3. Red Soil
- **Location**: Eastern and Southern India (Tamil Nadu, Karnataka, AP, Odisha, Jharkhand)
- **Properties**: Low in nitrogen, phosphorus, and humus; porous
- **pH**: 5.5-6.5
- **Suitable Crops**: Groundnut, potato, tomato, maize, millets, tobacco
- **Management**: Add organic matter, lime for acidity, balanced NPK

#### 4. Laterite Soil
- **Location**: Western Ghats, Eastern Ghats, NE India (Kerala, Assam, Meghalaya)
- **Properties**: Rich in iron and aluminium, poor in organic matter
- **pH**: 4.5-6.0 (acidic)
- **Suitable Crops**: Tea, coffee, rubber, cashew, coconut, arecanut
- **Management**: Heavy liming, organic matter addition, mulching

#### 5. Sandy/Desert Soil
- **Location**: Rajasthan, parts of Gujarat, Haryana
- **Properties**: Low water holding capacity, low fertility
- **pH**: 7.0-8.5
- **Suitable Crops**: Bajra, jowar, guar, moth bean, sesame, dates
- **Management**: Drip irrigation, mulching, windbreaks, organic matter

### Soil Health Indicators
- **Good soil** has earthworms, smells earthy, crumbles easily
- **Poor soil** is compacted, crusted, has poor drainage
- Get **Soil Health Card** tested every 2-3 years
- Maintain organic carbon above 0.5%

### Improving Soil Health
1. Add FYM/compost regularly (10-15 tonnes/hectare)
2. Practice crop rotation with legumes
3. Green manuring with Dhaincha/Sesbania
4. Avoid burning crop residues
5. Minimum tillage where possible
6. Mulching to conserve moisture and add organic matter
7. Use biofertilizers (Azotobacter, PSB, Rhizobium)

Source: ICAR-NBSS&LUP (National Bureau of Soil Survey & Land Use Planning)`,
    content_hi: 'भारतीय मिट्टी के प्रकार - जलोढ़, काली, लाल, लेटराइट, बलुई मिट्टी और उनका प्रबंधन।',
    source: 'ICAR-NBSS&LUP'
  }
];

function seedKnowledge(db) {
  const existing = db.prepare('SELECT COUNT(*) as count FROM knowledge_articles').get();
  if (existing.count > 0) {
    console.log('Knowledge articles already seeded, skipping...');
    return;
  }

  const getCropId = db.prepare('SELECT id FROM crops WHERE name = ?');
  const insert = db.prepare(
    'INSERT INTO knowledge_articles (category, crop_id, title, title_hi, content, content_hi, source) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const seedAll = db.transaction(() => {
    for (const article of articles) {
      let cropId = null;
      if (article.crop_name) {
        const crop = getCropId.get(article.crop_name);
        if (crop) cropId = crop.id;
      }
      insert.run(article.category, cropId, article.title, article.title_hi, article.content, article.content_hi, article.source);
    }
  });

  seedAll();
  console.log(`Seeded ${articles.length} knowledge articles`);
}

module.exports = { seedKnowledge };
