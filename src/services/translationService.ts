import { SupportedLanguageCode } from '../config/languageConfig';

/**
 * WEATHERGPT TRANSLATION SERVICE
 *
 * Converts WeatherGPT's deterministic English response templates
 * into the user's selected Indian language.
 *
 * Supported:
 *   en = English
 *   te = Telugu
 *   ta = Tamil
 *   hi = Hindi
 *   kn = Kannada
 *   ml = Malayalam
 *
 * Important:
 * - Weather numbers are preserved.
 * - Temperature values are preserved.
 * - Rain percentages are preserved.
 * - Wind speeds are preserved.
 * - Location names are preserved.
 * - Dates and time ranges are preserved.
 * - Weather condition names are translated when known.
 * - Markdown formatting is preserved.
 */

export async function translateExplanationText(
  text: string,
  targetLang: SupportedLanguageCode
): Promise<string> {
  if (!text || targetLang === 'en') {
    return text;
  }

  return formatLocalizedProse(text, targetLang);
}

function formatLocalizedProse(
  text: string,
  targetLang: SupportedLanguageCode
): string {
  let result = text;

  /*
   * ---------------------------------------------------------
   * WEATHER CONDITION TRANSLATION
   * ---------------------------------------------------------
   */

  const conditionTranslations: Record<
    SupportedLanguageCode,
    Record<string, string>
  > = {
    en: {
      clear: 'Clear',
      'mainly clear': 'Mainly clear',
      'partly cloudy': 'Partly cloudy',
      cloudy: 'Cloudy',
      overcast: 'Overcast',
      'light rain': 'Light rain',
      rain: 'Rain',
      'heavy rain': 'Heavy rain',
      thunderstorm: 'Thunderstorm',
      snow: 'Snow',
      fog: 'Fog',
      mist: 'Mist'
    },

    te: {
      clear: 'ఆకాశం నిర్మలంగా ఉంది',
      'mainly clear': 'ఎక్కువగా నిర్మలమైన ఆకాశం',
      'partly cloudy': 'కొంత మేఘావృతంగా ఉంది',
      cloudy: 'మేఘావృతంగా ఉంది',
      overcast: 'పూర్తిగా మేఘావృతంగా ఉంది',
      'light rain': 'తేలికపాటి వర్షం',
      rain: 'వర్షం',
      'heavy rain': 'భారీ వర్షం',
      thunderstorm: 'ఉరుములతో కూడిన వర్షం',
      snow: 'మంచు',
      fog: 'పొగమంచు',
      mist: 'పొగమంచు'
    },

    ta: {
      clear: 'வானம் தெளிவாக உள்ளது',
      'mainly clear': 'பெரும்பாலும் தெளிவான வானம்',
      'partly cloudy': 'ஓரளவு மேகமூட்டம்',
      cloudy: 'மேகமூட்டமாக உள்ளது',
      overcast: 'முழுமையாக மேகமூட்டமாக உள்ளது',
      'light rain': 'லேசான மழை',
      rain: 'மழை',
      'heavy rain': 'கனமழை',
      thunderstorm: 'இடியுடன் கூடிய மழை',
      snow: 'பனிப்பொழிவு',
      fog: 'மூடுபனி',
      mist: 'பனிமூட்டம்'
    },

    hi: {
      clear: 'आसमान साफ है',
      'mainly clear': 'आसमान मुख्य रूप से साफ है',
      'partly cloudy': 'आंशिक रूप से बादल छाए हैं',
      cloudy: 'बादल छाए हैं',
      overcast: 'पूरी तरह बादल छाए हैं',
      'light rain': 'हल्की बारिश',
      rain: 'बारिश',
      'heavy rain': 'भारी बारिश',
      thunderstorm: 'गरज के साथ बारिश',
      snow: 'बर्फबारी',
      fog: 'कोहरा',
      mist: 'धुंध'
    },

    kn: {
      clear: 'ಆಕಾಶವು ಸ್ಪಷ್ಟವಾಗಿದೆ',
      'mainly clear': 'ಹೆಚ್ಚಾಗಿ ಸ್ಪಷ್ಟವಾದ ಆಕಾಶ',
      'partly cloudy': 'ಭಾಗಶಃ ಮೋಡ ಕವಿದಿದೆ',
      cloudy: 'ಮೋಡ ಕವಿದಿದೆ',
      overcast: 'ಸಂಪೂರ್ಣವಾಗಿ ಮೋಡ ಕವಿದಿದೆ',
      'light rain': 'ಲಘು ಮಳೆ',
      rain: 'ಮಳೆ',
      'heavy rain': 'ಭಾರಿ ಮಳೆ',
      thunderstorm: 'ಗುಡುಗು ಸಹಿತ ಮಳೆ',
      snow: 'ಹಿಮಪಾತ',
      fog: 'ಮಂಜು',
      mist: 'ಮಂಜು'
    },

    ml: {
      clear: 'ആകാശം തെളിഞ്ഞതാണ്',
      'mainly clear': 'കൂടുതലും തെളിഞ്ഞ ആകാശം',
      'partly cloudy': 'ഭാഗികമായി മേഘാവൃതമാണ്',
      cloudy: 'മേഘാവൃതമാണ്',
      overcast: 'പൂർണ്ണമായും മേഘാവൃതമാണ്',
      'light rain': 'നേരിയ മഴ',
      rain: 'മഴ',
      'heavy rain': 'കനത്ത മഴ',
      thunderstorm: 'ഇടിമിന്നലോടുകൂടിയ മഴ',
      snow: 'മഞ്ഞുവീഴ്ച',
      fog: 'മൂടൽമഞ്ഞ്',
      mist: 'മഞ്ഞ്'
    }
  };

  /*
   * Translate condition words inside italic Markdown:
   *
   * conditions *Overcast*
   */
  result = result.replace(
    /\*([^*]+)\*/g,
    (fullMatch, condition: string) => {
      const normalized = String(condition).trim().toLowerCase();

      const translated =
        conditionTranslations[targetLang]?.[normalized];

      return translated
        ? `*${translated}*`
        : fullMatch;
    }
  );

  /*
   * ---------------------------------------------------------
   * GENERIC CURRENT / FORECAST WEATHER RESPONSE
   *
   * Example:
   *
   * Weather for **Chennai** (Today, now): **32°C**,
   * conditions *Overcast*, with a **52%** chance of rain
   * and wind speeds of **8 km/h**.
   * ---------------------------------------------------------
   */

  let match = result.match(
    /^Weather for \*\*(.*?)\*\* \((.*?)\): \*\*(.*?)\*\*, conditions \*(.*?)\*, with a \*\*(.*?)\*\* chance of rain and wind speeds of \*\*(.*?)\*\*\.?$/i
  );

  if (match) {
    const [, location, dateTime, temperature, condition, rain, wind] =
      match;

    const localizedCondition =
      conditionTranslations[targetLang]?.[
        condition.trim().toLowerCase()
      ] || condition;

    const templates: Record<
      SupportedLanguageCode,
      string
    > = {
      en:
        `Weather for **${location}** (${dateTime}): **${temperature}**, conditions *${localizedCondition}*, with a **${rain}** chance of rain and wind speeds of **${wind}**.`,

      te:
        `**${location}**లో (${dateTime}) వాతావరణం: ఉష్ణోగ్రత **${temperature}**, పరిస్థితులు *${localizedCondition}*, వర్షం పడే అవకాశం **${rain}**, గాలి వేగం **${wind}**.`,

      ta:
        `**${location}** பகுதியில் (${dateTime}) வானிலை: வெப்பநிலை **${temperature}**, நிலை *${localizedCondition}*, மழைக்கான வாய்ப்பு **${rain}**, காற்றின் வேகம் **${wind}**.`,

      hi:
        `**${location}** में (${dateTime}) मौसम: तापमान **${temperature}**, स्थिति *${localizedCondition}*, बारिश की संभावना **${rain}**, हवा की गति **${wind}**.`,

      kn:
        `**${location}** ನಲ್ಲಿ (${dateTime}) ಹವಾಮಾನ: ತಾಪಮಾನ **${temperature}**, ಪರಿಸ್ಥಿತಿ *${localizedCondition}*, ಮಳೆಯ ಸಾಧ್ಯತೆ **${rain}**, ಗಾಳಿಯ ವೇಗ **${wind}**.`,

      ml:
        `**${location}** ൽ (${dateTime}) കാലാവസ്ഥ: താപനില **${temperature}**, സാഹചര്യം *${localizedCondition}*, മഴയ്ക്ക് **${rain}** സാധ്യത, കാറ്റിന്റെ വേഗത **${wind}**.`
    };

    return templates[targetLang];
  }

  /*
   * ---------------------------------------------------------
   * OLD GENERIC WEATHER FORECAST TEMPLATE
   * ---------------------------------------------------------
   */

  match = result.match(
    /^Weather forecast for \*\*(.*?)\*\* \((.*?)\): Currently \*\*(.*?)\*\*, conditions \*(.*?)\*, with \*\*(.*?)\*\* rain chance and wind speeds of \*\*(.*?)\*\*\.?$/i
  );

  if (match) {
    const [, location, dateTime, temperature, condition, rain, wind] =
      match;

    const localizedCondition =
      conditionTranslations[targetLang]?.[
        condition.trim().toLowerCase()
      ] || condition;

    const templates: Record<
      SupportedLanguageCode,
      string
    > = {
      en:
        `Weather forecast for **${location}** (${dateTime}): Currently **${temperature}**, conditions *${localizedCondition}*, with **${rain}** rain chance and wind speeds of **${wind}**.`,

      te:
        `**${location}** కోసం (${dateTime}) వాతావరణ అంచనా: ప్రస్తుతం ఉష్ణోగ్రత **${temperature}**, పరిస్థితులు *${localizedCondition}*, వర్షం అవకాశం **${rain}**, గాలి వేగం **${wind}**.`,

      ta:
        `**${location}** க்கான (${dateTime}) வானிலை முன்னறிவிப்பு: தற்போது வெப்பநிலை **${temperature}**, நிலை *${localizedCondition}*, மழைக்கான வாய்ப்பு **${rain}**, காற்றின் வேகம் **${wind}**.`,

      hi:
        `**${location}** के लिए (${dateTime}) मौसम पूर्वानुमान: वर्तमान तापमान **${temperature}**, स्थिति *${localizedCondition}*, बारिश की संभावना **${rain}**, हवा की गति **${wind}**.`,

      kn:
        `**${location}** ಗಾಗಿ (${dateTime}) ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ: ಪ್ರಸ್ತುತ ತಾಪಮಾನ **${temperature}**, ಪರಿಸ್ಥಿತಿ *${localizedCondition}*, ಮಳೆಯ ಸಾಧ್ಯತೆ **${rain}**, ಗಾಳಿಯ ವೇಗ **${wind}**.`,

      ml:
        `**${location}** ന്റെ (${dateTime}) കാലാവസ്ഥാ പ്രവചനം: നിലവിലെ താപനില **${temperature}**, സാഹചര്യം *${localizedCondition}*, മഴയ്ക്കുള്ള സാധ്യത **${rain}**, കാറ്റിന്റെ വേഗത **${wind}**.`
    };

    return templates[targetLang];
  }

  /*
   * ---------------------------------------------------------
   * RAIN FORECAST
   * ---------------------------------------------------------
   */

  match = result.match(
    /^Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?)\), the precipitation probability is \*\*(.*?)\*\* with expected conditions of \*(.*?)\*\. (.*)$/i
  );

  if (match) {
    const [, location, dateTime, rain, condition, finalSentence] =
      match;

    const localizedCondition =
      conditionTranslations[targetLang]?.[
        condition.trim().toLowerCase()
      ] || condition;

    const highRain =
      finalSentence.toLowerCase().includes('carrying rain protection');

    const templates: Record<
      SupportedLanguageCode,
      string
    > = {
      en:
        `Based on live forecast telemetry for **${location}** (${dateTime}), the precipitation probability is **${rain}** with expected conditions of *${localizedCondition}*. ${finalSentence}`,

      te:
        `**${location}** కోసం (${dateTime}) ప్రత్యక్ష వాతావరణ అంచనా ప్రకారం, వర్షపాతం అవకాశం **${rain}**, పరిస్థితులు *${localizedCondition}*. ${
          highRain
            ? 'వర్షం నుండి రక్షణ కోసం గొడుగు లేదా రెయిన్‌కోట్ తీసుకెళ్లడం మంచిది.'
            : 'గణనీయమైన వర్షపాతం ప్రస్తుతం అంచనా వేయబడలేదు.'
        }`,

      ta:
        `**${location}** பகுதியில் (${dateTime}) நேரடி வானிலை முன்னறிவிப்பின்படி, மழைக்கான வாய்ப்பு **${rain}**, நிலை *${localizedCondition}*. ${
          highRain
            ? 'மழையிலிருந்து பாதுகாப்புக்காக குடை அல்லது மழைக்கோட்டை எடுத்துச் செல்வது நல்லது.'
            : 'குறிப்பிடத்தக்க மழை தற்போது எதிர்பார்க்கப்படவில்லை.'
        }`,

      hi:
        `**${location}** के लिए (${dateTime}) लाइव मौसम पूर्वानुमान के अनुसार, वर्षा की संभावना **${rain}** है और स्थिति *${localizedCondition}* है। ${
          highRain
            ? 'बारिश से बचाव के लिए छाता या रेनकोट साथ रखना उचित होगा।'
            : 'अभी महत्वपूर्ण बारिश की संभावना नहीं है।'
        }`,

      kn:
        `**${location}** ನಲ್ಲಿ (${dateTime}) ನೇರ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯ ಪ್ರಕಾರ, ಮಳೆಯ ಸಾಧ್ಯತೆ **${rain}**, ಪರಿಸ್ಥಿತಿ *${localizedCondition}*. ${
          highRain
            ? 'ಮಳೆಯಿಂದ ರಕ್ಷಣೆಗಾಗಿ ಛತ್ರಿ ಅಥವಾ ರೇನ್‌ಕೋಟ್ ತೆಗೆದುಕೊಂಡು ಹೋಗುವುದು ಉತ್ತಮ.'
            : 'ಗಮನಾರ್ಹ ಮಳೆಯ ನಿರೀಕ್ಷೆ ಪ್ರಸ್ತುತ ಇಲ್ಲ.'
        }`,

      ml:
        `**${location}** ൽ (${dateTime}) ലഭ്യമായ തത്സമയ കാലാവസ്ഥാ പ്രവചനമനുസരിച്ച്, മഴയ്ക്കുള്ള സാധ്യത **${rain}** ആണ്, സാഹചര്യം *${localizedCondition}*. ${
          highRain
            ? 'മഴയിൽ നിന്ന് സംരക്ഷണത്തിനായി കുടയോ റെയിൻകോട്ടോ കരുതുന്നത് നല്ലതാണ്.'
            : 'കാര്യമായ മഴ ഇപ്പോൾ പ്രതീക്ഷിക്കുന്നില്ല.'
        }`
    };

    return templates[targetLang];
  }

  /*
   * ---------------------------------------------------------
   * TEMPERATURE
   * ---------------------------------------------------------
   */

  match = result.match(
    /^The projected temperature in \*\*(.*?)\*\* for \*\*(.*?)\*\* \((.*?)\) is \*\*(.*?)\*\* with expected conditions of \*(.*?)\*\.?$/i
  );

  if (match) {
    const [, location, date, time, temperature, condition] =
      match;

    const localizedCondition =
      conditionTranslations[targetLang]?.[
        condition.trim().toLowerCase()
      ] || condition;

    const templates: Record<
      SupportedLanguageCode,
      string
    > = {
      en:
        `The projected temperature in **${location}** for **${date}** (${time}) is **${temperature}** with expected conditions of *${localizedCondition}*.`,

      te:
        `**${location}**లో **${date}** (${time}) అంచనా ఉష్ణోగ్రత **${temperature}**, పరిస్థితులు *${localizedCondition}*.`,

      ta:
        `**${location}** பகுதியில் **${date}** (${time}) எதிர்பார்க்கப்படும் வெப்பநிலை **${temperature}**, நிலை *${localizedCondition}*.`,

      hi:
        `**${location}** में **${date}** (${time}) अनुमानित तापमान **${temperature}** है और स्थिति *${localizedCondition}* है।`,

      kn:
        `**${location}** ನಲ್ಲಿ **${date}** (${time}) ನಿರೀಕ್ಷಿತ ತಾಪಮಾನ **${temperature}**, ಪರಿಸ್ಥಿತಿ *${localizedCondition}*.`,

      ml:
        `**${location}** ൽ **${date}** (${time}) പ്രതീക്ഷിക്കുന്ന താപനില **${temperature}**, സാഹചര്യം *${localizedCondition}*.`
    };

    return templates[targetLang];
  }

  /*
   * ---------------------------------------------------------
   * WEATHER ALERT
   * ---------------------------------------------------------
   */

  match = result.match(
    /^✓ No active severe weather warnings have been detected for \*\*(.*?)\*\* at this time \(GREEN status\)\.?$/i
  );

  if (match) {
    const [, location] = match;

    const templates: Record<
      SupportedLanguageCode,
      string
    > = {
      en:
        `✓ No active severe weather warnings have been detected for **${location}** at this time (GREEN status).`,

      te:
        `✓ ప్రస్తుతం **${location}**లో తీవ్రమైన వాతావరణ హెచ్చరికలు ఏవీ లేవు (GREEN స్థితి).`,

      ta:
        `✓ தற்போது **${location}** பகுதியில் தீவிர வானிலை எச்சரிக்கைகள் எதுவும் இல்லை (GREEN நிலை).`,

      hi:
        `✓ इस समय **${location}** में कोई सक्रिय गंभीर मौसम चेतावनी नहीं है (GREEN स्थिति)।`,

      kn:
        `✓ ಪ್ರಸ್ತುತ **${location}** ನಲ್ಲಿ ಯಾವುದೇ ಸಕ್ರಿಯ ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ (GREEN ಸ್ಥಿತಿ).`,

      ml:
        `✓ നിലവിൽ **${location}** ൽ സജീവമായ ഗുരുതര കാലാവസ്ഥാ മുന്നറിയിപ്പുകളൊന്നുമില്ല (GREEN നില).`
    };

    return templates[targetLang];
  }

  /*
   * ---------------------------------------------------------
   * COMMON PHRASE TRANSLATIONS
   *
   * These cover the decision/risk templates and older response
   * formats as a fallback.
   * ---------------------------------------------------------
   */

  if (targetLang === 'te') {
    result = result
      .replace(
        /For \*\*(.*?)\*\* in \*\*(.*?)\*\*/g,
        '**$2**లో **$1** కోసం'
      )
      .replace(
        /the calculated weather risk is \*\*(.*?)\*\*/gi,
        'లెక్కించిన వాతావరణ ప్రమాద స్కోర్ **$1**'
      )
      .replace(
        /WHY THIS RISK SCORE\?/gi,
        'ఈ వాతావరణ ప్రమాద స్కోర్ ఎందుకు?'
      )
      .replace(
        /Official Warning Active:/gi,
        'అధికారిక హెచ్చరిక సక్రియంగా ఉంది:'
      )
      .replace(
        /Recommendation:/gi,
        'సిఫార్సు:'
      )
      .replace(
        /Potentially Better Time Window:/gi,
        'మెరుగైన సమయ అవకాశం:'
      )
      .replace(
        /For travel in/gi,
        'ప్రయాణం కోసం'
      )
      .replace(
        /For outdoor activities in/gi,
        'బయటి కార్యకలాపాల కోసం'
      )
      .replace(
        /For your event in/gi,
        'మీ కార్యక్రమం కోసం'
      )
      .replace(
        /For agricultural planning in/gi,
        'వ్యవసాయ ప్రణాళిక కోసం'
      );
  }

  if (targetLang === 'ta') {
    result = result
      .replace(
        /For \*\*(.*?)\*\* in \*\*(.*?)\*\*/g,
        '**$2** இல் **$1**க்காக'
      )
      .replace(
        /the calculated weather risk is \*\*(.*?)\*\*/gi,
        'கணக்கிடப்பட்ட வானிலை அபாய மதிப்பெண் **$1**'
      )
      .replace(
        /WHY THIS RISK SCORE\?/gi,
        'இந்த வானிலை அபாய மதிப்பெண் ஏன்?'
      )
      .replace(
        /Official Warning Active:/gi,
        'அதிகாரப்பூர்வ எச்சரிக்கை செயலில் உள்ளது:'
      )
      .replace(
        /Recommendation:/gi,
        'பரிந்துரை:'
      )
      .replace(
        /Potentially Better Time Window:/gi,
        'சிறந்த நேர வாய்ப்பு:'
      )
      .replace(
        /For travel in/gi,
        'பயணத்திற்கு'
      )
      .replace(
        /For outdoor activities in/gi,
        'வெளிப்புற நடவடிக்கைகளுக்கு'
      )
      .replace(
        /For your event in/gi,
        'உங்கள் நிகழ்விற்கு'
      )
      .replace(
        /For agricultural planning in/gi,
        'விவசாயத் திட்டமிடலுக்கு'
      );
  }

  if (targetLang === 'hi') {
    result = result
      .replace(
        /For \*\*(.*?)\*\* in \*\*(.*?)\*\*/g,
        '**$2** में **$1** के लिए'
      )
      .replace(
        /the calculated weather risk is \*\*(.*?)\*\*/gi,
        'गणना किया गया मौसम जोखिम स्कोर **$1** है'
      )
      .replace(
        /WHY THIS RISK SCORE\?/gi,
        'यह मौसम जोखिम स्कोर क्यों है?'
      )
      .replace(
        /Official Warning Active:/gi,
        'आधिकारिक चेतावनी सक्रिय है:'
      )
      .replace(
        /Recommendation:/gi,
        'सिफारिश:'
      )
      .replace(
        /Potentially Better Time Window:/gi,
        'संभावित बेहतर समय:'
      )
      .replace(
        /For travel in/gi,
        'यात्रा के लिए'
      )
      .replace(
        /For outdoor activities in/gi,
        'बाहरी गतिविधियों के लिए'
      )
      .replace(
        /For your event in/gi,
        'आपके कार्यक्रम के लिए'
      )
      .replace(
        /For agricultural planning in/gi,
        'कृषि योजना के लिए'
      );
  }

  if (targetLang === 'kn') {
    result = result
      .replace(
        /For \*\*(.*?)\*\* in \*\*(.*?)\*\*/g,
        '**$2** ನಲ್ಲಿ **$1** ಗಾಗಿ'
      )
      .replace(
        /the calculated weather risk is \*\*(.*?)\*\*/gi,
        'ಲೆಕ್ಕಹಾಕಿದ ಹವಾಮಾನ ಅಪಾಯದ ಅಂಕ **$1**'
      )
      .replace(
        /WHY THIS RISK SCORE\?/gi,
        'ಈ ಹವಾಮಾನ ಅಪಾಯದ ಅಂಕ ಏಕೆ?'
      )
      .replace(
        /Official Warning Active:/gi,
        'ಅಧಿಕೃತ ಎಚ್ಚರಿಕೆ ಸಕ್ರಿಯವಾಗಿದೆ:'
      )
      .replace(
        /Recommendation:/gi,
        'ಶಿಫಾರಸು:'
      )
      .replace(
        /Potentially Better Time Window:/gi,
        'ಸಂಭಾವ್ಯ ಉತ್ತಮ ಸಮಯ:'
      )
      .replace(
        /For travel in/gi,
        'ಪ್ರಯಾಣಕ್ಕಾಗಿ'
      )
      .replace(
        /For outdoor activities in/gi,
        'ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಗಳಿಗಾಗಿ'
      )
      .replace(
        /For your event in/gi,
        'ನಿಮ್ಮ ಕಾರ್ಯಕ್ರಮಕ್ಕಾಗಿ'
      )
      .replace(
        /For agricultural planning in/gi,
        'ಕೃಷಿ ಯೋಜನೆಗಾಗಿ'
      );
  }

  if (targetLang === 'ml') {
    result = result
      .replace(
        /For \*\*(.*?)\*\* in \*\*(.*?)\*\*/g,
        '**$2** ൽ **$1** നായി'
      )
      .replace(
        /the calculated weather risk is \*\*(.*?)\*\*/gi,
        'കണക്കാക്കിയ കാലാവസ്ഥാ അപകടസാധ്യത **$1**'
      )
      .replace(
        /WHY THIS RISK SCORE\?/gi,
        'ഈ കാലാവസ്ഥാ അപകടസാധ്യത സ്കോർ എന്തുകൊണ്ട്?'
      )
      .replace(
        /Official Warning Active:/gi,
        'ഔദ്യോഗിക മുന്നറിയിപ്പ് സജീവമാണ്:'
      )
      .replace(
        /Recommendation:/gi,
        'ശുപാർശ:'
      )
      .replace(
        /Potentially Better Time Window:/gi,
        'സാധ്യമായ മികച്ച സമയം:'
      )
      .replace(
        /For travel in/gi,
        'യാത്രയ്ക്കായി'
      )
      .replace(
        /For outdoor activities in/gi,
        'ഔട്ട്ഡോർ പ്രവർത്തനങ്ങൾക്കായി'
      )
      .replace(
        /For your event in/gi,
        'നിങ്ങളുടെ പരിപാടിക്കായി'
      )
      .replace(
        /For agricultural planning in/gi,
        'കാർഷിക ആസൂത്രണത്തിനായി'
      );
  }

  return result;
}
