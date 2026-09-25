import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Hospital,
  BatteryCharging,
  Navigation,
  RotateCcw,
  Volume1,
  Languages
} from 'lucide-react';
import { AppLanguage } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  cityName: string;
  onSelectRouteQuick?: (originName: string, destName: string) => void;
  onNavigateTab?: (tab: 'map' | 'route' | 'cockpit' | 'services' | 'fare' | 'sos') => void;
  onOpenSos?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Convert numbers, transit acronyms, and formatting into clear, natural spoken Hindi
const sanitizeHindiTextForSpeech = (text: string): string => {
  return text
    // Remove emojis
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '')
    // Expand specific currency amounts to clear Hindi words
    .replace(/₹\s*10\b/g, 'दस रुपये')
    .replace(/₹\s*15\b/g, 'पंद्रह रुपये')
    .replace(/₹\s*20\b/g, 'बीस रुपये')
    .replace(/₹\s*40\b/g, 'चालीस रुपये')
    .replace(/₹\s*60\b/g, 'साठ रुपये')
    .replace(/₹\s*65\b/g, 'पैंसठ रुपये')
    .replace(/₹\s*120\b/g, 'एक सौ बीस रुपये')
    .replace(/₹\s*(\d+)/g, '$1 रुपये')
    // Expand abbreviations and transit acronyms
    .replace(/\bकिमी\b/g, 'किलोमीटर')
    .replace(/\bkm\b/gi, 'किलोमीटर')
    .replace(/\b24x7\b/gi, 'चौबीसों घंटे')
    .replace(/\bSOS\b/gi, 'एस ओ एस')
    .replace(/\bGPS\b/gi, 'जी पी एस')
    .replace(/\bICU\b/gi, 'आई सी यू')
    .replace(/\bIVRI\b/gi, 'आई वी आर आई')
    .replace(/\bNH-24\b/gi, 'नेशनल हाईवे चौबीस')
    .replace(/\bNH\s*24\b/gi, 'नेशनल हाईवे चौबीस')
    // Remove markdown formatting
    .replace(/[*_~`#>]/g, '')
    // Replace bullet dots and line breaks with soft pauses
    .replace(/[•\-\n]+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  language: initialLanguage,
  cityName,
  onSelectRouteQuick,
  onNavigateTab,
  onOpenSos
}) => {
  // Voice assistant defaults to Hindi for clear, high-quality native voice answers
  const [activeVoiceLang, setActiveVoiceLang] = useState<'hi' | 'en'>('hi');
  const isHindi = activeVoiceLang === 'hi';

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial language if user changes it
  useEffect(() => {
    if (initialLanguage === 'hi' || initialLanguage === 'ur') {
      setActiveVoiceLang('hi');
    }
  }, [initialLanguage]);

  // Initial welcome message
  const getInitialMessage = (): ChatMessage => ({
    id: 'welcome-msg',
    sender: 'assistant',
    text: isHindi
      ? `नमस्ते! मैं आपका राही असिस्टेंट हूँ। मैं ${cityName} में ई-रिक्शा रूट, सरकारी किराया सूची, 24x7 इमरजेंसी अस्पताल, बैटरी चार्जिंग स्टेशन और महिला सुरक्षा SOS की पूरी जानकारी रखता हूँ। बताइए, आज मैं आपकी क्या मदद कर सकता हूँ?`
      : `Hello! I am your Rahi Assistant. I provide complete information on e-rickshaw routes, government fares, 24x7 emergency hospitals, battery swapping docks, and Women Safety SOS in ${cityName}. How can I help you today?`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage()]);

  // Load and cache available voices with priority for high-definition Hindi voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Update initial message on language toggle
  useEffect(() => {
    setMessages([getInitialMessage()]);
  }, [activeVoiceLang, cityName]);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  // Web Speech Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = isHindi ? 'hi-IN' : 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setInputQuery(transcript);
          if (event.results[current].isFinal) {
            handleSendMessage(transcript);
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
  }, [activeVoiceLang]);

  // High-Definition, Crystal Clear Voice Synthesis
  const speakResponse = (text: string, messageId?: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = sanitizeHindiTextForSpeech(text);
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = isHindi ? 'hi-IN' : 'en-IN';

      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();

      if (isHindi && voices.length > 0) {
        // Find top natural Hindi voices
        const hindiVoice = voices.find(
          (v) =>
            v.lang.toLowerCase() === 'hi-in' ||
            v.lang.toLowerCase().startsWith('hi') ||
            v.name.toLowerCase().includes('google हिन्दी') ||
            v.name.toLowerCase().includes('hindi') ||
            v.name.toLowerCase().includes('swara') ||
            v.name.toLowerCase().includes('madhur') ||
            v.name.toLowerCase().includes('lekha') ||
            v.name.toLowerCase().includes('hemant') ||
            v.name.toLowerCase().includes('kalpana')
        ) || voices.find((v) => v.lang.toLowerCase().includes('en-in'));

        if (hindiVoice) {
          utterance.voice = hindiVoice;
        }
      } else if (!isHindi && voices.length > 0) {
        const engVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().includes('en-in') ||
            v.name.toLowerCase().includes('india') ||
            v.name.toLowerCase().includes('rishi') ||
            v.name.toLowerCase().includes('veena')
        );
        if (engVoice) utterance.voice = engVoice;
      }

      // Smooth, natural speech parameters for optimum Hindi articulation
      utterance.rate = isHindi ? 0.90 : 0.96;
      utterance.pitch = 1.0;

      utterance.onstart = () => setSpeakingMessageId(messageId || 'speaking');
      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
      setSpeakingMessageId(null);
    }
  };

  const handleStartListening = () => {
    if (!recognitionRef.current) {
      handleSendMessage(isHindi ? 'नमस्ते, राही ऐप में क्या क्या सुविधाएं हैं?' : 'Hello, what features are in Rahi app?');
      return;
    }
    try {
      recognitionRef.current.lang = isHindi ? 'hi-IN' : 'en-IN';
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

  // Comprehensive Knowledge Base & Query Intelligence Engine
  const processQueryIntelligence = (query: string): { reply: string; action?: ChatMessage['action'] } => {
    const q = query.toLowerCase().trim();

    // 0. Greetings & Friendly Courtesies
    const isGreeting = 
      /^(hi|hii|hiii|hello|helo|hey|heyy|namaste|namaskar|pranam|salam|salaam|adaab|vanakkam|ram ram|radhe radhe)$/i.test(q) ||
      q.startsWith('hi ') || q.startsWith('hello ') || q.startsWith('hey ') || q.startsWith('namaste ') ||
      q.includes('good morning') || q.includes('good afternoon') || q.includes('good evening') ||
      q.includes('shubh prabhat') || q.includes('kaise ho') || q.includes('kya haal') || q.includes('how are you') ||
      q.includes('aap kaun ho') || q.includes('tum kaun ho') || q.includes('who are you');

    if (isGreeting) {
      if (q.includes('kaise ho') || q.includes('kya haal') || q.includes('how are you')) {
        const reply = isHindi
          ? `मैं बहुत अच्छा हूँ, पूछने के लिए धन्यवाद! मैं ${cityName} में आपकी यात्रा को आसान और सुरक्षित बनाने के लिए तैयार हूँ। बताइए, आज मैं आपकी क्या मदद कर सकता हूँ?`
          : `I am doing great, thank you for asking! I'm ready to make your journey in ${cityName} smooth and safe. How can I assist you today?`;
        
        return {
          reply,
          action: {
            label: isHindi ? '💰 सरकारी किराया सूची देखें' : '💰 View Official Fare Guide',
            onClick: () => {
              onClose();
              if (onNavigateTab) onNavigateTab('fare');
            },
          },
        };
      }

      if (q.includes('aap kaun ho') || q.includes('tum kaun ho') || q.includes('who are you')) {
        const reply = isHindi
          ? `नमस्ते! मैं आपका राही असिस्टेंट हूँ। मैं ${cityName} के यात्रियों व ई-रिक्शा चालकों के लिए सटीक रूट, सरकारी किराया, इमरजेंसी अस्पताल और पुलिस SOS की पूरी जानकारी प्रदान करता हूँ। बताइए, मैं आपकी क्या सेवा करूँ?`
          : `Hello! I am your Rahi Assistant. I provide transit routes, government-approved fares, 24x7 hospitals, and emergency SOS across ${cityName}. How can I help you?`;

        return {
          reply,
          action: {
            label: isHindi ? '🗺️ स्मार्ट रूट मैप खोलें' : '🗺️ Open Route Map',
            onClick: () => {
              onClose();
              if (onNavigateTab) onNavigateTab('map');
            },
          },
        };
      }

      const reply = isHindi
        ? `नमस्ते! राही असिस्टेंट में आपका स्वागत है। बताइए, आज मैं आपकी क्या सहायता कर सकता हूँ? आप मुझसे किसी भी रूट का सरकारी किराया, शॉर्टकट रास्ते, नजदीकी 24x7 अस्पताल, बैटरी चार्जिंग स्टेशन या महिला सुरक्षा SOS के बारे में पूछ सकते हैं।`
        : `Hello! Welcome to Rahi Assistant. How can I help you today? You can ask about e-rickshaw routes, government fares, 24x7 hospitals, battery swapping docks, or emergency SOS.`;

      return {
        reply,
        action: {
          label: isHindi ? '💰 किराया कैलकुलेटर खोलें' : '💰 Fare Calculator',
          onClick: () => {
            onClose();
            if (onNavigateTab) onNavigateTab('fare');
          },
        },
      };
    }

    // 1. App Introduction / Features
    if (
      q.includes('rahi') ||
      q.includes('राही') ||
      q.includes('app') ||
      q.includes('ऐप') ||
      q.includes('about') ||
      q.includes('क्या है') ||
      q.includes('what is') ||
      q.includes('सुविधा') ||
      q.includes('feature')
    ) {
      const reply = isHindi
        ? `राही (Rahi) ${cityName} का आधिकारिक डिजिटल मोबिलिटी और सेफ्टी ऐप है। इसमें 6 मुख्य सुविधाएं हैं:
1. स्मार्ट रूट नेविगेशन व शॉर्टकट बाईपास
2. सरकारी मान्यता प्राप्त सटीक किराया सूची
3. 24x7 महिला सुरक्षा एवं पुलिस SOS
4. इमरजेंसी अस्पताल व स्वास्थ्य सेवाएं
5. बैटरी स्वैपिंग व चार्जिंग हब रडार
6. ई-रिक्शा चालक कॉकपिट व दैनिक कमाई मीटर।`
        : `Rahi is ${cityName}'s dedicated Urban Mobility platform. Key features include:
1. Smart alleyway bypass & traffic routing
2. Official government fare tables
3. 24x7 Women Safety & Police SOS
4. Emergency hospital directory
5. EV battery swapping radar
6. Driver Cockpit & daily revenue tracker.`;

      return {
        reply,
        action: {
          label: isHindi ? '🗺️ स्मार्ट रूट मैप खोलें' : '🗺️ Open Route Map',
          onClick: () => {
            onClose();
            if (onNavigateTab) onNavigateTab('map');
          },
        },
      };
    }

    // 2. Emergency Safety & SOS
    if (
      q.includes('sos') ||
      q.includes('मदद') ||
      q.includes('help') ||
      q.includes('police') ||
      q.includes('पुलिस') ||
      q.includes('सुरक्षा') ||
      q.includes('safety') ||
      q.includes('छेड़छाड़') ||
      q.includes('danger') ||
      q.includes('खतरा') ||
      q.includes('112') ||
      q.includes('1090')
    ) {
      const reply = isHindi
        ? `राही सुरक्षा शील्ड चौबीसों घंटे सक्रिय है। आपातकाल में आप यूपी पुलिस 112, महिला हेल्पलाइन 1090 और एम्बुलेंस 108 पर तत्काल कॉल कर सकते हैं। साथ ही एक क्लिक में परिवार को लाइव जीपीएस लोकेशन व सायरन अलर्ट भेजा जा सकता है।`
        : `Rahi Safety Shield is active 24x7. Instantly connect to UP Police 112, Women Power Line 1090, and Ambulance 108. You can also trigger an SOS siren and live GPS tracking to family.`;

      return {
        reply,
        action: {
          label: isHindi ? '🚨 इमरजेंसी सुरक्षा SOS खोलें' : '🚨 Open Emergency SOS',
          onClick: () => {
            onClose();
            if (onOpenSos) onOpenSos();
            else if (onNavigateTab) onNavigateTab('sos');
          },
        },
      };
    }

    // 3. Hospital & Healthcare Services
    if (
      q.includes('hospital') ||
      q.includes('अस्पताल') ||
      q.includes('डॉक्टर') ||
      q.includes('doctor') ||
      q.includes('इलाज') ||
      q.includes('medical') ||
      q.includes('दवा') ||
      q.includes('clara') ||
      q.includes('district') ||
      q.includes('rohilkhand') ||
      q.includes('ganga charan')
    ) {
      const reply = isHindi
        ? `${cityName} में 24x7 इमरजेंसी सरकारी व निजी अस्पताल उपलब्ध हैं:
• जिला पुरुष व महिला अस्पताल (सिविल लाइन्स) - आयुष्मान भारत योजना में निशुल्क इलाज।
• रोहिलखंड मेडिकल कॉलेज (पीलीभीत बाईपास) - सुपर स्पेशियलिटी व ट्रॉमा सेंटर।
• क्लारा स्वेन मिशन अस्पताल (स्टेशन रोड)
• गंगा चरण अस्पताल (दीनदयाल पुरम)।`
        : `24x7 Emergency Hospitals in ${cityName}:
• District Government Hospital (Civil Lines) - Free under Ayushman Bharat.
• Rohilkhand Medical College (Pilibhit Bypass) - Advanced Trauma & ICU.
• Clara Swain Mission Hospital (Station Road)
• Ganga Charan Hospital (Deen Dayal Puram).`;

      return {
        reply,
        action: {
          label: isHindi ? '🏥 अस्पताल सूची देखें' : '🏥 View Hospital Directory',
          onClick: () => {
            onClose();
            if (onNavigateTab) onNavigateTab('services');
          },
        },
      };
    }

    // 4. Station to Satellite Route
    if (
      (q.includes('स्टेशन') || q.includes('station') || q.includes('junction')) &&
      (q.includes('सेटेलाइट') || q.includes('satellite') || q.includes('चौपुला'))
    ) {
      const reply = isHindi
        ? `बरेली जंक्शन से सेटेलाइट बस स्टैंड का सरकारी शेयर्ड ई-रिक्शा किराया ₹15 प्रति सवारी है। दूरी 4.8 किलोमीटर है और लगभग 18 मिनट का समय लगेगा। चौपुला ओवरब्रिज रूट सबसे सुगम है।`
        : `Official shared E-Rickshaw fare from Bareilly Junction to Satellite Bus Stand is ₹15 per passenger. Distance is 4.8 km (approx 18 mins).`;

      return {
        reply,
        action: {
          label: isHindi ? '🗺️ स्टेशन ➔ सेटेलाइट रूट सेट करें' : '🗺️ Route: Junction to Satellite',
          onClick: () => {
            onClose();
            if (onSelectRouteQuick) {
              onSelectRouteQuick('Bareilly Junction', 'Satellite Bus Stand');
            }
          },
        },
      };
    }

    // 5. Fare Rates
    if (
      q.includes('किराया') ||
      q.includes('fare') ||
      q.includes('रेट') ||
      q.includes('rate') ||
      q.includes('पैसा') ||
      q.includes('रुपये') ||
      q.includes('charge') ||
      q.includes('price')
    ) {
      const reply = isHindi
        ? `उत्तर प्रदेश सरकार व नगर निगम द्वारा निर्धारित आधिकारिक ई-रिक्शा किराया दरें:
• 0 से 2 किलोमीटर: ₹10 प्रति सवारी
• 2 से 5 किलोमीटर: ₹15 प्रति सवारी
• 5 से 8 किलोमीटर: ₹20 प्रति सवारी
• रिज़र्व ई-रिक्शा बेस किराया: ₹40 से ₹120 तक।
अतिरिक्त वसूली की शिकायत आप सीधे ऐप से दर्ज कर सकते हैं।`
        : `Government-regulated E-Rickshaw Fare Structure in ${cityName}:
• 0 - 2 km: ₹10 per passenger
• 2 - 5 km: ₹15 per passenger
• 5 - 8 km: ₹20 per passenger
• Reserved Full Auto Base: ₹40 to ₹120.`;

      return {
        reply,
        action: {
          label: isHindi ? '💰 किराया कैलकुलेटर खोलें' : '💰 Open Fare Calculator',
          onClick: () => {
            onClose();
            if (onNavigateTab) onNavigateTab('fare');
          },
        },
      };
    }

    // 6. Battery Swapping & Charging
    if (
      q.includes('battery') ||
      q.includes('बैटरी') ||
      q.includes('चार्जिंग') ||
      q.includes('charging') ||
      q.includes('स्वैप') ||
      q.includes('swap')
    ) {
      const reply = isHindi
        ? `${cityName} में बैटरी स्मार्ट (Battery Smart) और सन मोबिलिटी के स्वैप स्टेशन श्यामगंज, सेटेलाइट, चौपुला और आईवीआरआई रोड पर सक्रिय हैं। स्वैप में मात्र 2 मिनट लगते हैं और शुल्क ₹60 से ₹65 प्रति बैटरी है।`
        : `EV Battery Swapping Stations (Battery Smart & Sun Mobility) are active at Shyamganj, Satellite, Choupla, and IVRI Road. Swap fee is ₹60 - ₹65 per battery.`;

      return {
        reply,
        action: {
          label: isHindi ? '🔋 बैटरी स्वैप स्टेशन देखें' : '🔋 View Battery Swapping Docks',
          onClick: () => {
            onClose();
            if (onNavigateTab) onNavigateTab('cockpit');
          },
        },
      };
    }

    // 7. Traffic & Bypass
    if (
      q.includes('जाम') ||
      q.includes('jam') ||
      q.includes('traffic') ||
      q.includes('ट्रैफिक') ||
      q.includes('बाईपास') ||
      q.includes('bypass') ||
      q.includes('shortcut')
    ) {
      const reply = isHindi
        ? `कुतुबखाना और श्यामगंज बाजार में भारी ट्रैफिक रहता है। राही का स्मार्ट बाईपास कोहाड़ापीर और मिनी बाईपास की सुगम गलियों से 12 से 15 मिनट की बचत कराता है।`
        : `Heavy congestion at Kutubkhana & Shyamganj. The smart alleyway bypass via Koharapeer saves up to 15 minutes.`;

      return {
        reply,
        action: {
          label: isHindi ? '🚦 लाइव ट्रैफिक मैप' : '🚦 Live Traffic',
          onClick: () => {
            onClose();
            if (onNavigateTab) onNavigateTab('route');
          },
        },
      };
    }

    // Fallback response
    const reply = isHindi
      ? `मैंने आपका सवाल समझा: "${query}"। राही असिस्टेंट में ${cityName} का सम्पूर्ण रूट ग्रिड, सरकारी किराया सूची, इमरजेंसी 112 सहायता, अस्पताल और बैटरी स्टेशन उपलब्ध हैं। आप नीचे दिए बटन से तुरंत नेविगेट कर सकते हैं।`
      : `Understood your query: "${query}". Rahi Assistant covers all transit routes, government fare charts, emergency 112 SOS, hospitals, and battery docks across ${cityName}.`;

    return {
      reply,
      action: {
        label: isHindi ? '🗺️ शहर का रूट मैप देखें' : '🗺️ View City Transit Map',
        onClick: () => {
          onClose();
          if (onNavigateTab) onNavigateTab('map');
        },
      },
    };
  };

  // Process and respond to user query
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend ?? inputQuery).trim();
    if (!query) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    // Stop listening if speech was active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Process intelligence and respond
    setTimeout(() => {
      const { reply, action } = processQueryIntelligence(query);
      const botMsgId = `assistant-${Date.now()}`;

      const botMessage: ChatMessage = {
        id: botMsgId,
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      speakResponse(reply, botMsgId);
    }, 400);
  };

  const handleClearChat = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setMessages([getInitialMessage()]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Compact, Ergonomic Chat Window Container */}
      <div className="relative w-full max-w-full sm:max-w-[420px] bg-white border-t sm:border border-slate-200/90 rounded-t-2xl sm:rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] sm:shadow-[0_20px_45px_-12px_rgba(0,0,0,0.22)] overflow-hidden text-slate-900 flex flex-col h-[72vh] sm:h-[490px] max-h-[80vh] animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        {/* Mobile Pull Handle */}
        <div className="sm:hidden pt-2 pb-0.5 flex justify-center w-full bg-white shrink-0">
          <div className="w-8 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Executive Chat Header */}
        <div className="px-3.5 py-2.5 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-2">
            {/* App Logo Avatar */}
            <div className="relative w-8 h-8 rounded-full bg-amber-50 border-2 border-amber-400/80 p-0.5 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src="/icon.svg"
                alt="Rahi Assistant Logo"
                className="w-full h-full object-cover rounded-full pointer-events-none"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {isHindi ? 'राही असिस्टेंट' : 'Rahi Assistant'}
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100/80 text-amber-800 border border-amber-200/60">
                  {cityName}
                </span>
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isHindi ? 'स्पष्ट हिन्दी वॉयस सक्रिय' : 'Clear Voice Active'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Language Switcher (हिन्दी / EN) */}
            <button
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                setActiveVoiceLang(isHindi ? 'en' : 'hi');
              }}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 transition-colors flex items-center gap-1 cursor-pointer"
              title="Change Voice Language"
            >
              <Languages className="w-3 h-3 text-amber-700" />
              <span>{isHindi ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Audio Voice Toggle */}
            <button
              onClick={() => {
                if (window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                  setSpeakingMessageId(null);
                }
                setIsMuted(!isMuted);
              }}
              className={`w-7 h-7 rounded-lg border transition-colors flex items-center justify-center cursor-pointer ${
                isMuted
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title={isMuted ? 'Unmute voice' : 'Mute voice'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Clear Chat */}
            <button
              onClick={handleClearChat}
              className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors flex items-center justify-center cursor-pointer"
              title="Clear chat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors flex items-center justify-center cursor-pointer"
              title="Close chat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/60 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Avatar */}
              {msg.sender === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-300 p-0.5 shrink-0 overflow-hidden mb-0.5">
                  <img src="/icon.svg" alt="Rahi" className="w-full h-full object-cover rounded-full" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                } max-w-[88%] sm:max-w-[84%]`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl text-xs sm:text-[13px] leading-relaxed break-words shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Interactive Action Chip */}
                  {msg.action && (
                    <button
                      onClick={msg.action.onClick}
                      className="mt-2 w-full py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300/80 text-amber-950 font-bold text-xs flex items-center justify-between gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-[0.98]"
                    >
                      <span className="truncate">{msg.action.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                    </button>
                  )}
                </div>

                {/* Message Details & Listen Audio Trigger */}
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {msg.time}
                  </span>

                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => speakResponse(msg.text, msg.id)}
                      className={`text-[10px] flex items-center gap-1 font-bold transition-colors cursor-pointer ${
                        speakingMessageId === msg.id
                          ? 'text-amber-600'
                          : 'text-amber-700 hover:text-amber-900'
                      }`}
                      title="स्पष्ट हिन्दी आवाज़ में सुनें"
                    >
                      {speakingMessageId === msg.id ? (
                        <>
                          <Volume2 className="w-3 h-3 text-amber-600 animate-pulse" />
                          <span>{isHindi ? 'बोल रहे हैं...' : 'Speaking...'}</span>
                        </>
                      ) : (
                        <>
                          <Volume1 className="w-3 h-3 text-amber-600" />
                          <span>{isHindi ? '🔊 आवाज़ सुनें' : '🔊 Listen'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-end gap-2 justify-start">
              <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-300 p-0.5 shrink-0 overflow-hidden mb-0.5">
                <img src="/icon.svg" alt="Rahi" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-xs px-3 py-2.5 shadow-2xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Chat Composer Bar */}
        <div className="p-2 sm:p-2.5 bg-white border-t border-slate-100 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white ring-4 ring-rose-400/30 animate-pulse shadow-md'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 shadow-2xs hover:scale-105 active:scale-95'
              }`}
              title={isListening ? 'Stop listening' : 'हिन्दी में बोलें (Speak Hindi)'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4 text-amber-600 stroke-[2.2]" />
              )}
            </button>

            {/* Text Input Field */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  isListening
                    ? isHindi
                      ? 'सुन रहे हैं... बोलिए'
                      : 'Listening... speak clearly'
                    : isHindi
                    ? 'पूछें: स्टेशन से सेटेलाइट किराया, अस्पताल, SOS...'
                    : 'Ask route, fare, hospital, SOS...'
                }
                className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-xs sm:text-sm rounded-full pl-3 pr-2 py-2 border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                inputQuery.trim()
                  ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-sm'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
