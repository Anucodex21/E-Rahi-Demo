import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  Navigation, 
  AlertTriangle, 
  Hospital, 
  BatteryCharging, 
  ShieldAlert, 
  ArrowRight,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { AppLanguage, VoiceQueryIntent } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  cityName: string;
  onSelectRouteQuick?: (originName: string, destName: string) => void;
  onNavigateTab?: (tab: 'map' | 'route' | 'cockpit' | 'services' | 'fare' | 'sos') => void;
  onOpenSos?: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
  cityName,
  onSelectRouteQuick,
  onNavigateTab,
  onOpenSos
}) => {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [detectedAction, setDetectedAction] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setSpokenText(transcript);
          if (event.results[current].isFinal) {
            handleProcessQuery(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.log('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  const speakResponse = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    }
  };

  const handleStartListening = () => {
    if (!recognitionRef.current) {
      // Simulate speech for unsupported environments
      simulateQuickQuery("स्टेशन से सेटेलाइट का किराया कितना है?");
      return;
    }
    setSpokenText('');
    setResponseText('');
    setDetectedAction(null);
    try {
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognitionRef.current.start();
    } catch (e) {
      console.log('Error starting speech:', e);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleProcessQuery = (query: string) => {
    const q = query.toLowerCase();

    // 1. SOS or Safety query
    if (q.includes('sos') || q.includes('मदद') || q.includes('help') || q.includes('police') || q.includes('पुलिस') || q.includes('छेड़छाड़') || q.includes('सुरक्षा')) {
      const reply = language === 'hi'
        ? 'इमरजेंसी महिला सुरक्षा एवं पुलिस SOS पोर्टल तुरंत खोला जा रहा है। 112 और 1090 पर सतर्क संदेश भेजा जा सकता है।'
        : 'Emergency Safety & Police SOS portal is opening right now. Police dispatch 112 and 1090 helpline ready.';
      setResponseText(reply);
      setDetectedAction('SOS_PORTAL');
      speakResponse(reply);
      if (onOpenSos) {
        setTimeout(onOpenSos, 1500);
      }
      return;
    }

    // 2. Hospital / Emergency Medical
    if (q.includes('hospital') || q.includes('अस्पताल') || q.includes('डॉक्टर') || q.includes('इलाज') || q.includes('emergency') || q.includes('दवा')) {
      const reply = language === 'hi'
        ? `${cityName} के 24x7 इमरजेंसी सरकारी व निजी अस्पताल लिस्ट किए गए हैं। जिला अस्पताल सिविल लाइन्स में आयुष्मान भारत स्वीकृत है।`
        : `Listing 24x7 Emergency Hospitals in ${cityName}. District Government Hospital in Civil Lines accepts Ayushman Bharat.`;
      setResponseText(reply);
      setDetectedAction('OPEN_SERVICES_HOSPITAL');
      speakResponse(reply);
      if (onNavigateTab) {
        setTimeout(() => onNavigateTab('services'), 1500);
      }
      return;
    }

    // 3. Battery swap / Charging
    if (q.includes('battery') || q.includes('बैटरी') || q.includes('charge') || q.includes('चार्जिंग') || q.includes('स्वैप') || q.includes('swap')) {
      const reply = language === 'hi'
        ? `श्यामगंज व सेटेलाइट के पास बैटरी स्मार्ट और सन मोबिलिटी स्वैप स्टेशन सक्रिय हैं। स्वैप शुल्क ₹60 से ₹65 प्रति बैटरी है।`
        : `Battery Smart and Sun Mobility swapping docks are active near Shyamganj & Satellite. Swap fee is ₹60 to ₹65 per battery.`;
      setResponseText(reply);
      setDetectedAction('OPEN_BATTERY_SWAP');
      speakResponse(reply);
      if (onNavigateTab) {
        setTimeout(() => onNavigateTab('cockpit'), 1500);
      }
      return;
    }

    // 4. Station to Satellite route or fare
    if ((q.includes('स्टेशन') || q.includes('station')) && (q.includes('सेटेलाइट') || q.includes('satellite'))) {
      const reply = language === 'hi'
        ? `बरेली जंक्शन से सेटेलाइट का सरकारी शेयर्ड ई-रिक्शा किराया ₹15 प्रति सवारी है। दूरी 4.8 किमी है और समय लगभग 18 मिनट लगेगा।`
        : `Official shared E-Rickshaw fare from Bareilly Junction to Satellite Bus Stand is ₹15 per passenger. Distance is 4.8 km, estimated time 18 minutes.`;
      setResponseText(reply);
      setDetectedAction('SET_ROUTE_STATION_SATELLITE');
      speakResponse(reply);
      if (onSelectRouteQuick) {
        onSelectRouteQuick('Bareilly Junction', 'Satellite Bus Stand');
      }
      return;
    }

    // 5. General Fare check
    if (q.includes('किराया') || q.includes('fare') || q.includes('रेट') || q.includes('rate') || q.includes('पैसा') || q.includes('रुपये')) {
      const reply = language === 'hi'
        ? `${cityName} में 2 किमी तक का न्यूनतम शेयर्ड किराया ₹10 है, और 4.5 किमी तक ₹15 है। रिजर्व ऑटो का न्यूनतम किराया ₹40 है।`
        : `In ${cityName}, minimum shared e-rickshaw fare up to 2 km is ₹10, and up to 4.5 km is ₹15. Reserved auto base fare is ₹40.`;
      setResponseText(reply);
      setDetectedAction('OPEN_FARE_CALCULATOR');
      speakResponse(reply);
      if (onNavigateTab) {
        setTimeout(() => onNavigateTab('fare'), 1500);
      }
      return;
    }

    // 6. Bypass or Jam avoidance
    if (q.includes('जाम') || q.includes('traffic') || q.includes('बाईपास') || q.includes('bypass') || q.includes('रूट') || q.includes('route')) {
      const reply = language === 'hi'
        ? `भीतरी कुतुबखाना व श्यामगंज बाजार में भारी जाम है। कोहाड़ापीर और मिनी बाईपास की सुगम गलियों का रूट सबसे तेज है।`
        : `Heavy congestion detected at Kutubkhana & Shyamganj. The smart alleyway bypass via Koharapeer saves up to 12 minutes.`;
      setResponseText(reply);
      setDetectedAction('OPEN_SMART_ROUTE');
      speakResponse(reply);
      if (onNavigateTab) {
        setTimeout(() => onNavigateTab('route'), 1500);
      }
      return;
    }

    // Default intelligent fallback
    const fallbackReply = language === 'hi'
      ? `मैंने आपकी आवाज़ सुनी: "${query}"। मैंने आपके लिए ${cityName} लाइव मैप और ट्रांजिट गाइड अपडेट कर दिया है।`
      : `Heard: "${query}". Updated live navigation grid and transit advisory for ${cityName}.`;
    setResponseText(fallbackReply);
    setDetectedAction('DEFAULT_SEARCH');
    speakResponse(fallbackReply);
  };

  const simulateQuickQuery = (text: string) => {
    setSpokenText(text);
    handleProcessQuery(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between relative z-10 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>{language === 'hi' ? 'ई-राही एआई वॉयस असिस्टेंट' : 'E-Rahi AI Voice Assistant'}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {language === 'hi' ? 'हिंदी / English' : 'Bilingual'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'hi' ? 'माइक दबाकर बोलें या नीचे दिए किसी भी प्रश्न पर टैप करें' : 'Tap mic and speak, or tap any suggestion below'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (isSpeaking && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
                setIsMuted(!isMuted);
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isMuted 
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isMuted ? 'Unmute voice response' : 'Mute voice response'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Interactive Voice Visualizer & Mic */}
        <div className="py-6 flex flex-col items-center justify-center text-center relative z-10 space-y-4">
          {/* Animated Pulsing Sound Wave Circle */}
          <div className="relative flex items-center justify-center">
            {isListening && (
              <>
                <div className="absolute w-28 h-28 rounded-full bg-amber-500/20 animate-ping" />
                <div className="absolute w-36 h-36 rounded-full bg-amber-500/10 animate-pulse" />
              </>
            )}

            {isSpeaking && (
              <div className="absolute w-32 h-32 rounded-full bg-blue-500/20 animate-pulse" />
            )}

            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-2xl transition-all transform active:scale-95 cursor-pointer shadow-xl ${
                isListening
                  ? 'bg-rose-600 text-white shadow-rose-600/40 ring-4 ring-rose-400/30 animate-pulse'
                  : 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/30 hover:scale-105'
              }`}
            >
              {isListening ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-200">
              {isListening 
                ? (language === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now') 
                : isSpeaking 
                ? (language === 'hi' ? 'उत्तर बोल रहा हूँ...' : 'Speaking response...')
                : (language === 'hi' ? 'माइक पर टैप करके कुछ भी पूछें' : 'Tap mic to ask route, fare or hospital')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {language === 'hi' ? `शहर: ${cityName} स्मार्ट ग्रिड` : `Target: ${cityName} Transit Hub`}
            </div>
          </div>

          {/* User Spoken Transcript Card */}
          {spokenText && (
            <div className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 text-left text-xs sm:text-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                🗣️ {language === 'hi' ? 'आपने पूछा:' : 'You said:'}
              </span>
              <p className="text-white font-medium italic">"{spokenText}"</p>
            </div>
          )}

          {/* AI Response Card */}
          {responseText && (
            <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-left text-xs sm:text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'ई-राही एआई उत्तर:' : 'E-Rahi AI Answer:'}</span>
                </span>
                {detectedAction && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                    <span>{detectedAction.replace(/_/g, ' ')}</span>
                  </span>
                )}
              </div>
              <p className="text-slate-100 font-medium leading-relaxed">{responseText}</p>
            </div>
          )}
        </div>

        {/* Quick Voice Suggestions Carousel */}
        <div className="relative z-10 border-t border-slate-800 pt-3 space-y-2 overflow-y-auto max-h-48 scrollbar-thin">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            💡 {language === 'hi' ? 'जल्दी पूछने के सुझाव (टैप करें):' : 'Instant Voice Shortcuts (Tap to ask):'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            <button
              onClick={() => simulateQuickQuery(language === 'hi' ? 'स्टेशन से सेटेलाइट का ई-रिक्शा किराया कितना है?' : 'What is the fare from Bareilly Junction to Satellite Bus Stand?')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-200 transition-colors flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="flex items-center gap-2 truncate">
                <Navigation className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{language === 'hi' ? 'स्टेशन से सेटेलाइट किराया' : 'Station to Satellite Fare'}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-amber-400 shrink-0" />
            </button>

            <button
              onClick={() => simulateQuickQuery(language === 'hi' ? 'पास का 24x7 इमरजेंसी अस्पताल दिखाओ' : 'Show nearest 24x7 emergency hospital in Bareilly')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-200 transition-colors flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="flex items-center gap-2 truncate">
                <Hospital className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">{language === 'hi' ? 'इमरजेंसी 24x7 अस्पताल' : 'Emergency 24x7 Hospital'}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-amber-400 shrink-0" />
            </button>

            <button
              onClick={() => simulateQuickQuery(language === 'hi' ? 'महिला सुरक्षा SOS और पुलिस हेल्पलाइन खोलें' : 'Trigger Women Safety SOS & Police dispatch')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-200 transition-colors flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="flex items-center gap-2 truncate">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="truncate">{language === 'hi' ? 'महिला सुरक्षा पुलिस SOS' : 'Women Safety Police SOS'}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-amber-400 shrink-0" />
            </button>

            <button
              onClick={() => simulateQuickQuery(language === 'hi' ? 'ई-रिक्शा बैटरी चार्जिंग व स्वैपिंग स्टेशन कहाँ हैं?' : 'Where are e-rickshaw battery swapping stations?')}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-200 transition-colors flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="flex items-center gap-2 truncate">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{language === 'hi' ? 'बैटरी स्वैपिंग स्टेशन' : 'Battery Swapping Stations'}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-amber-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>{speechSupported ? '🎙️ Web Speech API Enabled' : '⚡ Smart Tap Mode'}</span>
          <button
            onClick={() => {
              setSpokenText('');
              setResponseText('');
              setDetectedAction(null);
            }}
            className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{language === 'hi' ? 'रीसेट' : 'Clear'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
