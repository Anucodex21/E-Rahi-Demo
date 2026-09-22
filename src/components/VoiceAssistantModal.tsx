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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full sm:max-w-lg bg-white border-t sm:border border-slate-200/90 rounded-t-[28px] sm:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.18)] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)] overflow-hidden text-slate-900 flex flex-col max-h-[88vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-250">
        
        {/* Mobile Pull / Swipe Down Indicator Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center w-full bg-white shrink-0">
          <div className="w-10 h-1.2 rounded-full bg-slate-300" />
        </div>

        {/* Google Signature 4-Color Top Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] shrink-0" />

        {/* Ambient Subtle Google Aura */}
        <div className="absolute -top-20 -left-20 w-52 h-52 bg-[#4285F4]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-52 h-52 bg-[#34A853]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="p-4 sm:p-6 flex flex-col overflow-y-auto pb-7 sm:pb-5">
          {/* Modal Header */}
          <div className="flex items-center justify-between relative z-10 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Google 4-Color Waveform Dot Cluster */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-center shadow-2xs shrink-0">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC05] animate-bounce [animation-delay:0s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34A853] animate-bounce [animation-delay:0.15s]" />
                </div>
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                  <span>{language === 'hi' ? 'गूगल एआई वॉयस असिस्टेंट' : 'Google AI Voice Assistant'}</span>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                    Live
                  </span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-normal line-clamp-1">
                  {language === 'hi' ? 'बोलकर रूट, किराया व अस्पताल पूछें' : 'Speak to search routes, fares & hospitals'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => {
                  if (isSpeaking && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                  }
                  setIsMuted(!isMuted);
                }}
                className={`min-w-[40px] min-h-[40px] p-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
                  isMuted 
                    ? 'bg-rose-50 border-rose-200 text-rose-600' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={isMuted ? 'Unmute voice response' : 'Mute voice response'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="min-w-[40px] min-h-[40px] p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer flex items-center justify-center"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Interactive Google Voice Visualizer & Mic */}
          <div className="py-4 sm:py-6 flex flex-col items-center justify-center text-center relative z-10 space-y-3 sm:space-y-4">
            {/* Google Assistant 4-Color Equalizer Wave Bars (when listening) */}
            {isListening ? (
              <div className="flex items-center justify-center gap-1.5 h-10 sm:h-12">
                <span className="w-1.5 rounded-full bg-[#4285F4] animate-[pulse_0.7s_ease-in-out_infinite] h-7 sm:h-8" />
                <span className="w-1.5 rounded-full bg-[#EA4335] animate-[pulse_0.5s_ease-in-out_infinite] h-10 sm:h-12" />
                <span className="w-1.5 rounded-full bg-[#FBBC05] animate-[pulse_0.8s_ease-in-out_infinite] h-8 sm:h-10" />
                <span className="w-1.5 rounded-full bg-[#34A853] animate-[pulse_0.6s_ease-in-out_infinite] h-6 sm:h-7" />
              </div>
            ) : isSpeaking ? (
              <div className="flex items-center justify-center gap-1.5 h-10 sm:h-12">
                <span className="w-1.5 rounded-full bg-blue-500 animate-pulse h-5 sm:h-6" />
                <span className="w-1.5 rounded-full bg-blue-600 animate-pulse h-8 sm:h-9" />
                <span className="w-1.5 rounded-full bg-blue-400 animate-pulse h-4 sm:h-5" />
              </div>
            ) : (
              <div className="h-6 flex items-center justify-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {language === 'hi' ? 'माइक पर टैप करके बोलें' : 'Tap Google Mic to speak'}
                </span>
              </div>
            )}

            {/* Central Google Mic Button */}
            <div className="relative flex items-center justify-center my-1">
              {isListening && (
                <>
                  <div className="absolute w-24 h-24 rounded-full bg-[#4285F4]/15 animate-ping pointer-events-none" />
                  <div className="absolute w-28 h-28 rounded-full bg-[#34A853]/10 animate-pulse pointer-events-none" />
                </>
              )}

              <button
                onClick={isListening ? handleStopListening : handleStartListening}
                className={`relative z-10 w-20 h-20 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all transform active:scale-95 cursor-pointer shadow-lg border-2 ${
                  isListening
                    ? 'bg-rose-600 text-white border-white ring-4 ring-rose-400/30 animate-pulse shadow-rose-600/30'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300 ring-4 ring-slate-100 hover:ring-blue-100 hover:scale-105 shadow-slate-200'
                }`}
                title={isListening ? 'Stop listening' : 'Start Google Voice Search'}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  /* Google 4-Color Official Mic Icon */
                  <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z" fill="#4285F4"/>
                    <path d="M15.9 8.1C15.5 8.1 15.2 8.4 15.2 8.8V11C15.2 12.77 13.77 14.2 12 14.2C10.23 14.2 8.8 12.77 8.8 11V8.8C8.8 8.4 8.5 8.1 8.1 8.1C7.7 8.1 7.4 8.4 7.4 8.8V11C7.4 13.3 9.1 15.2 11.3 15.5V19H9.5C9.1 19 8.8 19.3 8.8 19.7C8.8 20.1 9.1 20.4 9.5 20.4H14.5C14.9 20.4 15.2 20.1 15.2 19.7C15.2 19.3 14.9 19 14.5 19H12.7V15.5C14.9 15.2 16.6 13.3 16.6 11V8.8C16.6 8.4 16.3 8.1 15.9 8.1Z" fill="#34A853"/>
                    <path d="M7.4 11C7.4 12.27 7.91 13.42 8.74 14.25L9.73 13.26C9.14 12.68 8.8 11.88 8.8 11H7.4Z" fill="#FBBC05"/>
                    <path d="M16.6 11H15.2C15.2 11.88 14.86 12.68 14.27 13.26L15.26 14.25C16.09 13.42 16.6 12.27 16.6 11Z" fill="#EA4335"/>
                  </svg>
                )}
              </button>
            </div>

            <div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800">
                {isListening 
                  ? (language === 'hi' ? 'सुन रहे हैं... बोलिए' : 'Listening... Speak clearly') 
                  : isSpeaking 
                  ? (language === 'hi' ? 'उत्तर बोल रहे हैं...' : 'Speaking answer...')
                  : (language === 'hi' ? 'बोलकर कुछ भी पूछें' : 'Ask any transit question')}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                {language === 'hi' ? `${cityName} स्मार्ट ग्रिड • हिंदी / English` : `${cityName} Transit Grid • Dual Speech Mode`}
              </div>
            </div>

            {/* User Spoken Transcript Card */}
            {spokenText && (
              <div className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 text-left text-xs sm:text-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  🗣️ {language === 'hi' ? 'आपने पूछा:' : 'You said:'}
                </span>
                <p className="text-slate-800 font-semibold italic">"{spokenText}"</p>
              </div>
            )}

            {/* Google AI Response Card */}
            {responseText && (
              <div className="w-full bg-blue-50/70 border border-blue-200/70 rounded-2xl p-3 sm:p-3.5 text-left text-xs sm:text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'hi' ? 'गूगल एआई उत्तर:' : 'Google AI Answer:'}</span>
                  </span>
                  {detectedAction && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      <span>{detectedAction.replace(/_/g, ' ')}</span>
                    </span>
                  )}
                </div>
                <p className="text-slate-800 font-medium leading-relaxed">{responseText}</p>
              </div>
            )}
          </div>

          {/* Quick Voice Suggestions Carousel (Google Assistant Style) */}
          <div className="relative z-10 border-t border-slate-100 pt-3 space-y-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              💡 {language === 'hi' ? 'अक्सर पूछे जाने वाले सवाल (टैप करें):' : 'Suggested Voice Queries (Tap to ask):'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              <button
                onClick={() => simulateQuickQuery(language === 'hi' ? 'स्टेशन से सेटेलाइट का ई-रिक्शा किराया कितना है?' : 'What is the fare from Bareilly Junction to Satellite Bus Stand?')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 active:bg-blue-100/70 border border-slate-200/80 hover:border-blue-200 text-xs text-slate-800 transition-all flex items-center justify-between gap-2 cursor-pointer group shadow-2xs min-h-[44px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-[#4285F4] shrink-0" />
                  <span className="truncate font-medium">{language === 'hi' ? 'स्टेशन से सेटेलाइट किराया' : 'Station to Satellite Fare'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
              </button>

              <button
                onClick={() => simulateQuickQuery(language === 'hi' ? 'पास का 24x7 इमरजेंसी अस्पताल दिखाओ' : 'Show nearest 24x7 emergency hospital in Bareilly')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/60 active:bg-purple-100/70 border border-slate-200/80 hover:border-purple-200 text-xs text-slate-800 transition-all flex items-center justify-between gap-2 cursor-pointer group shadow-2xs min-h-[44px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-[#EA4335] shrink-0" />
                  <span className="truncate font-medium">{language === 'hi' ? 'इमरजेंसी 24x7 अस्पताल' : 'Emergency 24x7 Hospital'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 shrink-0" />
              </button>

              <button
                onClick={() => simulateQuickQuery(language === 'hi' ? 'महिला सुरक्षा SOS और पुलिस हेल्पलाइन खोलें' : 'Trigger Women Safety SOS & Police dispatch')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50/60 active:bg-rose-100/70 border border-slate-200/80 hover:border-rose-200 text-xs text-slate-800 transition-all flex items-center justify-between gap-2 cursor-pointer group shadow-2xs min-h-[44px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-[#EA4335] shrink-0" />
                  <span className="truncate font-medium">{language === 'hi' ? 'महिला सुरक्षा पुलिस SOS' : 'Women Safety Police SOS'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 shrink-0" />
              </button>

              <button
                onClick={() => simulateQuickQuery(language === 'hi' ? 'ई-रिक्शा बैटरी चार्जिंग व स्वैपिंग स्टेशन कहाँ हैं?' : 'Where are e-rickshaw battery swapping stations?')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 active:bg-emerald-100/70 border border-slate-200/80 hover:border-emerald-200 text-xs text-slate-800 transition-all flex items-center justify-between gap-2 cursor-pointer group shadow-2xs min-h-[44px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-[#34A853] shrink-0" />
                  <span className="truncate font-medium">{language === 'hi' ? 'बैटरी स्वैपिंग स्टेशन' : 'Battery Swapping Docks'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
              </button>
            </div>
          </div>

          {/* Footer info */}
          <div className="pt-3 border-t border-slate-100 mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {speechSupported ? 'Google Web Speech Engine' : 'Touch Prompt Mode'}
            </span>
            <button
              onClick={() => {
                setSpokenText('');
                setResponseText('');
                setDetectedAction(null);
              }}
              className="min-h-[36px] px-2 flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer font-medium text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'रीसेट' : 'Clear'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
