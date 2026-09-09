import { SupportedLanguageCode } from '../config/languageConfig';

export const LOCALES: Record<SupportedLanguageCode, Record<string, string>> = {
  en: {
    appName: 'WeatherGPT',
    tagline: 'Weather-Aware AI Decision Assistant',
    welcomeMessage: 'Ask me anything about the weather.',
    searchPlaceholder: 'Search city or location...',
    useMyLocation: 'Use My Location',
    refreshWeather: 'Refresh Weather',
    clearChat: 'Clear Chat',
    newSession: 'New Session',

    // Nav
    navHome: 'Home',
    navAlerts: 'Alerts',
    navDecision: 'Decision Assistant',
    navClimate: 'Climate Insights',

    // Decision Assistant UI
    decisionTitle: 'Weather Decision Assistant',
    decisionSubtitle: "Tell us what you're planning. WeatherGPT will analyze weather conditions and assess weather risks.",
    planningQuestion: 'What are you planning to do?',
    selectActivity: 'Select Planned Activity',
    selectDate: 'Select Target Date',
    selectTime: 'Select Target Time Period',
    analyzeButton: 'Analyze Weather Risk',
    evaluatingModel: 'Evaluating Risk Model...',
    riskScoreLabel: 'Weather Risk Score',
    recommendationLabel: 'Decision Support Recommendation',
    whyThisScore: 'How was this score calculated?',
    betterTimeTitle: 'Potentially Better Weather Window',
    compareTimeTitle: 'Compare Two Time Periods',
    compareButton: 'Run Comparison',
    recentDecisions: 'Recent Decision Assessments',
    shareAssessment: 'Share Assessment',

    // Alerts UI
    alertsTitle: 'Severe Weather Warning & Alert Dashboard',
    alertsSubtitle: 'IMD official warning feeds, location-matched advisories, and emergency action protocols.',
    noActiveWarning: 'No Active Severe Weather Warning',
    noActiveWarningSub: 'Your selected location is currently under GREEN status with no severe weather warnings.',

    // Common
    locationLabel: 'Location',
    sourceLabel: 'Data Source',
    disclaimerText: 'WeatherGPT provides forecast-based decision support, not guaranteed safety advice. Always follow official weather warnings and local authority guidance.',
    errorLocationUnavailable: 'Location data is currently unavailable.',
    errorWeatherUnavailable: 'Weather forecast data is currently unavailable.',
    errorNetwork: 'Network error. Please try again.'
  },

  te: {
    appName: 'WeatherGPT',
    tagline: 'వాతావరణ-అవగాహన AI నిర్ణయ సహాయకుడు',
    welcomeMessage: 'వాతావరణం గురించి ఏదైనా అడగండి.',
    searchPlaceholder: 'నగరం లేదా లొకేషన్ వెతకండి...',
    useMyLocation: 'నా లొకేషన్ ఉపయోగించు',
    refreshWeather: 'వాతావరణాన్ని రిఫ్రెష్ చేయండి',
    clearChat: 'చాట్ క్లియర్ చేయండి',
    newSession: 'కొత్త సెషన్',

    // Nav
    navHome: 'హోమ్',
    navAlerts: 'హెచ్చరికలు',
    navDecision: 'నిర్ణయ సహాయకుడు',
    navClimate: 'వాతావరణ విశ్లేషణ',

    // Decision Assistant UI
    decisionTitle: 'వాతావరణ నిర్ణయ సహాయకుడు',
    decisionSubtitle: 'మీ ప్లాన్ ఏమిటో చెప్పండి. వాతావరణ పరిస్థితులు మరియు ప్రమాదాలను WeatherGPT విశ్లేషిస్తుంది.',
    planningQuestion: 'మీరు ఏమి చేయడానికి ప్లాన్ చేస్తున్నారు?',
    selectActivity: 'కార్యక్రమాన్ని ఎంచుకోండి',
    selectDate: 'తేదీని ఎంచుకోండి',
    selectTime: 'సమయాన్ని ఎంచుకోండి',
    analyzeButton: 'ప్రమాదాన్ని విశ్లేషించండి',
    evaluatingModel: 'విశ్లేషిస్తోంది...',
    riskScoreLabel: 'వాతావరణ రిస్క్ స్కోర్',
    recommendationLabel: 'సిఫార్సు',
    whyThisScore: 'ఈ స్కోర్ ఎలా లెక్కించబడింది?',
    betterTimeTitle: 'మంచి సమయం అందుబాటులో ఉంది',
    compareTimeTitle: 'రెండు సమయాలను పోల్చండి',
    compareButton: 'పోల్చండి',
    recentDecisions: 'ఇటీవలి విశ్లేషణలు',
    shareAssessment: 'షేర్ చేయండి',

    // Alerts UI
    alertsTitle: 'తీవ్ర వాతావరణ హెచ్చరికల డాష్‌బోర్డ్',
    alertsSubtitle: 'IMD అధికారిక హెచ్చరికలు మరియు అత్యవసర జాగ్రత్తలు.',
    noActiveWarning: 'ఎలాంటి తీవ్ర వాతావరణ హెచ్చరికలు లేవు',
    noActiveWarningSub: 'మీ లొకేషన్ ప్రస్తుతం గ్రీన్ స్టేటస్‌లో ఉంది.',

    // Common
    locationLabel: 'లొకేషన్',
    sourceLabel: 'సమాచార మూలం',
    disclaimerText: 'WeatherGPT వాతావరణ ఆధారిత నిర్ణయ సహాయాన్ని మాత్రమే అందిస్తుంది. అధికారిక హెచ్చరికలను పాటించండి.',
    errorLocationUnavailable: 'లొకేషన్ సమాచారం అందుబాటులో లేదు.',
    errorWeatherUnavailable: 'వాతావరణ సమాచారం ప్రస్తుతం అందుబాటులో లేదు.',
    errorNetwork: 'నెట్‌వర్క్ సమస్య. దయచేసి మళ్లీ ప్రయత్నించండి.'
  },

  ta: {
    appName: 'WeatherGPT',
    tagline: 'வானிலை அறிவுள்ள AI முடிவு உதவியாளர்',
    welcomeMessage: 'வானிலை பற்றி எதையும் கேளுங்கள்.',
    searchPlaceholder: 'நகரத்தைத் தேடுங்கள்...',
    useMyLocation: 'எனது இருப்பிடம்',
    refreshWeather: 'புதுப்பிக்கவும்',
    clearChat: 'அழித்துவிடு',
    newSession: 'புதிய அமர்வு',

    // Nav
    navHome: 'முகப்பு',
    navAlerts: 'எச்சரிக்கைகள்',
    navDecision: 'முடிவு உதவியாளர்',
    navClimate: 'காலநிலை பகுப்பாய்வு',

    // Decision Assistant UI
    decisionTitle: 'வானிலை முடிவு உதவியாளர்',
    decisionSubtitle: 'உங்கள் திட்டத்தைக் கூறுங்கள். வானிலை அபாயங்களை WeatherGPT பகுப்பாய்வு செய்யும்.',
    planningQuestion: 'நீங்கள் என்ன செய்ய திட்டமிடுகிறீர்கள்?',
    selectActivity: 'செயல்பாட்டைத் தேர்ந்தெடுக்கவும்',
    selectDate: 'தேதியைத் தேர்ந்தெடுக்கவும்',
    selectTime: 'நேரத்தைத் தேர்ந்தெடுக்கவும்',
    analyzeButton: 'அபாயத்தை ஆராய்க',
    evaluatingModel: 'ஆராய்கிறது...',
    riskScoreLabel: 'வானிலை அபாய மதிப்பெண்',
    recommendationLabel: 'பரிந்துரை',
    whyThisScore: 'இந்த மதிப்பெண் எப்படி கணக்கிடப்பட்டது?',
    betterTimeTitle: 'சிறந்த நேரம் கிடைக்கிறது',
    compareTimeTitle: 'இரண்டு நேரங்களை ஒப்பிடுக',
    compareButton: 'ஒப்பிடுக',
    recentDecisions: 'சமீபத்திய ஆய்வுகள்',
    shareAssessment: 'பகிருங்கள்',

    // Alerts UI
    alertsTitle: 'வானிலை எச்சரிக்கை மையம்',
    alertsSubtitle: 'IMD அதிகாரப்பூர்வ எச்சரிக்கைகள் மற்றும் வழிகாட்டுதல்கள்.',
    noActiveWarning: 'செயலில் உள்ள எச்சரிக்கைகள் எதுவுமில்லை',
    noActiveWarningSub: 'உங்கள் இருப்பிடம் பச்சை நிலையில் உள்ளது.',

    // Common
    locationLabel: 'இருப்பிடம்',
    sourceLabel: 'தரவு மூலம்',
    disclaimerText: 'WeatherGPT வானிலை தகவல்களை மட்டுமே வழங்குகிறது. அதிகாரப்பூர்வ வழிகாட்டுதல்களைப் பின்பற்றவும்.',
    errorLocationUnavailable: 'இருப்பிடத் தகவல் கிடைக்கவில்லை.',
    errorWeatherUnavailable: 'வானிலை தகவல் தற்போது கிடைக்கவில்லை.',
    errorNetwork: 'இணைப்பு பிழை.'
  },

  hi: {
    appName: 'WeatherGPT',
    tagline: 'मौसम-जागरूक AI निर्णय सहायक',
    welcomeMessage: 'मौसम के बारे में कुछ भी पूछें।',
    searchPlaceholder: 'शहर या स्थान खोजें...',
    useMyLocation: 'मेरा स्थान उपयोग करें',
    refreshWeather: 'मौसम अपडेट करें',
    clearChat: 'चैट साफ़ करें',
    newSession: 'नया सत्र',

    // Nav
    navHome: 'होम',
    navAlerts: 'चेतावनी',
    navDecision: 'निर्णय सहायक',
    navClimate: 'जलवायु विश्लेषण',

    // Decision Assistant UI
    decisionTitle: 'मौसम निर्णय सहायक',
    decisionSubtitle: 'अपनी योजना बताएं। WeatherGPT मौसम संबंधी जोखिमों का विश्लेषण करेगा।',
    planningQuestion: 'आप क्या करने की योजना बना रहे हैं?',
    selectActivity: 'गतिविधि चुनें',
    selectDate: 'तिथि चुनें',
    selectTime: 'समय चुनें',
    analyzeButton: 'जोखिम का विश्लेषण करें',
    evaluatingModel: 'विश्लेषण हो रहा है...',
    riskScoreLabel: 'मौसम जोखिम स्कोर',
    recommendationLabel: 'सिफारिश',
    whyThisScore: 'यह स्कोर कैसे गिना गया?',
    betterTimeTitle: 'संभावित बेहतर समय',
    compareTimeTitle: 'दो समय अवधियों की तुलना करें',
    compareButton: 'तुलना करें',
    recentDecisions: 'हाल के विश्लेषण',
    shareAssessment: 'शेयर करें',

    // Alerts UI
    alertsTitle: 'गंभीर मौसम चेतावनी डैशबोर्ड',
    alertsSubtitle: 'IMD आधिकारिक चेतावनी और आपातकालीन सुरक्षा दिशानिर्देश।',
    noActiveWarning: 'कोई सक्रिय मौसम चेतावनी नहीं',
    noActiveWarningSub: 'आपका स्थान वर्तमान में ग्रीन स्थिति में है।',

    // Common
    locationLabel: 'स्थान',
    sourceLabel: 'डेटा स्रोत',
    disclaimerText: 'WeatherGPT केवल पूर्वानुमान आधारित निर्णय सहायता प्रदान करता है। आधिकारिक चेतावनियों का पालन करें।',
    errorLocationUnavailable: 'स्थान डेटा उपलब्ध नहीं है।',
    errorWeatherUnavailable: 'मौसम डेटा वर्तमान में उपलब्ध नहीं है।',
    errorNetwork: 'नेटवर्क त्रुटि।'
  },

  kn: {
    appName: 'WeatherGPT',
    tagline: 'ಹವಾಮಾನ-ಅರಿವಿನ AI ನಿರ್ಧಾರ ಸಹಾಯಕ',
    welcomeMessage: 'ಹವಾಮಾನದ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ.',
    searchPlaceholder: 'ನಗರ ಹುಡುಕಿ...',
    useMyLocation: 'ನನ್ನ ಸ್ಥಳ ಬಳಸಿ',
    refreshWeather: 'ಅಪ್‌ಡೇಟ್ ಮಾಡಿ',
    clearChat: 'ಚಾಟ್ ಅಳಿಸಿ',
    newSession: 'ಹೊಸ ಸೆಷನ್',

    // Nav
    navHome: 'ಹೋಮ್',
    navAlerts: 'ಎಚ್ಚರಿಕೆಗಳು',
    navDecision: 'ನಿರ್ಧಾರ ಸಹಾಯಕ',
    navClimate: 'ಹವಾಮಾನ ವಿಶ್ಲೇಷಣೆ',

    // Decision Assistant UI
    decisionTitle: 'ಹವಾಮಾನ ನಿರ್ಧಾರ ಸಹಾಯಕ',
    decisionSubtitle: 'ನಿಮ್ಮ ಯೋಜನೆಯನ್ನು ತಿಳಿಸಿ. WeatherGPT ಹವಾಮಾನ ಅಪಾಯಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತದೆ.',
    planningQuestion: 'ನೀವು ಏನು ಮಾಡಲು ಯೋಜಿಸುತ್ತಿದ್ದೀರಿ?',
    selectActivity: 'ಚಟುವಟಿಕೆ ಆಯ್ಕೆಮಾಡಿ',
    selectDate: 'ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ',
    selectTime: 'ಸಮಯ ಆಯ್ಕೆಮಾಡಿ',
    analyzeButton: 'ಅಪಾಯ ವಿಶ್ಲೇಷಿಸಿ',
    evaluatingModel: 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
    riskScoreLabel: 'ಹವಾಮಾನ ಅಪಾಯದ ಅಂಕ',
    recommendationLabel: 'ಶಿಫಾರಸು',
    whyThisScore: 'ಈ ಅಂಕವನ್ನು ಹೇಗೆ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ?',
    betterTimeTitle: 'ಉತ್ತಮ ಸಮಯ ಲಭ್ಯವಿದೆ',
    compareTimeTitle: 'ಎರಡು ಸಮಯಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ',
    compareButton: 'ಹೋಲಿಕೆ ಮಾಡಿ',
    recentDecisions: 'ಇತ್ತೀಚಿನ ವಿಶ್ಲೇಷಣೆಗಳು',
    shareAssessment: 'ಹಂಚಿಕೊಳ್ಳಿ',

    // Alerts UI
    alertsTitle: 'ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    alertsSubtitle: 'IMD ಅಧಿಕೃತ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಮಾರ್ಗಸೂಚಿಗಳು.',
    noActiveWarning: 'ಯಾವುದೇ ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆ ಇಲ್ಲ',
    noActiveWarningSub: 'ನಿಮ್ಮ ಸ್ಥಳವು ಹಸಿರು ಸ್ಥಿತಿಯಲ್ಲಿದೆ.',

    // Common
    locationLabel: 'ಸ್ಥಳ',
    sourceLabel: 'ಮಾಹಿತಿ ಮೂಲ',
    disclaimerText: 'WeatherGPT ಮುನ್ಸೂಚನೆ ಆಧಾರಿತ ನಿರ್ಧಾರ ಬೆಂಬಲವನ್ನು ನೀಡುತ್ತದೆ.',
    errorLocationUnavailable: 'ಸ್ಥಳದ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.',
    errorWeatherUnavailable: 'ಹವಾಮಾನ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.',
    errorNetwork: 'ನೆಟ್‌ವರ್ಕ್ ದೋಷ.'
  },

  ml: {
    appName: 'WeatherGPT',
    tagline: 'കാലാവസ്ഥാ അധിഷ്ഠിത AI തീരുമാനം സഹായി',
    welcomeMessage: 'കാലാവസ്ഥയെക്കുറിച്ച് എന്തും ചോദിക്കൂ.',
    searchPlaceholder: 'നഗരം തിരയുക...',
    useMyLocation: 'എന്റെ സ്ഥാനം',
    refreshWeather: 'പുതുക്കുക',
    clearChat: 'ചാറ്റ് മാറ്റുക',
    newSession: 'പുതിയ സെഷൻ',

    // Nav
    navHome: 'ഹോം',
    navAlerts: 'മുന്നറിയിപ്പുകൾ',
    navDecision: 'തീരുമാന സഹായി',
    navClimate: 'കാലാവസ്ഥാ വിശകലനം',

    // Decision Assistant UI
    decisionTitle: 'കാലാവസ്ഥാ തീരുമാന സഹായി',
    decisionSubtitle: 'നിങ്ങളുടെ പ്ലാൻ പറയൂ. WeatherGPT കാലാവസ്ഥാ അപകടസാധ്യതകൾ വിശകലനം ചെയ്യും.',
    planningQuestion: 'നിങ്ങൾ എന്താണ് ചെയ്യാൻ പദ്ധതിയിടുന്നത്?',
    selectActivity: 'പ്രവർത്തനം തിരഞ്ഞെടുക്കുക',
    selectDate: 'തീയതി തിരഞ്ഞെടുക്കുക',
    selectTime: 'സമയം തിരഞ്ഞെടുക്കുക',
    analyzeButton: 'അപകടസാധ്യത വിശകലനം ചെയ്യുക',
    evaluatingModel: 'വിശകലനം ചെയ്യുന്നു...',
    riskScoreLabel: 'കാലാവസ്ഥാ അപകടസാധ്യത സ്കോർ',
    recommendationLabel: 'ശുപാർശ',
    whyThisScore: 'ഈ സ്കോർ എങ്ങനെ കണക്കാക്കി?',
    betterTimeTitle: 'മെച്ചപ്പെട്ട സമയം ലഭ്യമാണ്',
    compareTimeTitle: 'രണ്ട് സമയങ്ങൾ താരതമ്യം ചെയ്യുക',
    compareButton: 'താരതമ്യം ചെയ്യുക',
    recentDecisions: 'സമീപകാല വിശകലനങ്ങൾ',
    shareAssessment: 'പങ്കിടുക',

    // Alerts UI
    alertsTitle: 'കാലാവസ്ഥാ മുന്നറിയിപ്പ് കേന്ദ്രം',
    alertsSubtitle: 'IMD ഔദ്യോഗിക മുന്നറിയിപ്പുകൾ.',
    noActiveWarning: 'മുന്നറിയിപ്പുകൾ ഒന്നുമില്ല',
    noActiveWarningSub: 'നിങ്ങളുടെ സ്ഥലം പച്ച അവസ്ഥയിലാണ്.',

    // Common
    locationLabel: 'സ്ഥലം',
    sourceLabel: 'വിവര ഉറവിടം',
    disclaimerText: 'WeatherGPT പ്രവചന അധിഷ്ഠിത പിന്തുണ മാത്രമാണ് നൽകുന്നത്.',
    errorLocationUnavailable: 'സ്ഥല വിവരങ്ങൾ ലഭ്യമല്ല.',
    errorWeatherUnavailable: 'കാലാവസ്ഥാ വിവരങ്ങൾ ലഭ്യമല്ല.',
    errorNetwork: ' നെറ്റ്‌വർക്ക് തകരാർ.'
  }
};
