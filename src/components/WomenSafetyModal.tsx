import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  HeartHandshake, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  CheckCircle2, 
  X, 
  Radio, 
  Phone, 
  Send, 
  MessageSquare, 
  Share2, 
  Building2, 
  RefreshCw, 
  UserCheck, 
  Lock,
  Flame,
  PhoneForwarded,
  Info
} from 'lucide-react';
import { AppLanguage, BareillyLocation } from '../types';
import { 
  EMERGENCY_HELPLINES, 
  getPoliceStationsForCity, 
  findNearestPoliceStation, 
  PoliceStation 
} from '../data/womenSafetyData';
import { 
  playEmergencySiren, 
  stopEmergencySiren, 
  speakCleanVoice, 
  stopVoice, 
  playCleanChime, 
  triggerHapticBuzz 
} from '../utils/audioAlerts';

interface WomenSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName: string;
  cityId: string;
  language?: AppLanguage;
  cityLocations?: BareillyLocation[];
  onPinPoliceStationOnMap?: (lat: number, lng: number, name: string) => void;
}

export const WomenSafetyModal: React.FC<WomenSafetyModalProps> = ({
  isOpen,
  onClose,
  cityName,
  cityId,
  language = 'hi',
  cityLocations = [],
  onPinPoliceStationOnMap
}) => {
  const isHindi = language === 'hi';
  const isUrdu = language === 'ur';

  // Active tab: 'sos' | 'helplines' | 'tools'
  const [activeTab, setActiveTab] = useState<'sos' | 'helplines' | 'tools'>('sos');

  // Persistent User details in localStorage
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('erahi_sos_user_name') || '';
  });
  const [guardianPhone, setGuardianPhone] = useState<string>(() => {
    return localStorage.getItem('erahi_sos_guardian_phone') || '';
  });

  // GPS State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'locating' | 'ready' | 'error'>('locating');
  const [lastGpsAddress, setLastGpsAddress] = useState<string>('');

  // SOS Active State
  const [isSosTriggered, setIsSosTriggered] = useState<boolean>(false);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const [sosSentTimestamp, setSosSentTimestamp] = useState<string | null>(null);
  const [sosSuccessNotice, setSosSuccessNotice] = useState<string | null>(null);

  // Fake Call State
  const [isFakeCallRinging, setIsFakeCallRinging] = useState<boolean>(false);
  const [isFakeCallConnected, setIsFakeCallConnected] = useState<boolean>(false);
  const [fakeCallTimer, setFakeCallTimer] = useState<number>(0);
  const fakeCallIntervalRef = useRef<any>(null);

  // Police Stations
  const policeStations = useMemo(() => {
    const defaultLat = cityLocations[0]?.lat || 28.36;
    const defaultLng = cityLocations[0]?.lng || 79.42;
    return getPoliceStationsForCity(cityId, defaultLat, defaultLng);
  }, [cityId, cityLocations]);

  // Nearest Station
  const nearestPolice = useMemo(() => {
    if (!userCoords) {
      if (policeStations.length > 0) {
        return {
          station: policeStations[0],
          distanceKm: 0.8,
          distanceMeters: 800
        };
      }
      return null;
    }
    return findNearestPoliceStation(userCoords.lat, userCoords.lng, policeStations);
  }, [userCoords, policeStations]);

  // Fetch High Accuracy GPS on Open
  const fetchLiveGps = () => {
    setGpsStatus('locating');
    if (!('geolocation' in navigator)) {
      setGpsStatus('error');
      if (cityLocations.length > 0) {
        setUserCoords({ lat: cityLocations[0].lat, lng: cityLocations[0].lng });
        setLastGpsAddress(cityLocations[0].name);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = Math.round(position.coords.accuracy);
        setUserCoords({ lat, lng });
        setGpsAccuracy(acc);
        setGpsStatus('ready');

        // Find closest landmark
        let closestName = cityName;
        let minD = 999999;
        cityLocations.forEach(loc => {
          const d = Math.hypot(loc.lat - lat, loc.lng - lng);
          if (d < minD) {
            minD = d;
            closestName = loc.name;
          }
        });
        setLastGpsAddress(`${closestName} (±${acc}m)`);
      },
      () => {
        setGpsStatus('ready');
        if (cityLocations.length > 0) {
          setUserCoords({ lat: cityLocations[0].lat, lng: cityLocations[0].lng });
          setLastGpsAddress(`${cityLocations[0].name} (${cityName})`);
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (isOpen) {
      fetchLiveGps();
    } else {
      if (isSirenActive) {
        stopEmergencySiren();
        setIsSirenActive(false);
      }
      stopFakeCall();
    }
  }, [isOpen]);

  const handleNameChange = (val: string) => {
    setUserName(val);
    localStorage.setItem('erahi_sos_user_name', val);
  };

  const handleGuardianChange = (val: string) => {
    setGuardianPhone(val);
    localStorage.setItem('erahi_sos_guardian_phone', val);
  };

  // Generate Emergency SOS Dispatch Text with Google Maps URL
  const generateSosMessage = () => {
    const lat = userCoords?.lat || (cityLocations[0]?.lat || 28.36);
    const lng = userCoords?.lng || (cityLocations[0]?.lng || 79.42);
    const mapsLink = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
    const sender = userName.trim() ? userName.trim() : 'एक महिला / नागरिक';
    const landmark = lastGpsAddress || cityName;
    const policeName = nearestPolice?.station.name || 'स्थानीय पुलिस थाना';

    return `🚨 *आपातकालीन सुरक्षा SOS अलर्ट (Emergency SOS)* 🚨
नाम: ${sender}
शहर: ${cityName}
वर्तमान लोकेशन (GPS): ${landmark}
गूगल मैप्स लाइव लोकेशन: ${mapsLink}
नजदीकी थाना: ${policeName}
संदेश: मुझे तत्काल पुलिस सुरक्षा व सहायता की आवश्यकता है! कृपया तुरंत संपर्क करें!
(Sent via E-Rahi India Safety Desk)`;
  };

  // 1-Click SOS Trigger Handler
  const handleTrigger1ClickSos = () => {
    triggerHapticBuzz([300, 100, 300, 100, 500]);
    setIsSosTriggered(true);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSosSentTimestamp(nowStr);

    // Audio announcement
    const voiceMsg = isHindi 
      ? `आपातकालीन सुरक्षा अलर्ट सक्रिय किया गया। आपकी लाइव जीपीएस लोकेशन तैयार है।`
      : `Emergency safety alert triggered. Live GPS location prepared.`;
    speakCleanVoice(voiceMsg, language);

    // Prepare WhatsApp link
    const sosMsg = generateSosMessage();
    const encoded = encodeURIComponent(sosMsg);
    
    // Auto open WhatsApp or native share
    if (guardianPhone.trim()) {
      const cleanPhone = guardianPhone.replace(/\D/g, '');
      const waUrl = `https://wa.me/91${cleanPhone}?text=${encoded}`;
      window.open(waUrl, '_blank');
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
      window.open(waUrl, '_blank');
    }

    setSosSuccessNotice(
      isHindi 
        ? `✅ आपकी लाइव लोकेशन WhatsApp/SMS पर भेजी जा रही है।` 
        : `✅ Live location dispatch initiated.`
    );
  };

  // Toggle Siren
  const handleToggleSiren = () => {
    if (isSirenActive) {
      stopEmergencySiren();
      setIsSirenActive(false);
    } else {
      triggerHapticBuzz([200, 100, 200, 100, 400]);
      playEmergencySiren();
      setIsSirenActive(true);
    }
  };

  // Fake Call simulation
  const startFakeCall = () => {
    setIsFakeCallRinging(true);
    setIsFakeCallConnected(false);
    playCleanChime('alert');
    triggerHapticBuzz([400, 200, 400, 200]);
  };

  const answerFakeCall = () => {
    setIsFakeCallRinging(false);
    setIsFakeCallConnected(true);
    setFakeCallTimer(0);
    fakeCallIntervalRef.current = setInterval(() => {
      setFakeCallTimer(t => t + 1);
    }, 1000);

    const simulatedDialog = isHindi
      ? `हाँ बेटा, मैं 2 मिनट में चौराहे पर पहुँच रहा हूँ। तुम किस रिक्शे में हो? पुलिस चौकी के पास ही खड़े रहना।`
      : `Yes, I am reaching the junction in 2 minutes. Stay near the police booth.`;
    speakCleanVoice(simulatedDialog, language);
  };

  const stopFakeCall = () => {
    setIsFakeCallRinging(false);
    setIsFakeCallConnected(false);
    if (fakeCallIntervalRef.current) {
      clearInterval(fakeCallIntervalRef.current);
      fakeCallIntervalRef.current = null;
    }
    stopVoice();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className={`relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border ${
          isSirenActive ? 'border-rose-600 ring-4 ring-rose-500/40' : 'border-slate-200'
        } overflow-hidden my-auto flex flex-col max-h-[92vh]`}
      >
        {/* Siren Alert Strip if active */}
        {isSirenActive && (
          <div className="bg-rose-600 text-white px-4 py-2 text-center text-xs font-black flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-300" />
              <span>{isHindi ? '🚨 आपातकालीन सायरन सक्रिय है' : '🚨 EMERGENCY LOUD SIREN ACTIVE'}</span>
            </div>
            <button 
              onClick={handleToggleSiren}
              className="bg-white text-rose-700 px-2.5 py-0.5 rounded-lg text-xs font-black uppercase hover:bg-rose-50 cursor-pointer"
            >
              {isHindi ? 'बंद करें' : 'Stop'}
            </button>
          </div>
        )}

        {/* Clean Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                  {isHindi ? 'महिला सुरक्षा एवं पुलिस SOS' : isUrdu ? 'خواتین سیفٹی اور پولیس ہیلپ لائن' : 'Women Safety & Emergency SOS'}
                </h2>
                <span className="bg-rose-600/30 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/40">
                  24x7 Help
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {cityName} • UP 112 / WPL 1090
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isSirenActive) stopEmergencySiren();
              stopFakeCall();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Segmented Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('sos')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'sos'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isHindi ? '1-क्लिक SOS' : '1-Click SOS'}</span>
          </button>

          <button
            onClick={() => setActiveTab('helplines')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'helplines'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{isHindi ? 'पुलिस हेल्पलाइन' : 'Helplines'}</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isHindi ? 'सायरन व टूल्स' : 'Safety Tools'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800">
          
          {/* TAB 1: 1-CLICK SOS & DISPATCH */}
          {activeTab === 'sos' && (
            <div className="space-y-4">
              
              {/* BIG RED SOS ACTION CARD */}
              <div className="p-4 bg-gradient-to-b from-rose-50 to-pink-50 rounded-2xl border-2 border-rose-300 shadow-xs text-center space-y-3">
                <button
                  onClick={handleTrigger1ClickSos}
                  className="w-full py-4 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer min-h-[54px]"
                >
                  <ShieldAlert className="w-5 h-5 text-amber-300 animate-pulse shrink-0" />
                  <span>
                    {isHindi 
                      ? '🚨 1-क्लिक में आपातकालीन SOS भेजें' 
                      : '🚨 SEND 1-CLICK EMERGENCY SOS'}
                  </span>
                </button>

                {/* GPS Status Indicator */}
                <div className="flex items-center justify-between text-[11px] bg-white px-3 py-1.5 rounded-xl border border-rose-200 shadow-2xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Radio className={`w-3.5 h-3.5 ${gpsStatus === 'ready' ? 'text-emerald-600' : 'text-amber-500 animate-pulse'}`} />
                    <span className="text-slate-700">
                      {isHindi ? 'लोकेशन:' : 'GPS:'} <strong>{lastGpsAddress || cityName}</strong>
                    </span>
                  </div>
                  <button 
                    onClick={fetchLiveGps}
                    className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1" 
                  >
                    <RefreshCw className={`w-3 h-3 ${gpsStatus === 'locating' ? 'animate-spin' : ''}`} />
                    <span>{isHindi ? 'रिफ्रेश' : 'Refresh'}</span>
                  </button>
                </div>

                {/* Nearest Police Station detected */}
                {nearestPolice && (
                  <div className="bg-white/90 p-2.5 rounded-xl border border-rose-200/80 flex items-center justify-between text-left text-xs">
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-900 truncate">
                        🏢 {nearestPolice.station.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {isHindi ? 'दूरी:' : 'Distance:'} <strong>{nearestPolice.distanceKm} km</strong> • {nearestPolice.station.address}
                      </div>
                    </div>
                    <a
                      href={`tel:${nearestPolice.station.phone}`}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>{nearestPolice.station.phone}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Optional Contact Fields (Clean) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <UserCheck className="w-4 h-4 text-rose-600" />
                  <span>{isHindi ? 'त्वरित विवरण (अलर्ट में शामिल करने हेतु)' : 'Quick Contact Details'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      {isHindi ? 'आपका नाम' : 'Your Name'}
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder={isHindi ? 'उदा. पूजा / Priya' : 'e.g. Priya Sharma'}
                      className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      {isHindi ? 'अभिभावक/सहेली का मोबाइल' : 'Guardian Mobile'}
                    </label>
                    <input
                      type="tel"
                      value={guardianPhone}
                      onChange={(e) => handleGuardianChange(e.target.value)}
                      placeholder={isHindi ? 'उदा. 9876543210' : 'e.g. 9876543210'}
                      className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Direct Speed Buttons for WhatsApp / SMS Dispatch */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const encoded = encodeURIComponent(generateSosMessage());
                    const waUrl = guardianPhone.trim() 
                      ? `https://wa.me/91${guardianPhone.replace(/\D/g, '')}?text=${encoded}` 
                      : `https://api.whatsapp.com/send?text=${encoded}`;
                    window.open(waUrl, '_blank');
                  }}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp SOS</span>
                </button>

                <a
                  href={`sms:${guardianPhone || '112'}?body=${encodeURIComponent(generateSosMessage())}`}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors text-center"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>SMS SOS</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: EMERGENCY HELPLINES */}
          {activeTab === 'helplines' && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-600">
                {isHindi ? '24 घंटे सक्रिय आधिकारिक हेल्पलाइन पर 1-क्लिक में कॉल करें:' : 'Direct 1-click speed dial to official emergency services:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EMERGENCY_HELPLINES.map((h) => (
                  <a
                    key={h.number}
                    href={`tel:${h.number}`}
                    className="p-3 bg-slate-50 hover:bg-rose-50/50 border border-slate-200 hover:border-rose-300 rounded-xl transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900">{isHindi ? h.hindiTitle : h.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{h.description}</p>
                    </div>
                    <div className="bg-rose-600 group-hover:bg-rose-700 text-white font-black text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0 ml-2">
                      <Phone className="w-3 h-3" />
                      <span>{h.number}</span>
                    </div>
                  </a>
                ))}
              </div>

              {/* Local Police Stations List */}
              <div className="pt-2">
                <h4 className="text-xs font-black text-slate-900 mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{cityName} {isHindi ? 'के प्रमुख थाने व चौकियां' : 'Police Stations Directory'}</span>
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto divide-y divide-slate-100 pr-1">
                  {policeStations.map((st) => (
                    <div key={st.id} className="pt-1.5 pb-1 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-slate-900">{st.name}</span>
                        <p className="text-[10px] text-slate-500 truncate">{st.address}</p>
                      </div>
                      <a
                        href={`tel:${st.phone}`}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-2 py-1 rounded-md shrink-0"
                      >
                        📞 {st.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SAFETY TOOLS (SIREN & FAKE CALL) */}
          {activeTab === 'tools' && (
            <div className="space-y-3">
              
              {/* Siren Tool */}
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-950">
                    <Volume2 className="w-4 h-4 text-rose-600" />
                    <span>{isHindi ? 'लाउड सायरन अलार्म (Deterrent Siren)' : 'Loud Emergency Siren'}</span>
                  </div>
                  <p className="text-[11px] text-rose-800/80 mt-0.5">
                    {isHindi ? 'असुरक्षित महसूस होने पर भीड़ का ध्यान आकर्षित करने हेतु तेज अलार्म' : 'High-pitch sound alarm to alert nearby commuters'}
                  </p>
                </div>
                <button
                  onClick={handleToggleSiren}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                    isSirenActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                  }`}
                >
                  {isSirenActive ? (isHindi ? '⏹️ बंद करें' : '⏹️ Stop') : (isHindi ? '🔊 सायरन बजाएं' : '🔊 Play Siren')}
                </button>
              </div>

              {/* Fake Call Escape Simulator */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <Smartphone className="w-4 h-4 text-slate-700" />
                      <span>{isHindi ? 'फर्जी कॉल सुरक्षा टूल (Fake Call Simulator)' : 'Fake Incoming Call Tool'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isHindi ? 'असहज स्थिति से सुरक्षित निकलने हेतु तुरंत फर्जी इनकमिंग कॉल शुरू करें' : 'Trigger simulated call from family to exit uncomfortable situations'}
                    </p>
                  </div>
                  {!isFakeCallRinging && !isFakeCallConnected && (
                    <button
                      onClick={startFakeCall}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl shrink-0 cursor-pointer shadow-2xs"
                    >
                      📞 {isHindi ? 'कॉल लगाएं' : 'Start Call'}
                    </button>
                  )}
                </div>

                {/* Ringing / Connected State Card */}
                {isFakeCallRinging && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between animate-pulse">
                    <div className="text-xs font-bold text-amber-950">
                      📲 {isHindi ? 'इनकमिंग कॉल आ रही है: "पापा / घर से कॉल..."' : 'Incoming: "Papa Calling..."'}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={answerFakeCall}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        {isHindi ? 'उठाएं' : 'Answer'}
                      </button>
                      <button
                        onClick={stopFakeCall}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black px-2.5 py-1.5 rounded-lg cursor-pointer"
                      >
                        {isHindi ? 'काटें' : 'Reject'}
                      </button>
                    </div>
                  </div>
                )}

                {isFakeCallConnected && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs font-bold text-emerald-950">
                    <div className="flex items-center gap-2">
                      <PhoneForwarded className="w-4 h-4 text-emerald-600 animate-pulse" />
                      <span>{isHindi ? 'कॉल चालू है' : 'Call in progress'} ({fakeCallTimer}s)</span>
                    </div>
                    <button
                      onClick={stopFakeCall}
                      className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-rose-700 cursor-pointer"
                    >
                      {isHindi ? 'कॉल समाप्त' : 'End'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Clean Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>UP Police Emergency: <strong>Dial 112</strong></span>
          <button
            onClick={() => {
              if (isSirenActive) stopEmergencySiren();
              stopFakeCall();
              onClose();
            }}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
