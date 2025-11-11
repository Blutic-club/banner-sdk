import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  initializeCookieBannerSDK,
  trackConsentAction,
  fetchBannerConfig,
  parseBannerApiData,
  Consent,
  dispatchCookieEvent,
  getCookiesByStatus,
  updateGoogleConsentMode,
  mapConsentToGoogleConsentMode,
  setBanenrShown,
  generateInteractionId,
  trackIgnoredInteraction,
  trackInteraction,
  Languages,
  LANGUAGE_NAMES,
} from "./bannerActivity";

// Static text translations
const STATIC_TEXTS = {
  [Languages.ENGLISH]: {
    changeConsent: "Change your Consent",
    withdrawConsent: "Withdraw your Consent",
    consentTab: "Consent",
    aboutTab: "About Cookies",
    managePreferences: "Manage Consent preferences",
    privacyPolicy: "Privacy Policy",
    whatAreCookies: "What are cookies?",
    cookieName: "Cookie Name",
    duration: "Duration",
    description: "Description",
    aboutCookiesTitle: "What are cookies?",
    aboutCookiesPara1:
      "Cookies are small text files that can be used by websites to make a user's experience more efficient.",
    aboutCookiesPara2:
      "The law states that we can store cookies on your device if they are strictly necessary for the operation of this site. For all other types of cookies we need your permission. This site uses different types of cookies. Some cookies are placed by third party services that appear on our pages. You can at any time change or withdraw your consent from the Cookie Declaration on our website.",
    aboutCookiesPara3:
      "Learn more about who we are, how you can contact us and how we process personal data in our Privacy Policy.",
    poweredBy: "Powered by",
  },
  [Languages.HINDI]: {
    changeConsent: "अपनी सहमति बदलें",
    withdrawConsent: "अपनी सहमति वापस लें",
    consentTab: "सहमति",
    aboutTab: "कुकीज़ के बारे में",
    managePreferences: "सहमति प्राथमिकताएँ प्रबंधित करें",
    privacyPolicy: "गोपनीयता नीति",
    whatAreCookies: "कुकीज़ क्या हैं?",
    cookieName: "कुकी का नाम",
    duration: "अवधि",
    description: "विवरण",
    aboutCookiesTitle: "कुकीज़ क्या हैं?",
    aboutCookiesPara1:
      "कुकीज़ छोटी टेक्स्ट फ़ाइलें हैं जिनका उपयोग वेबसाइटों द्वारा उपयोगकर्ता के अनुभव को अधिक कुशल बनाने के लिए किया जा सकता है।",
    aboutCookiesPara2:
      "कानून कहता है कि हम आपके डिवाइस पर कुकीज़ स्टोर कर सकते हैं यदि वे इस साइट के संचालन के लिए सख्ती से आवश्यक हैं। अन्य सभी प्रकार की कुकीज़ के लिए हमें आपकी अनुमति चाहिए। यह साइट विभिन्न प्रकार की कुकीज़ का उपयोग करती है। कुछ कुकीज़ तीसरे पक्ष की सेवाओं द्वारा रखी जाती हैं जो हमारे पृष्ठों पर दिखाई देती हैं। आप किसी भी समय हमारी वेबसाइट पर कुकी घोषणा से अपनी सहमति बदल सकते हैं या वापस ले सकते हैं।",
    aboutCookiesPara3:
      "हमारी गोपनीयता नीति में हम कौन हैं, आप हमसे कैसे संपर्क कर सकते हैं और हम व्यक्तिगत डेटा को कैसे संसाधित करते हैं, इसके बारे में अधिक जानें।",
    poweredBy: "द्वारा संचालित",
  },
  [Languages.KANNADA]: {
    changeConsent: "ನಿಮ್ಮ ಸಮ್ಮತಿಯನ್ನು ಬದಲಾಯಿಸಿ",
    withdrawConsent: "ನಿಮ್ಮ ಸಮ್ಮತಿಯನ್ನು ಹಿಂತೆಗೆದುಕೊಳ್ಳಿ",
    consentTab: "ಸಮ್ಮತಿ",
    aboutTab: "ಕುಕೀಗಳ ಬಗ್ಗೆ",
    managePreferences: "ಸಮ್ಮತಿ ಆದ್ಯತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
    privacyPolicy: "ಗೌಪ್ಯತಾ ನೀತಿ",
    whatAreCookies: "ಕುಕೀಗಳು ಏನು?",
    cookieName: "ಕುಕೀ ಹೆಸರು",
    duration: "ಅವಧಿ",
    description: "ವಿವರಣೆ",
    aboutCookiesTitle: "ಕುಕೀಗಳು ಏನು?",
    aboutCookiesPara1:
      "ಕುಕೀಗಳು ಸಣ್ಣ ಪಠ್ಯ ಫೈಲ್‌ಗಳಾಗಿದ್ದು, ಬಳಕೆದಾರರ ಅನುಭವವನ್ನು ಹೆಚ್ಚು ಪರಿಣಾಮಕಾರಿಯಾಗಿ ಮಾಡಲು ವೆಬ್‌ಸೈಟ್‌ಗಳು ಬಳಸಬಹುದು.",
    aboutCookiesPara2:
      "ಈ ಸೈಟ್‌ನ ಕಾರ್ಯಾಚರಣೆಗೆ ಅವು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಅಗತ್ಯವಿದ್ದರೆ ನಾವು ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಕುಕೀಗಳನ್ನು ಸಂಗ್ರಹಿಸಬಹುದು ಎಂದು ಕಾನೂನು ಹೇಳುತ್ತದೆ. ಎಲ್ಲಾ ಇತರ ರೀತಿಯ ಕುಕೀಗಳಿಗೆ ನಮಗೆ ನಿಮ್ಮ ಅನುಮತಿ ಬೇಕು. ಈ ಸೈಟ್ ವಿವಿಧ ರೀತಿಯ ಕುಕೀಗಳನ್ನು ಬಳಸುತ್ತದೆ. ಕೆಲವು ಕುಕೀಗಳನ್ನು ನಮ್ಮ ಪುಟಗಳಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುವ ಮೂರನೇ ವ್ಯಕ್ತಿಯ ಸೇವೆಗಳು ಇರಿಸುತ್ತವೆ. ನಮ್ಮ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಕುಕೀ ಘೋಷಣೆಯಿಂದ ನೀವು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ಸಮ್ಮತಿಯನ್ನು ಬದಲಾಯಿಸಬಹುದು ಅಥವಾ ಹಿಂತೆಗೆದುಕೊಳ್ಳಬಹುದು.",
    aboutCookiesPara3:
      "ನಾವು ಯಾರು, ನೀವು ನಮ್ಮನ್ನು ಹೇಗೆ ಸಂಪರ್ಕಿಸಬಹುದು ಮತ್ತು ನಮ್ಮ ಗೌಪ್ಯತಾ ನೀತಿಯಲ್ಲಿ ನಾವು ವೈಯಕ್ತಿಕ ಡೇಟಾವನ್ನು ಹೇಗೆ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುತ್ತೇವೆ ಎಂಬುದರ ಕುರಿತು ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ.",
    poweredBy: "ಇವರಿಂದ ಚಾಲಿತ",
  },
  [Languages.TAMIL]: {
    changeConsent: "உங்கள் ஒப்புதலை மாற்றவும்",
    withdrawConsent: "உங்கள் ஒப்புதலை திரும்பப் பெறவும்",
    consentTab: "ஒப்புதல்",
    aboutTab: "குக்கீகள் பற்றி",
    managePreferences: "ஒப்புதல் விருப்பங்களை நிர்வகிக்கவும்",
    privacyPolicy: "தனியுரிமைக் கொள்கை",
    whatAreCookies: "குக்கீகள் என்றால் என்ன?",
    cookieName: "குக்கீ பெயர்",
    duration: "காலம்",
    description: "விளக்கம்",
    aboutCookiesTitle: "குக்கீகள் என்றால் என்ன?",
    aboutCookiesPara1:
      "குக்கீகள் சிறிய உரை கோப்புகள் ஆகும், அவை பயனரின் அனுபவத்தை மிகவும் திறமையாக்க இணையதளங்களால் பயன்படுத்தப்படலாம்.",
    aboutCookiesPara2:
      "இந்த தளத்தின் செயல்பாட்டிற்கு கண்டிப்பாக அவசியமானால் உங்கள் சாதனத்தில் குக்கீகளை நாங்கள் சேமிக்கலாம் என்று சட்டம் கூறுகிறது. மற்ற எல்லா வகையான குக்கீகளுக்கும் உங்கள் அனுமதி தேவை. இந்த தளம் பல்வேறு வகையான குக்கீகளைப் பயன்படுத்துகிறது. சில குக்கீகள் எங்கள் பக்கங்களில் தோன்றும் மூன்றாம் தரப்பு சேவைகளால் வைக்கப்படுகின்றன. எங்கள் இணையதளத்தில் குக்கீ பிரகடனத்திலிருந்து எந்த நேரத்திலும் உங்கள் ஒப்புதலை மாற்றலாம் அல்லது திரும்பப் பெறலாம்.",
    aboutCookiesPara3:
      "நாங்கள் யார், நீங்கள் எங்களை எவ்வாறு தொடர்பு கொள்ளலாம் மற்றும் எங்கள் தனியுரிமைக் கொள்கையில் தனிப்பட்ட தரவை நாங்கள் எவ்வாறு செயலாக்குகிறோம் என்பது பற்றி மேலும் அறியவும்.",
    poweredBy: "மூலம் இயக்கப்படுகிறது",
  },
  [Languages.MALAYALAM]: {
    changeConsent: "നിങ്ങളുടെ സമ്മതം മാറ്റുക",
    withdrawConsent: "നിങ്ങളുടെ സമ്മതം പിൻവലിക്കുക",
    consentTab: "സമ്മതം",
    aboutTab: "കുക്കികളെ കുറിച്ച്",
    managePreferences: "സമ്മത മുൻഗണനകൾ നിയന്ത്രിക്കുക",
    privacyPolicy: "സ്വകാര്യതാ നയം",
    whatAreCookies: "കുക്കികൾ എന്താണ്?",
    cookieName: "കുക്കി പേര്",
    duration: "കാലാവധി",
    description: "വിവരണം",
    aboutCookiesTitle: "കുക്കികൾ എന്താണ്?",
    aboutCookiesPara1:
      "കുക്കികൾ ചെറിയ ടെക്സ്റ്റ് ഫയലുകളാണ്, അവ ഉപയോക്താവിന്റെ അനുഭവം കൂടുതൽ കാര്യക്ഷമമാക്കാൻ വെബ്സൈറ്റുകൾക്ക് ഉപയോഗിക്കാം.",
    aboutCookiesPara2:
      "ഈ സൈറ്റിന്റെ പ്രവർത്തനത്തിന് അവ കർശനമായി ആവശ്യമാണെങ്കിൽ നിങ്ങളുടെ ഉപകരണത്തിൽ കുക്കികൾ സംഭരിക്കാൻ കഴിയുമെന്ന് നിയമം പറയുന്നു. മറ്റെല്ലാ തരത്തിലുള്ള കുക്കികൾക്കും ഞങ്ങൾക്ക് നിങ്ങളുടെ അനുമതി ആവശ്യമാണ്. ഈ സൈറ്റ് വ്യത്യസ്ത തരത്തിലുള്ള കുക്കികൾ ഉപയോഗിക്കുന്നു. ഞങ്ങളുടെ പേജുകളിൽ ദൃശ്യമാകുന്ന മൂന്നാം കക്ഷി സേവനങ്ങളാണ് ചില കുക്കികൾ സ്ഥാപിക്കുന്നത്. ഞങ്ങളുടെ വെബ്സൈറ്റിലെ കുക്കി പ്രഖ്യാപനത്തിൽ നിന്ന് നിങ്ങൾക്ക് എപ്പോൾ വേണമെങ്കിലും നിങ്ങളുടെ സമ്മതം മാറ്റാം അല്ലെങ്കിൽ പിൻവലിക്കാം.",
    aboutCookiesPara3:
      "ഞങ്ങൾ ആരാണ്, നിങ്ങൾക്ക് ഞങ്ങളെ എങ്ങനെ ബന്ധപ്പെടാം, ഞങ്ങളുടെ സ്വകാര്യതാ നയത്തിൽ ഞങ്ങൾ വ്യക്തിഗത ഡാറ്റ എങ്ങനെ പ്രോസസ്സ് ചെയ്യുന്നു എന്നതിനെക്കുറിച്ച് കൂടുതലറിയുക.",
    poweredBy: "പവർ ചെയ്തത്",
  },
  [Languages.MARATHI]: {
    changeConsent: "तुमची संमती बदला",
    withdrawConsent: "तुमची संमती मागे घ्या",
    consentTab: "संमती",
    aboutTab: "कुकीजबद्दल",
    managePreferences: "संमती प्राधान्ये व्यवस्थापित करा",
    privacyPolicy: "गोपनीयता धोरण",
    whatAreCookies: "कुकीज म्हणजे काय?",
    cookieName: "कुकी नाव",
    duration: "कालावधी",
    description: "वर्णन",
    aboutCookiesTitle: "कुकीज म्हणजे काय?",
    aboutCookiesPara1:
      "कुकीज लहान मजकूर फाइल्स आहेत ज्यांचा वापर वापरकर्त्याचा अनुभव अधिक कार्यक्षम करण्यासाठी वेबसाइट्सद्वारे केला जाऊ शकतो.",
    aboutCookiesPara2:
      "कायदा सांगतो की या साइटच्या ऑपरेशनसाठी ते कठोरपणे आवश्यक असल्यास आम्ही तुमच्या डिव्हाइसवर कुकीज संग्रहित करू शकतो. इतर सर्व प्रकारच्या कुकीजसाठी आम्हाला तुमची परवानगी आवश्यक आहे. ही साइट विविध प्रकारच्या कुकीज वापरते. काही कुकीज आमच्या पृष्ठांवर दिसणाऱ्या तृतीय पक्ष सेवांद्वारे ठेवल्या जातात. तुम्ही कधीही आमच्या वेबसाइटवरील कुकी घोषणेतून तुमची संमती बदलू किंवा मागे घेऊ शकता.",
    aboutCookiesPara3:
      "आम्ही कोण आहोत, तुम्ही आमच्याशी कसे संपर्क साधू शकता आणि आम्ही आमच्या गोपनीयता धोरणात वैयक्तिक डेटावर कशी प्रक्रिया करतो याबद्दल अधिक जाणून घ्या.",
    poweredBy: "द्वारा समर्थित",
  },
  [Languages.TELUGU]: {
    changeConsent: "మీ సమ్మతిని మార్చండి",
    withdrawConsent: "మీ సమ్మతిని ఉపసంహరించుకోండి",
    consentTab: "సమ్మతి",
    aboutTab: "కుకీల గురించి",
    managePreferences: "సమ్మతి ప్రాధాన్యతలను నిర్వహించండి",
    privacyPolicy: "గోప్యతా విధానం",
    whatAreCookies: "కుక్కీలు ఏమిటి?",
    cookieName: "కుకీ పేరు",
    duration: "వ్యవధి",
    description: "వివరణ",
    aboutCookiesTitle: "కుక్కీలు ఏమిటి?",
    aboutCookiesPara1:
      "కుక్కీలు చిన్న టెక్స్ట్ ఫైల్‌లు, వాటిని వెబ్‌సైట్‌లు వినియోగదారు అనుభవాన్ని మరింత సమర్థవంతంగా చేయడానికి ఉపయోగించవచ్చు.",
    aboutCookiesPara2:
      "ఈ సైట్ యొక్క ఆపరేషన్ కోసం అవి ఖచ్చితంగా అవసరమైతే మేము మీ పరికరంలో కుక్కీలను నిల్వ చేయవచ్చని చట్టం పేర్కొంది. అన్ని ఇతర రకాల కుక్కీల కోసం మాకు మీ అనుమతి అవసరం. ఈ సైట్ వివిధ రకాల కుక్కీలను ఉపయోగిస్తుంది. కొన్ని కుక్కీలు మా పేజీలలో కనిపించే మూడవ పక్ష సేవల ద్వారా ఉంచబడతాయి. మీరు ఎప్పుడైనా మా వెబ్‌సైట్‌లోని కుకీ ప్రకటన నుండి మీ సమ్మతిని మార్చవచ్చు లేదా ఉపసంహరించుకోవచ్చు.",
    aboutCookiesPara3:
      "మేము ఎవరు, మీరు మమ్మల్ని ఎలా సంప్రదించవచ్చు మరియు మా గోప్యతా విధానంలో మేము వ్యక్తిగత డేటాను ఎలా ప్రాసెస్ చేస్తాము అనే దాని గురించి మరింత తెలుసుకోండి.",
    poweredBy: "ద్వారా అందించబడింది",
  },
};

const CookieBanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("consent");
  const [cookieSettings, setCookieSettings] = useState({});
  const [prevCookieSettings, setPrevCookieSettings] = useState({});
  const [isVisible, setIsVisible] = useState(true);
  const [bannerData, setBannerData] = useState();
  const [cookieData, setCookieData] = useState();
  const [hasSavedPreference, setHasSavedPreference] = useState();
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [interactionId, setInteractionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(Languages.ENGLISH);
  const [translations, setTranslations] = useState([]);
  const [rawBannerData, setRawBannerData] = useState(null);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef(null);

  // Get static texts for current language
  const t = STATIC_TEXTS[selectedLanguage] || STATIC_TEXTS[Languages.ENGLISH];

  const areSettingsEqual = (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
  };

  const areAllNonNecessaryCookiesRejected = (settings) => {
    return Object.entries(settings).every(
      ([key, value]) => key === "necessary" || value === false
    );
  };

  // Apply consent settings to Google Consent Mode
  const applyConsentToGoogleConsentMode = (settings) => {
    updateGoogleConsentMode(settings);
  };

  // Get translated data based on selected language
  const getTranslatedData = (langCode) => {
    if (langCode === Languages.ENGLISH || !rawBannerData) {
      return rawBannerData ? parseBannerApiData(rawBannerData) : null;
    }

    const translation = translations.find((t) => t.langCode === langCode);
    if (!translation) {
      return rawBannerData ? parseBannerApiData(rawBannerData) : null;
    }

    // Create translated version
    const translatedBannerData = {
      ...rawBannerData,
      banner: {
        ...rawBannerData.banner,
        title: translation.translatedData.banner.title,
        description: translation.translatedData.banner.description,
        acceptButtonText: translation.translatedData.banner.acceptButtonText,
        declineButtonText: translation.translatedData.banner.declineButtonText,
        manageButtonText: translation.translatedData.banner.manageButtonText,
        privacyPolicy: translation.translatedData.banner.privacyPolicy,
      },
      categories: rawBannerData.categories.map((cat) => {
        const translatedCat = translation.translatedData.categories.find(
          (tc) => tc._id === cat._id
        );
        return translatedCat
          ? {
              ...cat,
              name: translatedCat.name,
              description: translatedCat.description,
            }
          : cat;
      }),
      cookies: rawBannerData.cookies
        .filter((cookie) => !cookie.isDeleted)
        .map((cookie) => {
          const translatedCookie = translation.translatedData.cookies.find(
            (tc) => tc._id === cookie._id
          );
          return translatedCookie
            ? {
                ...cookie,
                name: translatedCookie.name,
                description: translatedCookie.description,
              }
            : cookie;
        }),
    };

    return parseBannerApiData(translatedBannerData);
  };

  // Handle language change
  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    const translatedData = getTranslatedData(langCode);
    if (translatedData) {
      setBannerData(translatedData.bannerDetails);
      setCookieData(translatedData.cookieData);
    }
    setIsLanguageDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Generate or get existing interaction ID
    const existingInteractionId = generateInteractionId();
    setInteractionId(existingInteractionId);

    // Track ignored interaction on page unload if no interaction occurred
    const handleBeforeUnload = () => {
      if (!hasInteracted && interactionId) {
        trackIgnoredInteraction();
      }
    };

    // Add event listener for page unload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasInteracted, interactionId]);

  useEffect(() => {
    async function init() {
      const config = await initializeCookieBannerSDK();
      await setBanenrShown();
      let categorisedData;
      let apiCookieSettings = null;
      let consentArr = [];
      let rawData;

      if (!config) {
        rawData = await fetchBannerConfig();
        categorisedData = parseBannerApiData(rawData);
        consentArr = rawData.consent || [];
        setHasSavedPreference(consentArr.length !== 0);
      } else {
        rawData = config;
        categorisedData = parseBannerApiData(config);
        consentArr = config.consent || [];
        setHasSavedPreference(consentArr.length !== 0);
      }

      // Store raw data and translations
      setRawBannerData(rawData);
      setTranslations(rawData.translations || []);

      for (const item of consentArr) {
        if (item.cookieSettings) {
          apiCookieSettings = item.cookieSettings;
          break;
        }
      }

      setBannerData(categorisedData.bannerDetails);
      setCookieData(categorisedData.cookieData);

      // Check if there's cookie data
      if (
        !categorisedData.cookieData ||
        Object.keys(categorisedData.cookieData).length === 0
      ) {
        console.log(
          "Cookie Banner SDK: No cookie data found. Banner will not be displayed."
        );
        setShouldShowBanner(false);
        return;
      }

      setShouldShowBanner(true);

      // Dynamically set cookieSettings based on categories
      if (
        categorisedData.cookieData &&
        Object.keys(categorisedData.cookieData).length > 0
      ) {
        const initialSettings = {};

        // Convert apiCookieSettings from English names to category IDs if present
        const categoryIdSettings = {};
        if (apiCookieSettings) {
          for (const [categoryId, categoryData] of Object.entries(
            categorisedData.cookieData
          )) {
            const englishName = categoryData.title.toLowerCase();
            if (typeof apiCookieSettings[englishName] === "boolean") {
              categoryIdSettings[categoryId] = apiCookieSettings[englishName];
            }
          }
        }

        // Set initial settings for each category
        for (const [categoryId, categoryData] of Object.entries(
          categorisedData.cookieData
        )) {
          if (categoryData.isAlwaysActive) {
            // Always active categories (like "necessary") must always be true
            initialSettings[categoryId] = true;
          } else if (typeof categoryIdSettings[categoryId] === "boolean") {
            // Use saved consent settings if available
            initialSettings[categoryId] = categoryIdSettings[categoryId];
          } else {
            // Default to true for new users
            initialSettings[categoryId] = true;
          }
        }

        setCookieSettings(initialSettings);
        setPrevCookieSettings(initialSettings);
        if (consentArr.length > 0) {
          applyConsentToGoogleConsentMode(initialSettings);
        }
      }
    }

    init();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // Trap scroll inside cookie category list
  useEffect(() => {
    if (!isModalOpen) return;

    const scrollContainers = document.querySelectorAll(
      ".modal-content-scroll, .cookie-category-scroll"
    );
    if (!scrollContainers) return;

    const preventScrollPropagation = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainers;
      const atTop = scrollTop === 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight;

      if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
        e.preventDefault();
      }
    };

    scrollContainers.forEach((container) => {
      container.addEventListener("wheel", preventScrollPropagation, {
        passive: false,
      });
    });

    return () => {
      scrollContainers.forEach((container) => {
        container.removeEventListener("wheel", preventScrollPropagation);
      });
    };
  }, [isModalOpen]);

  const handleAccept = async () => {
    setLoading(true);
    setHasInteracted(true);
    setIsVisible(false);

    // Determine status in a single pass
    const status = (() => {
      if (!hasSavedPreference) {
        // First-time decision
        const hasAcceptedNonNecessary = Object.entries(cookieSettings).some(
          ([key, value]) => key !== "necessary" && value === true
        );

        return hasAcceptedNonNecessary ? Consent.ACCEPTED : Consent.REJECTED;
      } else {
        // For existing preferences
        const allNonNecessaryFalse = Object.entries(cookieSettings).every(
          ([key, value]) => key === "necessary" || value === false
        );

        return allNonNecessaryFalse ? Consent.WITHDRAWN : Consent.MODIFIED;
      }
    })();

    const { acceptedCookies, rejectedCookies } = getCookiesByStatus(
      cookieData,
      cookieSettings
    );

    const consentModeParams = mapConsentToGoogleConsentMode(cookieSettings);

    dispatchCookieEvent("cookieConsentAccept", {
      status,
      cookieSettings,
      acceptedCookies,
      rejectedCookies,
    });

    applyConsentToGoogleConsentMode(cookieSettings);

    if (typeof window.dataLayer !== "undefined") {
      window.dataLayer.push({
        event: "cookieConsentAccept",
        consentStatus: status,
        cookieSettings: cookieSettings,
        acceptedCookies: acceptedCookies.length,
        rejectedCookies: rejectedCookies.length,
        consentMode: consentModeParams,
      });
    }

    try {
      await trackConsentAction(status, cookieSettings);
      await trackInteraction(status, cookieSettings);
    } catch (error) {
      console.error("Cookie Banner SDK: Error tracking consent action:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleRejectAll = async () => {
    setLoading(true);
    setHasInteracted(true);
    setIsVisible(false);

    // Set all cookie settings to false except necessary (isAlwaysActive) cookies
    const rejectedSettings = {};

    for (const [categoryId, categoryData] of Object.entries(cookieData)) {
      // Always active categories (like "necessary") must remain true
      rejectedSettings[categoryId] = categoryData.isAlwaysActive ? true : false;
    }

    setCookieSettings(rejectedSettings);

    // Determine status based on whether user had previous preferences
    const status = !hasSavedPreference ? Consent.REJECTED : Consent.WITHDRAWN;

    const { acceptedCookies, rejectedCookies } = getCookiesByStatus(
      cookieData,
      rejectedSettings
    );

    const consentModeParams = mapConsentToGoogleConsentMode(rejectedSettings);

    dispatchCookieEvent("cookieConsentReject", {
      status,
      cookieSettings: rejectedSettings,
      acceptedCookies,
      rejectedCookies,
    });

    // Apply consent to Google Consent Mode
    applyConsentToGoogleConsentMode(rejectedSettings);

    // Send to GTM dataLayer for advanced tracking
    if (typeof window.dataLayer !== "undefined") {
      window.dataLayer.push({
        event: "cookieConsentReject",
        consentStatus: status,
        cookieSettings: rejectedSettings,
        acceptedCookies: acceptedCookies.length,
        rejectedCookies: rejectedCookies.length,
        consentMode: consentModeParams,
      });
    }

    try {
      await trackConsentAction(status, rejectedSettings);
      await trackInteraction(status, rejectedSettings);
    } catch (error) {
      console.error("Cookie Banner SDK: Error tracking consent action:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const toggleCookieSetting = (categoryId) => {
    // Can't toggle always active cookies (like "necessary")
    if (cookieData[categoryId]?.isAlwaysActive) return;

    setCookieSettings((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const formatValidityPeriod = (validityPeriod) => {
    if (!validityPeriod) return "";

    // Check if it's an ISO date format (YYYY-MM-DDTHH:mm:ss.sssZ)
    if (validityPeriod.includes("T") && validityPeriod.includes("Z")) {
      const date = new Date(validityPeriod);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Return as-is for other formats (like "Wed, 11 Nov 2026 05:59:51 GMT")
    return validityPeriod;
  };

  const ToggleSwitch = ({ isOn, disabled, onClick }) => (
    <div
      className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      } ${isOn ? "bg-blue-500" : "bg-gray-300"}`}
      onClick={disabled ? undefined : onClick}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${
          isOn ? "right-0.5" : "left-0.5"
        }`}
      />
    </div>
  );

  const LanguageDropdown = () => {
    return (
      <div className="relative" ref={languageDropdownRef}>
        <div
          onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
          className="text-xs border border-gray-300 bg-gray-50 text-gray-800 rounded-md px-3 py-1 flex items-center gap-1 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          {LANGUAGE_NAMES[selectedLanguage]} <ChevronDown size={10} />
        </div>
        {isLanguageDropdownOpen && (
          <div className="absolute right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-[100001] min-w-[120px] max-h-[280px] overflow-y-auto">
            {Object.entries(Languages).map(([, value]) => (
              <div
                key={value}
                onClick={() => handleLanguageChange(value)}
                className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedLanguage === value
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-800"
                }`}
              >
                {LANGUAGE_NAMES[value]}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const CookieDataItems = ({ category, categoryKey, isOpen, onToggle }) => {
    return (
      <div className="border-b border-gray-200 last:border-b-0 text-black">
        <div
          className="w-full py-5 text-left flex justify-between items-center hover:cursor-pointer transition-colors duration-200"
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          <div className="flex w-full">
            <div className="w-[5%]">
              {isOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </div>
            <div className="flex flex-col w-[95%]">
              <div className="flex justify-between items-center font-medium text-gray-800 text-sm w-full">
                <span>{category.title}</span>
                <ToggleSwitch
                  isOn={cookieSettings[categoryKey]}
                  disabled={category.isAlwaysActive}
                  onClick={() => toggleCookieSetting(categoryKey)}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1 !w-3/4">
                {category.description}
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out bg-[#f0f2f7] w-full ${
                  isOpen
                    ? "max-h-96 opacity-100 mt-1.5 overscroll-y-auto rounded-lg"
                    : "max-h-0 opacity-0"
                }`}
              >
                {category.cookies.map((cookie, index) => (
                  <div
                    key={index}
                    className="border-b border-b-gray-300 last:border-none w-full"
                  >
                    <div className="text-xs flex flex-col py-4 px-3">
                      <div className="flex items-start w-full">
                        <div className="w-1/4 font-semibold">
                          {t.cookieName}{" "}
                        </div>
                        <div className="w-[5%] font-semibold">: </div>
                        <div className="w-[70%]">{cookie.name}</div>
                      </div>
                      <div className="flex items-start w-full">
                        <div className="w-1/4 font-semibold">{t.duration} </div>
                        <div className="w-[5%] font-semibold">: </div>
                        <div className="w-[70%]">{formatValidityPeriod(cookie.validityPeriod)}</div>
                      </div>
                      <div className="flex items-start w-full">
                        <div className="w-1/4 font-semibold">
                          {t.description}{" "}
                        </div>
                        <div className="w-[5%] font-semibold">: </div>
                        <div className="w-[70%]">{cookie.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main CookieDataDropdown Component
  const CookieDataDropdown = ({
    title = t.managePreferences,
    data = {},
    allowMultipleOpen = true,
    className = "",
  }) => {
    const [openItems, setOpenItems] = useState(new Set());

    const handleToggle = (index) => {
      const newOpenItems = new Set(openItems);

      if (allowMultipleOpen) {
        // Allow multiple items to be open
        if (newOpenItems.has(index)) {
          newOpenItems.delete(index);
        } else {
          newOpenItems.add(index);
        }
      } else {
        // Only allow one item to be open at a time
        if (newOpenItems.has(index)) {
          newOpenItems.clear();
        } else {
          newOpenItems.clear();
          newOpenItems.add(index);
        }
      }

      setOpenItems(newOpenItems);
    };

    const categories = Object.entries(data).map(([key, value]) => ({
      key,
      ...value,
    }));

    return (
      <div className={`${className} cookie-category-scroll`}>
        <div className="font-bold !text-lg text-black">{title}</div>

        <div className="">
          {categories.map((category, index) => (
            <CookieDataItems
              key={category.key}
              category={category}
              categoryKey={category.key}
              isOpen={openItems.has(index)}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    );
  };

  const Modal = () => (
    <div
      className={`fixed inset-0 bg-[rgba(1,1,1,0.1)] z-[100000] ${
        isModalOpen ? "block" : "hidden"
      }`}
    >
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-xl max-md:w-full md:max-w-xl max-h-[90vh] !overflow-y-hidden shadow-2xl"
        style={{ backgroundColor: bannerData.backgroundColor }}
      >
        {/* Modal Tabs */}
        <div className="relative w-full h-full max-md:pb-5 md:pb-12">
          <div
            className="text-black !text-sm hover:!cursor-pointer absolute md:top-3 md:right-4 max-md:top-1 max-md:right-1"
            onClick={() => setIsModalOpen(false)}
          >
            x
          </div>
          <div className="flex max-md:justify-evenly border-b border-gray-200 max-md:bg-white md:bg-[#f6f6f6]">
            <div
              onClick={() => setActiveTab("consent")}
              className={`py-3 px-5 text-sm font-medium border-b-2 !rounded-none hover:!cursor-pointer ${
                activeTab === "consent"
                  ? "text-blue-500 !bg-white !border-b-blue-500 md:!border-r md:!border-r-gray-200"
                  : "!bg-transparent !text-gray-500 !border-transparent"
              }`}
            >
              {t.consentTab}
            </div>
            <div
              onClick={() => setActiveTab("about")}
              className={`py-3 px-5 text-sm font-medium border-b-2 !rounded-none hover:!cursor-pointer ${
                activeTab === "about"
                  ? "text-blue-500 !bg-white !border-b-blue-500 !border-x !border-x-gray-200"
                  : "!bg-transparent !text-gray-500 !border-transparent"
              }`}
            >
              {t.aboutTab}
            </div>
          </div>
          {/* Modal Content */}
          <div className="modal-content-scroll p-5">
            {activeTab === "consent" ? (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p
                    className="font-semibold max-md:!text-lg md:!text-xl"
                    style={{ color: bannerData.titleColor }}
                  >
                    {bannerData.title}
                  </p>
                  <LanguageDropdown />
                </div>

                <div
                  className="!text-sm mb-4 leading-relaxed !max-h-36 overflow-y-auto"
                  style={{ color: bannerData.descriptionColor }}
                  dangerouslySetInnerHTML={{ __html: bannerData.description }}
                />

                <div className="flex items-center gap-5 text-sm mb-5">
                  <a
                    href={bannerData.privacyPolicy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="!text-black !underline !opacity-75 !font-semibold hover:!opacity-100"
                  >
                    {t.privacyPolicy}
                  </a>
                </div>
                <CookieDataDropdown
                  data={cookieData}
                  className="pt-4 px-4 h-[200px] overflow-y-auto bg-white rounded-lg"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-y-2">
                <p className="max-md:!text-lg md:!text-xl font-semibold text-gray-800">
                  {t.aboutCookiesTitle}
                </p>
                <div className="!text-sm text-gray-600 leading-relaxed">
                  {t.aboutCookiesPara1}
                </div>
                <div className="!text-sm text-gray-600 leading-relaxed">
                  {t.aboutCookiesPara2}
                </div>
                <div className="!text-sm text-gray-600 leading-relaxed">
                  {t.aboutCookiesPara3}
                </div>
              </div>
            )}
          </div>
          <div className="w-full flex max-md:flex-col max-md:gap-y-2 md:gap-x-2 justify-center items-center px-5">
            <button
              onClick={handleRejectAll}
              className="!flex-1 !p-3 !text-sm !rounded-md border hover:cursor-pointer disabled:hover:!cursor-not-allowed max-md:w-full focus:!outline-none"
              style={{
                backgroundColor: bannerData.declineButtonColor,
                color: bannerData.declineButtonTextColor,
                border:
                  (bannerData.declineButtonColor === "#ffffff" ||
                    bannerData.declineButtonColor === "transparent") &&
                  bannerData.backgroundColor === "#ffffff"
                    ? "1px solid #e5e7eb"
                    : "none",
              }}
              disabled={
                loading ||
                (areSettingsEqual(prevCookieSettings, cookieSettings) &&
                  areAllNonNecessaryCookiesRejected(cookieSettings))
              }
            >
              {loading && "Loading..."}
              {!loading &&
                (!hasSavedPreference
                  ? bannerData.declineButtonText
                  : t.withdrawConsent)}
            </button>
            <button
              onClick={handleAccept}
              disabled={
                loading ||
                (hasSavedPreference &&
                  areSettingsEqual(prevCookieSettings, cookieSettings))
              }
              className="!flex-1 !p-3 !text-sm !rounded-md border-none hover:cursor-pointer disabled:!bg-gray-300 disabled:!text-[#7c828b] disabled:hover:!cursor-not-allowed max-md:w-full focus:!outline-none"
              style={{
                backgroundColor: bannerData.acceptButtonColor,
                color: bannerData.acceptButtonTextColor,
                border:
                  (bannerData.acceptButtonColor === "#ffffff" ||
                    bannerData.acceptButtonColor === "transparent") &&
                  bannerData.backgroundColor === "#ffffff"
                    ? "1px solid #e5e7eb"
                    : "none",
              }}
            >
              {loading && "Loading..."}
              {!loading &&
                (!hasSavedPreference
                  ? bannerData.acceptButtonText
                  : t.changeConsent)}
            </button>
          </div>
          {/* Modal Footer */}
          <div className="max-md:hidden absolute bottom-4 right-5 text-gray-500">
            <div className="!flex !items-center !gap-x-1 !whitespace-nowrap !text-xs">
              <span className="!text-xs"> {t.poweredBy} </span>
              <img
                src="https://bluetic-preprod.s3.ap-south-1.amazonaws.com/blutic-branding.svg"
                className="h-4.5"
              />
            </div>
          </div>
          <div className="max-md:!flex max-md:!items-center max-md:!gap-x-1 max-md:!whitespace-nowrap max-md:!text-xs max-md:w-full max-md:!justify-center md:hidden">
            <span className="!text-xs"> {t.poweredBy} </span>
            <img
              src="https://bluetic-preprod.s3.ap-south-1.amazonaws.com/blutic-branding.svg"
              className="!h-4.5"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (!shouldShowBanner || !isVisible) return null;

  return (
    <>
      {!isModalOpen && bannerData && !hasSavedPreference && (
        <div
          className="fixed z-[99999] font-sans bottom-2 left-1/2 transform -translate-x-1/2 w-[90%] shadow-lg md:hidden"
          style={{ backgroundColor: bannerData.backgroundColor }}
        >
          <div className="p-6 pb-10 relative">
            <div className="flex justify-between items-center mb-2">
              <p
                className="font-semibold !text-lg"
                style={{ color: bannerData.titleColor }}
              >
                {bannerData.title}
              </p>
              <LanguageDropdown />
            </div>

            <div
              className="text-sm mb-4 leading-relaxed !max-h-20 overflow-y-auto"
              style={{ color: bannerData.descriptionColor }}
              dangerouslySetInnerHTML={{ __html: bannerData.description }}
            />

            <div className="flex items-center gap-5 text-sm mb-5">
              <a
                href={bannerData.privacyPolicy}
                target="_blank"
                rel="noopener noreferrer"
                className="!text-black !underline !opacity-75 !font-semibold hover:!opacity-100"
              >
                Privacy Policy
              </a>
              <div className="h-4 border-l border-black opacity-20" />
              <div
                onClick={() => {
                  setActiveTab("about"), setIsModalOpen(true);
                }}
                className="text-black underline opacity-75 font-semibold hover:opacity-100 hover:cursor-pointer"
              >
                {t.whatAreCookies}
              </div>
            </div>

            <div className="flex flex-col gap-y-2 mb-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 !py-1.5 hover:cursor-pointer text-sm font-medium rounded-md border focus:!outline-none"
                style={{
                  backgroundColor: bannerData.manageButtonColor,
                  color: bannerData.manageButtonTextColor,
                  border:
                    (bannerData.manageButtonColor === "#ffffff" ||
                      bannerData.manageButtonColor === "transparent") &&
                    bannerData.backgroundColor === "#ffffff"
                      ? "1px solid #e5e7eb"
                      : "none",
                }}
              >
                {bannerData.manageButtonText}
              </button>
              <button
                disabled={loading}
                onClick={handleRejectAll}
                className="flex-1 !py-1.5 hover:cursor-pointer text-sm font-medium rounded-md border focus:!outline-none"
                style={{
                  backgroundColor: bannerData.declineButtonColor,
                  color: bannerData.declineButtonTextColor,
                  border:
                    (bannerData.declineButtonColor === "#ffffff" ||
                      bannerData.declineButtonColor === "transparent") &&
                    bannerData.backgroundColor === "#ffffff"
                      ? "1px solid #e5e7eb"
                      : "none",
                }}
              >
                {loading && "Loading..."}
                {bannerData.declineButtonText}
              </button>
              <button
                disabled={loading}
                onClick={handleAccept}
                className="flex-1 !py-1.5 hover:cursor-pointer text-sm font-medium rounded-md border-none focus:!outline-none"
                style={{
                  backgroundColor: bannerData.acceptButtonColor,
                  color: bannerData.acceptButtonTextColor,
                  border:
                    (bannerData.acceptButtonColor === "#ffffff" ||
                      bannerData.acceptButtonColor === "transparent") &&
                    bannerData.backgroundColor === "#ffffff"
                      ? "1px solid #e5e7eb"
                      : "none",
                }}
              >
                {loading && "Loading..."}
                {bannerData.acceptButtonText}
              </button>
            </div>

            <div className="!flex !items-center !justify-center !gap-x-1 !text-xs !whitespace-nowrap w-full">
              <span className="text-black !text-xs"> {t.poweredBy} </span>
              <img
                src="https://bluetic-preprod.s3.ap-south-1.amazonaws.com/blutic-branding.svg"
                className="!h-4.5"
              />
            </div>
          </div>
        </div>
      )}
      {!isModalOpen && bannerData && !hasSavedPreference && (
        <div
          className={`max-md:hidden fixed z-[99999] font-sans ${
            bannerData.position.startsWith("bottom")
              ? bannerData.position.includes("overlay")
                ? "bottom-0 w-full shadow-lg left-0"
                : `${
                    bannerData.position === "bottom_left" ? "left-4" : "right-4"
                  } bottom-4 max-w-lg rounded-xl shadow-xl overflow-hidden`
              : bannerData.position === "overlay"
              ? "top-0 w-full shadow-lg left-0"
              : "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-lg rounded-xl shadow-xl overflow-hidden"
          }`}
          style={{ backgroundColor: bannerData.backgroundColor }}
        >
          {(bannerData.position.startsWith("bottom") ||
            bannerData.position === "center") &&
          !bannerData.position.includes("overlay") ? (
            <div className="p-6 pb-10 relative">
              <div className="flex justify-between items-center mb-2">
                <p
                  className="font-semibold !text-xl"
                  style={{ color: bannerData.titleColor }}
                >
                  {bannerData.title}
                </p>
                <LanguageDropdown />
              </div>

              <div
                className="text-sm mb-4 leading-relaxed !max-h-20 overflow-y-auto"
                style={{ color: bannerData.descriptionColor }}
                dangerouslySetInnerHTML={{ __html: bannerData.description }}
              />

              <div className="flex items-center gap-5 text-sm mb-5">
                <a
                  href={bannerData.privacyPolicy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="!text-black !underline !opacity-75 !font-semibold hover:!opacity-100"
                >
                  Privacy Policy
                </a>
                <div className="h-4 border-l border-black opacity-20" />
                <div
                  onClick={() => {
                    setActiveTab("about"), setIsModalOpen(true);
                  }}
                  className="text-black underline opacity-75 font-semibold hover:opacity-100 hover:cursor-pointer"
                >
                  {t.whatAreCookies}
                </div>
              </div>

              <div className="flex gap-x-2 mb-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="!flex-1 hover:cursor-pointer text-sm font-medium rounded-md border focus:!outline-none"
                  style={{
                    paddingTop: "10px !important",
                    paddingBottom: "10px !important",
                    backgroundColor: bannerData.manageButtonColor,
                    color: bannerData.manageButtonTextColor,
                    border:
                      (bannerData.manageButtonColor === "#ffffff" ||
                        bannerData.manageButtonColor === "transparent") &&
                      bannerData.backgroundColor === "#ffffff"
                        ? "1px solid #e5e7eb"
                        : "none",
                  }}
                >
                  {bannerData.manageButtonText}
                </button>
                <button
                  disabled={loading}
                  onClick={handleRejectAll}
                  className="!flex-1 hover:cursor-pointer text-sm font-medium rounded-md border focus:!outline-none"
                  style={{
                    paddingTop: "10px !important",
                    paddingBottom: "10px !important",
                    backgroundColor: bannerData.declineButtonColor,
                    color: bannerData.declineButtonTextColor,
                    border:
                      (bannerData.declineButtonColor === "#ffffff" ||
                        bannerData.declineButtonColor === "transparent") &&
                      bannerData.backgroundColor === "#ffffff"
                        ? "1px solid #e5e7eb"
                        : "none",
                  }}
                >
                  {loading && "Loading..."}
                  {bannerData.declineButtonText}
                </button>
                <button
                  disabled={loading}
                  onClick={handleAccept}
                  className="!flex-1 hover:cursor-pointer text-sm font-medium rounded-md border-none focus:!outline-none"
                  style={{
                    paddingTop: "10px !important",
                    paddingBottom: "10px !important",
                    backgroundColor: bannerData.acceptButtonColor,
                    color: bannerData.acceptButtonTextColor,
                    border:
                      (bannerData.acceptButtonColor === "#ffffff" ||
                        bannerData.acceptButtonColor === "transparent") &&
                      bannerData.backgroundColor === "#ffffff"
                        ? "1px solid #e5e7eb"
                        : "none",
                  }}
                >
                  {loading && "Loading..."}
                  {bannerData.acceptButtonText}
                </button>
              </div>

              <div className="absolute bottom-3 right-6 text-gray-500">
                <div className="!flex !items-center !justify-center !gap-x-1 !text-xs !whitespace-nowrap">
                  <span className="text-black !text-xs"> {t.poweredBy} </span>
                  <img
                    src="https://bluetic-preprod.s3.ap-south-1.amazonaws.com/blutic-branding.svg"
                    className="h-4.5"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center relative px-12 pt-4 pb-9">
              <div className="w-3/5">
                <div className="flex items-center mb-1 gap-4">
                  <p
                    className="!text-xl font-semibold"
                    style={{ color: bannerData.titleColor }}
                  >
                    {bannerData.title}
                  </p>
                  <LanguageDropdown />
                </div>

                <div
                  className="text-sm mb-3 font-medium !max-h-20 overflow-y-auto"
                  style={{ color: bannerData.descriptionColor }}
                  dangerouslySetInnerHTML={{ __html: bannerData.description }}
                />

                <div className="flex items-center gap-5 text-sm">
                  <a
                    href={bannerData.privacyPolicy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="!text-black !underline !opacity-75 !font-semibold hover:!opacity-100"
                  >
                    Privacy Policy
                  </a>
                  <div className="h-4 border-l border-black opacity-20" />
                  <div
                    onClick={() => {
                      setActiveTab("about"), setIsModalOpen(true);
                    }}
                    className="text-black underline opacity-75 font-semibold hover:opacity-100 hover:cursor-pointer"
                  >
                    {t.whatAreCookies}
                  </div>
                </div>
              </div>

              <div className="w-2/5 flex gap-x-2 justify-end items-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 hover:cursor-pointer !text-sm rounded-md border focus:!outline-none"
                  style={{
                    paddingTop: "10px !important",
                    paddingBottom: "10px !important",
                    backgroundColor: bannerData.manageButtonColor,
                    color: bannerData.manageButtonTextColor,
                    border:
                      (bannerData.manageButtonColor === "#ffffff" ||
                        bannerData.manageButtonColor === "transparent") &&
                      bannerData.backgroundColor === "#ffffff"
                        ? "1px solid #e5e7eb"
                        : "none",
                  }}
                >
                  {bannerData.manageButtonText}
                </button>
                <button
                  disabled={loading}
                  onClick={handleRejectAll}
                  className="flex-1 hover:cursor-pointer !text-sm rounded-md border focus:!outline-none"
                  style={{
                    paddingTop: "10px !important",
                    paddingBottom: "10px !important",
                    backgroundColor: bannerData.declineButtonColor,
                    color: bannerData.declineButtonTextColor,
                    border:
                      (bannerData.declineButtonColor === "#ffffff" ||
                        bannerData.declineButtonColor === "transparent") &&
                      bannerData.backgroundColor === "#ffffff"
                        ? "1px solid #e5e7eb"
                        : "none",
                  }}
                >
                  {loading && "Loading..."}
                  {bannerData.declineButtonText}
                </button>
                <button
                  disabled={loading}
                  onClick={handleAccept}
                  className="flex-1 hover:cursor-pointer !text-sm rounded-md border-none focus:!outline-none"
                  style={{
                    paddingTop: "10px !important",
                    paddingBottom: "10px !important",
                    backgroundColor: bannerData.acceptButtonColor,
                    color: bannerData.acceptButtonTextColor,
                    border:
                      (bannerData.acceptButtonColor === "#ffffff" ||
                        bannerData.acceptButtonColor === "transparent") &&
                      bannerData.backgroundColor === "#ffffff"
                        ? "1px solid #e5e7eb"
                        : "none",
                  }}
                >
                  {loading && "Loading..."}
                  {bannerData.acceptButtonText}
                </button>
              </div>

              <div className="absolute bottom-2 right-11">
                <div className="!flex !items-center !justify-center !gap-x-1 !text-xs !whitespace-nowrap">
                  <span className="text-black !text-xs"> {t.poweredBy} </span>
                  <img
                    src="https://bluetic-preprod.s3.ap-south-1.amazonaws.com/blutic-branding.svg"
                    className="h-4.5"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {!isModalOpen && hasSavedPreference && (
        <div
          className="fixed rounded-full hover:cursor-pointer bottom-10 left-10 !z-[99999]"
          onClick={() => setIsModalOpen(true)}
        >
          <svg
            width="96"
            height="96"
            viewBox="0 0 96 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="max-md:!w-[64px] max-md:!h-[64px]"
          >
            <g filter="url(#ez0jg1pgfa)">
              <rect
                x="6"
                y="6"
                width="80"
                height="80"
                rx="40"
                fill="url(#bzo0r7r88b)"
                shape-rendering="crispEdges"
              />
              <g clip-path="url(#r00gf1mkgc)">
                <path
                  d="M72.27 43.344c-4.773-.08-9.866-5.2-7.146-11.254-7.947 2.667-15.387-4.24-13.84-12.16-19.014-4-32.214 11.654-32.214 26.107 0 14.72 11.947 26.667 26.667 26.667 15.707 0 28.107-13.547 26.533-29.36z"
                  fill="#fff"
                />
                <g clip-path="url(#jh3f8gjozd)">
                  <path
                    d="m46.678 41.88-3.95-3.9a.43.43 0 0 0-.601 0l-3.95 3.9a.416.416 0 0 0 0 .595l3.95 3.9a.43.43 0 0 0 .602 0l3.95-3.9a.416.416 0 0 0 0-.594z"
                    fill="url(#dv7aqb22we)"
                  />
                  <path
                    d="m47.892 58.152.828-.817L35.925 44.7a.43.43 0 0 0-.601 0l-5.7 5.628a.417.417 0 0 0 0 .594l7.322 7.23c.226.223.531.347.85.347h9.245c.319 0 .625-.124.85-.348v.001z"
                    fill="url(#b9gxfjod9f)"
                  />
                  <path
                    d="m47.886 58.152 14.488-14.306a.417.417 0 0 0 0-.594l-5.7-5.628a.43.43 0 0 0-.601 0l-19.962 19.71.829.817c.226.224.532.349.85.349h9.245c.319 0 .626-.125.85-.349v.001z"
                    fill="url(#rwjv4b0eug)"
                  />
                </g>
                <path
                  d="M62.252 27.535c.575 1.56 3.037.653 2.463-.907-.575-1.56-3.037-.652-2.463.907zM72.076 25.268c-.877-2.38-4.571-1.02-3.694 1.36.876 2.38 4.57 1.02 3.694-1.36zM72.852 32.44c-.574-1.56-3.037-.653-2.462.907.574 1.56 3.037.652 2.462-.907z"
                  fill="#fff"
                />
              </g>
            </g>
            <defs>
              <linearGradient
                id="bzo0r7r88b"
                x1="81.387"
                y1="13.312"
                x2="-3.87"
                y2="78.798"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#2065F5" />
                <stop offset="1" stop-color="#6DBDFF" />
              </linearGradient>
              <linearGradient
                id="dv7aqb22we"
                x1="42.427"
                y1="48.764"
                x2="42.427"
                y2="32.096"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#2065F5" />
                <stop offset="1" stop-color="#6DBDFF" />
              </linearGradient>
              <linearGradient
                id="b9gxfjod9f"
                x1="41.462"
                y1="56.009"
                x2="27.682"
                y2="43.126"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#2065F5" />
                <stop offset="1" stop-color="#6DBDFF" />
              </linearGradient>
              <linearGradient
                id="rwjv4b0eug"
                x1="60.977"
                y1="39.42"
                x2="37.829"
                y2="61.762"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#2065F5" />
                <stop offset="1" stop-color="#6DBDFF" />
              </linearGradient>
              <clipPath id="r00gf1mkgc">
                <path
                  fill="#fff"
                  transform="translate(19 19)"
                  d="M0 0h54v54H0z"
                />
              </clipPath>
              <clipPath id="jh3f8gjozd">
                <path
                  fill="#fff"
                  transform="translate(29.5 37.5)"
                  d="M0 0h33v21H0z"
                />
              </clipPath>
              <filter
                id="ez0jg1pgfa"
                x="0"
                y="0"
                width="96"
                height="96"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx="2" dy="2" />
                <feGaussianBlur stdDeviation="4" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
                <feBlend
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_1351_35532"
                />
                <feBlend
                  in="SourceGraphic"
                  in2="effect1_dropShadow_1351_35532"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
        </div>
      )}
      {isModalOpen && <Modal />}
    </>
  );
};

export default CookieBanner;
