import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShieldAlert, 
  PhoneCall, 
  HeartHandshake, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  CheckCircle2, 
  Radio, 
  Phone, 
  Send, 
  MessageSquare, 
  Building2, 
  RefreshCw, 
  UserCheck, 
  Flame, 
  Search, 
  ArrowLeft, 
  Info, 
  Battery, 
  BatteryCharging, 
  BatteryWarning, 
  PowerOff, 
  Power, 
  Mic, 
  MicOff, 
  Sun, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  Users,
  Eye,
  Zap,
  Sparkles,
  AlertOctagon,
  Copy,
  Check,
  Share2
} from 'lucide-react';
import { AppLanguage, BareillyLocation, EmergencyContact, DevicePowerState, LastKnownLocationRecord } from '../types';
import { 
  EMERGENCY_HELPLINES, 
  getPoliceStationsForCity, 
  findNearestPoliceStation, 
  PoliceStation 
} from '../data/womenSafetyData';
import { 
  playEmergencySiren, 
  stopEmergencySiren, 
  speakCleanVoice, 
  stopVoice, 
  playCleanChime, 
  triggerHapticBuzz,
  playEmergencyChimeAlert,
  speakHindiSosAlert,
  playHindiDistressCall,
  stopHindiDistressCall
} from '../utils/audioAlerts';
import { 
  loadStoredContacts, 
  saveStoredContacts, 
  getLastKnownLocation, 
  setLastKnownLocation,
  buildSosDispatchMessage,
  buildPreShutdownMessage,
  buildDeviceRestoredMessage,
  buildLiveLocationShareMessage,
  openWhatsAppDirect,
  openSmsDirect
} from '../utils/safetyGuardian';
import { EmergencyContactsManager } from './EmergencyContactsManager';
import { SafetyGuardConfigSection } from './SafetyGuardConfigSection';

interface WomenSafetyPageProps {
  cityName: string;
  cityId: string;
  language?: AppLanguage;
  cityLocations?: BareillyLocation[];
  onBackToRide?: () => void;
  onNavigateToPoliceStation?: (lat: number, lng: number, name: string) => void;
}

export const WomenSafetyPage: React.FC<WomenSafetyPageProps> = ({
  cityName,
  cityId,
  language = 'hi',
  cityLocations = [],
  onBackToRide,
  onNavigateToPoliceStation
}) => {
  const isHindi = language === 'hi';
  const isUrdu = language === 'ur';

  // Navigation sub-tabs inside Safety Hub: 'sos' | 'contacts' | 'stations' | 'tools' | 'helplines'
  const [activeTab, setActiveTab] = useState<'sos' | 'contacts' | 'stations' | 'tools' | 'helplines'>('sos');

  // Emergency Contacts
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => loadStoredContacts());
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('erahi_sos_user_name') || 'Priya Sharma';
  });

  const primaryContact = useMemo(() => {
    return contacts.find(c => c.isPrimary) || contacts[0] || null;
  }, [contacts]);

  // GPS Live Tracking State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'locating' | 'ready' | 'error'>('locating');
  const [lastGpsAddress, setLastGpsAddress] = useState<string>('');

  // Device Battery & Power Monitoring State
  const [powerState, setPowerState] = useState<DevicePowerState>({
    batteryLevel: 78,
    isCharging: false,
    isCritical: false,
    isBatteryApiSupported: false,
    lastCheckedTime: new Date().toLocaleTimeString(),
    isOnline: navigator.onLine
  });

  // Pre-Shutdown Safeguard & Device Restored States
  const [showShutdownSimulationModal, setShowShutdownSimulationModal] = useState(false);
  const [isPreShutdownTriggered, setIsPreShutdownTriggered] = useState(false);
  const [isDeviceRestoredBanner, setIsDeviceRestoredBanner] = useState(false);
  const [restoredEventHandled, setRestoredEventHandled] = useState(false);
  const [lastDispatchedInfo, setLastDispatchedInfo] = useState<string | null>(null);

  // Automatic Switch-Off and Power-On Dispatch Preferences (User Configurable, On by default)
  const [autoDispatchOnSwitchOff, setAutoDispatchOnSwitchOff] = useState<boolean>(() => {
    return localStorage.getItem('erahi_auto_preshutdown') !== 'false';
  });
  const [autoDispatchOnPowerOn, setAutoDispatchOnPowerOn] = useState<boolean>(() => {
    return localStorage.getItem('erahi_auto_power_restored') !== 'false';
  });

  // Floating Toast / Alert for Automatic Dispatches
  const [autoDispatchNotification, setAutoDispatchNotification] = useState<{
    type: 'switch_off' | 'power_on';
    contactName: string;
    phone: string;
    time: string;
    googleMapsUrl: string;
    rawMessage?: string;
    contactPhone?: string;
  } | null>(null);

  // Prevent multiple duplicate dispatches per session mount
  const hasAutoDispatchedOnMountRef = useRef<boolean>(false);

  // SOS Trigger Countdown & Danger Mode
  const [isSosArmed, setIsSosArmed] = useState(false);
  const [isSosActive, setIsSosActive] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(3);
  const countdownTimerRef = useRef<any>(null);

  // Tools: Siren, Flashlight Strobe, Audio Proof Recorder, Fake Call
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isDistressVoiceActive, setIsDistressVoiceActive] = useState(false);
  const [isPlayingAudioTest, setIsPlayingAudioTest] = useState(false);
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingDurationSec, setRecordingDurationSec] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Fake Call State
  const [isFakeCallRinging, setIsFakeCallRinging] = useState(false);
  const [isFakeCallConnected, setIsFakeCallConnected] = useState(false);
  const [fakeCallTimer, setFakeCallTimer] = useState(0);
  const fakeCallIntervalRef = useRef<any>(null);

  // Police Stations & Search
  const [stationSearchQuery, setStationSearchQuery] = useState('');
  const [stationFilterType, setStationFilterType] = useState<'all' | 'mahila' | 'general'>('all');

  const [copiedLink, setCopiedLink] = useState(false);

  // 1. Initial Battery API Connection & Continuous Event Listener
  useEffect(() => {
    let batteryInstance: any = null;

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryInstance = battery;
        const updateBattery = () => {
          const level = Math.round(battery.level * 100);
          const charging = battery.charging;
          const isCritical = level <= 10 && !charging;

          setPowerState({
            batteryLevel: level,
            isCharging: charging,
            isCritical,
            isBatteryApiSupported: true,
            lastCheckedTime: new Date().toLocaleTimeString(),
            isOnline: navigator.onLine
          });

          // Auto-trigger Last Gasp protocol if battery hits <= 5%
          if (level <= 5 && !charging && !isPreShutdownTriggered) {
            handleTriggerPreShutdown('Automatic Battery Critical (<= 5%)');
          }
        };

        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      }).catch((e: any) => {
        console.warn('Battery API error:', e);
      });
    }

    // Network Online/Offline Listeners
    const handleOnline = () => {
      setPowerState(p => ({ ...p, isOnline: true }));
      // Device powered back on / reconnected
      checkDevicePowerRestored();
    };
    const handleOffline = () => {
      setPowerState(p => ({ ...p, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Page Lifecycle Pre-Shutdown Listener (beforeunload / pagehide)
    const handleBeforeUnload = () => {
      // Save last location snapshot before tab close or device power-down
      if (userCoords) {
        const record: LastKnownLocationRecord = {
          lat: userCoords.lat,
          lng: userCoords.lng,
          accuracyMeters: gpsAccuracy || 10,
          addressHint: lastGpsAddress || cityName,
          timestamp: new Date().toISOString(),
          batteryLevel: powerState.batteryLevel,
          reason: 'LOW_BATTERY_SHUTDOWN',
          dispatchedToContacts: contacts.map(c => c.phone)
        };
        setLastKnownLocation(record);
        localStorage.setItem('erahi_was_pre_shutdown', 'true');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      if (batteryInstance) {
        batteryInstance.removeEventListener('levelchange', () => {});
        batteryInstance.removeEventListener('chargingchange', () => {});
      }
    };
  }, [userCoords, gpsAccuracy, lastGpsAddress, powerState.batteryLevel, isPreShutdownTriggered, contacts]);

  // 2. Fetch Live GPS on Load
  const fetchLiveGps = (onSuccess?: (coords: { lat: number; lng: number }) => void) => {
    setGpsStatus('locating');
    if (!('geolocation' in navigator)) {
      setGpsStatus('error');
      const fallback = cityLocations[0] ? { lat: cityLocations[0].lat, lng: cityLocations[0].lng } : { lat: 28.3620, lng: 79.4200 };
      setUserCoords(fallback);
      setLastGpsAddress(cityLocations[0]?.name || cityName);
      if (onSuccess) onSuccess(fallback);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);
        setUserCoords({ lat, lng });
        setGpsAccuracy(acc);
        setGpsStatus('ready');

        // Closest landmark
        let closestName = cityName;
        let minD = 999999;
        cityLocations.forEach(loc => {
          const d = Math.hypot(loc.lat - lat, loc.lng - lng);
          if (d < minD) {
            minD = d;
            closestName = loc.name;
          }
        });
        setLastGpsAddress(`${closestName} (±${acc}m)`);
        if (onSuccess) onSuccess({ lat, lng });
      },
      (err) => {
        console.warn('GPS position error, using city default:', err);
        setGpsStatus('ready');
        const fallback = cityLocations[0] ? { lat: cityLocations[0].lat, lng: cityLocations[0].lng } : { lat: 28.3620, lng: 79.4200 };
        setUserCoords(fallback);
        setLastGpsAddress(cityLocations[0]?.name || cityName);
        if (onSuccess) onSuccess(fallback);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // 3. Check If Device Powered Back On from previous shutdown OR auto-dispatch on app open
  const checkDevicePowerRestored = () => {
    const wasShutdown = localStorage.getItem('erahi_was_pre_shutdown');
    if (wasShutdown === 'true' && !restoredEventHandled) {
      setIsDeviceRestoredBanner(true);
      fetchLiveGps((freshCoords) => {
        fetch('/api/emergency/device-restored', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName,
            coords: freshCoords,
            addressHint: lastGpsAddress || cityName,
            batteryLevel: powerState.batteryLevel
          })
        }).catch(e => console.warn(e));

        // Automatic dispatch to selected contact as soon as phone turns back on
        if (autoDispatchOnPowerOn) {
          const targetContact = primaryContact || contacts[0];
          if (targetContact) {
            handleSendDeviceRestoredUpdate(targetContact, freshCoords);
          }
        }
      });
    } else if (autoDispatchOnPowerOn && !hasAutoDispatchedOnMountRef.current) {
      // Automatic live location dispatch when app turns on (app on hote hi live location share)
      hasAutoDispatchedOnMountRef.current = true;
      fetchLiveGps((freshCoords) => {
        const targetContact = primaryContact || contacts[0];
        if (targetContact) {
          handleSendDeviceRestoredUpdate(targetContact, freshCoords);
        }
      });
    }
  };

  useEffect(() => {
    fetchLiveGps();
    checkDevicePowerRestored();
  }, []);

  // Police Stations Calculation
  const policeStations = useMemo(() => {
    const defaultLat = cityLocations[0]?.lat || 28.36;
    const defaultLng = cityLocations[0]?.lng || 79.42;
    return getPoliceStationsForCity(cityId, defaultLat, defaultLng);
  }, [cityId, cityLocations]);

  const filteredPoliceStations = useMemo(() => {
    return policeStations.filter(st => {
      const matchesQuery = 
        st.name.toLowerCase().includes(stationSearchQuery.toLowerCase()) ||
        st.hindiName.toLowerCase().includes(stationSearchQuery.toLowerCase()) ||
        st.address.toLowerCase().includes(stationSearchQuery.toLowerCase());
      if (!matchesQuery) return false;
      if (stationFilterType === 'mahila') return st.isMahilaThana;
      if (stationFilterType === 'general') return !st.isMahilaThana;
      return true;
    });
  }, [policeStations, stationSearchQuery, stationFilterType]);

  const nearestPolice = useMemo(() => {
    if (!userCoords) {
      return policeStations[0] ? { station: policeStations[0], distanceKm: 0.8, distanceMeters: 800 } : null;
    }
    return findNearestPoliceStation(userCoords.lat, userCoords.lng, policeStations);
  }, [userCoords, policeStations]);

  // Handle Save Contacts
  const handleSaveContacts = (updated: EmergencyContact[]) => {
    setContacts(updated);
    saveStoredContacts(updated);
  };

  const handleNameChange = (val: string) => {
    setUserName(val);
    localStorage.setItem('erahi_sos_user_name', val);
  };

  // SOS ARM & TRIGGER LOGIC (with 3-Second Countdown Window)
  const handleStartSosArm = () => {
    setIsSosArmed(true);
    setCountdownSeconds(3);
    triggerHapticBuzz([200, 100, 200]);
    // Start with clear Hindi countdown announcement
    speakHindiSosAlert('countdown', { count: 3 });

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
          executeSosDispatch();
          return 0;
        }
        const nextVal = prev - 1;
        triggerHapticBuzz([120]);
        speakHindiSosAlert('countdown', { count: nextVal });
        return nextVal;
      });
    }, 1000);
  };

  const handleCancelSosCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setIsSosArmed(false);
    setCountdownSeconds(3);
    speakHindiSosAlert('cancelled');
  };

  // Direct Instant Trigger without countdown
  const handleInstantSosDispatch = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setIsSosArmed(false);
    executeSosDispatch();
  };

  const executeSosDispatch = () => {
    setIsSosActive(true);
    setIsSosArmed(false);
    triggerHapticBuzz([400, 100, 400, 100, 600]);

    const targetCoords = userCoords || { lat: 28.3620, lng: 79.4200 };

    // Record last location
    const lastRec: LastKnownLocationRecord = {
      lat: targetCoords.lat,
      lng: targetCoords.lng,
      accuracyMeters: gpsAccuracy || 10,
      addressHint: lastGpsAddress || cityName,
      timestamp: new Date().toISOString(),
      batteryLevel: powerState.batteryLevel,
      reason: 'SOS_TRIGGER',
      dispatchedToContacts: contacts.map(c => c.phone)
    };
    setLastKnownLocation(lastRec);

    // Backend logging
    fetch('/api/emergency/sos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName,
        coords: targetCoords,
        addressHint: lastGpsAddress || cityName,
        batteryLevel: powerState.batteryLevel,
        isCharging: powerState.isCharging,
        contactsNotified: contacts.map(c => ({ name: c.name, phone: c.phone, relation: c.relationship }))
      })
    }).catch(e => console.warn(e));

    // Clear and authoritative Hindi voice broadcast
    const primary = primaryContact || contacts[0];
    const guardianLabel = primary ? `${primary.relationship} ${primary.name}` : undefined;
    speakHindiSosAlert('dispatched', { guardianName: guardianLabel });

    // Auto-open primary contact WhatsApp
    if (primary) {
      const msg = buildSosDispatchMessage({
        userName,
        lat: targetCoords.lat,
        lng: targetCoords.lng,
        accuracyMeters: gpsAccuracy || 10,
        addressHint: lastGpsAddress || cityName,
        batteryLevel: powerState.batteryLevel,
        isCharging: powerState.isCharging,
        contactName: primary.name,
        isHindi
      });
      openWhatsAppDirect(primary.phone, msg);
      setLastDispatchedInfo(`${primary.name} (${primary.phone})`);
    }
  };

  const handleDeactivateSos = () => {
    setIsSosActive(false);
    setIsSosArmed(false);
    if (isSirenActive) {
      stopEmergencySiren();
      setIsSirenActive(false);
    }
    if (isDistressVoiceActive) {
      stopHindiDistressCall();
      setIsDistressVoiceActive(false);
    }
    setIsStrobeActive(false);
    stopVoice();
    speakHindiSosAlert('deactivated');
  };

  // Dedicated Hindi Audio Test Handler
  const handlePlayAudioTest = () => {
    setIsPlayingAudioTest(true);
    speakHindiSosAlert('test');
    setTimeout(() => {
      setIsPlayingAudioTest(false);
    }, 6000);
  };

  // Toggle Hindi Distress Vocal Siren ("बचाओ! पुलिस को बुलाओ!")
  const handleToggleDistressVoice = () => {
    if (isDistressVoiceActive) {
      stopHindiDistressCall();
      setIsDistressVoiceActive(false);
    } else {
      if (isSirenActive) {
        stopEmergencySiren();
        setIsSirenActive(false);
      }
      playHindiDistressCall();
      setIsDistressVoiceActive(true);
    }
  };

  // PRE-SHUTDOWN ("LAST GASP") TRIGGER WITH AUTOMATIC DISPATCH
  const handleTriggerPreShutdown = (reasonText: string = 'Pre-Shutdown Safeguard', forceAutoSend: boolean = false) => {
    setIsPreShutdownTriggered(true);
    triggerHapticBuzz([200, 100, 200, 100, 400]);

    const targetCoords = userCoords || { lat: 28.3620, lng: 79.4200 };

    const record: LastKnownLocationRecord = {
      lat: targetCoords.lat,
      lng: targetCoords.lng,
      accuracyMeters: gpsAccuracy || 10,
      addressHint: lastGpsAddress || cityName,
      timestamp: new Date().toISOString(),
      batteryLevel: powerState.batteryLevel,
      reason: 'LOW_BATTERY_SHUTDOWN',
      dispatchedToContacts: contacts.map(c => c.phone)
    };
    setLastKnownLocation(record);
    localStorage.setItem('erahi_was_pre_shutdown', 'true');
    localStorage.setItem('erahi_pre_shutdown_time', new Date().toISOString());

    const targetContact = primaryContact || contacts[0];

    // Voice warning in clear Hindi
    speakHindiSosAlert('shutdown', { 
      guardianName: targetContact ? `${targetContact.relationship} ${targetContact.name}` : undefined 
    });

    const shouldAutoSend = autoDispatchOnSwitchOff || forceAutoSend;

    if (shouldAutoSend && targetContact) {
      const msg = buildPreShutdownMessage({
        userName,
        lat: targetCoords.lat,
        lng: targetCoords.lng,
        batteryLevel: powerState.batteryLevel,
        addressHint: lastGpsAddress || cityName,
        contactName: targetContact.name,
        isHindi
      });

      if (targetContact.notifyViaWhatsapp) {
        openWhatsAppDirect(targetContact.phone, msg);
      } else {
        openSmsDirect(targetContact.phone, msg);
      }

      const mapsUrl = `https://maps.google.com/?q=${targetCoords.lat.toFixed(6)},${targetCoords.lng.toFixed(6)}`;
      setAutoDispatchNotification({
        type: 'switch_off',
        contactName: targetContact.name,
        phone: targetContact.phone,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        googleMapsUrl: mapsUrl
      });
      setLastDispatchedInfo(`${targetContact.name} (फोन बंद होने से पहले अंतिम लोकेशन स्वतः भेजी गई)`);
    }

    setShowShutdownSimulationModal(true);
  };

  const handleDispatchPreShutdownMessage = (contact: EmergencyContact) => {
    const targetCoords = userCoords || { lat: 28.3620, lng: 79.4200 };
    const msg = buildPreShutdownMessage({
      userName,
      lat: targetCoords.lat,
      lng: targetCoords.lng,
      batteryLevel: powerState.batteryLevel,
      addressHint: lastGpsAddress || cityName,
      contactName: contact.name,
      isHindi
    });

    if (contact.notifyViaWhatsapp) {
      openWhatsAppDirect(contact.phone, msg);
    } else {
      openSmsDirect(contact.phone, msg);
    }
    setLastDispatchedInfo(`${contact.name} (Last Known Location)`);
  };

  // DEVICE RESTORED BROADCAST (Auto or Manual)
  const handleSendDeviceRestoredUpdate = (contact: EmergencyContact, overrideCoords?: { lat: number; lng: number }) => {
    const targetCoords = overrideCoords || userCoords || { lat: 28.3620, lng: 79.4200 };
    const msg = buildDeviceRestoredMessage({
      userName,
      lat: targetCoords.lat,
      lng: targetCoords.lng,
      batteryLevel: powerState.batteryLevel,
      addressHint: lastGpsAddress || cityName,
      contactName: contact.name,
      isHindi
    });

    openWhatsAppDirect(contact.phone, msg);
    localStorage.removeItem('erahi_was_pre_shutdown');
    setIsDeviceRestoredBanner(false);
    setRestoredEventHandled(true);

    const mapsUrl = `https://maps.google.com/?q=${targetCoords.lat.toFixed(6)},${targetCoords.lng.toFixed(6)}`;
    setAutoDispatchNotification({
      type: 'power_on',
      contactName: contact.name,
      phone: contact.phone,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      googleMapsUrl: mapsUrl,
      rawMessage: msg,
      contactPhone: contact.phone
    });

    speakHindiSosAlert('power_restored', { 
      guardianName: `${contact.relationship} ${contact.name}` 
    });

    setLastDispatchedInfo(`${contact.name} (फोन चालू होते ही लाइव लोकेशन स्वतः भेजी गई)`);
  };

  // Manual / Interactive simulation for Power-On automatic dispatch
  const handleSimulatePowerOnRestored = () => {
    localStorage.setItem('erahi_was_pre_shutdown', 'true');
    setRestoredEventHandled(false);
    setIsDeviceRestoredBanner(true);
    fetchLiveGps((freshCoords) => {
      const targetContact = primaryContact || contacts[0];
      if (targetContact) {
        handleSendDeviceRestoredUpdate(targetContact, freshCoords);
      }
    });
  };

  // Share Live Location directly on WhatsApp (Normal safe journey tracking)
  const handleShareLiveLocationWhatsApp = (chooseAnyContact: boolean = false) => {
    const coords = userCoords || { lat: 28.3620, lng: 79.4200 };
    const targetContact = !chooseAnyContact ? (primaryContact || contacts[0]) : null;
    const msg = buildLiveLocationShareMessage({
      userName: userName || 'Priya Sharma',
      lat: coords.lat,
      lng: coords.lng,
      accuracyMeters: gpsAccuracy || 10,
      addressHint: lastGpsAddress || cityName,
      batteryLevel: powerState.batteryLevel,
      contactName: targetContact ? targetContact.name : undefined,
      isHindi
    });

    const targetPhone = targetContact ? targetContact.phone : '';
    openWhatsAppDirect(targetPhone, msg);
    triggerHapticBuzz([100, 50, 150]);

    const mapsUrl = `https://maps.google.com/?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;
    setAutoDispatchNotification({
      type: 'power_on',
      contactName: targetContact ? targetContact.name : (isHindi ? 'WhatsApp संपर्क' : 'WhatsApp Contact'),
      phone: targetContact ? targetContact.phone : (isHindi ? 'सीधा शेयर' : 'Direct Share'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      googleMapsUrl: mapsUrl
    });

    setLastDispatchedInfo(`${targetContact ? targetContact.name : 'WhatsApp'} (${isHindi ? 'लाइव लोकेशन WhatsApp पर शेयर की गई' : 'Live location shared via WhatsApp'})`);
    setTimeout(() => {
      setAutoDispatchNotification(null);
    }, 6000);
  };

  // Share Emergency SOS distress message directly on WhatsApp
  const handleShareSosWhatsApp = (chooseAnyContact: boolean = false) => {
    const targetContact = !chooseAnyContact ? (primaryContact || contacts[0]) : null;
    const coords = userCoords || { lat: 28.3620, lng: 79.4200 };
    const msg = buildSosDispatchMessage({
      userName: userName || 'Priya Sharma',
      lat: coords.lat,
      lng: coords.lng,
      accuracyMeters: gpsAccuracy || 10,
      addressHint: lastGpsAddress || cityName,
      batteryLevel: powerState.batteryLevel,
      isCharging: powerState.isCharging,
      contactName: targetContact ? targetContact.name : undefined,
      isHindi
    });

    const targetPhone = targetContact ? targetContact.phone : '';
    openWhatsAppDirect(targetPhone, msg);
    triggerHapticBuzz([200, 100, 300]);

    const mapsUrl = `https://maps.google.com/?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;
    setAutoDispatchNotification({
      type: 'power_on',
      contactName: targetContact ? targetContact.name : 'WhatsApp',
      phone: targetContact ? targetContact.phone : 'SOS Share',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      googleMapsUrl: mapsUrl
    });

    setLastDispatchedInfo(`${targetContact ? targetContact.name : 'WhatsApp'} (SOS अलर्ट WhatsApp पर भेजा गया)`);
  };

  // Siren toggle
  const handleToggleSiren = () => {
    if (isSirenActive) {
      stopEmergencySiren();
      setIsSirenActive(false);
    } else {
      playEmergencySiren();
      setIsSirenActive(true);
      triggerHapticBuzz([200, 100, 200, 100, 400]);
    }
  };

  // Screen Flashlight Strobe
  const handleToggleStrobe = () => {
    setIsStrobeActive(prev => !prev);
  };

  // Audio Evidence Recorder
  const handleToggleAudioRecording = async () => {
    if (isRecordingAudio) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingAudio(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setRecordedAudioUrl(url);
          stream.getTracks().forEach(t => t.stop());
        };

        recorder.start();
        setIsRecordingAudio(true);
        setRecordingDurationSec(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingDurationSec(s => s + 1);
        }, 1000);
      } catch (err) {
        console.warn('Microphone permission error:', err);
        alert(isHindi ? 'माइक्रोफोन की अनुमति नहीं मिली।' : 'Microphone permission denied.');
      }
    }
  };

  // Fake Call
  const startFakeCall = () => {
    setIsFakeCallRinging(true);
    setIsFakeCallConnected(false);
    playCleanChime('alert');
    triggerHapticBuzz([400, 200, 400, 200]);
  };

  const answerFakeCall = () => {
    setIsFakeCallRinging(false);
    setIsFakeCallConnected(true);
    setFakeCallTimer(0);
    fakeCallIntervalRef.current = setInterval(() => {
      setFakeCallTimer(t => t + 1);
    }, 1000);

    const dialog = isHindi 
      ? `हाँ बेटा, मैं 2 मिनट में पुलिस चौकी के पास पहुँच रहा हूँ। तुम वहीं रुको, मैं आ गया।`
      : `Yes, I am reaching the police booth in 2 minutes. Stay right there.`;
    speakCleanVoice(dialog, language);
  };

  const stopFakeCall = () => {
    setIsFakeCallRinging(false);
    setIsFakeCallConnected(false);
    if (fakeCallIntervalRef.current) {
      clearInterval(fakeCallIntervalRef.current);
      fakeCallIntervalRef.current = null;
    }
    stopVoice();
  };

  const handleCopyLocation = () => {
    const lat = userCoords?.lat || 28.3620;
    const lng = userCoords?.lng || 79.4200;
    const link = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className={`space-y-4 ${isStrobeActive ? 'animate-pulse' : ''}`}>
      
      {/* 1. TOP HEADER & SYSTEM HEALTH */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {isHindi ? 'सुरक्षा गार्ड एवं आपातकालीन SOS' : isUrdu ? 'خواتین سیفٹی اور ایمرجنسی SOS' : 'Emergency SOS & Safety Guard'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isHindi ? '24/7 सक्रिय' : 'Guardian Active'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {cityName} • {isHindi ? 'लाइव GPS, WhatsApp ऑटो-शेयर, और फोन स्विच-ऑफ सुरक्षा' : 'Live GPS, WhatsApp auto-dispatch & pre-shutdown location guard'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={handlePlayAudioTest}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95 ${
                isPlayingAudioTest
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
              }`}
              title="Test clear Hindi SOS voice"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudioTest ? 'animate-bounce text-white' : 'text-rose-600'}`} />
              <span>
                {isPlayingAudioTest 
                  ? (isHindi ? 'हिंदी ऑडियो बज रहा है...' : 'Playing Hindi Alert...') 
                  : (isHindi ? '🔊 हिंदी आवाज टेस्ट' : '🔊 Test Hindi Audio')}
              </span>
            </button>

            {onBackToRide && (
              <button
                onClick={onBackToRide}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>{isHindi ? 'सवारी व नक्शे पर लौटें' : 'Back to Ride'}</span>
              </button>
            )}
          </div>
        </div>

        {/* System Health Matrix Bar: GPS Accuracy, Battery Level & Power Guard */}
        <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {/* GPS Status */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Radio className={`w-4 h-4 shrink-0 ${gpsStatus === 'ready' ? 'text-emerald-600' : 'text-amber-500 animate-pulse'}`} />
              <div className="truncate">
                <div className="font-bold text-slate-900 text-[11px] truncate">{lastGpsAddress || 'GPS Active'}</div>
                <div className="text-[10px] text-slate-500 font-medium">±{gpsAccuracy || 10}m Accuracy</div>
              </div>
            </div>
            <button
              onClick={() => fetchLiveGps()}
              className="text-rose-600 hover:text-rose-800 text-[10px] font-bold p-1 cursor-pointer shrink-0"
              title="Refresh GPS"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${gpsStatus === 'locating' ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Battery Status & Switch-Off Guard */}
          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
            powerState.isCritical 
              ? 'bg-rose-50 border-rose-300 text-rose-900' 
              : 'bg-slate-50 border-slate-200/80 text-slate-800'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              {powerState.isCharging ? (
                <BatteryCharging className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : powerState.isCritical ? (
                <BatteryWarning className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />
              ) : (
                <Battery className="w-4 h-4 text-slate-700 shrink-0" />
              )}
              <div className="truncate">
                <div className="font-bold text-[11px] flex items-center gap-1">
                  <span>{powerState.batteryLevel}% Battery</span>
                  {powerState.isCharging && <span className="text-[9px] text-emerald-600">(Charging)</span>}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {powerState.isCritical ? (isHindi ? 'बैटरी संकट - शटडाउन अलर्ट!' : 'Critical - Shutoff Guard!') : (isHindi ? 'शटडाउन गार्ड सक्रिय' : 'Pre-Shutdown Guard')}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleTriggerPreShutdown('Manual Test Simulation')}
              className="text-[10px] font-bold text-slate-700 hover:text-rose-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs shrink-0 cursor-pointer"
              title={isHindi ? 'फोन स्विच ऑफ होने से पहले की लोकेशन टेस्ट करें' : 'Test phone shut-off location dispatch'}
            >
              ⚡ {isHindi ? 'टेस्ट शटडाउन' : 'Test Shutoff'}
            </button>
          </div>

          {/* Primary Guardian Status */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Users className="w-4 h-4 text-rose-600 shrink-0" />
              <div className="truncate">
                <div className="font-bold text-slate-900 text-[11px] truncate">
                  {primaryContact ? `${primaryContact.name} (${primaryContact.relationship})` : (isHindi ? 'कोई व्यक्ति नहीं' : 'No Contact')}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {primaryContact ? primaryContact.phone : (isHindi ? 'कृपया पति/परिवार जोड़ें' : 'Add guardian')}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('contacts')}
              className="text-rose-600 hover:text-rose-800 text-[10px] font-bold underline shrink-0 cursor-pointer"
            >
              {isHindi ? 'बदलें' : 'Manage'}
            </button>
          </div>
        </div>
      </div>

      {/* DEDICATED "SHARE LIVE LOCATION ON WHATSAPP" BANNER (STYLED LIKE RIDE & SERVICES SECTION) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {isHindi ? 'WhatsApp लाइव लोकेशन शेयर' : 'Share Live Location on WhatsApp'}
              </h2>
              <span className="text-[10px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isHindi ? 'लाइव GPS ट्रैकर' : 'Live GPS Tracker'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xl">
              {primaryContact 
                ? (isHindi 
                    ? `अपनी वर्तमान लाइव Google Maps स्थिति सीधे ${primaryContact.name} (${primaryContact.phone}) के WhatsApp पर एक क्लिक में भेजें।`
                    : `Instantly dispatch your live Google Maps coordinates to ${primaryContact.name} (${primaryContact.phone}) on WhatsApp.`)
                : (isHindi 
                    ? 'अपनी वर्तमान लाइव GPS स्थिति और Google Maps लिंक को WhatsApp पर किसी भी परिजन या ग्रुप में शेयर करें।'
                    : 'Share your current live GPS coordinates & Google Maps pin to any contact or family group on WhatsApp.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => handleShareLiveLocationWhatsApp(false)}
            className="flex-1 sm:flex-none py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {primaryContact 
                ? (isHindi ? `${primaryContact.name} को शेयर करें` : `Share with ${primaryContact.name}`)
                : (isHindi ? 'WhatsApp पर शेयर करें' : 'Share on WhatsApp')}
            </span>
          </button>
          <button
            onClick={() => handleShareLiveLocationWhatsApp(true)}
            className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
            title={isHindi ? 'किसी अन्य संपर्क को WhatsApp पर भेजें' : 'Share with any other contact on WhatsApp'}
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{isHindi ? 'अन्य संपर्क' : 'Any Contact'}</span>
          </button>
        </div>
      </div>

      {/* 2. EMERGENCY ALERTS / ACTIVE BANNERS */}

      {/* REAL-TIME AUTO-DISPATCH CONFIRMATION BANNER */}
      {autoDispatchNotification && (
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
              {autoDispatchNotification.type === 'switch_off' ? (
                <PowerOff className="w-5 h-5 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2 flex-wrap">
                <span>
                  {autoDispatchNotification.type === 'switch_off'
                    ? (isHindi ? '⚡ फोन स्विच-ऑफ: अंतिम लोकेशन स्वतः भेजी गई!' : '⚡ Pre-Shutdown: Last Location Auto-Sent!')
                    : (isHindi ? '✅ फोन ऑन हुआ: नई लाइव लोकेशन स्वतः भेजी गई!' : '✅ Phone Powered On: Live Location Auto-Sent!')
                  }
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-mono font-medium">
                  {autoDispatchNotification.time}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isHindi
                  ? `प्राप्तकर्ता: ${autoDispatchNotification.contactName} (${autoDispatchNotification.phone}) • WhatsApp पर Google Maps लिंक प्रेषित।`
                  : `Delivered to: ${autoDispatchNotification.contactName} (${autoDispatchNotification.phone}) via WhatsApp with Maps link.`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => {
                if (autoDispatchNotification.contactPhone && autoDispatchNotification.rawMessage) {
                  openWhatsAppDirect(autoDispatchNotification.contactPhone, autoDispatchNotification.rawMessage);
                } else {
                  handleShareLiveLocationWhatsApp(false);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isHindi ? 'WhatsApp खोलें' : 'Open WhatsApp'}</span>
            </button>
            <a
              href={autoDispatchNotification.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs shadow-2xs flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>{isHindi ? 'नक्शा देखें' : 'View Pin'}</span>
            </a>
            <button
              onClick={() => setAutoDispatchNotification(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* A. DEVICE POWER RESTORED / TURNED BACK ON BANNER */}
      {isDeviceRestoredBanner && (
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-slate-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
              <Power className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <span>{isHindi ? '✅ फोन पुनः ऑन (Switch On) हुआ!' : '✅ Phone Powered Back On / Online!'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isHindi 
                  ? 'आपकी लाइव लोकेशन अपडेट हो गई है। अपने पति/परिवार को सूचना भेजें कि फोन चालू हो गया है।' 
                  : 'Live GPS fix updated. Inform your emergency contacts that your phone is back online.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {primaryContact && (
              <button
                onClick={() => handleSendDeviceRestoredUpdate(primaryContact)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>{isHindi ? `WhatsApp पर ${primaryContact.name} को बताएं` : `Notify ${primaryContact.name}`}</span>
              </button>
            )}
            <button
              onClick={() => setIsDeviceRestoredBanner(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* B. ACTIVE SOS DANGER MODE BAR */}
      {isSosActive && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-600 text-white shadow-lg border-2 border-rose-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-rose-600 flex items-center justify-center font-black shrink-0 shadow-md">
              <Flame className="w-7 h-7 text-rose-600 animate-bounce" />
            </div>
            <div>
              <div className="font-black text-base flex items-center gap-2">
                <span>{isHindi ? '🚨 आपातकालीन SOS सक्रिय है (DANGER MODE)' : '🚨 EMERGENCY SOS ACTIVE'}</span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                {isHindi 
                  ? 'लाइव लोकेशन प्रेषित! सहायता पहुंचने तक सुरक्षित स्थान पर रहें।' 
                  : 'Live location dispatched. Stay in a safe, well-lit location until help arrives.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSiren}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSirenActive ? 'bg-amber-400 text-slate-900' : 'bg-rose-700 text-white border border-rose-400'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSirenActive ? (isHindi ? 'सायरन बंद' : 'Stop Siren') : (isHindi ? 'लाउड सायरन' : 'Play Siren')}</span>
            </button>

            <button
              onClick={handleDeactivateSos}
              className="px-4 py-2 rounded-xl bg-white text-rose-700 text-xs font-bold shadow-md hover:bg-rose-50 cursor-pointer"
            >
              {isHindi ? 'सुरक्षित हूँ (Cancel SOS)' : 'I am Safe (Deactivate)'}
            </button>
          </div>
        </div>
      )}

      {/* C. 3-SECOND SOS COUNTDOWN OVERLAY (PREVENTS ACCIDENTAL TRIGGERS) */}
      {isSosArmed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-rose-950 to-slate-900 text-white shadow-2xl border-2 border-rose-500/90 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-3xl shadow-lg ring-4 ring-rose-400/40 animate-pulse shrink-0">
                {countdownSeconds}
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>{isHindi ? 'आपातकालीन सुरक्षा उलटी गिनती शुरू' : 'EMERGENCY BROADCAST ARMED'}</span>
                </span>
                <span className="text-[10px] bg-rose-500/30 text-rose-200 border border-rose-400/30 px-2 py-0.5 rounded-full font-bold">
                  {isHindi ? '🔊 स्पष्ट हिंदी आवाज' : '🔊 Hindi Voice Alert'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {countdownSeconds > 0 
                  ? (isHindi ? `${countdownSeconds} सेकंड में आपके पति/परिजनों को लाइव लोकेशन भेजी जाएगी!` : `Dispatching live coordinates in ${countdownSeconds}s!`)
                  : (isHindi ? 'मैसेज और लाइव लोकेशन भेजी जा रही है...' : 'Dispatching emergency packets...')}
              </h3>
              <p className="text-xs text-rose-200/80">
                {isHindi 
                  ? 'यदि गलती से दबा है तो तुरंत "रद्द करें" दबाएं।' 
                  : 'If pressed accidentally, tap Cancel immediately.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleInstantSosDispatch}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{isHindi ? 'तुरंत भेजें (Now)' : 'Send Instantly'}</span>
            </button>
            <button
              onClick={handleCancelSosCountdown}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              {isHindi ? '✕ गलती से दबा - रद्द करें' : '✕ Cancel (False Alarm)'}
            </button>
          </div>
        </div>
      )}

      {/* 3. SAFETY NAVIGATION TABS */}
      <div className="bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('sos')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'sos'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>{isHindi ? '🚨 1-क्लिक SOS' : '1-Click SOS'}</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'contacts'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isHindi ? '🛡️ सेफ्टी गार्ड (Safety Guard)' : '🛡️ Safety Guard'}</span>
        </button>

        <button
          onClick={() => setActiveTab('stations')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'stations'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{isHindi ? '🏢 पुलिस थाने' : 'Police Stations'}</span>
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'tools'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{isHindi ? '🔊 सायरन व टूल्स' : 'Safety Tools'}</span>
        </button>

        <button
          onClick={() => setActiveTab('helplines')}
          className={`hidden sm:flex flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-semibold items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'helplines'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>{isHindi ? '📞 हेल्पलाइन 112' : 'Helplines'}</span>
        </button>
      </div>

      {/* 4. TAB 1: SOS COCKPIT & LIVE LOCATION DISPATCH */}
      {activeTab === 'sos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column: Big SOS Button & Multi-Channel Broadcast */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* BIG SOS CARD - ENTERPRISE GRADE SAFETY COCKPIT */}
            <div className="p-5 sm:p-7 bg-gradient-to-b from-rose-50 via-pink-50/30 to-white rounded-2xl border-2 border-rose-200 shadow-sm space-y-5">
              
              {/* Header & Guardian Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-rose-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span>{isHindi ? '24/7 आपातकालीन सुरक्षा शील्ड' : '24/7 Emergency Safety Shield'}</span>
                  </span>
                </div>

                {primaryContact ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {isHindi ? 'रक्षक:' : 'Guardian:'} {primaryContact.relationship} {primaryContact.name} ({primaryContact.phone})
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveTab('contacts')}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold hover:bg-amber-100 cursor-pointer"
                  >
                    <span>⚠️ {isHindi ? 'पति या परिजन का नंबर जोड़ें' : 'Add Guardian (Husband)'}</span>
                  </button>
                )}
              </div>

              {/* Title & Concise Explanation */}
              <div className="text-center space-y-1.5 max-w-lg mx-auto">
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  {isHindi ? 'संकट में हैं? तुरंत SOS दबाएं' : 'In Danger? Trigger Instant SOS'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {isHindi 
                    ? `बटन दबाते ही आपकी लाइव GPS लोकेशन Google Maps लिंक के साथ ${primaryContact ? primaryContact.name : 'आपके पति'} को WhatsApp पर तुरंत भेजी जाएगी।`
                    : `Dispatches your live GPS coordinates with Google Maps pin directly to ${primaryContact ? primaryContact.name : 'your husband/guardians'} via WhatsApp.`}
                </p>
              </div>

              {/* TACTILE SOS BUTTON WITH CONCENTRIC RADAR RINGS */}
              <div className="flex flex-col items-center justify-center py-2 space-y-3">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-rose-100/70 animate-ping pointer-events-none opacity-40" />
                  <button
                    onClick={handleStartSosArm}
                    disabled={isSosArmed || isSosActive}
                    className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-rose-500 text-white shadow-2xl hover:shadow-rose-300 border-4 border-white active:scale-95 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group select-none ring-8 ring-rose-200/90 hover:ring-rose-300"
                    title="Press to arm SOS (3s safety window)"
                  >
                    <ShieldAlert className="w-12 h-12 text-amber-300 group-hover:scale-110 transition-transform animate-pulse" />
                    <span className="font-black text-3xl tracking-wider">SOS</span>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-100">
                      {isHindi ? 'दबाएं (PRESS)' : 'EMERGENCY'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>{isHindi ? '3 सेकंड सुरक्षा समय • स्पष्ट हिंदी आवाज अलर्ट' : '3s Safety Window • Clear Hindi Voice Alert'}</span>
                </div>
              </div>

              {/* DIRECT 1-TAP EMERGENCY DISPATCH ACTION GRID */}
              <div className="pt-3 border-t border-rose-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{isHindi ? '1-क्लिक सीधा आपातकालीन प्रेषण:' : '1-Click Direct Emergency Dispatch:'}</span>
                  {primaryContact && (
                    <span className="text-emerald-700 font-extrabold flex items-center gap-1 text-[11px]">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{primaryContact.name} ({primaryContact.phone})</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* WhatsApp Live SOS to Guardian */}
                  <button
                    onClick={() => handleShareSosWhatsApp(false)}
                    className="py-3 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                    title={isHindi ? 'WhatsApp पर लाइव लोकेशन व SOS आपातकालीन संदेश भेजें' : 'Send live location & SOS distress alert on WhatsApp'}
                  >
                    <Send className="w-4 h-4 text-white fill-white" />
                    <span>
                      {primaryContact 
                        ? (isHindi ? `WhatsApp SOS: ${primaryContact.name}` : `WhatsApp SOS: ${primaryContact.name}`) 
                        : (isHindi ? 'WhatsApp लाइव SOS' : 'WhatsApp Live SOS')}
                    </span>
                  </button>

                  {/* Police 112 */}
                  <a
                    href="tel:112"
                    className="py-3 px-3.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 text-center"
                  >
                    <Phone className="w-4 h-4 text-amber-300" />
                    <span>{isHindi ? 'पुलिस 112 कॉल' : 'Call Police 112'}</span>
                  </a>

                  {/* Women Helpline 1090 */}
                  <a
                    href="tel:1090"
                    className="py-3 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 text-center"
                  >
                    <ShieldCheck className="w-4 h-4 text-rose-300" />
                    <span>{isHindi ? 'महिला हेल्पलाइन 1090' : 'Women Helpline 1090'}</span>
                  </a>
                </div>

                {lastDispatchedInfo && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isHindi ? `✅ संदेश भेजा गया: ${lastDispatchedInfo}` : `✅ Message sent: ${lastDispatchedInfo}`}</span>
                  </div>
                )}
              </div>
            </div>

            {/* "यह कैसे काम करता है?" - 3 SIMPLE STEPS EXPLANATION (ENTERPRISE / BIG COMPANY SAFETY STANDARD) */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  {isHindi ? 'यह कैसे काम करता है? (3 आसान चरण)' : 'How Professional SOS Works (3 Simple Steps)'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center">
                    1
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    {isHindi ? 'SOS बटन दबाएं' : 'Press SOS Button'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isHindi ? '3 सेकंड की उलटी गिनती शुरू होती है और फोन स्पष्ट हिंदी में बोलता है ताकि गलती से अलर्ट न जाए।' : 'Starts a 3s safety window with audible voice so you can cancel accidental presses.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    2
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    {isHindi ? 'पति को लोकेशन WhatsApp' : 'Live WhatsApp to Husband'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isHindi ? 'लाइव Google Maps पिन, निकटतम लैंडमार्क और बैटरी स्थिति आपके पति के WhatsApp पर स्वतः जाती है।' : 'Dispatches live Google Maps link, nearest landmark & battery level to your selected guardian.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center">
                    3
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    {isHindi ? 'फोन स्विच-ऑफ सुरक्षा' : 'Pre-Shutdown Safeguard'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isHindi ? 'यदि फोन की बैटरी 5% हो या फोन बंद होने वाला हो, तो बंद होने से पहले अंतिम लोकेशन सुरक्षित हो जाती है।' : 'If battery reaches 5% or powers down, last location is safeguarded before switch-off.'}
                  </p>
                </div>
              </div>
            </div>

            {/* PRE-SHUTDOWN ("LAST GASP") & POWER-ON AUTOMATIC DISPATCH SAFEGUARD CARD */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-300 shadow-2xs space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <PowerOff className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900">
                        {isHindi 
                          ? '⚡ फोन स्विच-ऑफ एवं ऑन होने पर स्वतः लोकेशन प्रेषण' 
                          : '⚡ Auto Location Dispatch on Phone Switch-Off & Power-On'}
                      </h3>
                      <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      {isHindi 
                        ? 'फोन की बैटरी खत्म/स्विच-ऑफ होने से ठीक पहले अंतिम लोकेशन, और फोन ऑन होते ही नई लाइव लोकेशन आपके पति को स्वतः WhatsApp पर पहुँच जाती है।' 
                        : 'Automatically sends your last live GPS location to your husband before shutdown, and sends fresh location as soon as phone turns back on.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Guardian Info */}
              <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      {isHindi ? 'लोकेशन प्राप्तकर्ता (Selected Guardian):' : 'Receiving Contact:'}
                    </div>
                    <div className="font-bold text-slate-900 text-xs">
                      {primaryContact ? (
                        <span>{primaryContact.name} ({primaryContact.relationship || 'पति'}) • <span className="font-mono text-slate-600">{primaryContact.phone}</span></span>
                      ) : (
                        <span className="text-amber-700">{isHindi ? 'कोई नंबर नहीं चुना (कांटेक्ट टैब में पति का नंबर जोड़ें)' : 'No contact selected yet'}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      const el = document.getElementById('safety-guard-config-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        setActiveTab('contacts');
                      }
                    }}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold rounded-lg border border-amber-300 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>{isHindi ? '⚙️ नंबर बदलें / सेट करें' : '⚙️ Configure Guard'}</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <Send className="w-3 h-3 text-emerald-600" />
                    <span>WhatsApp Direct</span>
                  </div>
                </div>
              </div>

              {/* Dual Step Workflow: Before Switch Off & After Power On */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* 1. Before Switch-Off */}
                <div className="p-3 bg-white rounded-xl border border-amber-200/90 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">1</span>
                      <span>{isHindi ? 'स्विच-ऑफ से ठीक पहले' : 'Before Phone Powers Off'}</span>
                    </div>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      बैटरी ≤ 5%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {isHindi 
                      ? 'फोन बंद होने से पहले अंतिम GPS पिन, निकटतम लैंडमार्क व बैटरी प्रतिशत स्वतः WhatsApp पर भेजा जाता है।' 
                      : 'Captures final GPS fix, nearest landmark & battery level, auto-dispatches to husband.'}
                  </p>
                  <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={autoDispatchOnSwitchOff} 
                      onChange={(e) => {
                        setAutoDispatchOnSwitchOff(e.target.checked);
                        localStorage.setItem('erahi_auto_preshutdown', e.target.checked ? 'true' : 'false');
                      }}
                      className="w-3.5 h-3.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer" 
                    />
                    <span className="text-[10px] font-bold text-slate-700">
                      {isHindi ? 'स्वतः WhatsApp भेजें' : 'Auto-send via WhatsApp'}
                    </span>
                  </label>
                </div>

                {/* 2. On Power Back On */}
                <div className="p-3 bg-white rounded-xl border border-emerald-200/90 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                      <span>{isHindi ? 'फोन ऑन होते ही' : 'As Soon As Phone Turns On'}</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      पावर ऑन
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {isHindi 
                      ? 'फोन चालू होते ही नई लाइव लोकेशन व सुरक्षित स्थिति का संदेश स्वतः पति के पास पहुँच जाता है।' 
                      : 'As soon as device boots, fresh live GPS & safe status are sent directly to your husband.'}
                  </p>
                  <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={autoDispatchOnPowerOn} 
                      onChange={(e) => {
                        setAutoDispatchOnPowerOn(e.target.checked);
                        localStorage.setItem('erahi_auto_power_restored', e.target.checked ? 'true' : 'false');
                      }}
                      className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer" 
                    />
                    <span className="text-[10px] font-bold text-slate-700">
                      {isHindi ? 'स्वतः नई लोकेशन भेजें' : 'Auto-send on Power On'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Two Direct Interactive Simulation Buttons */}
              <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleTriggerPreShutdown('User manual test', true)}
                  className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isHindi ? '⚡ टेस्ट 1: स्विच-ऑफ ऑटो-प्रेषण' : '⚡ Test 1: Pre-Shutdown Auto Send'}</span>
                </button>

                <button
                  onClick={handleSimulatePowerOnRestored}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{isHindi ? '🔄 टेस्ट 2: फोन ऑन ऑटो-प्रेषण' : '🔄 Test 2: Power-On Auto Send'}</span>
                </button>
              </div>
            </div>

            {/* Nearest Police Station detected */}
            {nearestPolice && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-rose-600" />
                    <h3 className="text-xs font-bold text-slate-900">
                      {isHindi ? 'आपके सबसे पास स्थित पुलिस थाना:' : 'Nearest Police Station:'}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    📍 {nearestPolice.distanceKm} km away
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      {isHindi ? nearestPolice.station.hindiName : nearestPolice.station.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {nearestPolice.station.address}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onNavigateToPoliceStation && (
                      <button
                        onClick={() => onNavigateToPoliceStation(
                          nearestPolice.station.lat, 
                          nearestPolice.station.lng, 
                          nearestPolice.station.name
                        )}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>{isHindi ? 'नक्शे पर देखें' : 'View on Map'}</span>
                      </button>
                    )}

                    <a
                      href={`tel:${nearestPolice.station.phone}`}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{nearestPolice.station.phone}</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: User Info, Live Coordinates Card & Rapid Tools */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Dedicated Safety Guard Configuration Section (Crash & Reboot Persistent) */}
            <div id="safety-guard-config-section">
              <SafetyGuardConfigSection
                primaryContact={primaryContact}
                userName={userName}
                isHindi={isHindi}
                onSaved={(updatedContacts, updatedUserName) => {
                  setContacts(updatedContacts);
                  if (updatedUserName) {
                    setUserName(updatedUserName);
                    localStorage.setItem('erahi_sos_user_name', updatedUserName);
                  }
                }}
              />
            </div>

            {/* Live GPS Coordinates Card with Direct Google Maps Share */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <h3 className="text-xs font-bold text-slate-900">
                    {isHindi ? 'लाइव GPS स्थान एवं लिंक' : 'Live GPS & Pin Link'}
                  </h3>
                </div>
                <button
                  onClick={handleCopyLocation}
                  className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? (isHindi ? 'कॉपी हुआ' : 'Copied') : (isHindi ? 'लिंक कॉपी' : 'Copy')}</span>
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Latitude:</span>
                  <span className="font-mono font-bold text-slate-900">{userCoords?.lat.toFixed(6) || '28.362000'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Longitude:</span>
                  <span className="font-mono font-bold text-slate-900">{userCoords?.lng.toFixed(6) || '79.420000'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{isHindi ? 'सटीकता:' : 'Accuracy:'}</span>
                  <span className="font-semibold text-emerald-700">±{gpsAccuracy || 10} meters</span>
                </div>
              </div>

              {/* PRIMARY PROMINENT SHARE LIVE LOCATION ON WHATSAPP BUTTON */}
              <button
                type="button"
                onClick={() => handleShareLiveLocationWhatsApp(false)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer"
                title="Send live GPS coordinates & Google Maps link to guardian on WhatsApp"
              >
                <Send className="w-4 h-4 text-white fill-white" />
                <span>
                  {primaryContact
                    ? (isHindi ? `🟢 ${primaryContact.name} को WhatsApp पर लाइव लोकेशन भेजें` : `🟢 Share Live Location with ${primaryContact.name} on WhatsApp`)
                    : (isHindi ? '🟢 WhatsApp पर लाइव लोकेशन शेयर करें' : '🟢 Share Live Location on WhatsApp')}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleShareLiveLocationWhatsApp(true)}
                  className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title="Share live location with any contact or group on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{isHindi ? 'अन्य WhatsApp चैट' : 'Any Contact (WA)'}</span>
                </button>

                <a
                  href={`https://maps.google.com/?q=${userCoords?.lat || 28.3620},${userCoords?.lng || 79.4200}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                  <span>{isHindi ? 'Google Maps' : 'Open in Maps'}</span>
                </a>
              </div>
            </div>

            {/* Quick Safety Tools Strip */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-slate-600" />
                  <span>{isHindi ? 'त्वरित आत्म-सुरक्षा टूल' : 'Instant Deterrents'}</span>
                </h3>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  {isHindi ? 'ध्वनि व प्रकाश' : 'Sound & Light'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Hindi Distress Call Siren ("बचाओ! पुलिस को बुलाओ!") */}
                <button
                  onClick={handleToggleDistressVoice}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isDistressVoiceActive
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md animate-bounce ring-2 ring-amber-300'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-200'
                  }`}
                  title="Play loud repeating Hindi emergency call"
                >
                  <Volume2 className="w-5 h-5 text-rose-600" />
                  <span className="text-center leading-tight">
                    {isDistressVoiceActive 
                      ? (isHindi ? 'पुकार बंद करें' : 'Stop Call') 
                      : (isHindi ? '🗣️ हिंदी बचाव पुकार' : '🗣️ Hindi Distress Call')}
                  </span>
                </button>

                {/* Loud Police Siren */}
                <button
                  onClick={handleToggleSiren}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSirenActive
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm animate-pulse'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                  <span>{isSirenActive ? (isHindi ? 'सायरन बंद' : 'Stop Siren') : (isHindi ? '🚨 लाउड सायरन' : '🚨 Loud Siren')}</span>
                </button>

                {/* Strobe Flashlight */}
                <button
                  onClick={handleToggleStrobe}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isStrobeActive
                      ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm animate-pulse'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <Sun className="w-5 h-5" />
                  <span>{isStrobeActive ? (isHindi ? 'स्ट्रोब बंद' : 'Stop Strobe') : (isHindi ? '⚡ स्क्रीन स्ट्रोब' : '⚡ Screen Strobe')}</span>
                </button>

                {/* Audio Evidence Voice Recorder */}
                <button
                  onClick={handleToggleAudioRecording}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isRecordingAudio
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm animate-pulse'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {isRecordingAudio ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  <span>{isRecordingAudio ? `${recordingDurationSec}s Rec` : (isHindi ? '🎙️ ऑडियो रिकॉर्ड' : '🎙️ Record Audio')}</span>
                </button>
              </div>

              {/* Fake Call Trigger */}
              <button
                onClick={startFakeCall}
                className="w-full py-2.5 px-3 rounded-xl border bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-rose-600" />
                <span>{isHindi ? '📞 फर्जी फोन कॉल (छुटकारा पाने हेतु)' : '📞 Trigger Fake Escape Call'}</span>
              </button>

              {recordedAudioUrl && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-semibold text-slate-700">{isHindi ? 'ऑडियो साक्ष्य रिकॉर्डिंग:' : 'Audio Evidence:'}</div>
                  <audio controls src={recordedAudioUrl} className="w-full h-8" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: EMERGENCY CONTACTS & DEDICATED SAFETY GUARD MANAGER */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div id="safety-guard-tab-config">
            <SafetyGuardConfigSection
              primaryContact={primaryContact}
              userName={userName}
              isHindi={isHindi}
              onSaved={(updatedContacts, updatedUserName) => {
                setContacts(updatedContacts);
                if (updatedUserName) {
                  setUserName(updatedUserName);
                  localStorage.setItem('erahi_sos_user_name', updatedUserName);
                }
              }}
            />
          </div>

          <EmergencyContactsManager
            contacts={contacts}
            onSaveContacts={handleSaveContacts}
            userName={userName}
            isHindi={isHindi}
          />
        </div>
      )}

      {/* 6. TAB 3: POLICE STATIONS & THANA DIRECTORY */}
      {activeTab === 'stations' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {cityName} • {isHindi ? 'पुलिस थाने एवं महिला हेल्प डेस्क' : 'Police Stations & Mahila Thana'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {filteredPoliceStations.length} {isHindi ? 'थाने उपलब्ध' : 'Stations listed'}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setStationFilterType('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${stationFilterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  {isHindi ? 'सभी' : 'All'}
                </button>
                <button
                  onClick={() => setStationFilterType('mahila')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${stationFilterType === 'mahila' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  {isHindi ? 'महिला थाना' : 'Mahila Thana'}
                </button>
                <button
                  onClick={() => setStationFilterType('general')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${stationFilterType === 'general' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
                >
                  {isHindi ? 'कोतवाली/चौकी' : 'General'}
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={stationSearchQuery}
                onChange={(e) => setStationSearchQuery(e.target.value)}
                placeholder={isHindi ? 'थाने का नाम या क्षेत्र खोजें...' : 'Search police station name or area...'}
                className="w-full text-xs font-semibold pl-9 pr-3 py-2 rounded-xl border border-slate-200 outline-none bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPoliceStations.map(station => (
              <div key={station.id} className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      {isHindi ? station.hindiName : station.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{station.address}</p>
                  </div>
                  {station.isMahilaThana && (
                    <span className="text-[10px] font-bold bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full shrink-0">
                      {isHindi ? 'महिला थाना' : 'Women Cell'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <a
                    href={`tel:${station.phone}`}
                    className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{station.phone}</span>
                  </a>

                  {onNavigateToPoliceStation && (
                    <button
                      onClick={() => onNavigateToPoliceStation(station.lat, station.lng, station.name)}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>{isHindi ? 'नक्शा' : 'Map'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 4: SAFETY TOOLS & DETERRENTS */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-rose-600" />
              <span>{isHindi ? 'लाउड सायरन चेतावनी' : 'High-Decibel Police Siren'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isHindi 
                ? 'भीड़-भाड़ या सुनसान रास्तों में हमलावरों को डराने व स्थानीय लोगों का ध्यान खींचने हेतु तीव्र सायरन।' 
                : 'Blasts high-frequency police/ambulance siren tone to scare harassers and alert public.'}
            </p>
            <button
              onClick={handleToggleSiren}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSirenActive ? 'bg-amber-500 text-slate-950' : 'bg-rose-600 text-white hover:bg-rose-700'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSirenActive ? (isHindi ? 'सायरन बंद करें' : 'Stop Siren') : (isHindi ? 'सायरन बजाएं' : 'Start Siren')}</span>
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>{isHindi ? 'फर्जी कॉल (Fake Escape Call)' : 'Discreet Fake Escape Call'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isHindi 
                ? 'असहज स्थिति से सुरक्षित निकलने के लिए फोन पर तुरंत परिवार या पुलिस की बनावटी कॉल प्राप्त करें।' 
                : 'Simulates an incoming rescue call from family to provide an easy exit from uncomfortable situations.'}
            </p>
            <button
              onClick={startFakeCall}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{isHindi ? 'कॉल प्राप्त करें (Ring Fake Call)' : 'Trigger Call Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 8. TAB 5: 24/7 HELPLINES */}
      {activeTab === 'helplines' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EMERGENCY_HELPLINES.map((h) => (
            <div key={h.number} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs text-slate-900">{isHindi ? h.hindiTitle : h.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{h.description}</p>
              </div>
              <a
                href={`tel:${h.number}`}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{h.number}</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: PRE-SHUTDOWN AUTOMATIC DISPATCH STATUS */}
      {showShutdownSimulationModal && (
        <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-amber-300 max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                <PowerOff className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full uppercase">
                  {isHindi ? 'स्वतः प्रेषण सक्रिय (AUTO-DISPATCHED)' : 'AUTO-DISPATCHED'}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  {isHindi ? '⚡ फोन स्विच-ऑफ: अंतिम लोकेशन स्वतः प्रेषित!' : 'Pre-Shutdown: Location Auto-Dispatched!'}
                </h3>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">
                  {isHindi 
                    ? `आपके पति ${primaryContact?.name || ''} को WhatsApp पर लोकेशन स्वतः भेज दी गई है!` 
                    : `Dispatched automatically to ${primaryContact?.name || 'Selected Contact'} via WhatsApp!`}
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  {isHindi 
                    ? 'फोन की बैटरी खत्म होने से पहले अंतिम GPS लोकेशन, गूगल मैप्स लिंक व लैंडमार्क प्रेषित हो चुका है।' 
                    : 'Final GPS coordinates, landmark and battery level safely delivered before device shutdown.'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-line leading-relaxed max-h-44 overflow-y-auto">
              {buildPreShutdownMessage({
                userName,
                lat: userCoords?.lat || 28.3620,
                lng: userCoords?.lng || 79.4200,
                batteryLevel: powerState.batteryLevel,
                addressHint: lastGpsAddress || cityName,
                contactName: primaryContact?.name,
                isHindi
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              {primaryContact && (
                <button
                  onClick={() => {
                    handleDispatchPreShutdownMessage(primaryContact);
                    setShowShutdownSimulationModal(false);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isHindi ? `WhatsApp दोबारा खोलें (${primaryContact.name})` : `Re-Open in WhatsApp`}</span>
                </button>
              )}

              <button
                onClick={() => setShowShutdownSimulationModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
              >
                {isHindi ? 'ठीक है (Close)' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAKE CALL MODAL */}
      {isFakeCallRinging && (
        <div className="fixed inset-0 z-[2000] bg-slate-950 flex flex-col justify-between p-6 text-white animate-in fade-in duration-200">
          <div className="text-center pt-12 space-y-2">
            <span className="text-xs uppercase tracking-widest text-slate-400">Incoming Call</span>
            <h2 className="text-2xl font-bold">{primaryContact ? `${primaryContact.name} (${primaryContact.relationship})` : 'Home (Papa)'}</h2>
            <p className="text-sm text-slate-400">+91 98765 43210</p>
          </div>

          <div className="flex items-center justify-around pb-12">
            <button
              onClick={stopFakeCall}
              className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg active:scale-95"
            >
              <Phone className="w-7 h-7 rotate-[135deg]" />
            </button>

            <button
              onClick={answerFakeCall}
              className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-95 animate-bounce"
            >
              <Phone className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}

      {isFakeCallConnected && (
        <div className="fixed inset-0 z-[2000] bg-slate-900 flex flex-col justify-between p-6 text-white animate-in fade-in duration-200">
          <div className="text-center pt-12 space-y-2">
            <h2 className="text-2xl font-bold">{primaryContact ? primaryContact.name : 'Home (Papa)'}</h2>
            <p className="text-xs text-emerald-400">Connected • {Math.floor(fakeCallTimer / 60)}:{('0' + (fakeCallTimer % 60)).slice(-2)}</p>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl text-xs text-slate-300 text-center max-w-sm mx-auto">
            {isHindi 
              ? 'सिमुलेटेड कॉल चल रही है: "हाँ बेटा, मैं 2 मिनट में पुलिस चौकी के पास पहुँच रहा हूँ। तुम वहीं रुको, मैं आ गया।"' 
              : 'Simulated voice active: "Yes, I am reaching the junction in 2 minutes. Stay near the police booth."'}
          </div>

          <div className="flex justify-center pb-12">
            <button
              onClick={stopFakeCall}
              className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg active:scale-95"
            >
              <Phone className="w-7 h-7 rotate-[135deg]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
