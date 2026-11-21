const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_URL = 'https://api.x.ai/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Intelligent ICAR Agricultural Fallback Engine
 * Generates tailored, stage-specific agricultural advisory
 */
function generateAgriculturalAdvisory(message, context = {}) {
  const { user, profile, farmerCrops, language } = context;
  const isHi = language === 'hi';
  const q = (message || '').toLowerCase();

  const primaryCrop = (farmerCrops && farmerCrops.length > 0) ? farmerCrops[0] : null;
  const cropName = primaryCrop?.crop_name || 'Crop';
  const cropStage = primaryCrop?.growth_stage?.current_stage || primaryCrop?.current_stage?.name || 'Vegetative';

  // 1. Irrigation queries
  if (q.includes('irriga') || q.includes('water') || q.includes('सिंचाई') || q.includes('पानी')) {
    if (isHi) {
      return `💧 **${cropName} फसल के लिए सिंचाई परामर्श (${cropStage} अवस्था):**\n\n` +
        `1. **सिंचाई का समय:** इस अवस्था में खेत में 2-3 सेमी की नमी बनाए रखें। अत्यधिक जलभराव से बचें ताकि जड़ों का विकास सही रहे।\n` +
        `2. **मौसम की स्थिति:** सिंचाई से पूर्व 24 घंटे का मौसम पूर्वानुमान अवश्य देखें। यदि वर्षा की संभावना 50% से अधिक हो तो सिंचाई 1-2 दिन टाल दें।\n` +
        `3. **सुझाव:** सुबह या शाम के समय ही सिंचाई करें ताकि वाष्पीकरण कम हो और पानी की बचत हो सके।\n\n` +
        `*नोट: स्थानीय कृषि विज्ञान केंद्र (KVK) से मिट्टी की जांच कराकर सिंचाई चक्र तय करना सर्वोत्तम है।*`;
    }
    return `💧 **Irrigation Advisory for ${cropName} (${cropStage} Stage):**\n\n` +
      `1. **Water Requirement:** Maintain a thin water layer (2-3 cm) or consistent root-zone moisture. Avoid waterlogging.\n` +
      `2. **Weather Alignment:** Check rainfall probability before starting your pump. If rain > 40% is forecast within 48 hours, delay irrigation.\n` +
      `3. **Best Practice:** Irrigate during early morning or late evening hours to minimize evaporation losses.\n\n` +
      `*Advisory Note: Always cross-verify soil moisture with local Krishi Vigyan Kendra (KVK) guidance.*`;
  }

  // 2. Yellow leaves / Disease queries
  if (q.includes('yellow') || q.includes('पीली') || q.includes('रोग') || q.includes('disease') || q.includes('fungus')) {
    if (isHi) {
      return `🍂 **पत्तियों का पीलापन - कारण एवं रोकथाम उपाय:**\n\n` +
        `1. **नाइट्रोजन की कमी:** यदि पुरानी (निचली) पत्तियां पहले पीली पड़ रही हैं, तो यह नाइट्रोजन की कमी का संकेत है। इसके लिए 2% यूरिया घोल (20 ग्राम प्रति लीटर पानी) का छिड़काव करें।\n` +
        `2. **जिंक अथवा आयरन की कमी:** यदि नई ऊपरी पत्तियां पीली हो रही हैं, तो 0.5% जिंक सल्फेट + 0.25% बुझा हुआ चूना का छिड़काव लाभप्रद है।\n` +
        `3. **जलभराव या जड़ गलन:** खेत में अतिरिक्त पानी खड़ा न रहने दें। जल निकासी का उचित प्रबंध करें।\n\n` +
        `*सावधानी: लक्षण बने रहने पर प्रभावित पत्ती की फोटो 'Disease Scanner' में अपलोड करें या नजदीकी कृषि अधिकारी को दिखाएं।*`;
    }
    return `🍂 **Leaf Yellowing & Problem Diagnosis:**\n\n` +
      `1. **Nitrogen Deficiency:** If older/lower leaves turn pale yellow first, it indicates nitrogen shortage. Apply a foliar spray of 2% Urea (20g per litre water).\n` +
      `2. **Micronutrient Deficiency (Zinc/Iron):** If young upper leaves turn yellow with green veins, spray 0.5% Zinc Sulphate neutralized with 0.25% slaked lime.\n` +
      `3. **Waterlogging & Root Health:** Ensure proper drainage. Excess stagnant water chokes roots and leads to chlorosis.\n\n` +
      `*Recommendation: Upload a leaf photo to the 'Disease AI Scanner' module for closer inspection.*`;
  }

  // 3. Spraying / Pesticide suitability
  if (q.includes('spray') || q.includes('छिड़काव') || q.includes('कीटनाशक') || q.includes('pesticide')) {
    if (isHi) {
      return `🧪 **कीटनाशक/उर्वरक छिड़काव के लिए कृषि निर्देश:**\n\n` +
        `1. **मौसम की स्थिति:** हवा की गति 15 किमी/घंटा से कम होनी चाहिए। तेज हवा में छिड़काव करने से दवा हवा में उड़ जाती है।\n` +
        `2. **वर्षा की संभावना:** छिड़काव के बाद कम से कम 4-6 घंटे तक वर्षा न हो, तभी दवा असर करती है। बादल छाए रहने या बारिश की संभावना पर छिड़काव न करें।\n` +
        `3. **उपयुक्त समय:** सुबह 9 बजे से 11 बजे या शाम 3 बजे से 5 बजे का समय छिड़काव के लिए सर्वोत्तम है। तेज धूप में छिड़काव न करें।\n\n` +
        `*सुरक्षा: छिड़काव करते समय मास्क और दस्तानों का प्रयोग अवश्य करें।*`;
    }
    return `🧪 **Foliar Spray & Pesticide Suitability Advisory:**\n\n` +
      `1. **Wind Condition:** Spraying is ideal when wind speed is under 12-15 km/h. Stronger winds cause chemical drift.\n` +
      `2. **Rain-Fast Window:** Ensure at least 4-6 hours of dry weather post-spray so the chemical adheres properly.\n` +
      `3. **Timing:** Early morning (8:00 AM - 10:30 AM) or late afternoon (3:30 PM - 5:30 PM) is optimal. Avoid mid-day sun.\n\n` +
      `*Safety Warning: Always wear protective masks and gloves during pesticide handling.*`;
  }

  // 4. Fertilizer queries
  if (q.includes('fertilizer') || q.includes('खाद') || q.includes('यूरिया') || q.includes('urea') || q.includes('dap')) {
    if (isHi) {
      return `🌱 **${cropName} के लिए पोषक तत्व एवं उर्वरक प्रबंधन:**\n\n` +
        `1. **बेसल डोज:** बुवाई के समय डीएपी (DAP) और पोटाश (MOP) की पूरी मात्रा तथा यूरिया का एक-तिहाई हिस्सा खेत में मिलाएं।\n` +
        `2. **टॉप ड्रेसिंग (${cropStage} अवस्था):** बुवाई के 25-30 दिन बाद और कल्ले निकलते समय यूरिया की बची हुई खुराक 2 भागों में खेत में हल्की नमी होने पर दें।\n` +
        `3. **जैव उर्वरक:** मिट्टी के स्वास्थ्य के लिए नीम-लेपित यूरिया तथा प्रति एकड़ 5-10 किलो जिंक सल्फेट का उपयोग करें।\n\n` +
        `*सुझाव: मृदा स्वास्थ्य कार्ड (Soil Health Card) की सिफारिशों के अनुसार ही उर्वरक की मात्रा तय करें।*`;
    }
    return `🌱 **Nutrient & Fertilizer Advisory for ${cropName}:**\n\n` +
      `1. **Basal Application:** Full dose of Phosphorus (DAP) and Potassium (MOP) along with 1/3rd Nitrogen at sowing/transplanting.\n` +
      `2. **Top Dressing (${cropStage}):** Split the remaining Nitrogen into 2 top-dressings (e.g. active tillering and panicle initiation) during moist soil conditions.\n` +
      `3. **Micronutrients:** Apply 10 kg/acre Zinc Sulphate (21%) or 5 kg/acre Zinc (33%) once per season for vigor.\n\n` +
      `*Tip: Follow Soil Health Card recommendations to avoid over-fertilization.*`;
  }

  // 5. General crop advisory
  if (isHi) {
    return `🌾 **कृषि मित्र साप्ताहिक सलाह (${cropName} - ${cropStage} अवस्था):**\n\n` +
      `1. **खेत का निरीक्षण:** सप्ताह में दो बार खेत का भ्रमण करें और पत्तियों पर किसी कीट (जैसे तना छेदक या रस चूसक कीट) के प्रकोप की जांच करें।\n` +
      `2. **नमी संतुलन:** मिट्टी में पर्याप्त नमी बनी रहे, लेकिन जलभराव न होने पाए।\n` +
      `3. **खरपतवार नियंत्रण:** कल्ले फूटने से पहले हाथ से निराई-गुड़ाई करें अथवा अनुशंसित शाकनाशी का प्रयोग करें।\n\n` +
      `*विस्तृत जानकारी या किसी विशिष्ट समस्या के लिए आप सीधे सवाल पूछ सकते हैं।*`;
  }
  return `🌾 **KrishiMitra Field Advisory for ${cropName} (${cropStage}):**\n\n` +
    `1. **Field Scouting:** Inspect your field twice weekly for early signs of stem borer, leaf blast, or aphid attack.\n` +
    `2. **Moisture Balance:** Keep the root zone moist without causing stagnant ponding water.\n` +
    `3. **Weed Management:** Carry out weeding before canopy closure to prevent competition for sunlight and nutrients.\n\n` +
    `*Feel free to ask specific questions about fertilizer dosage, pest control, or weather management.*`;
}

/**
 * Chat with AI (Supports xAI Grok, Gemini, with graceful fallback to ICAR engine)
 */
async function chat(message, context = {}) {
  const { user, profile, farmerCrops, history, language } = context;

  // Build system prompt
  let systemPrompt = `You are KrishiMitra, an expert agricultural decision assistant for Indian farmers. Respond in ${language === 'hi' ? 'Hindi' : 'English'}. Provide clear, actionable, empathetic, practical farming advice. Include dosages, weather precautions, and ICAR best practices. When uncertain, recommend consulting local Krishi Vigyan Kendra (KVK).`;

  if (profile && profile.state) {
    systemPrompt += `\nFarmer Context: State: ${profile.state}, District: ${profile.district || ''}, Soil: ${profile.soil_type || ''}, Land: ${profile.land_size || ''} ${profile.land_unit || 'acres'}.`;
  }

  if (farmerCrops && farmerCrops.length > 0) {
    const cropInfo = farmerCrops.map(fc => `${fc.crop_name} (${fc.growth_stage?.current_stage || 'active'})`).join(', ');
    systemPrompt += `\nActive crops in field: ${cropInfo}.`;
  }

  // 1. Try xAI Grok if key is configured
  if (XAI_API_KEY) {
    try {
      const messages = [{ role: 'system', content: systemPrompt }];

      if (history && history.length > 0) {
        for (const msg of history.slice(-6)) {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          });
        }
      }

      messages.push({ role: 'user', content: message });

      const xaiRes = await fetch(XAI_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${XAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          model: 'grok-2-latest',
          temperature: 0.5,
          max_tokens: 1000
        })
      });

      if (xaiRes.ok) {
        const data = await xaiRes.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content;
        }
      } else {
        console.warn('xAI API status:', xaiRes.status, await xaiRes.text());
      }
    } catch (err) {
      console.warn('xAI request error:', err.message);
    }
  }

  // 2. Try Gemini API if key is configured
  if (GEMINI_API_KEY) {
    try {
      const contents = [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nQuestion: ${message}` }] }];
      const gemRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig: { temperature: 0.6, maxOutputTokens: 1000 } })
      });

      if (gemRes.ok) {
        const data = await gemRes.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
      }
    } catch (err) {
      console.warn('Gemini request error:', err.message);
    }
  }

  // 3. Fallback to ICAR Agricultural Advisory Engine
  return generateAgriculturalAdvisory(message, context);
}

/**
 * Image analysis for plant disease
 */
async function analyzeImageWithAI(imageBase64, mimeType, cropName) {
  // If xAI has vision endpoint or Gemini vision
  if (GEMINI_API_KEY) {
    try {
      const prompt = `You are a plant pathologist. Analyze this ${cropName || 'crop'} leaf image. Identify any disease symptoms, severity, and recommend treatment steps. Clearly state confidence level.`;
      const body = {
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: prompt }
          ]
        }]
      };

      const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
      }
    } catch (err) {
      console.warn('Vision analysis error:', err.message);
    }
  }

  return null;
}

module.exports = { chat, analyzeImageWithAI, generateAgriculturalAdvisory };
