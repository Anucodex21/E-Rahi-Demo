import React, { useState, useRef, useEffect } from "react";
import { AppLanguage } from "../types";
import { Mic } from "lucide-react";

interface VoiceFloatingButtonProps {
  language: AppLanguage;
  onClick: () => void;
}

/**
 * Floating Action Button: Premium Circular Rahi Assistant
 * GPU-accelerated frictionless drag with magnetic edge docking & executive finish.
 */
export const VoiceFloatingButton: React.FC<VoiceFloatingButtonProps> = ({
  language,
  onClick,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const posRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    buttonX: number;
    buttonY: number;
    moved: boolean;
  }>({
    startX: 0,
    startY: 0,
    buttonX: 0,
    buttonY: 0,
    moved: false,
  });

  // Initialize position in bottom-right corner safely
  useEffect(() => {
    const updateDefaultPos = () => {
      const buttonSize = 58;
      const margin = 20;
      const defaultX = Math.max(margin, window.innerWidth - buttonSize - margin);
      // Position above bottom tab bar on mobile, comfortable bottom-right on desktop
      const defaultY = Math.max(80, window.innerHeight - buttonSize - (window.innerWidth < 768 ? 96 : 36));
      setPosition({ x: defaultX, y: defaultY });
      posRef.current = { x: defaultX, y: defaultY };
    };

    updateDefaultPos();
    window.addEventListener("resize", updateDefaultPos);
    return () => window.removeEventListener("resize", updateDefaultPos);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      buttonX: rect.left,
      buttonY: rect.top,
      moved: false,
    };
    isDraggingRef.current = true;
    setIsDragging(true);

    if (buttonRef.current) {
      buttonRef.current.style.transition = "none";
    }

    buttonRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDraggingRef.current || !buttonRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    if (!dragStartRef.current.moved && (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4)) {
      dragStartRef.current.moved = true;
    }

    if (dragStartRef.current.moved) {
      const buttonSize = 58;
      const nextX = Math.min(
        Math.max(8, dragStartRef.current.buttonX + deltaX),
        window.innerWidth - buttonSize - 8
      );
      const nextY = Math.min(
        Math.max(64, dragStartRef.current.buttonY + deltaY),
        window.innerHeight - buttonSize - 20
      );

      posRef.current = { x: nextX, y: nextY };
      // Direct GPU transform bypasses React render cycle for instant 120fps fluid response
      buttonRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      buttonRef.current?.releasePointerCapture(e.pointerId);
    } catch {}

    // Tap/Click without drag opens assistant
    if (!dragStartRef.current.moved) {
      onClick();
      return;
    }

    // Professional magnetic edge docking
    const buttonSize = 58;
    const edgeMargin = 16;
    const currentX = posRef.current.x;
    const currentY = posRef.current.y;

    const isLeftHalf = currentX + buttonSize / 2 < window.innerWidth / 2;
    const targetX = isLeftHalf ? edgeMargin : window.innerWidth - buttonSize - edgeMargin;

    // Keep within safe vertical bounds (below top navbar and above bottom mobile tab bar)
    const minY = 72;
    const maxY = window.innerHeight - buttonSize - (window.innerWidth < 768 ? 96 : 32);
    const targetY = Math.min(Math.max(minY, currentY), Math.max(minY, maxY));

    posRef.current = { x: targetX, y: targetY };
    setPosition({ x: targetX, y: targetY });

    if (buttonRef.current) {
      buttonRef.current.style.transition =
        "transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.15), box-shadow 0.25s ease, filter 0.25s ease";
      buttonRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
    }
  };

  return (
    <button
      ref={buttonRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        left: 0,
        top: 0,
        transform: position
          ? `translate3d(${position.x}px, ${position.y}px, 0)`
          : "translate3d(calc(100vw - 76px), calc(100vh - 140px), 0)",
        touchAction: "none",
        willChange: isDragging ? "transform" : "auto",
      }}
      className={`fixed z-50 group flex items-center justify-center w-[54px] h-[54px] sm:w-[58px] sm:h-[58px] rounded-full select-none cursor-grab active:cursor-grabbing ${
        isDragging
          ? "scale-[1.08] shadow-[0_20px_40px_-4px_rgba(245,158,11,0.45),0_12px_24px_-4px_rgba(0,0,0,0.25)] ring-4 ring-amber-400/40"
          : "hover:scale-[1.05] active:scale-[0.96] shadow-[0_12px_32px_-4px_rgba(245,158,11,0.32),0_6px_16px_-2px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_38px_-4px_rgba(245,158,11,0.42),0_8px_20px_-2px_rgba(0,0,0,0.16)]"
      }`}
      title={
        language === "hi"
          ? "राही असिस्टेंट • बोलकर पूछें (स्क्रीन पर कहीं भी ड्रैग करें)"
          : "Rahi Assistant • Tap to speak (Drag freely anywhere)"
      }
      aria-label="Rahi Assistant"
    >
      {/* Outer Glow Halo Ring */}
      <span className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 opacity-90 group-hover:opacity-100 transition-opacity blur-[1px]"></span>

      {/* Main Glassmorphic Circular Body */}
      <div className="relative w-full h-full rounded-full bg-white p-1 border-2 border-white/90 shadow-inner flex items-center justify-center overflow-hidden">
        {/* Crisp App Logo */}
        <img
          src="/icon.svg"
          alt="Rahi Assistant Logo"
          className="w-full h-full object-cover rounded-full pointer-events-none drop-shadow-xs"
          draggable={false}
        />

        {/* Subtle Specular Glass Highlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/35 via-transparent to-black/10 pointer-events-none" />

        {/* Live Active Voice Status Dot */}
        <span className="absolute top-1 right-1 flex h-2.5 w-2.5 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white shadow-2xs"></span>
        </span>

        {/* Micro Voice Mic Indicator Badge */}
        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-slate-900 border-1.5 border-white text-amber-400 flex items-center justify-center shadow-md pointer-events-none group-hover:scale-110 transition-transform">
          <Mic className="w-2.5 h-2.5 stroke-[2.5]" />
        </div>
      </div>
    </button>
  );
};



