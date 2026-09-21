import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Navigation } from 'lucide-react';

interface AutoRunningLoaderProps {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen' | 'inline' | 'floating-pill';
  cityName?: string;
}

export const AutoRunningLoader: React.FC<AutoRunningLoaderProps> = ({
  message = 'ई-राही रूट लोड हो रहा है...',
  subMessage,
  size = 'floating-pill',
  cityName
}) => {
  // If requested as fullscreen or floating-pill, render as a sleek Rapido-style floating badge
  if (size === 'fullscreen' || size === 'floating-pill') {
    return (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[3000] pointer-events-none px-4 w-full max-w-sm flex justify-center animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="bg-slate-950/92 backdrop-blur-md text-white border border-amber-500/30 shadow-2xl rounded-full px-4 py-2 flex items-center gap-3 w-auto">
          {/* Mini Rapido-style Running Auto Icon */}
          <div className="relative w-12 h-6 flex items-center justify-center shrink-0 overflow-hidden bg-slate-900 rounded-lg px-1 border border-slate-800">
            {/* Speed line */}
            <motion.div
              className="absolute bottom-1 left-0 right-0 h-0.5 bg-amber-400/40"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            />
            {/* Tiny Running Rickshaw */}
            <motion.div
              animate={{
                y: [0, -1, 0, -1, 0],
                x: [-1, 1, -1]
              }}
              transition={{ repeat: Infinity, duration: 0.4, ease: 'easeInOut' }}
            >
              <svg width="28" height="18" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 38 C 22 20, 35 14, 60 14 L 120 14 C 132 14, 142 22, 145 35 L 140 50 L 15 50 Z" fill="#F59E0B" />
                <path d="M 22 34 L 143 34 L 141 40 L 19 40 Z" fill="#10B981" />
                <path d="M 120 16 L 142 35 L 138 48 L 118 48 Z" fill="#67E8F9" />
                <rect x="25" y="48" width="85" height="28" rx="6" fill="#0F172A" />
                <path d="M 110 48 L 142 48 L 136 74 L 110 74 Z" fill="#F59E0B" />
                <circle cx="140" cy="58" r="5" fill="#FEF08A" />
                <circle cx="126" cy="84" r="12" fill="#334155" stroke="#0F172A" strokeWidth="4" />
                <circle cx="42" cy="84" r="12" fill="#334155" stroke="#0F172A" strokeWidth="4" />
              </svg>
            </motion.div>
          </div>

          {/* Text Message */}
          <div className="flex flex-col min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-amber-400 tracking-tight whitespace-nowrap">
                {message}
              </span>
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            </div>
            {subMessage && (
              <span className="text-[10px] text-slate-400 truncate max-w-[190px]">
                {subMessage}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inline compact size (e.g. Inside Route planner or widgets)
  return (
    <div className="w-full bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        {/* Tiny Rapido Auto Animation */}
        <div className="relative w-12 h-7 bg-white rounded-xl border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
          <motion.div
            className="absolute bottom-0.5 left-0 right-0 h-0.5 bg-amber-400/50"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          />
          <motion.div
            animate={{
              y: [0, -1.5, 0, -1, 0]
            }}
            transition={{ repeat: Infinity, duration: 0.4, ease: 'easeInOut' }}
          >
            <svg width="28" height="18" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 38 C 22 20, 35 14, 60 14 L 120 14 C 132 14, 142 22, 145 35 L 140 50 L 15 50 Z" fill="#F59E0B" />
              <path d="M 22 34 L 143 34 L 141 40 L 19 40 Z" fill="#10B981" />
              <path d="M 120 16 L 142 35 L 138 48 L 118 48 Z" fill="#67E8F9" />
              <rect x="25" y="48" width="85" height="28" rx="6" fill="#0F172A" />
              <path d="M 110 48 L 142 48 L 136 74 L 110 74 Z" fill="#F59E0B" />
              <circle cx="140" cy="58" r="5" fill="#FEF08A" />
              <circle cx="126" cy="84" r="12" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
              <circle cx="42" cy="84" r="12" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
            </svg>
          </motion.div>
        </div>

        <div>
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>{message}</span>
          </div>
          {subMessage && (
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium line-clamp-1">
              {subMessage} {cityName ? `• ${cityName}` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-md shrink-0">
        <Navigation className="w-3 h-3 animate-pulse" />
        <span>LIVE</span>
      </div>
    </div>
  );
};
