import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  MapPin, 
  Phone, 
  User, 
  Send, 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  HelpCircle, 
  Navigation, 
  RefreshCw,
  Clock,
  PhoneCall,
  BadgeAlert,
  FileText
} from 'lucide-react';
import { CitizenComplaint, ComplaintCategory, AppLanguage } from '../types';
import { playCleanChime, speakCleanVoice } from '../utils/audioAlerts';
import { TRANSLATIONS } from '../utils/i18n';

interface CitizenComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName?: string;
  defaultCoords?: { lat: number; lng: number };
  language?: AppLanguage;
  onComplaintSubmitted?: (complaint: CitizenComplaint) => void;
}

export const CitizenComplaintModal: React.FC<CitizenComplaintModalProps> = ({
  isOpen,
  onClose,
  cityName = 'Bareilly',
  defaultCoords,
  language = 'en',
  onComplaintSubmitted
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isHindi = language === 'hi';
  const isUrdu = language === 'ur';

  // Input fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [issueType, setIssueType] = useState<ComplaintCategory>('auto_overcharging');
  const [description, setDescription] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  // GPS auto-fetch states
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [addressHint, setAddressHint] = useState<string>('');

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{ ticketNumber: string; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'recent'>('new');
  const [recentComplaints, setRecentComplaints] = useState<CitizenComplaint[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  // Auto fetch GPS immediately when modal opens
  const fetchCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setGpsError(isHindi ? 'ब्राउज़र में GPS सपोर्ट नहीं है।' : 'Geolocation is not supported by your browser.');
      if (defaultCoords) {
        setGpsLocation(defaultCoords);
        setAddressHint(`${cityName} City Center`);
      }
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy || 10)
        };
        setGpsLocation(coords);
        setIsLocating(false);
        setAddressHint(`GPS Fetched: Lat ${coords.lat.toFixed(4)}, Lng ${coords.lng.toFixed(4)} (±${coords.accuracy}m)`);
      },
      (err) => {
        console.warn('GPS location fetch failed:', err);
        setIsLocating(false);
        if (defaultCoords) {
          setGpsLocation(defaultCoords);
          setAddressHint(`${cityName} Central Hub`);
          setGpsError(isHindi ? 'GPS सिग्नल नहीं मिला, शहर केंद्र सेट किया गया।' : 'Could not get fine GPS signal, defaulting to current city center.');
        } else {
          setGpsLocation({ lat: 28.3620, lng: 79.4200 });
          setAddressHint(`${cityName} Central District`);
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    if (isOpen) {
      fetchCurrentLocation();
      fetchRecentComplaints();
      setSubmittedTicket(null);
    }
  }, [isOpen, cityName]);

  const fetchRecentComplaints = async () => {
    try {
      setIsLoadingRecent(true);
      const res = await fetch(`/api/complaints?city=${encodeURIComponent(cityName)}`);
      if (res.ok) {
        const data = await res.json();
        setRecentComplaints(data.complaints || []);
      }
    } catch (e) {
      console.warn('Could not fetch complaints:', e);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert(isHindi ? 'कृपया अपना नाम और मोबाइल नंबर दर्ज करें।' : 'Please enter your name and phone number.');
      return;
    }

    if (!gpsLocation) {
      alert(isHindi ? 'GPS लोकेशन प्राप्त की जा रही है, कृपया 2 सेकंड प्रतीक्षा करें।' : 'GPS location is being detected, please wait 2 seconds.');
      fetchCurrentLocation();
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        category: issueType,
        description: description.trim(),
        emergency: isEmergency,
        cityName,
        userGps: {
          lat: gpsLocation.lat,
          lng: gpsLocation.lng,
          accuracyMeters: gpsLocation.accuracy,
          addressHint: addressHint || `${cityName} Location`
        }
      };

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playCleanChime('fare');
        if (isEmergency) {
          const emergencyVoice = isHindi
            ? `आपकी आपातकालीन शिकायत दर्ज हो गई है। टिकट नंबर ${data.ticketNumber} है।`
            : `Your emergency complaint is registered with ticket number ${data.ticketNumber}.`;
          speakCleanVoice(emergencyVoice, language);
        }
        setSubmittedTicket({
          ticketNumber: data.ticketNumber,
          message: data.message || (isHindi ? 'शिकायत सफलतापूर्वक दर्ज हो गई है।' : 'Complaint recorded successfully with verified GPS location.')
        });
        if (onComplaintSubmitted && data.complaint) {
          onComplaintSubmitted(data.complaint);
        }
        fetchRecentComplaints();
      } else {
        alert(data.error || (isHindi ? 'शिकायत दर्ज करने में विफल। पुनः प्रयास करें।' : 'Failed to submit complaint. Please try again.'));
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert(isHindi ? 'नेटवर्क समस्या। कृपया इंटरनेट कनेक्शन जांचें।' : 'Network error while lodging complaint. Please check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { id: ComplaintCategory; label: string; icon: string; emergency?: boolean }[] = [
    { 
      id: 'emergency_help', 
      label: isHindi ? 'आपातकालीन मदद / दुर्घटना' : isUrdu ? 'ہنگامی مدد / حادثہ' : 'Urgent Help / Accident', 
      icon: '🚨', 
      emergency: true 
    },
    { 
      id: 'auto_overcharging', 
      label: isHindi ? 'अधिक किराया वसूली' : isUrdu ? 'زیادہ کرایہ وصولی' : 'Overcharging / Extra Fare', 
      icon: '💸' 
    },
    { 
      id: 'road_blocked', 
      label: isHindi ? 'रास्ता बंद / ई-रिक्शा जाम' : isUrdu ? 'راستہ بند / جام' : 'Road Blocked / Auto Gridlock', 
      icon: '🚧' 
    },
    { 
      id: 'harassment_safety', 
      label: isHindi ? 'यात्री सुरक्षा / दुर्व्यवहार' : isUrdu ? 'مسافر تحفظ / بدتمیزی' : 'Passenger Safety / Misbehaviour', 
      icon: '🛡️', 
      emergency: true 
    },
    { 
      id: 'auto_refusal', 
      label: isHindi ? 'सवारी ले जाने से मना किया' : isUrdu ? 'سواری سے انکار' : 'Driver Refused Ride', 
      icon: '🚫' 
    },
    { 
      id: 'lost_belonging', 
      label: isHindi ? 'ऑटो में सामान छूट गया' : isUrdu ? 'سامان چھوٹ گیا' : 'Lost Item in Auto / E-Rickshaw', 
      icon: '🎒' 
    },
    { 
      id: 'reckless_driving', 
      label: isHindi ? 'खतरनाक ड्राइविंग / ओवरलोडिंग' : isUrdu ? 'خطرناک ڈرائیونگ' : 'Rash / Dangerous Driving', 
      icon: '⚡' 
    },
    { 
      id: 'other_issue', 
      label: isHindi ? 'अन्य समस्या / शिकायत' : isUrdu ? 'دیگر مسئلہ' : 'Other Issue / Help Request', 
      icon: '💬' 
    },
  ];

  return (
    <div className="fixed inset-0 z-[2300] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg shadow-inner">
              📢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                  {t.grievanceDeskTitle}
                </h3>
                <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/30">
                  {t.gpsLinked}
                </span>
              </div>
              <p className="text-[11px] text-rose-100">
                {cityName} • {isHindi ? 'शिकायत एवं सहायता पोर्टल (नाम, फ़ोन और ऑटो-GPS)' : 'Instant Citizen Grievance & Emergency Assistance'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: New Complaint vs Recent Complaints */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'new'
                ? 'border-rose-600 text-rose-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>📝 {t.fileNewComplaint}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('recent');
              fetchRecentComplaints();
            }}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'recent'
                ? 'border-rose-600 text-rose-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>📋 {t.liveTickets} ({recentComplaints.length})</span>
          </button>
        </div>

        {/* Success Confirmation Screen */}
        {submittedTicket ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                {t.ticketRegistered}
              </span>
              <h4 className="font-extrabold text-slate-900 text-lg mt-2">
                {isHindi ? 'शिकायत सफलतापूर्वक दर्ज हो गई!' : 'Complaint Recorded Successfully!'}
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                {submittedTicket.message}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left max-w-sm mx-auto space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">{isHindi ? 'ट्रैकिंग टिकट:' : 'Tracking Ticket:'}</span>
                <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {submittedTicket.ticketNumber}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">{isHindi ? 'नागरिक:' : 'Citizen:'}</span>
                <span className="font-bold text-slate-800">{name} ({phone})</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">{isHindi ? 'GPS लोकेशन:' : 'GPS Auto-Location:'}</span>
                <span className="font-bold text-emerald-700 truncate max-w-[180px]">
                  {addressHint || `${gpsLocation?.lat.toFixed(4)}, ${gpsLocation?.lng.toFixed(4)}`}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => {
                  setSubmittedTicket(null);
                  setName('');
                  setPhone('');
                  setDescription('');
                  setIsEmergency(false);
                  setActiveTab('recent');
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
              >
                {t.viewTrackedTickets}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
              >
                {t.doneBtn}
              </button>
            </div>
          </div>
        ) : activeTab === 'new' ? (
          /* New Complaint Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
            
            {/* Automatic GPS Location Fetch Box */}
            <div className="bg-emerald-50/80 border border-emerald-300 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                  <Navigation className={`w-4 h-4 text-emerald-700 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{t.autoGpsDetection}</span>
                </div>
                <button
                  type="button"
                  onClick={fetchCurrentLocation}
                  disabled={isLocating}
                  className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? (isHindi ? 'लोकेशन खोजी जा रही है...' : 'Detecting...') : t.refetchGps}</span>
                </button>
              </div>

              <div className="bg-white/90 p-2 rounded-lg border border-emerald-200 text-xs">
                {isLocating ? (
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>{t.detectingGps}</span>
                  </div>
                ) : gpsLocation ? (
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="truncate">{addressHint || `${cityName} Coords`}</span>
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded shrink-0">
                        ✓ {t.verifiedBadge} GPS
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Lat: {gpsLocation.lat.toFixed(5)}, Lng: {gpsLocation.lng.toFixed(5)}
                      {gpsLocation.accuracy ? ` (±${gpsLocation.accuracy}m)` : ''}
                    </p>
                  </div>
                ) : (
                  <p className="text-rose-700 text-xs font-medium">
                    {gpsError || (isHindi ? 'GPS प्राप्त नहीं हुआ। रिफ्रेश करें।' : 'GPS not fetched yet. Click Refetch GPS.')}
                  </p>
                )}
              </div>
            </div>

            {/* Name & Phone Number Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.yourName}</span>
                  <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.phoneNum}</span>
                  <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder={t.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>
            </div>

            {/* Emergency Toggle Switch */}
            <div className={`p-2.5 rounded-xl border transition-colors flex items-center justify-between cursor-pointer ${
              isEmergency ? 'bg-rose-50 border-rose-400' : 'bg-slate-50 border-slate-200'
            }`}
              onClick={() => setIsEmergency(!isEmergency)}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🚨</span>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>{t.emergencyAlert}</span>
                    {isEmergency && (
                      <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded uppercase font-extrabold">
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {t.emergencySubtext}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
              />
            </div>

            {/* Issue Category Radio/Pills */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {t.selectIssueCategory}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const isSelected = issueType === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setIssueType(cat.id);
                        if (cat.emergency) {
                          setIsEmergency(true);
                        }
                      }}
                      className={`p-2 rounded-lg border text-left transition-all text-xs flex items-center gap-1.5 ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50/70 font-bold text-rose-950 ring-1 ring-rose-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                      }`}
                    >
                      <span className="text-base shrink-0">{cat.icon}</span>
                      <span className="truncate font-semibold text-[11px] leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description Details */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span>{t.issueDetailsLabel}</span>
                <span className="text-[10px] font-normal text-slate-400">{isHindi ? 'वैकल्पिक' : 'Optional'}</span>
              </label>
              <textarea
                rows={2}
                placeholder={t.issueDetailsPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs font-normal p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Quick Emergency Helplines Box */}
            <div className="bg-slate-100 rounded-xl p-2.5 text-[11px] text-slate-600 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                <span>{isHindi ? 'हेल्पलाइन नंबर:' : 'Direct Helpline:'}</span>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href="tel:112" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-2 py-0.5 rounded text-[10px]"
                >
                  {t.dialPolice}
                </a>
                <a 
                  href="tel:1090" 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-2 py-0.5 rounded text-[10px]"
                >
                  {t.dialWomen}
                </a>
                <a 
                  href="tel:108" 
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-2 py-0.5 rounded text-[10px]"
                >
                  {t.dialAmbulance}
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isEmergency
                  ? 'bg-rose-600 hover:bg-rose-700 ring-2 ring-rose-300 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800'
              } disabled:opacity-50`}
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? (isHindi ? 'शिकायत दर्ज की जा रही है...' : 'Recording grievance with GPS...')
                  : isEmergency
                  ? t.submitEmergencyAlert
                  : t.submitComplaint}
              </span>
            </button>
          </form>
        ) : (
          /* Recent Complaints List */
          <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                {isHindi ? `${cityName} में दर्ज शिकायतें` : `Active Tracked Tickets in ${cityName}`}
              </span>
              <button
                type="button"
                onClick={fetchRecentComplaints}
                className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingRecent ? 'animate-spin' : ''}`} />
                <span>{isHindi ? 'रिफ्रेश' : 'Refresh'}</span>
              </button>
            </div>

            {isLoadingRecent ? (
              <div className="py-8 text-center text-xs text-slate-500">
                {isHindi ? 'शिकायतें लोड हो रही हैं...' : 'Loading ticket records...'}
              </div>
            ) : recentComplaints.length === 0 ? (
              <div className="py-8 text-center space-y-2 bg-slate-50 rounded-xl border border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">
                  {isHindi ? 'कोई सक्रिय शिकायत दर्ज नहीं है।' : 'No active grievances found for this city.'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isHindi ? 'नई शिकायत दर्ज करने के लिए ऊपर टैब चुनें।' : 'Switch to "File New Complaint" tab to register an issue.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentComplaints.map((c) => (
                  <div 
                    key={c.id} 
                    className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                      c.emergency ? 'bg-rose-50/70 border-rose-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        {c.emergency && <span className="text-rose-600 font-bold">🚨</span>}
                        <span className="font-mono text-rose-700 bg-white px-1.5 py-0.2 rounded border text-[11px]">
                          {c.ticketNumber}
                        </span>
                        <span>{c.name}</span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        c.status === 'RESOLVED' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : c.status === 'UNDER_REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-700">
                      <span className="font-semibold text-slate-900">
                        {categories.find(cat => cat.id === c.issueType)?.label || c.issueType}:
                      </span>{' '}
                      {c.description || (isHindi ? 'नागरिक द्वारा दर्ज शिकायत' : 'No description provided')}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{c.userGps.addressHint || `${c.userGps.lat.toFixed(3)}, ${c.userGps.lng.toFixed(3)}`}</span>
                      </span>
                      <span className="shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
