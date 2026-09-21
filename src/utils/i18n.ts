import { AppLanguage } from '../types';

export interface Translations {
  appName: string;
  tagline: string;
  commuterMode: string;
  driverMode: string;
  flagJam: string;
  mapTab: string;
  routesTab: string;
  cockpitTab: string;
  alertsTab: string;
  policeTab: string;
  complaintTab: string;
  complaintBtn: string;
  fareCalcBtn: string;
  installAppBtn: string;
  architectureTab: string;
  listenAudio: string;
  smartBypass: string;
  chokedRoute: string;
  timeSaved: string;
  batterySaved: string;
  trafficPoliceAdvisory: string;
  crowdsourceRuleTitle: string;
  crowdsourceRuleSubtitle: string;
  simulateClusterBtn: string;
  resetWeightsBtn: string;
  spatialRadarTitle: string;
  audioAnnouncementText: string;
  
  // Route planner & trip
  originLabel: string;
  destLabel: string;
  selectOrigin: string;
  selectDest: string;
  swapTooltip: string;
  fastestRouteBadge: string;
  chokedRouteBadge: string;
  startNavigation: string;
  stopNavigation: string;
  rideOngoing: string;
  remainingDist: string;
  estTime: string;
  currentSpeed: string;
  estFare: string;
  aiAdvisor: string;
  getAiAdvice: string;
  loadingAiAdvice: string;

  // Map controls
  myGpsBtn: string;
  recenterMapBtn: string;
  congestionLegend: string;
  chargingHubs: string;

  // Driver cockpit
  driverQuickActions: string;
  quickReportJam: string;
  chargingStations: string;
  officialFareCard: string;
  batteryEcoStatus: string;

  // Feed & Reports
  incidentFeedTitle: string;
  verifiedBadge: string;
  upvote: string;
  downvote: string;
  noReportsYet: string;
  allSeverity: string;
  criticalOnly: string;

  // Complaint & Help Modal
  grievanceDeskTitle: string;
  gpsLinked: string;
  fileNewComplaint: string;
  liveTickets: string;
  yourName: string;
  namePlaceholder: string;
  phoneNum: string;
  phonePlaceholder: string;
  emergencyAlert: string;
  emergencySubtext: string;
  selectIssueCategory: string;
  issueDetailsLabel: string;
  issueDetailsPlaceholder: string;
  autoGpsDetection: string;
  detectingGps: string;
  refetchGps: string;
  submitComplaint: string;
  submitEmergencyAlert: string;
  dialPolice: string;
  dialWomen: string;
  dialAmbulance: string;
  ticketRegistered: string;
  doneBtn: string;
  viewTrackedTickets: string;

  // General
  poweredBy: string;
  version: string;
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  en: {
    appName: "E-Rahi India",
    tagline: "Hyperlocal E-Rickshaw & Commuter Route Optimizer",
    commuterMode: "Commuter Mode",
    driverMode: "E-Rickshaw Driver",
    flagJam: "Report Obstacle",
    mapTab: "Live Map",
    routesTab: "Smart Routes",
    cockpitTab: "Driver Cockpit",
    alertsTab: "Live Feed",
    policeTab: "Police Advisory",
    complaintTab: "Grievance / Help",
    complaintBtn: "Complaint / Help",
    fareCalcBtn: "Fare Calculator",
    installAppBtn: "Install App",
    architectureTab: "Engine & Roadmap",
    listenAudio: "Voice Alert",
    smartBypass: "Smart Bypass Route",
    chokedRoute: "Standard Congested Route",
    timeSaved: "Time Saved",
    batterySaved: "Battery Saved",
    trafficPoliceAdvisory: "City Traffic Police Advisory & Directives",
    crowdsourceRuleTitle: "Crowdsource Aggregation Engine (Phase 2)",
    crowdsourceRuleSubtitle: "≥3 user reports within 15 mins triggers 320% road penalty & auto-detour.",
    simulateClusterBtn: "Simulate Congestion Spike",
    resetWeightsBtn: "Reset Penalty Weights",
    spatialRadarTitle: "PostGIS 500m Hazard Radar",
    audioAnnouncementText: "E-Rahi Traffic Alert: Heavy E-Rickshaw congestion reported in central corridors. Smart bypass routes activated.",

    originLabel: "Pickup Point (Origin)",
    destLabel: "Drop-off Destination",
    selectOrigin: "Select pickup point",
    selectDest: "Select destination",
    swapTooltip: "Swap origin and destination",
    fastestRouteBadge: "Fastest Bypass Route",
    chokedRouteBadge: "Congested Main Road",
    startNavigation: "Start Live GPS Navigation",
    stopNavigation: "Stop Trip",
    rideOngoing: "Trip in Progress",
    remainingDist: "Remaining",
    estTime: "Time",
    currentSpeed: "Speed",
    estFare: "Est. Fare",
    aiAdvisor: "AI Transit Advisor",
    getAiAdvice: "Get Smart Traffic Advice",
    loadingAiAdvice: "Analyzing live city traffic...",

    myGpsBtn: "My GPS Location",
    recenterMapBtn: "Recenter Map",
    congestionLegend: "Live Congestion",
    chargingHubs: "Charging Hubs",

    driverQuickActions: "Driver Quick Dashboard",
    quickReportJam: "Report Jam Ahead",
    chargingStations: "EV Charging Stations",
    officialFareCard: "Official Rate Card",
    batteryEcoStatus: "Battery Eco-Saver Active",

    incidentFeedTitle: "Live Crowdsourced Traffic Feed",
    verifiedBadge: "Verified",
    upvote: "Confirm",
    downvote: "Dismiss",
    noReportsYet: "No traffic incidents reported currently.",
    allSeverity: "All Incidents",
    criticalOnly: "Critical Only",

    grievanceDeskTitle: "Citizen Grievance & Help Desk",
    gpsLinked: "GPS Linked",
    fileNewComplaint: "File New Complaint / Help",
    liveTickets: "Tracked Tickets",
    yourName: "Your Full Name",
    namePlaceholder: "e.g. Rahul Sharma",
    phoneNum: "Phone Number",
    phonePlaceholder: "e.g. 98370 12345",
    emergencyAlert: "Emergency / Immediate Police Assistance",
    emergencySubtext: "Mark for accidents, immediate danger, medical delays, or major disputes",
    selectIssueCategory: "Select Issue Category",
    issueDetailsLabel: "Issue Details / Auto Number / Description",
    issueDetailsPlaceholder: "Mention vehicle number, exact junction, or what happened...",
    autoGpsDetection: "Automatic GPS Location Tagging",
    detectingGps: "Acquiring satellite GPS coordinates...",
    refetchGps: "Refetch GPS",
    submitComplaint: "Submit Complaint with Auto-GPS",
    submitEmergencyAlert: "Submit Emergency Alert & Dispatch GPS",
    dialPolice: "Dial 112 (Police)",
    dialWomen: "Dial 1090 (Women)",
    dialAmbulance: "Dial 108 (Ambulance)",
    ticketRegistered: "Ticket Registered Successfully",
    doneBtn: "Done",
    viewTrackedTickets: "View Tracked Tickets",

    poweredBy: "National Smart Mobility Grid",
    version: "v2.5 Production"
  },
  hi: {
    appName: "ई-राही भारत",
    tagline: "हाइपरलोकल ई-रिक्शा एवं यात्री रूट ऑप्टिमाइज़र",
    commuterMode: "यात्री मोड",
    driverMode: "ई-रिक्शा चालक",
    flagJam: "जाम की सूचना दें",
    mapTab: "लाइव नक्शा",
    routesTab: "स्मार्ट रास्ते",
    cockpitTab: "ड्राइवर कॉकपिट",
    alertsTab: "लाइव फीड",
    policeTab: "ट्रैफिक पुलिस",
    complaintTab: "शिकायत व सहायता",
    complaintBtn: "शिकायत / सहायता",
    fareCalcBtn: "किराया कैलकुलेटर",
    installAppBtn: "ऐप इंस्टॉल करें",
    architectureTab: "रोडमैप व तकनीक",
    listenAudio: "आवाज सुनें",
    smartBypass: "स्मार्ट संकरी गली बाईपास",
    chokedRoute: "जाम वाला मुख्य बाजार मार्ग",
    timeSaved: "समय की बचत",
    batterySaved: "बैटरी की बचत",
    trafficPoliceAdvisory: "शहर ट्रैफिक पुलिस नागरिक निर्देश व एडवाइजरी",
    crowdsourceRuleTitle: "क्राउडसोर्स एग्रीगेशन एल्गोरिदम (फेज 2)",
    crowdsourceRuleSubtitle: "15 मिनट में 3 या अधिक रिपोर्ट आने पर 320% पेनल्टी लगती है और बाईपास स्वतः लागू होता है।",
    simulateClusterBtn: "जाम रिपोर्ट का परीक्षण करें",
    resetWeightsBtn: "पेनल्टी रीसेट करें",
    spatialRadarTitle: "PostGIS 500-मीटर परिधि रडार",
    audioAnnouncementText: "ई-राही चेतावनी: मुख्य चौराहों पर ई-रिक्शा का जाम है। सुझाये गए बाईपास मार्ग से जाएं, समय बचेगा।",

    originLabel: "शुरुआती स्थान (पिकअप)",
    destLabel: "गंतव्य स्थान (ड्रॉप)",
    selectOrigin: "शुरुआती स्थान चुनें",
    selectDest: "गंतव्य स्थान चुनें",
    swapTooltip: "स्थान आपस में बदलें",
    fastestRouteBadge: "सबसे तेज़ बाईपास रास्ता",
    chokedRouteBadge: "जाम से भरा मुख्य मार्ग",
    startNavigation: "लाइव GPS नेविगेशन शुरू करें",
    stopNavigation: "यात्रा रोकें",
    rideOngoing: "यात्रा जारी है",
    remainingDist: "बची दूरी",
    estTime: "समय",
    currentSpeed: "स्पीड",
    estFare: "अनुमानित किराया",
    aiAdvisor: "AI ट्रैफिक सलाहकार",
    getAiAdvice: "स्मार्ट रूट सुझाव प्राप्त करें",
    loadingAiAdvice: "लाइव शहर ट्रैफिक का विश्लेषण जारी...",

    myGpsBtn: "मेरी लोकेशन (GPS)",
    recenterMapBtn: "नक्शा रीसेंटर करें",
    congestionLegend: "लाइव जाम स्थिति",
    chargingHubs: "चार्जिंग केंद्र",

    driverQuickActions: "ड्राइवर त्वरित डैशबोर्ड",
    quickReportJam: "आगे जाम की सूचना दें",
    chargingStations: "ईवी चार्जिंग स्टेशन",
    officialFareCard: "सरकारी रेट कार्ड",
    batteryEcoStatus: "बैटरी बचत मोड सक्रिय",

    incidentFeedTitle: "लाइव क्राउडसोर्स्ड ट्रैफिक घटनाएं",
    verifiedBadge: "सत्यापित",
    upvote: "पुष्टि करें",
    downvote: "खारिज करें",
    noReportsYet: "वर्तमान में कोई ट्रैफिक बाधा दर्ज नहीं है।",
    allSeverity: "सभी घटनाएं",
    criticalOnly: "केवल गंभीर",

    grievanceDeskTitle: "नागरिक शिकायत एवं सहायता केंद्र",
    gpsLinked: "GPS लिंक्ड",
    fileNewComplaint: "नई शिकायत / सहायता दर्ज करें",
    liveTickets: "दर्ज शिकायतें",
    yourName: "आपका पूरा नाम",
    namePlaceholder: "जैसे: रमेश कुमार",
    phoneNum: "मोबाइल नंबर",
    phonePlaceholder: "जैसे: 98370 12345",
    emergencyAlert: "आपातकालीन / त्वरित पुलिस सहायता",
    emergencySubtext: "दुर्घटना, त्वरित खतरे या विवाद की स्थिति में चुनें",
    selectIssueCategory: "समस्या का प्रकार चुनें",
    issueDetailsLabel: "समस्या का विवरण / ऑटो नंबर / स्थान",
    issueDetailsPlaceholder: "ऑटो नंबर, चौराहा या घटना का विवरण लिखें...",
    autoGpsDetection: "ऑटोमैटिक GPS लोकेशन टैगिंग",
    detectingGps: "सैटेलाइट GPS लोकेशन प्राप्त की जा रही है...",
    refetchGps: "GPS रिफ्रेश करें",
    submitComplaint: "ऑटो-GPS के साथ शिकायत दर्ज करें",
    submitEmergencyAlert: "आपातकालीन अलर्ट व GPS भेजें",
    dialPolice: "डायल 112 (पुलिस)",
    dialWomen: "डायल 1090 (महिला हेल्पलाइन)",
    dialAmbulance: "डायल 108 (एम्बुलेंस)",
    ticketRegistered: "शिकायत सफलतापूर्वक दर्ज हो गई है",
    doneBtn: "पूर्ण",
    viewTrackedTickets: "दर्ज टिकट देखें",

    poweredBy: "राष्ट्रीय स्मार्ट मोबिलिटी ग्रिड",
    version: "v2.5 प्रो"
  },
  ur: {
    appName: "ای-راہی بھارت",
    tagline: "مقامی ای-رکشہ اور مسافر روٹ آپٹیمائزر",
    commuterMode: "مسافر موڈ",
    driverMode: "ای-رکشہ ڈرائیور",
    flagJam: "جام کی اطلاع دیں",
    mapTab: "براہ راست نقشہ",
    routesTab: "سمارٹ راستے",
    cockpitTab: "ڈرائیور کاک پٹ",
    alertsTab: "لائیو فیڈ",
    policeTab: "ٹریفک پولیس",
    complaintTab: "شکایات و مدد",
    complaintBtn: "شکایت / مدد",
    fareCalcBtn: "کرایہ کیلکولیٹر",
    installAppBtn: "ایپ انسٹال کریں",
    architectureTab: "روڈ میپ اور انجن",
    listenAudio: "آواز سنیں",
    smartBypass: "سمارٹ بائی پاس راستہ",
    chokedRoute: "جام والا عام راستہ",
    timeSaved: "وقت کی بچت",
    batterySaved: "بیٹری کی بچت",
    trafficPoliceAdvisory: "ٹریفک پولیس ایڈوائزری",
    crowdsourceRuleTitle: "کراؤڈ سورس ایگریگیشن الگورتھم",
    crowdsourceRuleSubtitle: "15 منٹ میں 3 رپورٹوں پر متبادل راستہ فعال ہوتا ہے۔",
    simulateClusterBtn: "ٹیسٹ الرٹ چلائیں",
    resetWeightsBtn: "پنالٹی ری سیٹ کریں",
    spatialRadarTitle: "خطرہ ریڈار",
    audioAnnouncementText: "ای-راہی الرٹ: ٹریفک جام سے بچنے کے لیے تجویز کردہ بائی پاس راستہ اختیار کریں۔",

    originLabel: "آغاز کی جگہ (پک اپ)",
    destLabel: "منزل کی جگہ (ڈراپ)",
    selectOrigin: "پک اپ کا انتخاب کریں",
    selectDest: "منزل کا انتخاب کریں",
    swapTooltip: "مقامات تبدیل کریں",
    fastestRouteBadge: "سب سے تیز بائی پاس",
    chokedRouteBadge: "جام والا راستہ",
    startNavigation: "نیویگیشن شروع کریں",
    stopNavigation: "سفر روکیں",
    rideOngoing: "سفر جاری ہے",
    remainingDist: "باقی فاصلہ",
    estTime: "وقت",
    currentSpeed: "رفتار",
    estFare: "تخمینہ کرایہ",
    aiAdvisor: "AI ٹریفک مشیر",
    getAiAdvice: "سمارٹ مشورہ حاصل کریں",
    loadingAiAdvice: "ٹریفک کا تجزیہ جاری ہے...",

    myGpsBtn: "میری لوکیشن (GPS)",
    recenterMapBtn: "نقشہ ری سیٹ کریں",
    congestionLegend: "ٹریفک کی صورتحال",
    chargingHubs: "چارجنگ اسٹیشن",

    driverQuickActions: "ڈرائیور فوری ڈیش بورڈ",
    quickReportJam: "جام کی اطلاع دیں",
    chargingStations: "ای وی چارجنگ",
    officialFareCard: "سرکاری ریٹ کارڈ",
    batteryEcoStatus: "بیٹری بچت فعال",

    incidentFeedTitle: "لائیو ٹریفک فیڈ",
    verifiedBadge: "تصدیق شدہ",
    upvote: "تصدیق",
    downvote: "مسترد",
    noReportsYet: "فی الحال کوئی ٹریفک رکاوٹ نہیں ہے۔",
    allSeverity: "تمام واقعات",
    criticalOnly: "صرف سنگین",

    grievanceDeskTitle: "شہری شکایات و ہیلپ ڈیسک",
    gpsLinked: "GPS منسلک",
    fileNewComplaint: "نئی شکایت درج کریں",
    liveTickets: "درج شدہ شکایات",
    yourName: "آپ کا پورا نام",
    namePlaceholder: "جیسے: احمد خان",
    phoneNum: "فون نمبر",
    phonePlaceholder: "جیسے: 98370 12345",
    emergencyAlert: "ہنگامی / فوری پولیس مدد",
    emergencySubtext: "حادثے یا فوری خطرے کی صورت میں منتخب کریں",
    selectIssueCategory: "مسئلے کی قسم",
    issueDetailsLabel: "تفصیلات / رکشہ نمبر",
    issueDetailsPlaceholder: "واقعے کی تفصیل درج کریں...",
    autoGpsDetection: "خودکار GPS لوکیشن",
    detectingGps: "لوکیشن تلاش کی جا رہی ہے...",
    refetchGps: "GPS دوبارہ حاصل کریں",
    submitComplaint: "شکایت درج کریں",
    submitEmergencyAlert: "ہنگامی الرٹ ارسال کریں",
    dialPolice: "112 (پولیس)",
    dialWomen: "1090 (خواتین)",
    dialAmbulance: "108 (ایمبولینس)",
    ticketRegistered: "شکایت درج ہو گئی ہے",
    doneBtn: "مکمل",
    viewTrackedTickets: "شکایات دیکھیں",

    poweredBy: "اسمارٹ موبیلیٹی گرڈ",
    version: "v2.5"
  }
};
