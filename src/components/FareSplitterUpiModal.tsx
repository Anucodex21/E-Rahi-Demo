import React, { useState } from 'react';
import { 
  X, 
  Users, 
  QrCode, 
  Moon, 
  Luggage, 
  CreditCard, 
  Volume2, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles,
  Smartphone,
  IndianRupee,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { AppLanguage } from '../types';

interface FareSplitterUpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  cityName: string;
  defaultFare?: number;
}

export const FareSplitterUpiModal: React.FC<FareSplitterUpiModalProps> = ({
  isOpen,
  onClose,
  language,
  cityName,
  defaultFare = 15
}) => {
  const isHindi = language === 'hi';

  const [passengersCount, setPassengersCount] = useState<number>(3);
  const [baseFarePerSeat, setBaseFarePerSeat] = useState<number>(defaultFare);
  const [isNightSurcharge, setIsNightSurcharge] = useState<boolean>(false);
  const [luggageBagsCount, setLuggageBagsCount] = useState<number>(0);
  const [customDriverUpiId, setCustomDriverUpiId] = useState<string>('erahi.driver@okaxis');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [isSoundboxPlaying, setIsSoundboxPlaying] = useState<boolean>(false);
  const [showDriverUpiEdit, setShowDriverUpiEdit] = useState<boolean>(false);

  // Calculations
  const nightMultiplier = isNightSurcharge ? 1.25 : 1.0;
  const luggageExtra = luggageBagsCount * 10;
  const singleSeatFare = Math.round(baseFarePerSeat * nightMultiplier);
  const totalTripFare = (singleSeatFare * passengersCount) + luggageExtra;
  const perPersonShare = Math.round(totalTripFare / passengersCount);

  // Standard UPI URI format
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(customDriverUpiId)}&pn=ERahi%20Auto%20Driver&am=${perPersonShare}&cu=INR&tn=Auto%20Ride%20Fare`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(customDriverUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSimulateSoundbox = () => {
    setIsSoundboxPlaying(true);
    try {
      // Audio Chime using Web Audio API
      if (typeof window !== 'undefined') {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start();
          osc2.start(ctx.currentTime + 0.15);
          osc1.stop(ctx.currentTime + 0.2);
          osc2.stop(ctx.currentTime + 0.45);
        }
      }

      // Voice alert simulation
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const msg = isHindi
          ? `पेटीएम साउंडबॉक्स पर ${perPersonShare} रुपये प्राप्त हुए!`
          : `Received ${perPersonShare} rupees on PhonePe UPI soundbox!`;
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
        utterance.rate = 1.05;
        utterance.onend = () => setIsSoundboxPlaying(false);
        utterance.onerror = () => setIsSoundboxPlaying(false);
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 350);
      } else {
        setTimeout(() => setIsSoundboxPlaying(false), 1200);
      }
    } catch {
      setIsSoundboxPlaying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-lg shadow-2xs">
              🛺
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>{isHindi ? 'शेयर्ड सीट किराया व यूपीआई क्यूआर' : 'Shared Seat Fare & Driver UPI QR'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {isHindi ? 'खुल्ले पैसे का समाधान' : 'Exact Change'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {isHindi ? 'सवारियों में किराया बांटें और 1-टैप में ऑनलाइन भुगतान करें' : 'Split per-seat rates & pay drivers without change issues'}
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-4 scrollbar-thin">
          {/* 1. Passenger Count Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>{isHindi ? 'सवारियों की संख्या (Passenger Count):' : 'Number of Passengers:'}</span>
              </label>
              <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {passengersCount} {isHindi ? 'सवारी' : 'riders'}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setPassengersCount(num)}
                  className={`py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    passengersCount === num
                      ? 'bg-slate-900 text-white shadow-md scale-102'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Base Per-Seat Fare Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-amber-500" />
              <span>{isHindi ? 'स्टेज किराया प्रति सवारी (Base Rate per Seat):' : 'Stage Rate per Passenger:'}</span>
            </label>

            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 20, 25].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setBaseFarePerSeat(rate)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    baseFarePerSeat === rate
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-2xs font-extrabold'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  ₹{rate}
                  <span className="block text-[10px] font-normal opacity-80">
                    {rate === 10 ? '0-2 km' : rate === 15 ? '2-4 km' : rate === 20 ? '4-7 km' : '7+ km'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Toggles: Night Surcharge & Luggage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Night Surcharge */}
            <div 
              onClick={() => setIsNightSurcharge(!isNightSurcharge)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                isNightSurcharge 
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-950' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className={`w-4 h-4 ${isNightSurcharge ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold">{isHindi ? 'रात्रि किराया (+25%)' : 'Night Service (+25%)'}</div>
                  <div className="text-[10px] text-slate-500">{isHindi ? 'रात 10 बजे से सुबह 6 बजे' : '10:00 PM - 06:00 AM'}</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isNightSurcharge}
                onChange={() => {}}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Luggage Bag Extra */}
            <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Luggage className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="text-xs font-bold">{isHindi ? 'भारी सामान बैग' : 'Heavy Luggage'}</div>
                  <div className="text-[10px] text-slate-500">+₹10 / {isHindi ? 'बड़ा बैग' : 'bag'}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setLuggageBagsCount(Math.max(0, luggageBagsCount - 1))}
                  className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                >
                  -
                </button>
                <span className="text-xs font-bold w-4 text-center">{luggageBagsCount}</span>
                <button
                  onClick={() => setLuggageBagsCount(Math.min(5, luggageBagsCount + 1))}
                  className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 4. Split Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-700/80 pb-2">
              <span>{isHindi ? 'कुल सवारी किराया (Total Fare):' : 'Total Ride Fare:'}</span>
              <span className="text-base font-black text-amber-400">₹{totalTripFare}</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-300 block">
                  {isHindi ? 'प्रति व्यक्ति देय राशि (Per Person Share):' : 'Each Passenger Pays:'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white flex items-center gap-1">
                  <span>₹{perPersonShare}</span>
                  <span className="text-xs font-medium text-emerald-400">/ {isHindi ? 'सवारी' : 'seat'}</span>
                </span>
              </div>

              {/* Exact Coin Advisory */}
              <div className="text-right">
                <div className="text-[10px] text-slate-400">{isHindi ? 'छुट्टे पैसे की जरूरत:' : 'Exact Coins/Notes:'}</div>
                <div className="text-xs font-bold text-amber-300 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700 mt-1 inline-block">
                  {perPersonShare % 10 === 0 ? `₹${perPersonShare} नोट` : `₹${Math.floor(perPersonShare / 10) * 10} + ₹${perPersonShare % 10} सिक्का`}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Dynamic Driver UPI QR Code Generator */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-600" />
                <span>{isHindi ? 'चालक यूपीआई क्यूआर कोड' : 'Driver Online UPI QR'}</span>
              </span>
              <button
                onClick={() => setShowDriverUpiEdit(!showDriverUpiEdit)}
                className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
              >
                {showDriverUpiEdit ? (isHindi ? 'हो गया' : 'Done') : (isHindi ? 'UPI आईडी बदलें' : 'Change UPI')}
              </button>
            </div>

            {/* Editable Driver UPI ID */}
            {showDriverUpiEdit && (
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-300 text-xs">
                <input
                  type="text"
                  value={customDriverUpiId}
                  onChange={(e) => setCustomDriverUpiId(e.target.value)}
                  placeholder="driver@okaxis or 98371xxxxx@ybl"
                  className="flex-1 bg-transparent outline-none font-mono text-slate-800 text-xs"
                />
              </div>
            )}

            {/* SVG Crisp QR Code Representation */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border-2 border-slate-900 shadow-md flex flex-col items-center justify-center relative">
              {/* Center Logo Badge */}
              <div className="absolute w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-white shadow-md z-10">
                ₹{perPersonShare}
              </div>

              {/* Custom SVG QR Code pattern */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                {/* 3 Corner Finder Patterns */}
                <rect x="5" y="5" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="11" y="11" width="12" height="12" fill="currentColor" />

                <rect x="71" y="5" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="77" y="11" width="12" height="12" fill="currentColor" />

                <rect x="5" y="71" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="11" y="77" width="12" height="12" fill="currentColor" />

                {/* Data Matrix Dots */}
                <circle cx="36" cy="12" r="3" fill="currentColor" />
                <circle cx="48" cy="12" r="3" fill="currentColor" />
                <circle cx="60" cy="12" r="3" fill="currentColor" />
                <circle cx="42" cy="24" r="3" fill="currentColor" />
                <circle cx="54" cy="24" r="3" fill="currentColor" />
                
                <circle cx="12" cy="42" r="3" fill="currentColor" />
                <circle cx="24" cy="42" r="3" fill="currentColor" />
                <circle cx="24" cy="54" r="3" fill="currentColor" />
                
                <circle cx="76" cy="42" r="3" fill="currentColor" />
                <circle cx="88" cy="42" r="3" fill="currentColor" />
                <circle cx="76" cy="54" r="3" fill="currentColor" />
                <circle cx="88" cy="54" r="3" fill="currentColor" />

                <circle cx="42" cy="76" r="3" fill="currentColor" />
                <circle cx="54" cy="76" r="3" fill="currentColor" />
                <circle cx="42" cy="88" r="3" fill="currentColor" />
                <circle cx="66" cy="88" r="3" fill="currentColor" />
                <circle cx="78" cy="76" r="3" fill="currentColor" />
                <circle cx="88" cy="88" r="3" fill="currentColor" />
              </svg>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-600 bg-white py-1.5 px-3 rounded-xl border border-slate-200">
              <span className="truncate max-w-[200px]">{customDriverUpiId}</span>
              <button
                onClick={handleCopyUpi}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Copy UPI ID"
              >
                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Direct One-Tap Pay Links (PhonePe / GPay / Paytm) */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <a
                href={upiPayUrl}
                className="py-2 px-1 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-[11px] shadow-2xs flex items-center justify-center gap-1 transition-transform active:scale-95"
              >
                <span>PhonePe</span>
              </a>
              <a
                href={upiPayUrl}
                className="py-2 px-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-2xs flex items-center justify-center gap-1 transition-transform active:scale-95"
              >
                <span>GPay</span>
              </a>
              <a
                href={upiPayUrl}
                className="py-2 px-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] shadow-2xs flex items-center justify-center gap-1 transition-transform active:scale-95"
              >
                <span>Paytm</span>
              </a>
            </div>

            {/* Soundbox Confirmation Alert Simulator */}
            <button
              onClick={handleSimulateSoundbox}
              disabled={isSoundboxPlaying}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                isSoundboxPlaying
                  ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>
                {isSoundboxPlaying 
                  ? (isHindi ? 'साउंडबॉक्स बोल रहा है...' : 'Soundbox Speaking...') 
                  : (isHindi ? '🔊 साउंडबॉक्स वॉयस अलर्ट बजाएं (₹' + perPersonShare + ')' : '🔊 Test Soundbox Voice Confirmation')}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHindi ? '100% सुरक्षित एनपीसीआई यूपीआई' : 'NPCI UPI Compliant'}</span>
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
