import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  IndianRupee, 
  Search, 
  Users, 
  ArrowRight, 
  ShieldCheck,
  CheckCircle2,
  Building
} from 'lucide-react';
import { AppLanguage, AutoStand } from '../types';
import { SAMPLE_AUTO_STANDS } from '../data/autoStandsAndEvData';

interface AutoStandDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  cityName: string;
  onSelectStandForRoute?: (standName: string) => void;
}

export const AutoStandDirectoryModal: React.FC<AutoStandDirectoryModalProps> = ({
  isOpen,
  onClose,
  language,
  cityName,
  onSelectStandForRoute
}) => {
  const isHindi = language === 'hi';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStand, setSelectedStand] = useState<AutoStand>(SAMPLE_AUTO_STANDS[0]);

  const filteredStands = SAMPLE_AUTO_STANDS.filter((stand) => {
    return stand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stand.hindiName.includes(searchTerm) ||
      stand.landmark.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSetRoute = (stand: AutoStand) => {
    if (onSelectStandForRoute) {
      onSelectStandForRoute(stand.name);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-lg shadow-2xs">
              🚏
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>{isHindi ? 'नगर निगम अधिकृत ई-रिक्शा स्टैंड व रूट गाइड' : 'Official Auto Stands & Route Directory'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {SAMPLE_AUTO_STANDS.length} {isHindi ? 'स्टैंड' : 'Stands'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {isHindi ? `${cityName} के प्रमुख शेयर्ड स्टैंड, तय सरकारी रेट व यूनियन हेल्पलाइन` : `Official municipal stands, fixed stage fares & frequency for ${cityName}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="pt-3 pb-1">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 text-xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isHindi ? 'ऑटो स्टैंड का नाम या चौराहा खोजें (उदा. जंक्शन, सेटेलाइट, चौक)...' : 'Search auto stand by name or hub (e.g. Junction, Satellite, Chowk)...'}
              className="w-full bg-transparent outline-none text-slate-800 text-xs"
            />
          </div>
        </div>

        {/* Content: Split List & Stand Details */}
        <div className="overflow-y-auto py-3 space-y-4 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Stands List Column (2 cols) */}
            <div className="md:col-span-2 space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
              {filteredStands.map((stand) => (
                <button
                  key={stand.id}
                  onClick={() => setSelectedStand(stand)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedStand.id === stand.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="font-extrabold text-xs flex items-center justify-between">
                    <span className="truncate">{isHindi ? stand.hindiName.split(' ')[0] + ' ' + stand.hindiName.split(' ')[1] : stand.name.split(' ')[0] + ' ' + stand.name.split(' ')[1]}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                      selectedStand.id === stand.id ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-200 text-slate-700'
                    }`}>
                      ~{stand.activeRickshawsEst} 🛺
                    </span>
                  </div>
                  <div className={`text-[10px] truncate mt-1 ${selectedStand.id === stand.id ? 'text-slate-300' : 'text-slate-500'}`}>
                    {stand.landmark}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Stand Detail Column (3 cols) */}
            <div className="md:col-span-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs sm:text-sm text-slate-900">
                    {isHindi ? selectedStand.hindiName : selectedStand.name}
                  </h4>
                  {selectedStand.nightServiceAvailable && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      🌙 24x7 Night Stand
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedStand.landmark}</span>
                </div>
              </div>

              {/* Stand Meta Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{isHindi ? 'भीड़ का समय:' : 'Peak Rush Hours:'}</span>
                  </div>
                  <div className="font-bold text-slate-800 text-[11px] mt-0.5 truncate">
                    {selectedStand.peakHours}
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>{isHindi ? 'सक्रिय रिक्शा:' : 'Avg. Rickshaws:'}</span>
                  </div>
                  <div className="font-bold text-emerald-600 text-[11px] mt-0.5">
                    ~{selectedStand.activeRickshawsEst} {isHindi ? 'सवारी वाहन' : 'Vehicles'}
                  </div>
                </div>
              </div>

              {/* Fixed Stage Routes & Fares Table */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">
                  📍 {isHindi ? 'तय सरकारी रूट व शेयर्ड किराया सूची:' : 'Fixed Destinations & Standard Fares:'}
                </span>

                <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                  {selectedStand.routes.map((route, i) => (
                    <div
                      key={i}
                      className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="truncate max-w-[180px] sm:max-w-[220px]">
                        <span className="font-bold text-slate-900 block truncate">{route.destinationName}</span>
                        <span className="text-[10px] text-slate-400">{route.distanceKm} km • ~{route.travelTimeMin} min</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          ₹{route.standardSharedFare}
                        </span>
                        <span className="block text-[9px] text-slate-400">{isHindi ? 'प्रति सीट' : 'per seat'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Set as route button */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                {selectedStand.unionHelpline && (
                  <a
                    href={`tel:${selectedStand.unionHelpline}`}
                    className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[150px]">{selectedStand.unionHelpline}</span>
                  </a>
                )}

                <button
                  onClick={() => handleSetRoute(selectedStand)}
                  className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer ml-auto"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isHindi ? 'इस स्टैंड से रूट बनाएं' : 'Set as Route'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHindi ? 'आरटीओ बरेली अनुमोदित दरें' : 'RTO Bareilly Regulated Rates'}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
