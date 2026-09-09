import { SupportedLanguageCode } from '../config/languageConfig';

/**
 * WEATHERGPT TRANSLATION SERVICE
 *
 * Translates deterministic WeatherGPT responses into:
 * Telugu, Hindi, Tamil, Kannada and Malayalam.
 *
 * Numbers, percentages, temperatures, risk scores,
 * locations and weather values are preserved.
 */

export async function translateExplanationText(
  text: string,
  targetLang: SupportedLanguageCode
): Promise<string> {
  if (targetLang === 'en' || !text) {
    return text;
  }

  switch (targetLang) {
    case 'te':
      return translateTelugu(text);

    case 'hi':
      return translateHindi(text);

    case 'ta':
      return translateTamil(text);

    case 'kn':
      return translateKannada(text);

    case 'ml':
      return translateMalayalam(text);

    default:
      return text;
  }
}


/* ============================================================
   COMMON DYNAMIC PHRASES
   ============================================================ */

function translateDynamicEnglish(
  text: string,
  targetLang: SupportedLanguageCode
): string {

  let result = text;

  /* ----------------------------------------------------------
     RISK FACTORS
     ---------------------------------------------------------- */

  if (targetLang === 'hi') {

    result = result
      .replace(
        /🌧 Heavy rain \/ precipitation risk \((.*?)%\) -> \+(\d+)/gi,
        '🌧 भारी बारिश / वर्षा का जोखिम ($1%) → +$2'
      )
      .replace(
        /⚡ Lightning \/ Thunderstorm warning \((.*?)\) -> \+(\d+)/gi,
        '⚡ बिजली / गरज के साथ तूफान का खतरा ($1) → +$2'
      )
      .replace(
        /💨 Strong wind \((.*?) km\/h\) -> \+(\d+)/gi,
        '💨 तेज हवा ($1 km/h) → +$2'
      )
      .replace(
        /🌡 High temperature \((.*?)°C, feels (.*?)°C\) -> \+(\d+)/gi,
        '🌡 अधिक तापमान ($1°C, महसूस $2°C) → +$3'
      )
      .replace(
        /⚠️ Active weather warning \((.*?)\) -> \+(\d+)/gi,
        '⚠️ सक्रिय मौसम चेतावनी ($1) → +$2'
      );

    /* ----------------------------------------------------------
       RECOMMENDATIONS
       ---------------------------------------------------------- */

    result = result
      .replace(
        /Official weather warning \((.*?)\) active for your selected location\. Outdoor activity is not recommended during the selected period due to significant weather risk\./gi,
        'आपके चुने हुए स्थान के लिए आधिकारिक मौसम चेतावनी ($1) सक्रिय है। मौसम के महत्वपूर्ण जोखिम के कारण इस अवधि में बाहरी गतिविधि की सलाह नहीं दी जाती है।'
      )
      .replace(
        /Outdoor activity is not recommended during the selected period due to significant weather risk\./gi,
        'मौसम के महत्वपूर्ण जोखिम के कारण इस अवधि में बाहरी गतिविधि की सलाह नहीं दी जाती है।'
      )
      .replace(
        /Consider postponing the activity or choosing another time\./gi,
        'गतिविधि को स्थगित करने या किसी अन्य समय को चुनने पर विचार करें।'
      )
      .replace(
        /Conditions are generally manageable, but monitor the weather before starting\./gi,
        'स्थिति सामान्य रूप से संभालने योग्य है, लेकिन शुरू करने से पहले मौसम की निगरानी करें।'
      )
      .replace(
        /Conditions appear favorable for this activity during the selected period\./gi,
        'चयनित अवधि में इस गतिविधि के लिए मौसम की स्थिति अनुकूल दिखाई दे रही है।'
      )
      .replace(
        /Extreme weather factors present dangerous conditions for (.*?)\./gi,
        '$1 के लिए अत्यधिक मौसम कारक खतरनाक परिस्थितियां उत्पन्न कर रहे हैं।'
      )
      .replace(
        /Calculated risk score of (\d+)\/100 indicates significant potential weather disruption\./gi,
        '$1/100 का गणना किया गया जोखिम स्कोर मौसम में महत्वपूर्ण व्यवधान की संभावना दर्शाता है।'
      )
      .replace(
        /Moderate precipitation, wind, or thermal factors observed\./gi,
        'मध्यम वर्षा, हवा या तापमान से संबंधित जोखिम कारक पाए गए हैं।'
      )
      .replace(
        /Weather forecast projects clear, safe conditions\./gi,
        'मौसम पूर्वानुमान साफ और सुरक्षित परिस्थितियों का संकेत देता है।'
      )
      .replace(
        /Potentially lower weather risk \((\d+)\/100 vs (\d+)\/100\) based on available forecast data\./gi,
        'उपलब्ध मौसम पूर्वानुमान के आधार पर मौसम का जोखिम कम हो सकता है ($1/100 बनाम $2/100)।'
      );

    return result;
  }


  /* ============================================================
     TAMIL
     ============================================================ */

  if (targetLang === 'ta') {

    result = result
      .replace(
        /🌧 Heavy rain \/ precipitation risk \((.*?)%\) -> \+(\d+)/gi,
        '🌧 கனமழை / மழைப்பொழிவு அபாயம் ($1%) → +$2'
      )
      .replace(
        /⚡ Lightning \/ Thunderstorm warning \((.*?)\) -> \+(\d+)/gi,
        '⚡ மின்னல் / இடியுடன் கூடிய புயல் அபாயம் ($1) → +$2'
      )
      .replace(
        /💨 Strong wind \((.*?) km\/h\) -> \+(\d+)/gi,
        '💨 பலத்த காற்று ($1 km/h) → +$2'
      )
      .replace(
        /🌡 High temperature \((.*?)°C, feels (.*?)°C\) -> \+(\d+)/gi,
        '🌡 அதிக வெப்பநிலை ($1°C, உணரப்படும் வெப்பநிலை $2°C) → +$3'
      )
      .replace(
        /⚠️ Active weather warning \((.*?)\) -> \+(\d+)/gi,
        '⚠️ செயலில் உள்ள வானிலை எச்சரிக்கை ($1) → +$2'
      );

    /* ----------------------------------------------------------
       RECOMMENDATIONS
       ---------------------------------------------------------- */

    result = result
      .replace(
        /Official weather warning \((.*?)\) active for your selected location\. Outdoor activity is not recommended during the selected period due to significant weather risk\./gi,
        'நீங்கள் தேர்ந்தெடுத்த இடத்திற்கு அதிகாரப்பூர்வ வானிலை எச்சரிக்கை ($1) செயலில் உள்ளது. குறிப்பிடத்தக்க வானிலை அபாயம் காரணமாக இந்த நேரத்தில் வெளிப்புற நடவடிக்கையைத் தவிர்ப்பது நல்லது.'
      )
      .replace(
        /Outdoor activity is not recommended during the selected period due to significant weather risk\./gi,
        'குறிப்பிடத்தக்க வானிலை அபாயம் காரணமாக இந்த நேரத்தில் வெளிப்புற நடவடிக்கையைத் தவிர்ப்பது நல்லது.'
      )
      .replace(
        /Consider postponing the activity or choosing another time\./gi,
        'நடவடிக்கையை ஒத்திவைப்பது அல்லது வேறு நேரத்தைத் தேர்வு செய்வது நல்லது.'
      )
      .replace(
        /Conditions are generally manageable, but monitor the weather before starting\./gi,
        'நிலைமைகள் பொதுவாக சமாளிக்கக்கூடியவை, ஆனால் தொடங்குவதற்கு முன் வானிலையை கண்காணிக்கவும்.'
      )
      .replace(
        /Conditions appear favorable for this activity during the selected period\./gi,
        'தேர்ந்தெடுக்கப்பட்ட நேரத்தில் இந்த நடவடிக்கைக்கு வானிலை சாதகமாகத் தெரிகிறது.'
      )
      .replace(
        /Extreme weather factors present dangerous conditions for (.*?)\./gi,
        '$1 நடவடிக்கைக்கு தீவிர வானிலை காரணிகள் ஆபத்தான நிலைமைகளை உருவாக்குகின்றன.'
      )
      .replace(
        /Calculated risk score of (\d+)\/100 indicates significant potential weather disruption\./gi,
        '$1/100 என்ற கணக்கிடப்பட்ட அபாய மதிப்பெண் குறிப்பிடத்தக்க வானிலை இடையூறு ஏற்படக்கூடும் என்பதைக் காட்டுகிறது.'
      )
      .replace(
        /Moderate precipitation, wind, or thermal factors observed\./gi,
        'மிதமான மழைப்பொழிவு, காற்று அல்லது வெப்பநிலை தொடர்பான காரணிகள் காணப்படுகின்றன.'
      )
      .replace(
        /Weather forecast projects clear, safe conditions\./gi,
        'வானிலை முன்னறிவிப்பு தெளிவான மற்றும் பாதுகாப்பான நிலைமைகளை காட்டுகிறது.'
      )
      .replace(
        /Potentially lower weather risk \((\d+)\/100 vs (\d+)\/100\) based on available forecast data\./gi,
        'கிடைக்கக்கூடிய வானிலை முன்னறிவிப்பின் அடிப்படையில் குறைந்த வானிலை அபாயம் இருக்கக்கூடும் ($1/100 மற்றும் $2/100 ஒப்பீடு).'
      );

    return result;
  }


  return result;
}


/* ============================================================
   TELUGU
   ============================================================ */

function translateTelugu(text: string): string {

  let result = translateDynamicEnglish(text, 'te');

  result = result
    .replace(
      /For \*\*(.*?)\*\* in \*\*(.*?)\*\* \((.*?), (.*?)\), the calculated weather risk is \*\*(.*?)\/100 \((.*?)\)\./gi,
      '**$2** లో **$1** కోసం ($3, $4), లెక్కించిన వాతావరణ ప్రమాద స్కోర్ **$5/100 ($6)**.'
    )
    .replace(
      /\*\*WHY THIS RISK SCORE\?\*\*/gi,
      '**ఈ ప్రమాద స్కోర్ ఎందుకు?**'
    )
    .replace(
      /⚠️ \*\*Official Warning Active:\*\* (.*?) Alert \((.*?)\) is in effect for (.*?)(?:\.|\n)/gi,
      '⚠️ **అధికారిక హెచ్చరిక అమల్లో ఉంది:** **$1** అలర్ట్ ($2) **$3** కోసం అమల్లో ఉంది.'
    )
    .replace(
      /💡 \*\*Recommendation:\*\*/gi,
      '💡 **సిఫార్సు:**'
    )
    .replace(
      /🕒 \*\*Potentially Better Time Window:\*\*/gi,
      '🕒 **మెరుగైన సమయ అవకాశం:**'
    )
    .replace(
      /Recommendation:/gi,
      'సిఫార్సు:'
    );

  return result;
}


/* ============================================================
   HINDI
   ============================================================ */

function translateHindi(text: string): string {

  let result = translateDynamicEnglish(text, 'hi');

  result = result
    .replace(
      /For \*\*(.*?)\*\* in \*\*(.*?)\*\* \((.*?), (.*?)\), the calculated weather risk is \*\*(.*?)\/100 \((.*?)\)\./gi,
      '**$2** में **$1** के लिए ($3, $4), गणना किया गया मौसम जोखिम स्कोर **$5/100 ($6)** है।'
    )
    .replace(
      /\*\*WHY THIS RISK SCORE\?\*\*/gi,
      '**यह जोखिम स्कोर क्यों है?**'
    )
    .replace(
      /⚠️ \*\*Official Warning Active:\*\* (.*?) Alert \((.*?)\) is in effect for (.*?)(?:\.|\n)/gi,
      '⚠️ **आधिकारिक चेतावनी सक्रिय है:** **$1** अलर्ट ($2) **$3** के लिए प्रभावी है।'
    )
    .replace(
      /💡 \*\*Recommendation:\*\*/gi,
      '💡 **सिफारिश:**'
    )
    .replace(
      /🕒 \*\*Potentially Better Time Window:\*\*/gi,
      '🕒 **बेहतर संभावित समय:**'
    )
    .replace(
      /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Carrying rain protection would be advisable\./gi,
      '**$1** के लिए ($2, $3) उपलब्ध लाइव मौसम पूर्वानुमान के अनुसार, वर्षा की संभावना **$4%** है और अपेक्षित मौसम *$5* है। बारिश से बचाव का सामान साथ रखना उचित रहेगा।'
    )
    .replace(
      /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Significant rainfall is not currently projected\./gi,
      '**$1** के लिए ($2, $3) उपलब्ध लाइव मौसम पूर्वानुमान के अनुसार, वर्षा की संभावना **$4%** है और अपेक्षित मौसम *$5* है। फिलहाल महत्वपूर्ण बारिश की संभावना नहीं है।'
    )
    .replace(
      /The projected temperature in \*\*(.*?)\*\* for \*\*(.*?)\*\* \((.*?)\) is \*\*(.*?)°C\*\* with expected conditions of \*(.*?)\*\*\./gi,
      '**$1** में **$2** ($3) के दौरान अनुमानित तापमान **$4°C** है और मौसम की स्थिति *$5* रहने की उम्मीद है।'
    )
    .replace(
      /⚠️ Official \*\*(.*?) Alert\*\* is currently active for \*\*(.*?)\*\* \((.*?)\)\. Valid until official expiration\./gi,
      '⚠️ **$1 अलर्ट** वर्तमान में **$2** के लिए सक्रिय है ($3)। यह आधिकारिक समाप्ति समय तक मान्य रहेगा।'
    )
    .replace(
      /✓ No active severe weather warnings have been detected for \*\*(.*?)\*\* at this time \(GREEN status\)\./gi,
      '✓ इस समय **$1** के लिए कोई सक्रिय गंभीर मौसम चेतावनी नहीं मिली है (GREEN स्थिति)।'
    )
    .replace(
      /Weather forecast for \*\*(.*?)\*\* \((.*?), (.*?)\): Currently \*\*(.*?)°C\*\*, conditions \*(.*?)\*, with \*\*(.*?)%\*\* rain chance and wind speeds of \*\*(.*?) km\/h\*\*\./gi,
      '**$1** के लिए मौसम पूर्वानुमान ($2, $3): वर्तमान तापमान **$4°C**, मौसम की स्थिति *$5*, बारिश की संभावना **$6%** और हवा की गति **$7 km/h** है।'
    );

  return result;
}


/* ============================================================
   TAMIL
   ============================================================ */

function translateTamil(text: string): string {

  let result = translateDynamicEnglish(text, 'ta');

  result = result
    .replace(
      /For \*\*(.*?)\*\* in \*\*(.*?)\*\* \((.*?), (.*?)\), the calculated weather risk is \*\*(.*?)\/100 \((.*?)\)\./gi,
      '**$2** பகுதியில் **$1** நடவடிக்கைக்காக ($3, $4), கணக்கிடப்பட்ட வானிலை அபாய மதிப்பெண் **$5/100 ($6)** ஆகும்.'
    )
    .replace(
      /\*\*WHY THIS RISK SCORE\?\*\*/gi,
      '**இந்த அபாய மதிப்பெண் ஏன்?**'
    )
    .replace(
      /⚠️ \*\*Official Warning Active:\*\* (.*?) Alert \((.*?)\) is in effect for (.*?)(?:\.|\n)/gi,
      '⚠️ **அதிகாரப்பூர்வ எச்சரிக்கை செயலில் உள்ளது:** **$1** எச்சரிக்கை ($2) **$3** பகுதியில் அமலில் உள்ளது.'
    )
    .replace(
      /💡 \*\*Recommendation:\*\*/gi,
      '💡 **பரிந்துரை:**'
    )
    .replace(
      /🕒 \*\*Potentially Better Time Window:\*\*/gi,
      '🕒 **சிறந்த நேர வாய்ப்பு:**'
    )
    .replace(
      /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Carrying rain protection would be advisable\./gi,
      '**$1** பகுதிக்கான ($2, $3) நேரடி வானிலை முன்னறிவிப்பின்படி, மழைக்கான வாய்ப்பு **$4%** மற்றும் எதிர்பார்க்கப்படும் வானிலை *$5*. மழையிலிருந்து பாதுகாப்புக்கான பொருட்களை எடுத்துச் செல்வது நல்லது.'
    )
    .replace(
      /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Significant rainfall is not currently projected\./gi,
      '**$1** பகுதிக்கான ($2, $3) நேரடி வானிலை முன்னறிவிப்பின்படி, மழைக்கான வாய்ப்பு **$4%** மற்றும் எதிர்பார்க்கப்படும் வானிலை *$5*. தற்போது குறிப்பிடத்தக்க மழைப்பொழிவு எதிர்பார்க்கப்படவில்லை.'
    )
    .replace(
      /The projected temperature in \*\*(.*?)\*\* for \*\*(.*?)\*\* \((.*?)\) is \*\*(.*?)°C\*\* with expected conditions of \*(.*?)\*\*\./gi,
      '**$1** பகுதியில் **$2** ($3) நேரத்தில் எதிர்பார்க்கப்படும் வெப்பநிலை **$4°C**, மேலும் வானிலை *$5* ஆக இருக்கும்.'
    )
    .replace(
      /⚠️ Official \*\*(.*?) Alert\*\* is currently active for \*\*(.*?)\*\* \((.*?)\)\. Valid until official expiration\./gi,
      '⚠️ **$1 எச்சரிக்கை** தற்போது **$2** பகுதியில் செயல்பாட்டில் உள்ளது ($3). அதிகாரப்பூர்வ காலாவதி நேரம் வரை இது செல்லுபடியாகும்.'
    )
    .replace(
      /✓ No active severe weather warnings have been detected for \*\*(.*?)\*\* at this time \(GREEN status\)\./gi,
      '✓ தற்போது **$1** பகுதிக்கு கடுமையான வானிலை எச்சரிக்கைகள் எதுவும் இல்லை (GREEN நிலை).'
    )
    .replace(
      /Weather forecast for \*\*(.*?)\*\* \((.*?), (.*?)\): Currently \*\*(.*?)°C\*\*, conditions \*(.*?)\*, with \*\*(.*?)%\*\* rain chance and wind speeds of \*\*(.*?) km\/h\*\*\./gi,
      '**$1** வானிலை முன்னறிவிப்பு ($2, $3): தற்போதைய வெப்பநிலை **$4°C**, வானிலை *$5*, மழைக்கான வாய்ப்பு **$6%**, காற்றின் வேகம் **$7 km/h**.'
    );

  return result;
}


/* ============================================================
   KANNADA
   ============================================================ */

function translateKannada(text: string): string {

  let result = text;

  result = result
    .replace(
      /For \*\*(.*?)\*\* in \*\*(.*?)\*\* \((.*?), (.*?)\), the calculated weather risk is \*\*(.*?)\/100 \((.*?)\)\./gi,
      '**$2** ನಲ್ಲಿ **$1** ಚಟುವಟಿಕೆಗೆ ($3, $4), ಲೆಕ್ಕಹಾಕಿದ ಹವಾಮಾನ ಅಪಾಯದ ಸ್ಕೋರ್ **$5/100 ($6)** ಆಗಿದೆ.'
    )
    .replace(
      /\*\*WHY THIS RISK SCORE\?\*\*/gi,
      '**ಈ ಅಪಾಯದ ಸ್ಕೋರ್ ಏಕೆ?**'
    )
    .replace(
      /💡 \*\*Recommendation:\*\*/gi,
      '💡 **ಶಿಫಾರಸು:**'
    )
    .replace(
      /🕒 \*\*Potentially Better Time Window:\*\*/gi,
      '🕒 **ಉತ್ತಮ ಸಮಯದ ಸಾಧ್ಯತೆ:**'
    )
    .replace(
      /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Carrying rain protection would be advisable\./gi,
      '**$1** ಗಾಗಿ ($2, $3) ಲಭ್ಯವಿರುವ ನೇರ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಯ ಪ್ರಕಾರ, ಮಳೆಯ ಸಾಧ್ಯತೆ **$4%** ಮತ್ತು ನಿರೀಕ್ಷಿತ ಪರಿಸ್ಥಿತಿ *$5*. ಮಳೆಯಿಂದ ರಕ್ಷಣೆಗಾಗಿ ಅಗತ್ಯ ವಸ್ತುಗಳನ್ನು ತೆಗೆದುಕೊಂಡು ಹೋಗುವುದು ಸೂಕ್ತ.'
    )
    .replace(
      /The projected temperature in \*\*(.*?)\*\* for \*\*(.*?)\*\* \((.*?)\) is \*\*(.*?)°C\*\* with expected conditions of \*(.*?)\*\*\./gi,
      '**$1** ನಲ್ಲಿ **$2** ($3) ಸಮಯದಲ್ಲಿ ನಿರೀಕ್ಷಿತ ತಾಪಮಾನ **$4°C** ಮತ್ತು ಹವಾಮಾನ ಪರಿಸ್ಥಿತಿ *$5* ಆಗಿರುತ್ತದೆ.'
    )
    .replace(
      /⚠️ Official \*\*(.*?) Alert\*\* is currently active for \*\*(.*?)\*\* \((.*?)\)\. Valid until official expiration\./gi,
      '⚠️ **$1 ಎಚ್ಚರಿಕೆ** ಪ್ರಸ್ತುತ **$2** ನಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿದೆ ($3). ಅಧಿಕೃತ ಅವಧಿ ಮುಗಿಯುವವರೆಗೆ ಇದು ಮಾನ್ಯವಾಗಿರುತ್ತದೆ.'
    )
    .replace(
      /✓ No active severe weather warnings have been detected for \*\*(.*?)\*\* at this time \(GREEN status\)\./gi,
      '✓ ಪ್ರಸ್ತುತ **$1** ನಲ್ಲಿ ಯಾವುದೇ ಸಕ್ರಿಯ ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ (GREEN ಸ್ಥಿತಿ).'
    )
    .replace(
      /Weather forecast for \*\*(.*?)\*\* \((.*?), (.*?)\): Currently \*\*(.*?)°C\*\*, conditions \*(.*?)\*, with \*\*(.*?)%\*\* rain chance and wind speeds of \*\*(.*?) km\/h\*\*\./gi,
      '**$1** ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ($2, $3): ಪ್ರಸ್ತುತ ತಾಪಮಾನ **$4°C**, ಪರಿಸ್ಥಿತಿ *$5*, ಮಳೆಯ ಸಾಧ್ಯತೆ **$6%**, ಗಾಳಿಯ ವೇಗ **$7 km/h**.'
    );

  return result;
}


/* ============================================================
   MALAYALAM
   ============================================================ */

function translateMalayalam(text: string): string {

  let result = text;

  result = result
    .replace(
      /For \*\*(.*?)\*\* in \*\*(.*?)\*\* \((.*?), (.*?)\), the calculated weather risk is \*\*(.*?)\/100 \((.*?)\)\./gi,
      '**$2** ൽ **$1** എന്ന പ്രവർത്തനത്തിന് ($3, $4), കണക്കാക്കിയ കാലാവസ്ഥാ അപകടസാധ്യത **$5/100 ($6)** ആണ്.'
    )
    .replace(
      /\*\*WHY THIS RISK SCORE\?\*\*/gi,
      '**ഈ അപകടസാധ്യതാ സ്കോർ എന്തുകൊണ്ട്?**'
    )
    .replace(
      /💡 \*\*Recommendation:\*\*/gi,
      '💡 **ശുപാർശ:**'
    )
    .replace(
      /🕒 \*\*Potentially Better Time Window:\*\*/gi,
      '🕒 **കൂടുതൽ അനുയോജ്യമായ സമയം:**'
    )
    .replace(
      /Based on live forecast telemetry for \*\*(.*?)\*\* \((.*?), (.*?)\), the precipitation probability is \*\*(.*?)%\*\* with expected conditions of \*(.*?)\*\. Carrying rain protection would be advisable\./gi,
      '**$1** എന്ന സ്ഥലത്തേക്കുള്ള ($2, $3) തത്സമയ കാലാവസ്ഥാ പ്രവചനമനുസരിച്ച്, മഴയ്ക്കുള്ള സാധ്യത **$4%** ആണ്, പ്രതീക്ഷിക്കുന്ന കാലാവസ്ഥ *$5* ആണ്. മഴയിൽ നിന്ന് സംരക്ഷിക്കാനുള്ള സാധനങ്ങൾ കൂടെ കരുതുന്നത് ഉചിതമാണ്.'
    )
    .replace(
      /The projected temperature in \*\*(.*?)\*\* for \*\*(.*?)\*\* \((.*?)\) is \*\*(.*?)°C\*\* with expected conditions of \*(.*?)\*\*\./gi,
      '**$1** ൽ **$2** ($3) സമയത്തെ പ്രതീക്ഷിക്കുന്ന താപനില **$4°C** ആണ്, കാലാവസ്ഥ *$5* ആയിരിക്കും.'
    )
    .replace(
      /⚠️ Official \*\*(.*?) Alert\*\* is currently active for \*\*(.*?)\*\* \((.*?)\)\. Valid until official expiration\./gi,
      '⚠️ **$1 മുന്നറിയിപ്പ്** നിലവിൽ **$2** ൽ സജീവമാണ് ($3). ഔദ്യോഗിക കാലാവധി വരെ ഇത് സാധുവായിരിക്കും.'
    )
    .replace(
      /✓ No active severe weather warnings have been detected for \*\*(.*?)\*\* at this time \(GREEN status\)\./gi,
      '✓ നിലവിൽ **$1** ൽ സജീവമായ ഗുരുതര കാലാവസ്ഥാ മുന്നറിയിപ്പുകളൊന്നും കണ്ടെത്തിയിട്ടില്ല (GREEN നില).'
    )
    .replace(
      /Weather forecast for \*\*(.*?)\*\* \((.*?), (.*?)\): Currently \*\*(.*?)°C\*\*, conditions \*(.*?)\*, with \*\*(.*?)%\*\* rain chance and wind speeds of \*\*(.*?) km\/h\*\*\./gi,
      '**$1** കാലാവസ്ഥാ പ്രവചനം ($2, $3): നിലവിലെ താപനില **$4°C**, കാലാവസ്ഥ *$5*, മഴയ്ക്കുള്ള സാധ്യത **$6%**, കാറ്റിന്റെ വേഗത **$7 km/h**.'
    );

  return result;
}
