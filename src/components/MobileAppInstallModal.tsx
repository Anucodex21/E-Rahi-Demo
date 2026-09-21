import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Zap, 
  Battery, 
  Volume2, 
  WifiOff, 
  ExternalLink 
} from 'lucide-react';
import { AppLanguage } from '../types';

interface MobileAppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  onInstallClick?: () => void;
  deferredPromptAvailable: boolean;
}

export const MobileAppInstallModal: React.FC<MobileAppInstallModalProps> = ({
  isOpen,
  onClose,
  language,
  onInstallClick,
  deferredPromptAvailable
}) => {
  const [copied, setCopied] = useState(false);
  const [activeDeviceTab, setActiveDeviceTab] = useState<'android' | 'ios'>('android');

  if (!isOpen) return null;

  const appUrl = window.location.origin || 'https://ais-pre-4l63tng3tvaesmzpmb5dfe-851926359578.asia-southeast1.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🛺 E-Rahi India (ई-राही इंडिया) — Hyperlocal E-Rickshaw & Commuter Route Optimizer!\nInstall it on your phone now for fast navigation across India:\n${appUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-amber-600 flex items-center justify-center text-2xl shadow-md border-2 border-amber-300 font-black">
              🛺
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  Yes, E-Rahi is a Mobile App!
                </h2>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Install directly on your Android or iPhone without needing Play Store or App Store
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-slate-800">
          
          {/* Native 1-Click Install Button if Prompt Ready */}
          {deferredPromptAvailable && (
            <div className="bg-amber-50 border-2 border-amber-400 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
              <div>
                <div className="text-xs font-black text-amber-950 uppercase tracking-wide">
                  Instant Installation Available
                </div>
                <div className="text-xs text-amber-900 mt-0.5">
                  Tap below to add E-Rahi to your phone's home screen immediately
                </div>
              </div>
              <button
                onClick={() => {
                  if (onInstallClick) onInstallClick();
                  onClose();
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Install Now</span>
              </button>
            </div>
          )}

          {/* Device Tabs: Android vs iPhone */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              onClick={() => setActiveDeviceTab('android')}
              className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                activeDeviceTab === 'android'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🤖</span>
              <span>Android (Chrome / Samsung)</span>
            </button>
            <button
              onClick={() => setActiveDeviceTab('ios')}
              className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                activeDeviceTab === 'ios'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🍎</span>
              <span>iPhone / iPad (Safari)</span>
            </button>
          </div>

          {/* Android Steps */}
          {activeDeviceTab === 'android' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>How to Install on Android (Takes 5 seconds):</span>
              </div>
              <ol className="space-y-2 list-decimal list-inside text-slate-700 leading-relaxed">
                <li>
                  Open this link in <b>Google Chrome</b> on your phone.
                </li>
                <li>
                  Tap the <b>three dots menu (⋮)</b> in the top-right corner of Chrome.
                </li>
                <li>
                  Tap <b>"Install app"</b> or <b>"Add to Home screen"</b>.
                </li>
                <li>
                  Tap <b>"Install"</b>. The <b>ई-राही (E-Rahi)</b> icon will appear on your phone screen just like any Play Store app!
                </li>
              </ol>
            </div>
          )}

          {/* iOS Steps */}
          {activeDeviceTab === 'ios' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>How to Install on iPhone / iPad:</span>
              </div>
              <ol className="space-y-2 list-decimal list-inside text-slate-700 leading-relaxed">
                <li>
                  Open this link in <b>Safari</b> on your iPhone.
                </li>
                <li>
                  Tap the <b>Share icon</b> (square with an arrow pointing up at bottom of screen).
                </li>
                <li>
                  Scroll down the share sheet and tap <b>"Add to Home Screen"</b>.
                </li>
                <li>
                  Tap <b>"Add"</b> in the top right. E-Rahi opens in full-screen mode without browser tabs!
                </li>
              </ol>
            </div>
          )}

          {/* Open on Phone / QR Code Scan Section */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <QrCode className="w-4 h-4 text-amber-600" />
                <span>Open on Your Phone Right Now</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                Scan with Phone Camera
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Crisp High-Contrast QR Code image from public QR generator API */}
              <div className="p-2 bg-white border-2 border-slate-900 rounded-2xl shadow-sm shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(appUrl)}`}
                  alt="Scan QR code to install E-Rahi mobile app"
                  className="w-28 h-28 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-2 text-xs flex-1 w-full">
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Point your phone's camera at the QR code to open the mobile app immediately on your smartphone.
                </p>

                {/* Copy Link & WhatsApp Share */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all border border-slate-200"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                  </button>

                  <button
                    onClick={handleWhatsAppShare}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Why E-Rahi is Optimized for Mobile Phones */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Built Specifically for Bareilly Roads & Mobile Drivers:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <WifiOff className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Works Offline</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Maps & routes cache locally so spotty Kutubkhana network won't stop you.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Battery className="w-3.5 h-3.5 text-emerald-600" />
                  <span>64% Less Battery</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Distance-gated GPS prevents phone overheating on all-day shifts.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Voice Navigation</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Speaks Hindi & Urdu audio alerts so drivers never look down.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Zap className="w-3.5 h-3.5 text-rose-600" />
                  <span>No App Store Wait</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Updates instantly in the background with zero download size.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">E-Rahi Progressive Mobile App</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};
