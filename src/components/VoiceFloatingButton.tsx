import React from "react";
import { AppLanguage } from "../types";

interface VoiceFloatingButtonProps {
  language: AppLanguage;
  onClick: () => void;
}

/**
 * Floating Action Button: Google-Grade AI Voice Assistant
 * Gives users quick, familiar 1-tap voice access anywhere on mobile and desktop.
 */
export const VoiceFloatingButton: React.FC<VoiceFloatingButtonProps> = ({
  language,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 group flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/95 backdrop-blur-md text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.18)] border border-slate-200/90 hover:border-slate-300 hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer ring-1 ring-slate-900/5"
      title={
        language === "hi"
          ? "गूगल वॉयस असिस्टेंट • बोलकर खोजें (Google Voice Search)"
          : "Voice Assistant • Search with voice like Google"
      }
      aria-label="Google Voice Assistant"
    >
      {/* Google 4-Color Voice Mic Icon */}
      <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-50 border border-slate-100 shadow-2xs group-hover:bg-slate-100 transition-colors shrink-0">
        <svg
          className="w-4 h-4 sm:w-4.5 sm:h-4.5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z"
            fill="#4285F4"
          />
          <path
            d="M15.9 8.1C15.5 8.1 15.2 8.4 15.2 8.8V11C15.2 12.77 13.77 14.2 12 14.2C10.23 14.2 8.8 12.77 8.8 11V8.8C8.8 8.4 8.5 8.1 8.1 8.1C7.7 8.1 7.4 8.4 7.4 8.8V11C7.4 13.3 9.1 15.2 11.3 15.5V19H9.5C9.1 19 8.8 19.3 8.8 19.7C8.8 20.1 9.1 20.4 9.5 20.4H14.5C14.9 20.4 15.2 20.1 15.2 19.7C15.2 19.3 14.9 19 14.5 19H12.7V15.5C14.9 15.2 16.6 13.3 16.6 11V8.8C16.6 8.4 16.3 8.1 15.9 8.1Z"
            fill="#34A853"
          />
          <path
            d="M7.4 11C7.4 12.27 7.91 13.42 8.74 14.25L9.73 13.26C9.14 12.68 8.8 11.88 8.8 11H7.4Z"
            fill="#FBBC05"
          />
          <path
            d="M16.6 11H15.2C15.2 11.88 14.86 12.68 14.27 13.26L15.26 14.25C16.09 13.42 16.6 12.27 16.6 11Z"
            fill="#EA4335"
          />
        </svg>
        {/* Active pulse */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4285F4] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4285F4]"></span>
        </span>
      </div>

      {/* Text & Google 4-Color Waveform */}
      <div className="flex flex-col items-start text-left pr-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs sm:text-sm font-semibold tracking-tight text-slate-800 group-hover:text-slate-900 transition-colors">
            {language === "hi" ? "आवाज़ से पूछें" : "Voice Assistant"}
          </span>
          {/* Google Assistant 4 colored bouncing dots */}
          <div className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4] animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335] animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC05] animate-bounce [animation-delay:0s]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#34A853] animate-bounce [animation-delay:0.15s]"></span>
          </div>
        </div>
        <span className="text-[10px] text-slate-500 font-medium hidden sm:inline-block">
          {language === "hi"
            ? "गूगल वॉइस • रूट व किराया"
            : "Google-style voice search"}
        </span>
      </div>
    </button>
  );
};
