// Crystal-Clear Audio Chimes & Hindi Voice Engine for E-Rahi Bareilly
// Designed for maximum clarity and accessibility for both educated & non-lettered commuters and drivers.

import { AppLanguage } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a clean, pleasant, studio-quality harmonic chime
 * 'fare': Bright, cheerful confirmation chime (C5 -> E5 -> G5)
 * 'alert': Clear dual-tone caution alert (D5 -> A5)
 * 'success': Warm single-tone arrival bell
 */
export function playCleanChime(type: 'fare' | 'alert' | 'success' = 'fare'): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'fare') {
      // 3-note melodic arpeggio (C5: 523Hz -> E5: 659Hz -> G5: 784Hz)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.08;
        const stopTime = startTime + 0.35;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        // Smooth attack & decay to prevent audio pops
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(stopTime);
      });
    } else if (type === 'alert') {
      // Dual-tone caution bell with soft harmonic overtone
      const freqs = [587.33, 880.00];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.12;
        const stopTime = startTime + 0.4;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(stopTime);
      });
    } else {
      // Warm single harmonic bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}

// Backward compatibility alias
export function playHazardWarningChime(): void {
  playCleanChime('alert');
}

/**
 * Triggers mobile hardware vibration buzz (Haptic Feedback)
 */
export function triggerHapticBuzz(pattern: number | number[] = [200, 100, 200]): boolean {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      return navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibration API error:', e);
    }
  }
  return false;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * Gets the clearest, highest-fidelity English voice available on the user's browser/device.
 * Prioritizes natural, neural, and studio voices and strictly excludes Hindi/foreign TTS engines.
 */
function getBestEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices || voices.length === 0) return null;

  // Filter for genuine English voices, strictly excluding Hindi engines
  const englishVoices = voices.filter(v => 
    v.lang.toLowerCase().startsWith('en') && 
    !v.name.toLowerCase().includes('hindi')
  );

  if (englishVoices.length === 0) {
    // Fallback: any voice starting with en
    const anyEn = voices.find(v => v.lang.toLowerCase().startsWith('en'));
    return anyEn || null;
  }

  // 1. Natural / Neural / High-clarity voices (Edge Natural, Google US/UK, Siri, Samantha, Daniel)
  const premiumVoice = englishVoices.find(v => {
    const name = v.name.toLowerCase();
    return (
      name.includes('natural') || 
      name.includes('neural') ||
      name.includes('google us english') ||
      name.includes('google uk english') ||
      name.includes('samantha') || 
      name.includes('daniel') ||
      name.includes('karen') ||
      name.includes('alex') ||
      name.includes('serena') ||
      name.includes('oliver') ||
      name.includes('ava')
    );
  });
  if (premiumVoice) return premiumVoice;

  // 2. High-compatibility standard US / UK voices
  const standardClearVoice = englishVoices.find(v => 
    v.lang === 'en-US' || v.lang === 'en-GB' || v.lang === 'en_US' || v.lang === 'en_GB'
  );
  if (standardClearVoice) return standardClearVoice;

  return englishVoices[0];
}

/**
 * Gets the best available Hindi voice on the user's phone or computer with maximum clarity
 */
function getBestHindiVoice(): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices || voices.length === 0) return null;
  
  // 1. Natural, neural, or high-fidelity Hindi voices
  const premiumHindi = voices.find(v => {
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();
    return (
      (lang.startsWith('hi') || lang.includes('hi-in') || lang.includes('hi_in')) &&
      (name.includes('google') || name.includes('natural') || name.includes('swara') || name.includes('kalpana') || name.includes('lekha') || name.includes('neural'))
    );
  });
  if (premiumHindi) return premiumHindi;

  // 2. Any voice explicitly tagged with Hindi language
  const hindiVoices = voices.filter(v => {
    const lang = v.lang.toLowerCase();
    const name = v.name.toLowerCase();
    return lang.startsWith('hi') || name.includes('hindi');
  });
  if (hindiVoices.length > 0) return hindiVoices[0];
  
  // 3. Fallback to Indian English or Indian Regional TTS engine which understands Hindi phonetics
  const inVoice = voices.find(v => v.lang.toLowerCase().includes('in') && !v.lang.toLowerCase().startsWith('en-us'));
  return inVoice || null;
}

/**
 * Prepares text for speech synthesis:
 * - Strips emojis and special symbols that cause speech engines to stumble or pronounce "emoji"
 * - Converts abbreviations (mins, km, km/h, etc.) to full conversational words for crystal clear audio
 */
function cleanTextForSpeech(text: string, language: string): string {
  // Strip emojis and non-speech symbols
  let cleaned = text
    .replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{1F100}-\u{1F1FF}]/gu, '')
    .replace(/[🟢🔴🚨⚠️🛺📍➔↓✓✕⭐★•\(\)\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (language === 'en') {
    cleaned = cleaned
      .replace(/\b(\d+)\s*mins?\b/gi, '$1 minutes')
      .replace(/\b(\d+)\s*km\b/gi, '$1 kilometers')
      .replace(/\b(\d+)\s*km\/h\b/gi, '$1 kilometers per hour')
      .replace(/\b(\d+)\s*m\b/gi, '$1 meters')
      .replace(/₹\s*(\d+)/g, '$1 rupees')
      .replace(/\bRs\.?\s*(\d+)/gi, '$1 rupees')
      .replace(/\+(\d+)/g, 'plus $1')
      .replace(/\s*\/\s*/g, ' or ')
      .replace(/\bmin\b/gi, 'minute')
      .replace(/\bsec\b/gi, 'second')
      .replace(/\best\b/gi, 'estimated');
  }

  return cleaned;
}

/**
 * Speaks a clear, natural voice announcement in English or Hindi/Urdu.
 * Configured with crystal-clear pronunciation, natural pauses, and native voice selection.
 */
export function speakCleanVoice(
  text: string, 
  language: AppLanguage | string = 'hi',
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported on this device.');
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const cleanText = cleanTextForSpeech(text, language);
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (language === 'en') {
      const enVoice = getBestEnglishVoice();
      if (enVoice) {
        utterance.voice = enVoice;
        utterance.lang = enVoice.lang || 'en-US';
      } else {
        utterance.lang = 'en-US';
      }
      // Pacing calibrated for maximum English intelligibility
      utterance.rate = 0.93;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
    } else if (language === 'ur') {
      utterance.lang = 'ur-PK';
      const hiVoice = getBestHindiVoice();
      if (hiVoice) utterance.voice = hiVoice;
      utterance.rate = 0.90;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;
    } else {
      utterance.lang = 'hi-IN';
      const hiVoice = getBestHindiVoice();
      if (hiVoice) utterance.voice = hiVoice;
      utterance.rate = 0.90;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Voice synthesis error:', err);
    if (onEnd) onEnd();
  }
}

/**
 * Stop any currently playing voice
 */
export function stopVoice(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Announces Bareilly Fare in simple, crystal-clear Hindi words
 * e.g. "नकटिया से श्यामगंज: किराया दस रुपये प्रति सवारी।"
 */
export function speakBareillyFare(
  originClean: string,
  destClean: string,
  fareRupees: number,
  passengers: number = 1,
  rideType: 'shared' | 'reserve' = 'shared',
  onStart?: () => void,
  onEnd?: () => void
): void {
  // Play bright cash register chime first
  playCleanChime('fare');
  triggerHapticBuzz([80, 50, 80]);

  let text = '';
  if (rideType === 'reserve') {
    text = `${originClean} से ${destClean}। पूरी गाड़ी रिजर्व का किराया ${fareRupees} रुपये है।`;
  } else if (passengers > 1) {
    text = `${originClean} से ${destClean}। ${passengers} सवारी का कुल किराया ${fareRupees} रुपये है। प्रति सवारी दर ${Math.round(fareRupees / passengers)} रुपये है।`;
  } else {
    text = `${originClean} से ${destClean}। एक सवारी का किराया ${fareRupees} रुपये है।`;
  }

  speakCleanVoice(text, 'hi', onStart, onEnd);
}

/**
 * Combined Proximity Alert: Plays audio chime, triggers mobile haptic buzz, and speaks voice announcement
 */
export function triggerProximityHazardAlert(hazardName: string, language: AppLanguage | string = 'hi'): void {
  playCleanChime('alert');
  triggerHapticBuzz([250, 120, 250]);

  let text = `सावधान! 200 मीटर आगे ${hazardName} पर भारी जाम है।`;
  if (language === 'ur') {
    text = `خبردار! آگے ${hazardName} پر ٹریفک جام ہے۔`;
  } else if (language === 'en') {
    text = `Attention! Traffic jam 200 meters ahead at ${hazardName}.`;
  }

  speakCleanVoice(text, language);
}

let sirenOscillator: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenInterval: any = null;

/**
 * Starts a loud, piercing emergency siren alarm (alternating police tone) to deter attackers and attract help
 */
export function playEmergencySiren(): void {
  try {
    stopEmergencySiren();
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(700, ctx.currentTime);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    sirenOscillator = osc;
    sirenGain = gain;

    let isHigh = false;
    sirenInterval = setInterval(() => {
      if (sirenOscillator && ctx.state === 'running') {
        const nextFreq = isHigh ? 650 : 960;
        sirenOscillator.frequency.setTargetAtTime(nextFreq, ctx.currentTime, 0.08);
        isHigh = !isHigh;
        triggerHapticBuzz([300, 100]);
      }
    }, 400);
  } catch (err) {
    console.warn('Failed to start emergency siren:', err);
  }
}

/**
 * Stops the emergency siren alarm
 */
export function stopEmergencySiren(): void {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (sirenGain && audioCtx) {
    try {
      sirenGain.gain.setValueAtTime(0, audioCtx.currentTime);
    } catch (e) {}
  }
  if (sirenOscillator) {
    try {
      sirenOscillator.stop();
      sirenOscillator.disconnect();
    } catch (e) {}
    sirenOscillator = null;
  }
  sirenGain = null;
}

/**
 * High-resonance piercing emergency chime (dual-tone harmonic warning)
 */
export function playEmergencyChimeAlert(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // 2-pulse urgent attention tone: 880Hz (A5) -> 1318.5Hz (E6)
    [880.0, 1318.51].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.14;
      const stopTime = startTime + 0.32;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(stopTime);
    });
  } catch (e) {
    console.warn('Emergency chime error:', e);
  }
}

/**
 * Dedicated, authoritative Hindi Emergency Voice Broadcaster
 * Synthesizes clear, perfectly enunciated Hindi instructions for all SOS states.
 */
export function speakHindiSosAlert(
  state: 'countdown' | 'dispatched' | 'cancelled' | 'deactivated' | 'test' | 'shutdown' | 'power_restored',
  options?: { count?: number; guardianName?: string }
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();

    let text = '';
    if (state === 'countdown') {
      const n = options?.count ?? 3;
      if (n === 3) {
        text = 'सावधान! तीन! आपातकालीन एसओएस अलर्ट भेजा जा रहा है।';
      } else if (n === 2) {
        text = 'दो!';
      } else if (n === 1) {
        text = 'एक!';
      } else {
        text = 'अलर्ट भेजा जा रहा है...';
      }
    } else if (state === 'dispatched') {
      playEmergencyChimeAlert();
      triggerHapticBuzz([300, 100, 300, 100, 500]);
      const name = options?.guardianName ? options.guardianName : 'आपके पति और परिवार';
      text = `सावधान! आपातकालीन सुरक्षा अलर्ट सक्रिय हो चुका है। आपकी लाइव जीपीएस लोकेशन और गूगल मैप्स लिंक ${name} को व्हाट्सएप पर भेज दी गई है। सहायता पहुँचने तक सुरक्षित स्थान पर रहें।`;
    } else if (state === 'cancelled') {
      playCleanChime('success');
      text = 'एसओएस अलर्ट रद्द कर दिया गया है। आप सुरक्षित हैं।';
    } else if (state === 'deactivated') {
      playCleanChime('success');
      text = 'सुरक्षा अलर्ट बंद कर दिया गया है। आप अब सुरक्षित हैं।';
    } else if (state === 'shutdown') {
      playCleanChime('alert');
      const name = options?.guardianName ? options.guardianName : 'आपके पति';
      text = `सावधान! फोन बंद होने से पहले आपकी अंतिम लाइव लोकेशन और गूगल मैप्स लिंक ${name} को व्हाट्सएप पर स्वचालित रूप से भेज दी गई है।`;
    } else if (state === 'power_restored') {
      playCleanChime('success');
      const name = options?.guardianName ? options.guardianName : 'आपके पति';
      text = `फोन पुनः चालू हो चुका है। आपकी वर्तमान लाइव लोकेशन और सुरक्षित स्थिति ${name} को व्हाट्सएप पर भेज दी गई है।`;
    } else if (state === 'test') {
      playEmergencyChimeAlert();
      text = 'यह ई-राही का आपातकालीन सुरक्षा ऑडियो टेस्ट है। ध्वनि और हिंदी उद्घोषणा बिल्कुल स्पष्ट काम कर रही है। संकट के समय एसओएस बटन दबाते ही यह अलर्ट तुरंत बजेगा।';
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    const hiVoice = getBestHindiVoice();
    if (hiVoice) {
      utterance.voice = hiVoice;
    }
    // Rate at 0.88 for crystal clarity and authoritative cadence
    utterance.rate = 0.88;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Hindi SOS speech error:', err);
  }
}

let distressInterval: any = null;
let isDistressPlaying = false;

/**
 * Loud Vocal Hindi Distress Call ("बचाओ! पुलिस को बुलाओ! Help!")
 * Loops until stopped to attract public assistance or scare away perpetrators.
 */
export function playHindiDistressCall(): void {
  stopHindiDistressCall();
  isDistressPlaying = true;

  const phrase = 'बचाओ! पुलिस को बुलाओ! आपातकालीन सहायता चाहिए! Help! Help!';
  
  const speakOnce = () => {
    if (!isDistressPlaying) return;
    playEmergencyChimeAlert();
    triggerHapticBuzz([400, 150, 400]);

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'hi-IN';
    const hiVoice = getBestHindiVoice();
    if (hiVoice) utterance.voice = hiVoice;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    utterance.onend = () => {
      if (isDistressPlaying) {
        distressInterval = setTimeout(speakOnce, 1200);
      }
    };
    utterance.onerror = () => {
      if (isDistressPlaying) {
        distressInterval = setTimeout(speakOnce, 2000);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  speakOnce();
}

/**
 * Stops looping Hindi distress vocal alarm
 */
export function stopHindiDistressCall(): void {
  isDistressPlaying = false;
  if (distressInterval) {
    clearTimeout(distressInterval);
    distressInterval = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

