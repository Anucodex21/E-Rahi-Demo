import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Sparkles, ArrowRight } from 'lucide-react';

interface AutoSplashIntroProps {
  onComplete: () => void;
  cityName?: string;
}

export const AutoSplashIntro: React.FC<AutoSplashIntroProps> = ({ onComplete, cityName = 'Bareilly' }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fast, sleek 1.1s opening animation
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 200);
          return 100;
        }
        return prev + 10;
      });
    }, 90);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md text-white flex flex-col items-center justify-center p-6 select-none"
      >
        {/* Compact Rapido-Style Brand Card */}
        <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          
          {/* Subtle Glow Accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          {/* Quick Skip button at corner */}
          <button
            onClick={onComplete}
            className="absolute top-3 right-3 text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Skip</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {/* Mini Running Rickshaw Animation */}
          <div className="relative w-40 h-20 flex items-center justify-center mb-3">
            {/* Speed dots / road */}
            <div className="absolute bottom-2 left-2 right-2 h-0.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="w-12 h-full bg-amber-400 rounded-full"
                animate={{ x: [-48, 160] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              />
            </div>

            {/* Driving Auto */}
            <motion.div
              animate={{
                y: [0, -2, 0, -1.5, 0]
              }}
              transition={{ repeat: Infinity, duration: 0.45, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <svg width="76" height="46" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Roof Canopy (Amber & Eco Green) */}
                <path d="M20 38 C 22 20, 35 14, 60 14 L 120 14 C 132 14, 142 22, 145 35 L 140 50 L 15 50 Z" fill="#F59E0B" />
                <path d="M 22 34 L 143 34 L 141 40 L 19 40 Z" fill="#10B981" />
                {/* Glass */}
                <path d="M 120 16 L 142 35 L 138 48 L 118 48 Z" fill="#67E8F9" opacity="0.85" />
                {/* Cabin */}
                <rect x="25" y="48" width="85" height="28" rx="6" fill="#0F172A" />
                <rect x="30" y="52" width="75" height="12" rx="3" fill="#1E293B" />
                {/* Front Apron */}
                <path d="M 110 48 L 142 48 L 136 74 L 110 74 Z" fill="#F59E0B" />
                {/* Headlight */}
                <circle cx="140" cy="58" r="4.5" fill="#FEF08A" />
                {/* Battery Box */}
                <rect x="52" y="70" width="38" height="10" rx="3" fill="#059669" />
                {/* Wheels */}
                <circle cx="126" cy="84" r="12" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
                <circle cx="126" cy="84" r="5" fill="#94A3B8" />
                <circle cx="42" cy="84" r="12" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
                <circle cx="42" cy="84" r="5" fill="#94A3B8" />
              </svg>
            </motion.div>
          </div>

          {/* Brand Name */}
          <div className="flex items-center gap-1.5 font-black text-xl tracking-tight text-white">
            <span>E-Rahi</span>
            <span className="text-amber-400">India</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded-md border border-emerald-500/30">
              EV
            </span>
          </div>

          <p className="text-xs text-slate-400 font-medium mt-1">
            Smart Transit • {cityName}
          </p>

          {/* Minimalist Progress Bar */}
          <div className="w-full mt-4">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mt-1.5">
              <span>Finding routes...</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
