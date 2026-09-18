/* ==========================================================================
   Readout — Multilingual Support Engine for Patient Families
   --------------------------------------------------------------------------
   Provides instant localized translations of clinical results, explanations,
   and doctor conversation prompts into Hindi, Telugu, Tamil, Spanish, and Bengali.
   Keeps diagnostic biomarker codes (e.g. HbA1c, TSH) and units intact so
   clinicians and family members can read the report collaboratively.
   ========================================================================== */

const TRANSLATIONS = {
  en: {
    name: "English",
    flag: "🇬🇧",
    title: "Your results",
    worthRaising: "Worth raising with a clinician",
    everyTest: "Every test on this report",
    allTestsSub: "All parameters extracted from your laboratory document",
    outsideRange: "Outside reference range",
    insideRange: "Inside reference range",
    criticalAlert: "Critical Panic Value Detected",
    fastingState: "Fasting",
    nonFastingState: "Non-Fasting",
    searchPlaceholder: "Search a test, e.g. haemoglobin, SGPT, vitamin D",
    lifestyleHeading: "Evidence-Based Lifestyle & Dietary Levers",
    contextHeading: "Smart Contextualizer: Fasting & Medications",
    verdictOutsidePlural: "results sit outside the range printed on your report",
    verdictOutsideSingular: "result sits outside the range printed on your report",
    verdictInside: "Every value sits inside the range printed beside it",
    verdictSub: "Outside the range is a prompt for a conversation, not a diagnosis. Reference ranges describe what most healthy people in a comparison group measured.",
    askDoctor: "Worth asking your doctor",
    whatThisMeans: "What this test measures",
    whyItMatters: "Everyday factors that influence it",
    summaryButton: "Build doctor summary",
    uploadButton: "Upload report"
  },

  hi: {
    name: "हिन्दी (Hindi)",
    flag: "🇮🇳",
    title: "आपकी जांच रिपोर्ट के परिणाम",
    worthRaising: "डॉक्टर से चर्चा योग्य परिणाम (सीमा से बाहर)",
    everyTest: "इस रिपोर्ट की सभी जांचें",
    allTestsSub: "आपकी प्रयोगशाला रिपोर्ट से पढ़े गए सभी परीक्षण",
    outsideRange: "सामान्य सीमा से बाहर",
    insideRange: "सामान्य सीमा के अंदर",
    criticalAlert: "🚨 आपातकालीन मान: तत्काल डॉक्टर से संपर्क करें",
    fastingState: "उपवास (खाली पेट 8-12 घंटे)",
    nonFastingState: "भोजन के बाद (गैर-उपवास)",
    searchPlaceholder: "जांच खोजें, जैसे हीमोग्लोबिन, शुगर, थायरॉइड, विटामिन डी",
    lifestyleHeading: "🥗 प्रमाण-आधारित जीवनशैली और खान-पान सुधार",
    contextHeading: "⏱️ स्मार्ट संदर्भ: उपवास और दवाइयां",
    verdictOutsidePlural: "जांच परिणाम आपकी रिपोर्ट पर छपी सामान्य सीमा से बाहर हैं",
    verdictOutsideSingular: "जांच परिणाम आपकी रिपोर्ट पर छपी सामान्य सीमा से बाहर है",
    verdictInside: "सभी जांच परिणाम सामान्य सीमा के भीतर हैं",
    verdictSub: "सीमा से बाहर होना डॉक्टर से बातचीत का विषय है, कोई बीमारी की पुष्टि नहीं। स्वस्थ लोगों के परिणाम भी कई कारणों से थोड़ा ऊपर-नीचे हो सकते हैं।",
    askDoctor: "डॉक्टर से पूछने योग्य सवाल",
    whatThisMeans: "यह जांच क्या दर्शाती है",
    whyItMatters: "दैनिक कारक जो इसे प्रभावित करते हैं",
    summaryButton: "डॉक्टर सारांश तैयार करें",
    uploadButton: "रिपोर्ट अपलोड करें"
  },

  te: {
    name: "తెలుగు (Telugu)",
    flag: "🇮🇳",
    title: "మీ వైద్య పరీక్ష ఫలితాలు",
    worthRaising: "వైద్యుడితో చర్చించవలసిన ముఖ్య ఫలితాలు",
    everyTest: "ఈ నివేదికలోని అన్ని పరీక్షలు",
    allTestsSub: "ల్యాబ్ నివేదిక నుండి సేకరించిన అన్ని వివరాలు",
    outsideRange: "సాధారణ పరిధి వెలుపల ఉంది",
    insideRange: "సాధారణ పరిధి లోపల ఉంది",
    criticalAlert: "🚨 అత్యవసర విలువ గుర్తించబడింది: వెంటనే వైద్యుడిని సంప్రదించండి",
    fastingState: "ఉపవాసం (ఖాళీ కడుపుతో 8-12 గంటలు)",
    nonFastingState: "ఆహారం తీసుకున్న తర్వాత",
    searchPlaceholder: "పరీక్షను వెతకండి, ఉదా. హిమోగ్లోబిన్, షుగర్, థైరాయిడ్",
    lifestyleHeading: "🥗 ఆధారిత జీవనశైలి మరియు ఆహార మార్పులు",
    contextHeading: "⏱️ స్మార్ట్ సందర్భం: ఉపవాసం మరియు మందులు",
    verdictOutsidePlural: "ఫలితాలు మీ నివేదికలోని సాధారణ పరిధికి వెలుపల ఉన్నాయి",
    verdictOutsideSingular: "ఫలితం మీ నివేదికలోని సాధారణ పరిధికి వెలుపల ఉంది",
    verdictInside: "అన్ని పరీక్షల విలువలు సాధారణ పరిధిలోనే ఉన్నాయి",
    verdictSub: "పరిధి వెలుపల ఉండటం అంటే వైద్యుడితో చర్చించడానికి ఒక అవకాశం, రోగనిర్ధారణ కాదు.",
    askDoctor: "వైద్యుడిని అడగవలసిన ప్రశ్నలు",
    whatThisMeans: "ఈ పరీక్ష దేనిని కొలుస్తుంది",
    whyItMatters: "దీనిపై ప్రభావం చూపే రోజువారీ అంశాలు",
    summaryButton: "వైద్య సారాంశం పొందండి",
    uploadButton: "రిపోర్టు అప్‌లోడ్ చేయండి"
  },

  ta: {
    name: "தமிழ் (Tamil)",
    flag: "🇮🇳",
    title: "உங்கள் மருத்துவ பரிசோதனை முடிவுகள்",
    worthRaising: "மருத்துவரிடம் விவாதிக்க வேண்டிய முடிவுகள்",
    everyTest: "அனைத்து சோதனைகளும்",
    allTestsSub: "ஆய்வக அறிக்கையிலிருந்து பெறப்பட்ட அனைத்து தகவல்களும்",
    outsideRange: "இயல்பான வரம்பிற்கு வெளியே",
    insideRange: "இயல்பான வரம்பிற்குள்",
    criticalAlert: "🚨 அவசர மருத்துவ மதிப்பு: உடனே மருத்துவரை அணுகவும்",
    fastingState: "வெறும் வயிறு (8-12 மணி நேரம்)",
    nonFastingState: "உணவுக்குப் பின்",
    searchPlaceholder: "சோதனையைத் தேடுங்கள், எ.கா. ஹீமோகுளோபின், சர்க்கரை",
    lifestyleHeading: "🥗 ஆதாரப்பூர்வ வாழ்க்கை முறை & உணவு மாற்றங்கள்",
    contextHeading: "⏱️ உண்ணாவிரதம் மற்றும் மருந்துகள் சூழல்",
    verdictOutsidePlural: "முடிவுகள் ஆய்வக வரம்பிற்கு வெளியே உள்ளன",
    verdictOutsideSingular: "முடிவு ஆய்வக வரம்பிற்கு வெளியே உள்ளது",
    verdictInside: "அனைத்து முடிவுகளும் இயல்பான வரம்பிற்குள் உள்ளன",
    verdictSub: "வரம்பிற்கு வெளியே இருப்பது மருத்துவரிடம் பேசுவதற்கான வழிகாட்டுதல் மட்டுமே; எந்த நோய்க்கான இறுதியான தீர்ப்பும் அல்ல.",
    askDoctor: "மருத்துவரிடம் கேட்க வேண்டியவை",
    whatThisMeans: "இந்த சோதனை எதைக் குறிக்கிறது",
    whyItMatters: "இதை பாதிக்கும் காரணிகள்",
    summaryButton: "மருத்துவர் சுருக்கம்",
    uploadButton: "அறிக்கையை பதிவேற்றவும்"
  },

  es: {
    name: "Español (Spanish)",
    flag: "🇪🇸",
    title: "Sus resultados",
    worthRaising: "Vale la pena consultar con un médico",
    everyTest: "Todas las pruebas de este informe",
    allTestsSub: "Todos los parámetros leídos de su documento de laboratorio",
    outsideRange: "Fuera del rango de referencia",
    insideRange: "Dentro del rango de referencia",
    criticalAlert: "🚨 Valor crítico detectado: contacte a su médico hoy",
    fastingState: "En ayunas (8-12 horas)",
    nonFastingState: "Sin ayuno / Comida reciente",
    searchPlaceholder: "Buscar prueba, ej. hemoglobina, glucosa, colesterol",
    lifestyleHeading: "🥗 Cambios de estilo de vida y nutrición basados en evidencia",
    contextHeading: "⏱️ Contexto clínico: Ayuno y medicación",
    verdictOutsidePlural: "resultados se sitúan fuera del rango impreso en su informe",
    verdictOutsideSingular: "resultado se sitúa fuera del rango impreso en su informe",
    verdictInside: "Cada valor se encuentra dentro del rango de referencia impreso",
    verdictSub: "Estar fuera de rango es motivo para una conversación, no un diagnóstico. Personas sanas caen fuera de los rangos con frecuencia.",
    askDoctor: "Preguntas útiles para su médico",
    whatThisMeans: "Qué mide esta prueba",
    whyItMatters: "Factores cotidianos que la influyen",
    summaryButton: "Crear resumen para el médico",
    uploadButton: "Subir informe"
  },

  bn: {
    name: "বাংলা (Bengali)",
    flag: "🇧🇩",
    title: "আপনার পরীক্ষার ফলাফল",
    worthRaising: "ডাক্তারের সাথে আলোচনার যোগ্য ফলাফল",
    everyTest: "এই রিপোর্টের সমস্ত পরীক্ষা",
    allTestsSub: "ল্যাব রিপোর্ট থেকে নেওয়া সমস্ত ফলাফল",
    outsideRange: "স্বাভাবিক সীমার বাইরে",
    insideRange: "স্বাভাবিক সীমার ভেতরে",
    criticalAlert: "🚨 জরুরি মান চিহ্নিত: অবিলম্বে ডাক্তারের পরামর্শ নিন",
    fastingState: "উপবাস (খালি পেটে ৮-১২ ঘণ্টা)",
    nonFastingState: "খাওয়ার পরে",
    searchPlaceholder: "পরীক্ষা খুঁজুন, যেমন হিমোগ্লোবিন, সুগার, ভিটামিন ডি",
    lifestyleHeading: "🥗 প্রমাণ-ভিত্তিক জীবনধারা এবং খাদ্যাভ্যাস পরিবর্তন",
    contextHeading: "⏱️ স্মার্ট প্রসঙ্গ: উপবাস এবং ওষুধ",
    verdictOutsidePlural: "ফলাফল স্বাভাবিক সীমার বাইরে রয়েছে",
    verdictOutsideSingular: "ফলাফল স্বাভাবিক সীমার বাইরে রয়েছে",
    verdictInside: "সমস্ত ফলাফল স্বাভাবিক সীমার মধ্যে রয়েছে",
    verdictSub: "সীমার বাইরে থাকা মানেই রোগ নয়, এটি কেবল ডাক্তারের সাথে আলোচনার একটি সূত্র।",
    askDoctor: "ডাক্তারকে জিজ্ঞাসা করার মতো প্রশ্ন",
    whatThisMeans: "এই পরীক্ষাটি কী পরিমাপ করে",
    whyItMatters: "দৈনন্দিন যেসব কারণে এটি পরিবর্তিত হয়",
    summaryButton: "ডাক্তারের সারাংশ তৈরি করুন",
    uploadButton: "রিপোর্ট আপলোড করুন"
  }
};

// Localized parameter explanations for common lab markers
const PARAM_TRANSLATIONS = {
  glucose: {
    hi: { what: "यह रक्त में शर्करा (ग्लूकोज) की मात्रा मापता है, आमतौर पर 8 से 12 घंटे बिना कुछ खाए।" },
    te: { what: "ఇది రక్తంలో గ్లూకోజ్ (చక్కెర) స్థాయిని కొలుస్తుంది, సాధారణంగా 8-12 గంటల ఉపవాసం తర్వాత." },
    ta: { what: "இது இரத்தத்தில் உள்ள சர்க்கரையின் அளவை அளவிடுகிறது, வழக்கமாக 8-12 மணிநேர உண்ணாவிரதத்திற்குப் பின்." },
    es: { what: "Mide la cantidad de glucosa en sangre tras un período de ayuno de 8 a 12 horas." },
    bn: { what: "এটি রক্তে গ্লুকোজের পরিমাণ পরিমাপ করে, সাধারণত ৮ থেকে ১২ ঘণ্টা খালি পেটে থাকার পর।" }
  },
  hba1c: {
    hi: { what: "HbA1c पिछले 2 से 3 महीनों में आपके औसत रक्त शर्करा स्तर को दर्शाता है।" },
    te: { what: "HbA1c గత 2-3 నెలల్లో మీ సగటు రక్తంలో చక్కెర స్థాయిని ప్రతిబింబిస్తుంది." },
    ta: { what: "HbA1c கடந்த 2 முதல் 3 மாதங்களில் உங்கள் சராசரி இரத்த சர்க்கரையை காட்டுகிறது." },
    es: { what: "Refleja el promedio de glucosa en sangre durante los últimos 2 a 3 meses." },
    bn: { what: "HbA1c গত ২ থেকে ৩ মাসের রক্তে শর্করার গড় মাত্রা প্রকাশ করে।" }
  },
  chol: {
    hi: { what: "कुल कोलेस्ट्रॉल आपके रक्त में विभिन्न प्रकार के फैट (लिपिड) की कुल मात्रा मापता है।" },
    te: { what: "మొత్తం కొలెస్ట్రాల్ మీ రక్తంలో ఉండే అన్ని కొవ్వుల మొత్తాన్ని కొలుస్తుంది." },
    ta: { what: "மொத்த கொலஸ்ட்ரால் இரத்தத்தில் உள்ள அனைத்து கொழுப்புகளின் அளவை அளவிடுகிறது." },
    es: { what: "Mide la cantidad total de lípidos y colesterol circulantes en su sangre." },
    bn: { what: "টোটাল কোলেস্টেরল রক্তে চর্বির মোট পরিমাণ পরিমাপ করে।" }
  },
  ldl: {
    hi: { what: "एलडीएल (खराब कोलेस्ट्रॉल) धमनियों में प्लाक जमने के जोखिम से जुड़ा होता है।" },
    te: { what: "LDL కొలెస్ట్రాల్ రక్తనాళాలలో కొవ్వు చేరడానికి కారణమయ్యే ముఖ్య కొవ్వు." },
    ta: { what: "LDL என்பது இரத்த நாளங்களில் படியும் கெட்ட கொலஸ்ட்ரால் ஆகும்." },
    es: { what: "Conocido como colesterol malo, transporta lípidos que pueden depositarse en las arterias." },
    bn: { what: "এলডিএল রক্তনালীতে চর্বি জমতে সাহায্যকারী কোলেস্টেরল হিসেবে পরিচিত।" }
  },
  tg: {
    hi: { what: "ट्राइग्लिसराइड्स रक्त में मौजूद वसा का एक रूप हैं जो हाल के भोजन और कैलोरी से तुरंत प्रभावित होते हैं।" },
    te: { what: "ట్రైగ్లిజరైడ్స్ రక్తంలో అత్యంత సాధారణ కొవ్వు, ఆహారం మరియు చక్కెర వినియోగం వల్ల త్వరగా మారుతుంది." },
    ta: { what: "ட்ரைகிளிசரைடுகள் உணவுக்குப் பின் இரத்தத்தில் அதிகரிக்கும் முக்கிய கொழுப்பு." },
    es: { what: "Grasa común en sangre altamente sensible a la dieta, azúcar y alcohol reciente." },
    bn: { what: "ট্রাইগ্লিসারাইডস রক্তে চর্বির একটি সাধারণ প্রকার যা সাম্প্রতিক খাদ্যাভ্যাসে দ্রুত পরিবর্তিত হয়।" }
  },
  hb: {
    hi: { what: "हीमोग्लोबिन लाल रक्त कोशिकाओं में मौजूद प्रोटीन है जो फेफड़ों से शरीर में ऑक्सीजन पहुंचाता है।" },
    te: { what: "హిమోగ్లోబిన్ ఎర్ర రక్త కణాలలో ఉండే ప్రోటీన్, ఇది ఊపిరితిత్తుల నుండి శరీరానికి ఆక్సిజన్‌ను మోసుకెళుతుంది." },
    ta: { what: "ஹீமோகுளோபின் என்பது நுரையீரலில் இருந்து உடலுக்கு ஆக்சிஜனை எடுத்துச் செல்லும் புரதம்." },
    es: { what: "Proteína dentro de los glóbulos rojos que transporta oxígeno de los pulmones a los tejidos." },
    bn: { what: "হিমোগ্লোবিন হলো লোহিত রক্তকণিকার প্রোটিন যা সারা শরীরে অক্সিজেন পরিবহন করে।" }
  },
  tsh: {
    hi: { what: "टीएसएच (थायरॉइड स्टिमुलेटिंग हार्मोन) पिट्यूटरी ग्रंथि द्वारा थायरॉइड को नियंत्रित करने वाला हार्मोन है।" },
    te: { what: "TSH అనేది థైరాయిడ్ గ్రంథి పనితీరును నియంత్రించడానికి మెదడు విడుదల చేసే హార్మోన్." },
    ta: { what: "TSH என்பது தைராய்டு சுரப்பியை கட்டுப்படுத்த பிட்யூட்டரி சுரக்கும் ஹார்மோன்." },
    es: { what: "Hormona liberada por la hipófisis para regular la producción hormonal de la tiroides." },
    bn: { what: "টিএসএইচ পিটুইটারি গ্রন্থি থেকে নির্গত হরমোন যা থাইরয়েডকে নিয়ন্ত্রণ করে।" }
  },
  vitd: {
    hi: { what: "यह विटामिन डी के भंडारण स्तर को मापता है, जो हड्डियों और प्रतिरक्षा प्रणाली के लिए आवश्यक है।" },
    te: { what: "ఇది ఎముకలు మరియు రోగనిరోధక శక్తికి అవసరమైన విటమిన్ డి స్థాయిని కొలుస్తుంది." },
    ta: { what: "இது எலும்பு மற்றும் நோய் எதிர்ப்பு சக்திக்கு தேவையான வைட்டமின் டி அளவை அளவிடுகிறது." },
    es: { what: "Mide la forma de reserva de vitamina D, fundamental para los huesos y la inmunidad." },
    bn: { what: "এটি ভিটামিন ডি এর সঞ্চয় মাত্রা পরিমাপ করে যা হাড় ও রোগপ্রতিরোধের জন্য জরুরি।" }
  }
};

const I18N = {
  getLang() {
    return Store.get("selected_language", "en");
  },

  setLang(lang) {
    if (TRANSLATIONS[lang]) {
      Store.set("selected_language", lang);
    }
  },

  t(key, fallback = "") {
    const lang = I18N.getLang();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || fallback;
  },

  getParamWhat(paramId, defaultText) {
    const lang = I18N.getLang();
    if (lang === "en") return defaultText;
    const pid = (paramId || "").toLowerCase();
    for (const k of Object.keys(PARAM_TRANSLATIONS)) {
      if (pid.includes(k)) {
        const trans = PARAM_TRANSLATIONS[k][lang];
        if (trans && trans.what) return trans.what;
      }
    }
    return defaultText;
  },

  renderSelector(targetElement, onChange) {
    if (!targetElement) return;
    const current = I18N.getLang();

    const options = Object.keys(TRANSLATIONS).map((k) => {
      const t = TRANSLATIONS[k];
      return `<option value="${k}" ${k === current ? 'selected' : ''}>${t.flag} ${t.name}</option>`;
    }).join("");

    targetElement.innerHTML = `
      <div style="display:inline-flex;align-items:center;gap:6px">
        <label for="i18n-lang-select" style="font-size:11.5px;font-weight:600;color:var(--ink-2);white-space:nowrap">🌐 Language:</label>
        <select id="i18n-lang-select" class="btn btn-secondary btn-sm" style="height:32px;font-size:12px;padding:2px 8px;cursor:pointer;background:var(--surface);border:1px solid var(--line);border-radius:var(--r-sm)">
          ${options}
        </select>
      </div>
    `;

    const select = $("#i18n-lang-select");
    if (select) {
      select.addEventListener("change", (e) => {
        I18N.setLang(e.target.value);
        if (typeof onChange === "function") onChange(e.target.value);
      });
    }
  }
};

window.I18N = I18N;
window.TRANSLATIONS = TRANSLATIONS;
