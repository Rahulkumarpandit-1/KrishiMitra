const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_URL = 'https://api.x.ai/v1/chat/completions';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// High-utility agricultural reference visuals for farmers
const AGRI_VISUALS = {
  yellow_leaves: {
    title: 'Leaf Chlorosis & Nutrient Deficiency',
    title_hi: 'पत्तियों का पीलापन व पोषण कमी',
    url: 'https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=700&auto=format&fit=crop&q=80',
    caption: 'Visual symptoms: yellowing of leaf tissue between green veins indicating Zinc or Nitrogen shortfall.'
  },
  irrigation: {
    title: 'Controlled Root-Zone Irrigation',
    title_hi: 'नियंत्रित जड़-क्षेत्र सिंचाई',
    url: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=700&auto=format&fit=crop&q=80',
    caption: 'Drip or furrow watering maintains optimal soil moisture without stagnant ponding.'
  },
  pesticide_spray: {
    title: 'Foliar Spraying Best Practice',
    title_hi: 'पर्णीय छिड़काव की सर्वोत्तम विधि',
    url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=700&auto=format&fit=crop&q=80',
    caption: 'Wear protective mask and spray during low wind speeds (< 12 km/h) in early morning.'
  },
  fertilizer: {
    title: 'Split Fertilizer Top Dressing',
    title_hi: 'यूरिया व डीएपी संतुलित अनुप्रयोग',
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&auto=format&fit=crop&q=80',
    caption: 'Apply Neem-coated Urea in split doses when soil has mild moisture for maximum absorption.'
  },
  pest_scouting: {
    title: 'Field Scouting & Insect Inspection',
    title_hi: 'कीट निगरानी व निरीक्षण',
    url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=700&auto=format&fit=crop&q=80',
    caption: 'Inspect under surfaces of leaves for aphids, whiteflies, or borer larvae.'
  }
};

/**
 * Intelligent ICAR Agricultural Fallback Engine
 * Generates dynamic, natural, stage-specific agricultural advisory
 */
function generateAgriculturalAdvisory(message, context = {}) {
  const { user, profile, farmerCrops, language } = context;
  const isHi = language === 'hi';
  const q = (message || '').trim().toLowerCase();

  const primaryCrop = (farmerCrops && farmerCrops.length > 0) ? farmerCrops[0] : null;
  const cropName = primaryCrop?.crop_name || (isHi ? 'आपकी फसल' : 'your crop');
  const cropStage = primaryCrop?.growth_stage?.current_stage || primaryCrop?.current_stage?.name || 'Vegetative';
  const farmerName = user?.name ? user.name.split(' ')[0] : (isHi ? 'किसान भाई' : 'Farmer');

  // 1. Greetings & Conversational Queries
  const isGreeting = /^(hi|hey|hello|namaste|namaskar|pranam|kya haal|kaise ho|who are you|about you|help|नमस्ते|प्रणाम|हैलो|हाय)/i.test(q);
  if (isGreeting || q.length <= 4) {
    if (isHi) {
      return `🙏 **नमस्ते ${farmerName}! मैं आपका कृषि मित्र (KrishiMitra) AI सहायक हूँ।**\n\n` +
        `आज आपके खेत में **${cropName}** (${cropStage} अवस्था) की स्थिति अनुकूल है।\n\n` +
        `आप मुझसे खेती से जुड़ा कोई भी सवाल नीचे दिए गए **माइक बटन 🎙️ पर बोलकर** या लिखकर पूछ सकते हैं, जैसे:\n` +
        `• *"अगली सिंचाई कब करनी चाहिए?"*\n` +
        `• *"पत्तियां पीली क्यों पड़ रही हैं?"*\n` +
        `• *"क्या कल कीटनाशक का छिड़काव कर सकते हैं?"*\n` +
        `• *"इस अवस्था में कौन सी खाद डालें?"*\n\n` +
        `बताइए, आज मैं आपकी क्या सहायता करूँ?`;
    }
    return `🙏 **Hello ${farmerName}! I'm KrishiMitra, your personal AI Farming Assistant.**\n\n` +
      `Your active **${cropName}** plot is currently in the **${cropStage} stage** and performing well.\n\n` +
      `You can ask me any farming question by **tapping the mic button 🎙️ to speak**, or typing:\n` +
      `• *"When should I irrigate next?"*\n` +
      `• *"Why are my crop leaves turning yellow?"*\n` +
      `• *"Is tomorrow suitable for spraying pesticides?"*\n` +
      `• *"Which fertilizer should I apply right now?"*\n\n` +
      `How can I assist your field today?`;
  }

  // 2. Irrigation queries
  if (q.includes('irriga') || q.includes('water') || q.includes('सिंचाई') || q.includes('पानी') || q.includes('moisture')) {
    if (isHi) {
      return `💧 **${cropName} फसल के लिए सिंचाई परामर्श (${cropStage} अवस्था):**\n\n` +
        `1. **सिंचाई का समय:** इस अवस्था में खेत में 2-3 सेमी की नमी बनाए रखें। अत्यधिक जलभराव से बचें ताकि जड़ों का विकास सही रहे।\n` +
        `2. **मौसम की स्थिति:** सिंचाई से पूर्व 24 घंटे का मौसम पूर्वानुमान अवश्य देखें। यदि वर्षा की संभावना 50% से अधिक हो तो सिंचाई 1-2 दिन टाल दें।\n` +
        `3. **सुझाव:** सुबह या शाम के समय ही सिंचाई करें ताकि वाष्पीकरण कम हो और पानी की बचत हो सके।\n\n` +
        `*नोट: स्थानीय कृषि विज्ञान केंद्र (KVK) से मिट्टी की जांच कराकर सिंचाई चक्र तय करना सर्वोत्तम है।*`;
    }
    return `💧 **Irrigation Advisory for ${cropName} (${cropStage} Stage):**\n\n` +
      `1. **Water Requirement:** Maintain consistent root-zone moisture (2-3 cm layer). Avoid waterlogging.\n` +
      `2. **Weather Alignment:** Check rainfall probability before starting your pump. If rain > 40% is forecast within 48 hours, delay irrigation.\n` +
      `3. **Best Practice:** Irrigate during early morning or late evening hours to minimize evaporation losses.\n\n` +
      `*Advisory Note: Always cross-verify soil moisture with local Krishi Vigyan Kendra (KVK) guidance.*`;
  }

  // 3. Yellow leaves / Disease queries
  if (q.includes('yellow') || q.includes('पीली') || q.includes('रोग') || q.includes('disease') || q.includes('fungus') || q.includes('pest') || q.includes('कीड़ा')) {
    if (isHi) {
      return `🍂 **पत्तियों का पीलापन व रोग निदान (${cropName}):**\n\n` +
        `1. **नाइट्रोजन की कमी:** यदि पुरानी (निचली) पत्तियां पहले पीली पड़ रही हैं, तो यह नाइट्रोजन की कमी है। 2% यूरिया घोल (20 ग्राम प्रति लीटर पानी) का छिड़काव करें।\n` +
        `2. **जिंक अथवा सूक्ष्म पोषक तत्व:** यदि नई ऊपरी पत्तियां पीली हो रही हैं और नसें हरी हैं, तो 0.5% जिंक सल्फेट + 0.25% बुझा हुआ चूना का छिड़काव करें।\n` +
        `3. **फफूंद या जड़ सड़न:** अत्यधिक पानी के जमाव से बचें। यदि धब्बे दिखें, तो कार्बेन्डाजिम या मैंकोजेब (2 ग्राम/लीटर) का स्प्रे करें।\n\n` +
        `*सुझाव: सटीक जांच के लिए पत्ती की फोटो 'Disease Detection' स्कैनर में अपलोड करें।*`;
    }
    return `🍂 **Leaf Yellowing & Problem Diagnosis for ${cropName}:**\n\n` +
      `1. **Nitrogen Deficiency:** If older/lower leaves turn pale yellow first, spray 2% Urea (20g per litre of water).\n` +
      `2. **Micronutrient Deficiency (Zinc/Iron):** If young upper leaves turn yellow with green veins, spray 0.5% Zinc Sulphate neutralized with 0.25% slaked lime.\n` +
      `3. **Root Health & Drainage:** Ensure proper water drainage. Stagnant water chokes roots and causes chlorosis.\n\n` +
      `*Recommendation: Capture a photo of the affected leaf in the Disease Scanner for AI diagnosis.*`;
  }

  // 4. Spraying / Pesticide suitability
  if (q.includes('spray') || q.includes('छिड़काव') || q.includes('कीटनाशक') || q.includes('pesticide')) {
    if (isHi) {
      return `🧪 **कीटनाशक/उर्वरक छिड़काव के लिए कृषि निर्देश:**\n\n` +
        `1. **मौसम की स्थिति:** हवा की गति 15 किमी/घंटा से कम होनी चाहिए। तेज हवा में छिड़काव करने से दवा हवा में उड़ जाती है।\n` +
        `2. **वर्षा की संभावना:** छिड़काव के बाद कम से कम 4-6 घंटे तक वर्षा न हो, तभी दवा असर करती है।\n` +
        `3. **उपयुक्त समय:** सुबह 9 बजे से 11 बजे या शाम 3 बजे से 5 बजे का समय छिड़काव के लिए सर्वोत्तम है। तेज धूप में छिड़काव न करें।\n\n` +
        `*सुरक्षा: छिड़काव करते समय मास्क और दस्तानों का प्रयोग अवश्य करें।*`;
    }
    return `🧪 **Foliar Spray & Pesticide Suitability Advisory:**\n\n` +
      `1. **Wind Condition:** Spraying is ideal when wind speed is under 12-15 km/h. Stronger winds cause chemical drift.\n` +
      `2. **Rain-Fast Window:** Ensure at least 4-6 hours of dry weather post-spray so the chemical adheres properly.\n` +
      `3. **Timing:** Early morning (8:00 AM - 10:30 AM) or late afternoon (3:30 PM - 5:30 PM) is optimal. Avoid mid-day sun.\n\n` +
      `*Safety Warning: Always wear protective masks and gloves during pesticide handling.*`;
  }

  // 5. Fertilizer queries
  if (q.includes('fertilizer') || q.includes('खाद') || q.includes('यूरिया') || q.includes('urea') || q.includes('dap') || q.includes('npk')) {
    if (isHi) {
      return `🌱 **${cropName} के लिए पोषक तत्व एवं उर्वरक प्रबंधन:**\n\n` +
        `1. **बेसल डोज:** बुवाई के समय डीएपी (DAP) और पोटाश (MOP) की पूरी मात्रा तथा यूरिया का एक-तिहाई हिस्सा खेत में मिलाएं।\n` +
        `2. **टॉप ड्रेसिंग (${cropStage} अवस्था):** बुवाई के 25-30 दिन बाद यूरिया की बची हुई खुराक खेत में हल्की नमी होने पर दें।\n` +
        `3. **जैव उर्वरक:** मिट्टी के स्वास्थ्य के लिए नीम-लेपित यूरिया तथा प्रति एकड़ 5-10 किलो जिंक सल्फेट का उपयोग करें।\n\n` +
        `*सुझाव: मृदा स्वास्थ्य कार्ड (Soil Health Card) की सिफारिशों के अनुसार ही उर्वरक की मात्रा तय करें।*`;
    }
    return `🌱 **Nutrient & Fertilizer Advisory for ${cropName}:**\n\n` +
      `1. **Basal Application:** Full dose of Phosphorus (DAP) and Potassium (MOP) along with 1/3rd Nitrogen at sowing/transplanting.\n` +
      `2. **Top Dressing (${cropStage}):** Split the remaining Nitrogen into 2 top-dressings during moist soil conditions.\n` +
      `3. **Micronutrients:** Apply 10 kg/acre Zinc Sulphate (21%) or 5 kg/acre Zinc (33%) once per season for vigor.\n\n` +
      `*Tip: Follow Soil Health Card recommendations to avoid over-fertilization.*`;
  }

  // 6. Weather & Rainfall
  if (q.includes('rain') || q.includes('weather') || q.includes('barish') || q.includes('मौसम') || q.includes('बारिश')) {
    if (isHi) {
      return `🌦️ **मौसम एवं कृषि कार्य सामंजस्य:**\n\n` +
        `1. **वर्तमान स्थिति:** क्षेत्र में सामान्य तापमान और अनुकूल आर्द्रता बनी हुई है।\n` +
        `2. **बारिश की संभावना:** यदि बारिश की संभावना 50% से कम है, तो सिंचाई और खरपतवार नियंत्रण कार्य सामान्य रूप से जारी रख सकते हैं।\n` +
        `3. **सतर्कता:** तेज धूप में दोपहर के समय खेत में कोई रासायनिक स्प्रे न करें।\n\n` +
        `*कृषि मित्र का 7-दिवसीय मौसम पूर्वानुमान टैब में विस्तृत चार्ट देखें।*`;
    }
    return `🌦️ **Agro-Weather Coordination Advisory:**\n\n` +
      `1. **Current Telemetry:** Temperatures and relative humidity in your district are within standard agronomic ranges.\n` +
      `2. **Rainfall Window:** If precipitation probability is low (< 30%), routine field operations (weeding, fertigation) may proceed.\n` +
      `3. **Field Tip:** Avoid afternoon chemical applications during peak solar intensity.\n\n` +
      `*Check the 7-day Agricultural Forecast card for hourly temperature and rain probability details.*`;
  }

  // 7. General crop advisory
  if (isHi) {
    return `🌾 **कृषि मित्र सलाह (${cropName} - ${cropStage} अवस्था):**\n\n` +
      `• **फसल स्थिति:** आपकी फसल अभी ${cropStage} चरण में है। इस समय पौधों को संतुलित नमी और कीटों से सुरक्षा की आवश्यकता होती है।\n` +
      `• **खेत का निरीक्षण:** सप्ताह में दो बार पत्तियों के नीचे देखें कि कहीं माहू (एफिड्स) या सुंडी तो नहीं लग रही।\n` +
      `• **पोषक तत्व:** आवश्यकतानुसार सूक्ष्म पोषक तत्व या 19:19:19 घुलनशील खाद का हल्का स्प्रे लाभदायक रहेगा।\n\n` +
      `*आप किसी विशिष्ट समस्या (जैसे पत्ती का मुड़ना, सिंचाई का समय, कीटनाशक) के बारे में बोलकर या लिखकर पूछ सकते हैं।*`;
  }
  return `🌾 **KrishiMitra Advisory for ${cropName} (${cropStage}):**\n\n` +
    `• **Current Stage:** Your crop is in the ${cropStage} phase. Prioritize balanced moisture and vigilant pest scouting.\n` +
    `• **Field Scouting:** Inspect underneath leaves twice weekly for early signs of aphids, mites, or leaf spot.\n` +
    `• **Nutrition:** A balanced foliar spray of NPK 19:19:19 (5g/L) supports healthy vegetative progress.\n\n` +
    `*Feel free to speak your specific question about pest control, watering, or fertilizer dosage.*`;
}

/**
 * Chat with AI (Tries Gemini with gemini-3.5-flash, then xAI, then ICAR engine)
 */
async function chat(message, context = {}) {
  const { user, profile, farmerCrops, history, language } = context;

  // Build system prompt
  let systemPrompt = `You are KrishiMitra, an empathetic, highly knowledgeable agricultural decision assistant for Indian farmers. Respond concisely and practically in ${language === 'hi' ? 'Hindi (हिंदी)' : 'English'}. Include exact dosages per acre/liter, weather alignment, and ICAR best practices. When uncertain, advise consulting the local Krishi Vigyan Kendra (KVK). Avoid complex enterprise jargon.`;

  if (profile && profile.state) {
    systemPrompt += `\nFarmer Context: State: ${profile.state}, District: ${profile.district || ''}, Soil: ${profile.soil_type || ''}, Land: ${profile.land_size || ''} ${profile.land_unit || 'acres'}.`;
  }

  if (farmerCrops && farmerCrops.length > 0) {
    const cropInfo = farmerCrops.map(fc => `${fc.crop_name} (${fc.growth_stage?.current_stage || 'active'})`).join(', ');
    systemPrompt += `\nActive crops in field: ${cropInfo}.`;
  }

  // 1. Try Google Gemini (gemini-3.5-flash) first
  if (GEMINI_API_KEY) {
    try {
      const contents = [];
      if (history && history.length > 0) {
        for (const msg of history.slice(-4)) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nFarmer Query: ${message}` }]
      });

      const gemRes = await fetch(GEMINI_URL + `?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 800
          }
        })
      });

      if (gemRes.ok) {
        const data = await gemRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } else {
        console.warn('Gemini API status:', gemRes.status, await gemRes.text());
      }
    } catch (err) {
      console.warn('Gemini request error:', err.message);
    }
  }

  // 2. Try xAI Grok if key configured
  if (XAI_API_KEY) {
    try {
      const messages = [{ role: 'system', content: systemPrompt }];
      if (history && history.length > 0) {
        for (const msg of history.slice(-4)) {
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
          max_tokens: 800
        })
      });

      if (xaiRes.ok) {
        const data = await xaiRes.json();
        if (data.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      }
    } catch (err) {
      console.warn('xAI request error:', err.message);
    }
  }

  // 3. Fallback to ICAR Agricultural Advisory Engine
  return generateAgriculturalAdvisory(message, context);
}

/**
 * Image analysis for plant disease
 */
async function analyzeImageWithAI(imageBase64, mimeType, cropName) {
  if (GEMINI_API_KEY) {
    try {
      const prompt = `You are a plant pathologist. Analyze this ${cropName || 'crop'} leaf image. Identify any disease symptoms, severity, and recommend treatment steps. Clearly state confidence level. Provide actionable remedy with dosage.`;
      const body = {
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: prompt }
          ]
        }]
      };

      const response = await fetch(GEMINI_URL + `?key=${GEMINI_API_KEY}`, {
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

module.exports = { chat, analyzeImageWithAI, generateAgriculturalAdvisory, AGRI_VISUALS };
