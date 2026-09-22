import { AppLanguage } from "../types";

/**
 * Returns user-friendly loading and progress messages when switching tabs or views.
 * Supports English, Hindi, and Urdu.
 */
export function getTabTransitionMessage(
  tab: string,
  language: AppLanguage,
  cityName: string
): { message: string; subMessage: string } {
  const isHindi = language === "hi";

  const tabMessages: Record<string, { msg: string; sub: string }> = {
    map: {
      msg: isHindi ? "लाइव मैप लोड हो रहा है..." : "Loading Live Transit Map...",
      sub: isHindi
        ? "जीपीएस ट्रैकिंग व चोकपॉइंट सेंसर कनेक्ट हो रहे हैं"
        : "Syncing GPS sensors & live choke zones",
    },
    route: {
      msg: isHindi ? "स्मार्ट रूट कैलकुलेटर..." : "Calculating Smart Detour...",
      sub: isHindi
        ? "गली-गली बायपास व सबसे तेज रास्ता"
        : "Finding fastest alleyways & congestion bypass",
    },
    cockpit: {
      msg: isHindi ? "ई-रिक्शा चालक कॉकपिट..." : "Initializing Driver Cockpit...",
      sub: isHindi
        ? "बैटरी चार्जिंग स्टेशन व लाइव पैसेंजर डिमांड"
        : "Syncing charging stations & passenger surges",
    },
    services: {
      msg: isHindi ? "शहर सेवाएं व अस्पताल लोड हो रहे हैं..." : "Loading City Directory...",
      sub: isHindi
        ? "अस्पताल, घंटे के होटल, कॉलेज व स्थानीय दुकानें"
        : "Hospitals, hourly stays, colleges & local clinics",
    },
    fare: {
      msg: isHindi ? "ई-रिक्शा किराया दरें लोड हो रही हैं..." : "Loading Official Fare Rates...",
      sub: isHindi
        ? `${cityName} आधिकारिक रेट चार्ट व कैलकुलेटर`
        : `${cityName} verified rates & route fare chart`,
    },
    sos: {
      msg: isHindi ? "महिला सुरक्षा एवं पुलिस SOS..." : "Loading Women Safety & SOS Hub...",
      sub: isHindi
        ? "112 पुलिस आपातकाल व लाइव जीपीएस लोकेशन"
        : "Connecting to emergency police desk & GPS broadcast",
    },
    feed: {
      msg: isHindi ? "लाइव क्राउडसोर्स अलर्ट्स..." : "Fetching Live Citizen Reports...",
      sub: isHindi
        ? "चालक व पुलिस लाइव अपडेट्स"
        : "Crowdsourced jam reports & police clearances",
    },
    police: {
      msg: isHindi ? "यातायात पुलिस एडवाइजरी..." : "Loading Police Bulletins...",
      sub: isHindi
        ? "आधिकारिक रूट डायवर्जन व नोटिस"
        : "Official traffic police notices & diversions",
    },
    roadmap: {
      msg: isHindi ? "4-फेज ट्रांजिट इंजन..." : "Loading Architecture Engine...",
      sub: isHindi ? "एआई रूटिंग व सेंसर मैट्रिक्स" : "Algorithms & data architecture",
    },
  };

  const selected = tabMessages[tab] || {
    msg: isHindi ? "लोड हो रहा है..." : "Loading...",
    sub: isHindi ? "डेटा अपडेट हो रहा है" : "Updating transit data",
  };

  return { message: selected.msg, subMessage: selected.sub };
}
