import React from 'react';
import { X, Navigation, IndianRupee, ShieldAlert, Building2, BedDouble, CheckCircle2, Sparkles, Compass } from 'lucide-react';
import { AppLanguage } from '../types';

interface SimpleExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: AppLanguage;
  onSelectTransit: () => void;
  onSelectServices: () => void;
}

export const SimpleExplainerModal: React.FC<SimpleExplainerModalProps> = ({
  isOpen,
  onClose,
  language = 'hi',
  onSelectTransit,
  onSelectServices
}) => {
  if (!isOpen) return null;

  const isHindi = language === 'hi';
  const isUrdu = language === 'ur';

  return (
    <div className="fixed inset-0 z-[2300] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/30 shrink-0">
              🛺
            </div>
            <div>
              <div className="inline-flex items-center gap-1 bg-amber-700/60 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-amber-100">
                <Sparkles className="w-3 h-3 text-amber-200" />
                {isHindi ? 'सरल गाइड' : isUrdu ? 'آسان گائیڈ' : 'Simple 1-Minute Guide'}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                {isHindi ? 'ई-राही का उपयोग कैसे करें?' : isUrdu ? 'ای-راہی کا استعمال کیسے کریں؟' : 'How to use E-Rahi India?'}
              </h2>
              <p className="text-xs text-amber-100 mt-0.5">
                {isHindi ? 'आपके शहर में आवागमन और आवश्यक सेवाओं का आसान साथी' : 'Your easy companion for daily commute & city utilities'}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Simple Points */}
        <div className="p-5 space-y-4">
          
          {/* 1. Fare & Best Route */}
          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-xs">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {isHindi ? '1. ई-रिक्शा का सही किराया व शॉर्टकट' : '1. Fair Fare & Shortcut Routes'}
              </h3>
              <p className="text-slate-600 mt-1 leading-relaxed">
                {isHindi 
                  ? 'कोई भी चालक आपसे मनमाना किराया न ले सके! दूरी के अनुसार तय सरकारी रेट (₹10 - ₹25) देखें और बाजार के जाम से बचाने वाले बाईपास रास्ते चुनें।'
                  : 'Check fixed, fair rates based on distance and navigate via smart alleyway detours that bypass crowded markets.'}
              </p>
            </div>
          </div>

          {/* 2. Turn-by-Turn Navigation */}
          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
              <Navigation className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {isHindi ? '2. हिंदी वॉइस नेविगेशन' : '2. Hindi Voice & Live Guidance'}
              </h3>
              <p className="text-slate-600 mt-1 leading-relaxed">
                {isHindi
                  ? 'रिक्शा में चलते समय "आवाज में सुनें" दबाएं। ऐप आपको बोलकर बताएगा कि आगे जाम है या नहीं और कौन सी गली से मुड़ना है।'
                  : 'Tap "Listen in Hindi" while in the rickshaw. The app speaks out live congestion notices and upcoming turn directions.'}
              </p>
            </div>
          </div>

          {/* 3. Hospitals & Hourly Lodges */}
          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-rose-50/70 border border-rose-200/80">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {isHindi ? '3. अस्पताल व 2-3 घंटे के लॉज' : '3. Hospitals & Hourly Stays for Exams'}
              </h3>
              <p className="text-slate-600 mt-1 leading-relaxed">
                {isHindi
                  ? 'बीमारी या समस्या लिखकर नजदीकी डॉक्टर खोजें। यदि आप परीक्षा या इंटरव्यू देने आए हैं, तो ₹99 से शुरू होने वाले घंटे के हिसाब से सुरक्षित कमरे खोजें।'
                  : 'Search by medical symptoms to find nearby specialists. For exam candidates, find verified hourly rooms near stations starting at ₹99.'}
              </p>
            </div>
          </div>

          {/* 4. Women Safety SOS */}
          <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 font-bold shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {isHindi ? '4. 1-क्लिक महिला सुरक्षा (SOS)' : '4. 1-Click Women Safety SOS'}
              </h3>
              <p className="text-slate-600 mt-1 leading-relaxed">
                {isHindi
                  ? 'किसी भी आपात स्थिति में ऊपर दिए गए लाल SOS बटन को दबाएं। यह तुरंत आपकी लाइव लोकेशन पुलिस (112/1090) और परिवार को साझा करता है।'
                  : 'Press the top red SOS button anytime to instantly broadcast your live GPS to UP Police (112/1090) and emergency contacts.'}
              </p>
            </div>
          </div>

          {/* Quick Choice Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={() => {
                onClose();
                onSelectTransit();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🛺</span>
              <span>{isHindi ? 'सवारी व रास्ता खोजें' : 'Find Ride & Route'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onSelectServices();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🏥</span>
              <span>{isHindi ? 'अस्पताल व सेवाएं देखें' : 'View City Services'}</span>
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer"
            >
              {isHindi ? 'ठीक है, समझ गया' : 'Got it, let\'s explore'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
