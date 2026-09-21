import React, { useState } from 'react';
import { ReportCategory, ReportSeverity, TrafficReport, AppLanguage } from '../types';
import { BAREILLY_LOCATIONS } from '../data/bareillyData';
import { X, AlertTriangle, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { TRANSLATIONS } from '../utils/i18n';

interface CrowdsourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  clickedCoords: { lat: number; lng: number } | null;
  onSubmitReport: (newReport: Omit<TrafficReport, 'id' | 'upvotes' | 'downvotes' | 'reportedAt'> & { userGps?: { lat: number; lng: number } }) => void;
  language?: AppLanguage;
  cityName?: string;
}

export const CrowdsourceModal: React.FC<CrowdsourceModalProps> = ({
  isOpen,
  onClose,
  clickedCoords,
  onSubmitReport,
  language = 'hi',
  cityName = 'Bareilly'
}) => {
  const isHindi = language === 'hi';
  const isUrdu = language === 'ur';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [locationName, setLocationName] = useState(
    clickedCoords ? `Custom Map Point (${clickedCoords.lat.toFixed(3)}, ${clickedCoords.lng.toFixed(3)})` : BAREILLY_LOCATIONS[1].name
  );
  const [category, setCategory] = useState<ReportCategory>('erickshaw_gridlock');
  const [severity, setSeverity] = useState<ReportSeverity>('heavy');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userType, setUserType] = useState<'erickshaw_driver' | 'commuter'>('commuter');
  const [avoidanceTip, setAvoidanceTip] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [userGps, setUserGps] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Auto-fetch user live GPS for Phase 4 Anti-Spam Geofence
  React.useEffect(() => {
    if (isOpen && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Use clicked coordinates if present, or look up location coords
    let coords = clickedCoords || { lat: 28.3620, lng: 79.4200 };
    const matchedLoc = BAREILLY_LOCATIONS.find(l => l.name === locationName);
    if (matchedLoc && !clickedCoords) {
      coords = { lat: matchedLoc.lat, lng: matchedLoc.lng };
    }

    onSubmitReport({
      locationName,
      category,
      severity,
      title,
      description: description || (isHindi ? `${locationName} के पास सक्रिय यात्री/चालक द्वारा जाम रिपोर्ट दर्ज की गई।` : `Reported near ${locationName} by active commuter/driver.`),
      coordinates: coords,
      userType,
      avoidanceTip: avoidanceTip || (isHindi ? 'जाम से बचने के लिए बाहरी लिंक रोड या वैकल्पिक मार्ग का प्रयोग करें।' : 'Follow outer link roads to prevent deadlock.'),
      userGps: userGps || undefined
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const presetTitles: Record<ReportCategory, string[]> = {
    erickshaw_gridlock: isHindi ? [
      'दोनों तरफ बेतरतीब ई-रिक्शों की कतार से भारी जाम',
      'सवारी भरने के लिए 20+ ई-रिक्शे खड़े हैं, रास्ता बंद',
      'पतली गली में बेतरतीब रिक्शों से पूर्ण रुकावट'
    ] : [
      'Unplanned E-rickshaw jam blocking both sides',
      'Over 30 e-rickshaws lined up picking passengers',
      'Narrow alley completely blocked by parked rickshaws'
    ],
    bottleneck: isHindi ? [
      'सब्जी मंडी के ठेलों के कारण मार्ग संकरा हो गया है',
      'दुकानों के बाहर डबल पार्किंग से जाम',
      'मोड़ पर ठेले और आटो फंसने से आवागमन बाधित'
    ] : [
      'Sabzi mandi carts occupying 70% of carriage-way',
      'Double parking choke near central market cut',
      'Sharp bend deadlock with tempos and rickshaws'
    ],
    festive_rush: isHindi ? [
      'त्योहारी बाजार या शोभायात्रा के कारण भारी भीड़',
      'साप्ताहिक हाट के कारण यातायात पूरी तरह रुका हुआ',
      'स्कूल छूटने के समय भारी जाम'
    ] : [
      'Religious procession or festive bazaar crowd',
      'Weekly haat bazaar causing standstill',
      'School dispersal rush adding to narrow street jam'
    ],
    railway_crossing: isHindi ? [
      'रेलवे फाटक बंद होने से दोनों ओर वाहनों की लंबी कतार (15+ मिनट)',
      'फाटक के पास भारी जाम की स्थिति'
    ] : [
      'Railway Fatak closed for express shunting (15+ min wait)',
      'Crossing barrier broken - heavy backlog on both sides'
    ],
    narrow_street_block: isHindi ? [
      'गली में निर्माण सामग्री या ठेला खराब होने से रुकावट',
      'सड़क पर मलबा पड़ा होने से रास्ता बंद'
    ] : [
      'Handcart broken down in 10-foot gali',
      'Construction debris dumped on street corner'
    ],
    police_diversion: isHindi ? [
      'ट्रैफिक पुलिस चेकिंग व एकतरफा डायवर्जन',
      'ई-रिक्शा रूट चेकिंग दस्ता सक्रिय'
    ] : [
      'Bareilly Traffic Police checkpoint & one-way diversion',
      'E-rickshaw registration inspection squad active'
    ],
    waterlogging: isHindi ? [
      'जलभराव के कारण वाहन धीमे चल रहे हैं'
    ] : [
      'Monsoon puddle obstruction - rickshaws struggling to pass'
    ]
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{isHindi ? 'लाइव जाम / रुकावट रिपोर्ट करें' : 'Flag Hyperlocal Chokepoint'}</h3>
              <p className="text-[11px] text-amber-100">{isHindi ? 'अन्य यात्रियों को सचेत करें व रूट सुगम बनाएं' : 'Crowdsource real-time traffic bottlenecks'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white/90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">{isHindi ? 'अलर्ट सफलतापूर्वक प्रसारित!' : 'Alert Broadcasted!'}</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {isHindi ? 'आपकी रिपोर्ट दर्ज हो गई है। साथी यात्रियों को वैकल्पिक मार्ग सुझाया जा रहा है।' : 'Your crowdsourced alert has been posted. Other commuters and drivers are now being rerouted.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
            {/* User Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isHindi ? 'आप रिपोर्ट कर रहे हैं' : 'Reporting As'}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUserType('commuter')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    userType === 'commuter'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isHindi ? '🚶 यात्री / राहगीर' : '🚶 Commuter / Passenger'}
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('erickshaw_driver')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    userType === 'erickshaw_driver'
                      ? 'border-amber-500 bg-amber-50 text-amber-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isHindi ? '🛺 ई-रिक्शा चालक' : '🛺 E-Rickshaw Driver'}
                </button>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isHindi ? `${cityName} में स्थान` : `Location in ${cityName}`}
              </label>
              {clickedCoords ? (
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-medium">{isHindi ? 'मानचित्र द्वारा चयनित बिन्दु' : 'Selected via Map Click'}: {clickedCoords.lat.toFixed(4)}, {clickedCoords.lng.toFixed(4)}</span>
                </div>
              ) : (
                <select
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg px-2.5 py-2 focus:bg-white focus:ring-2 focus:ring-amber-500/30"
                >
                  {BAREILLY_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {isHindi ? `${loc.hindiName} (${loc.name})` : `${loc.name} (${loc.hindiName})`}
                    </option>
                  ))}
                  <option value="Novelty Cinema Cut">Novelty Cinema Cut (Patel Chowk)</option>
                  <option value="Shahamatganj Sabzi Mandi Gali">Shahamatganj Sabzi Mandi Gali</option>
                  <option value="Subhash Nagar Railway Fatak">Subhash Nagar Railway Fatak</option>
                  <option value="Qila Chauraha">Qila Chauraha (Old City Entrance)</option>
                </select>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isHindi ? 'रुकावट / समस्या का प्रकार' : 'Chokepoint Nature'}</label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: 'erickshaw_gridlock', label: isHindi ? '🛺 ई-रिक्शा जाम' : '🛺 E-Rickshaw Gridlock', desc: isHindi ? 'सवारी उतारने-चढ़ाने से' : 'Unregistered queuing' },
                  { id: 'bottleneck', label: isHindi ? '🛑 संकरी गली / ठेला' : '🛑 Narrow Lane Bottleneck', desc: isHindi ? 'अतिक्रमण व ठेले' : 'Thela/street parking' },
                  { id: 'festive_rush', label: isHindi ? '🎪 बाजार व त्योहारी भीड़' : '🎪 Festive / Market Rush', desc: isHindi ? 'अत्यधिक भीड़' : 'Heavy crowd surge' },
                  { id: 'railway_crossing', label: isHindi ? '🚂 रेलवे फाटक बंद' : '🚂 Railway Fatak Closed', desc: isHindi ? 'ट्रेन आवागमन' : 'Train shunting gate' },
                  { id: 'police_diversion', label: isHindi ? '👮 पुलिस चेकिंग / डायवर्जन' : '👮 Traffic Police Check', desc: isHindi ? 'वन-वे / चालान' : 'One-way / Challan' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id as ReportCategory);
                      if (presetTitles[cat.id as ReportCategory]?.length) {
                        setTitle(presetTitles[cat.id as ReportCategory][0]);
                      }
                    }}
                    className={`p-2 text-left rounded-lg border transition-all ${
                      category === cat.id
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold text-[11px]">{cat.label}</div>
                    <div className="text-[10px] text-slate-400">{cat.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isHindi ? 'जाम की गंभीरता' : 'Traffic Impact Severity'}</label>
              <div className="flex gap-2">
                {[
                  { id: 'moderate', label: isHindi ? 'धीमा (5-10 मि देरी)' : 'Slow (5-10m delay)', color: 'border-blue-300 text-blue-700 bg-blue-50' },
                  { id: 'heavy', label: isHindi ? 'भारी जाम (15-20 मि)' : 'Heavy Crawl (15-20m)', color: 'border-amber-400 text-amber-800 bg-amber-50' },
                  { id: 'critical', label: isHindi ? 'पूर्ण ठहराव (30+ मि)' : 'Deadlock (30m+ stop)', color: 'border-red-500 text-red-800 bg-red-50' }
                ].map((sev) => (
                  <button
                    key={sev.id}
                    type="button"
                    onClick={() => setSeverity(sev.id as ReportSeverity)}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-center text-[11px] font-semibold transition-all ${
                      severity === sev.id ? `${sev.color} ring-1 ring-amber-500` : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {sev.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title / Summary */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">{isHindi ? 'घटना का विवरण' : 'Incident Headline'}</label>
                <span className="text-[10px] text-slate-400">{isHindi ? 'सुझाव नीचे उपलब्ध हैं' : 'Presets available below'}</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isHindi ? 'उदा. 20 ई-रिक्शे खड़े होने से रास्ता रुका है...' : 'e.g., 30 e-rickshaws blocking cloth market gali...'}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-amber-500/30"
              />

              {/* Preset quick buttons */}
              {presetTitles[category] && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {presetTitles[category].map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTitle(preset)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition-colors"
                    >
                      + {preset.slice(0, 32)}...
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Avoidance Detour Advice for Fellow Drivers */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isHindi ? 'साथी चालकों/यात्रियों के लिए वैकल्पिक रास्ता सुझाव' : 'Suggested Bypass Tip for Fellow Commuters / Drivers'}
              </label>
              <input
                type="text"
                value={avoidanceTip}
                onChange={(e) => setAvoidanceTip(e.target.value)}
                placeholder={isHindi ? 'उदा. शाहमतगंज फ्लाईओवर या सिविल लाइन्स लिंक रोड लें' : 'e.g., Take Shahamatganj flyover or Civil Lines link road'}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-98 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isHindi ? 'अलर्ट सबमिट करें' : `Submit Crowd Alert for ${cityName}`}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
