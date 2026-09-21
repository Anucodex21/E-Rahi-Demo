import { EmergencyContact, DevicePowerState, LastKnownLocationRecord } from '../types';

export const DEFAULT_CONTACTS: EmergencyContact[] = [
  {
    id: 'contact-husband',
    name: 'Rahul (Husband)',
    relationship: 'Husband',
    phone: '+919876543210',
    isPrimary: true,
    notifyViaWhatsapp: true,
    notifyViaSms: true
  },
  {
    id: 'contact-family',
    name: 'Papa (Home)',
    relationship: 'Father',
    phone: '+919812345678',
    isPrimary: false,
    notifyViaWhatsapp: true,
    notifyViaSms: true
  }
];

export function loadStoredContacts(): EmergencyContact[] {
  let contacts: EmergencyContact[] = DEFAULT_CONTACTS;
  try {
    const raw = localStorage.getItem('erahi_emergency_contacts');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        contacts = parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading emergency contacts:', err);
  }

  // Backup direct keys to survive system reboots, app crashes, or partial storage resets
  try {
    const guardName = localStorage.getItem('erahi_primary_guardian_name');
    const guardPhone = localStorage.getItem('erahi_primary_guardian_phone');
    const guardRel = localStorage.getItem('erahi_primary_guardian_relation') || 'Husband';

    if (guardName && guardPhone) {
      const primaryIdx = contacts.findIndex(c => c.isPrimary);
      if (primaryIdx >= 0) {
        contacts[primaryIdx] = {
          ...contacts[primaryIdx],
          name: guardName,
          phone: guardPhone,
          relationship: (guardRel as any) || contacts[primaryIdx].relationship
        };
      } else if (contacts.length > 0) {
        contacts[0] = {
          ...contacts[0],
          name: guardName,
          phone: guardPhone,
          relationship: (guardRel as any) || 'Husband',
          isPrimary: true
        };
      } else {
        contacts = [
          {
            id: 'contact-safety-guard',
            name: guardName,
            relationship: (guardRel as any) || 'Husband',
            phone: guardPhone,
            isPrimary: true,
            notifyViaWhatsapp: true,
            notifyViaSms: true
          }
        ];
      }
    }
  } catch (e) {
    console.warn('Error syncing direct safety guard keys:', e);
  }

  return contacts;
}

export function saveStoredContacts(contacts: EmergencyContact[]): void {
  try {
    localStorage.setItem('erahi_emergency_contacts', JSON.stringify(contacts));
    const primary = contacts.find(c => c.isPrimary) || contacts[0];
    if (primary) {
      localStorage.setItem('erahi_primary_guardian_name', primary.name);
      localStorage.setItem('erahi_primary_guardian_phone', primary.phone);
      localStorage.setItem('erahi_primary_guardian_relation', primary.relationship);
    }
  } catch (err) {
    console.warn('Error saving emergency contacts:', err);
  }
}

export function saveSafetyGuardContact(params: {
  name: string;
  phone: string;
  relationship?: string;
  notifyViaWhatsapp?: boolean;
  notifyViaSms?: boolean;
}): EmergencyContact[] {
  const cleanName = params.name.trim();
  const cleanPhone = params.phone.trim();
  const rel = params.relationship || 'Husband';
  const notifyWa = params.notifyViaWhatsapp ?? true;
  const notifySms = params.notifyViaSms ?? true;

  try {
    localStorage.setItem('erahi_primary_guardian_name', cleanName);
    localStorage.setItem('erahi_primary_guardian_phone', cleanPhone);
    localStorage.setItem('erahi_primary_guardian_relation', rel);
  } catch (err) {
    console.warn('LocalStorage error while saving safety guard:', err);
  }

  const currentContacts = loadStoredContacts();
  let updatedContacts: EmergencyContact[];
  const primaryIdx = currentContacts.findIndex(c => c.isPrimary);

  if (primaryIdx >= 0) {
    updatedContacts = currentContacts.map((c, idx) => {
      if (idx === primaryIdx) {
        return {
          ...c,
          name: cleanName,
          phone: cleanPhone,
          relationship: rel as any,
          notifyViaWhatsapp: notifyWa,
          notifyViaSms: notifySms,
          isPrimary: true
        };
      }
      return c;
    });
  } else if (currentContacts.length > 0) {
    updatedContacts = [
      {
        ...currentContacts[0],
        name: cleanName,
        phone: cleanPhone,
        relationship: rel as any,
        notifyViaWhatsapp: notifyWa,
        notifyViaSms: notifySms,
        isPrimary: true
      },
      ...currentContacts.slice(1).map(c => ({ ...c, isPrimary: false }))
    ];
  } else {
    updatedContacts = [
      {
        id: `guard-${Date.now()}`,
        name: cleanName,
        phone: cleanPhone,
        relationship: rel as any,
        isPrimary: true,
        notifyViaWhatsapp: notifyWa,
        notifyViaSms: notifySms
      }
    ];
  }

  saveStoredContacts(updatedContacts);
  return updatedContacts;
}

export function getLastKnownLocation(): LastKnownLocationRecord | null {
  try {
    const raw = localStorage.getItem('erahi_last_known_location');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLastKnownLocation(record: LastKnownLocationRecord): void {
  try {
    localStorage.setItem('erahi_last_known_location', JSON.stringify(record));
    // Also backup to server
    fetch('/api/emergency/last-known-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: localStorage.getItem('erahi_sos_user_name') || 'App User',
        userPhone: localStorage.getItem('erahi_sos_user_phone') || undefined,
        coords: { lat: record.lat, lng: record.lng, accuracyMeters: record.accuracyMeters },
        addressHint: record.addressHint,
        batteryLevel: record.batteryLevel,
        contactsNotified: record.dispatchedToContacts.map(phone => ({ name: 'Emergency Contact', phone })),
        reason: record.reason
      })
    }).catch(e => console.warn('Server last-location backup failed:', e));
  } catch (err) {
    console.warn('Error saving last known location:', err);
  }
}

// Format emergency distress message for WhatsApp / SMS
export function buildSosDispatchMessage(options: {
  userName: string;
  lat: number;
  lng: number;
  accuracyMeters?: number;
  addressHint?: string;
  batteryLevel?: number;
  isCharging?: boolean;
  contactName?: string;
  isHindi?: boolean;
}): string {
  const {
    userName,
    lat,
    lng,
    accuracyMeters = 10,
    addressHint,
    batteryLevel,
    contactName,
    isHindi = true
  } = options;

  const mapsUrl = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = new Date().toLocaleDateString();

  if (isHindi) {
    return `🚨 *आपातकालीन सुरक्षा SOS अलर्ट (EMERGENCY SOS)* 🚨
${contactName ? `प्रिय ${contactName}, ` : ''}मुझे तुरंत आपकी सहायता और पुलिस सुरक्षा की आवश्यकता है!

👤 *प्रेषक:* ${userName || 'सुरक्षित नागरिक'}
📍 *लाइव लोकेशन (Google Maps):* ${mapsUrl}
📌 *निकटतम स्थान:* ${addressHint || 'लाइव जीपीएस स्थिति'}
🎯 *सटीकता:* ±${accuracyMeters} मीटर
🔋 *बैटरी स्तर:* ${batteryLevel !== undefined ? `${batteryLevel}%` : 'N/A'}
⏰ *समय:* ${now}, ${dateStr}

⚠️ *कृपया तुरंत संपर्क करें अथवा 112 डायल करें!*
(E-Rahi India सुरक्षित 24x7 इमरजेंसी सिस्टम द्वारा प्रेषित)`;
  }

  return `🚨 *EMERGENCY SOS DISTRESS ALERT* 🚨
${contactName ? `Dear ${contactName}, ` : ''}I am in urgent danger and need immediate assistance!

👤 *Sender:* ${userName || 'Protected User'}
📍 *Live Location (Google Maps):* ${mapsUrl}
📌 *Nearest Landmark:* ${addressHint || 'GPS Coordinates'}
🎯 *Accuracy:* ±${accuracyMeters} meters
🔋 *Battery:* ${batteryLevel !== undefined ? `${batteryLevel}%` : 'N/A'}
⏰ *Time:* ${now}, ${dateStr}

⚠️ *Please call me immediately or dispatch local police (112)!*
(Sent via E-Rahi India Professional Safety Guard)`;
}

// Format Pre-Shutdown "Last Gasp" message
export function buildPreShutdownMessage(options: {
  userName: string;
  lat: number;
  lng: number;
  batteryLevel: number;
  addressHint?: string;
  contactName?: string;
  isHindi?: boolean;
}): string {
  const {
    userName,
    lat,
    lng,
    batteryLevel,
    addressHint,
    contactName,
    isHindi = true
  } = options;

  const mapsUrl = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (isHindi) {
    return `⚠️ *फोन स्विच ऑफ अलर्ट - अंतिम लाइव लोकेशन (LAST KNOWN LOCATION)* ⚠️
${contactName ? `प्रिय ${contactName}, ` : ''}मेरा फोन बंद (Switch Off / Low Battery) होने वाला है!

👤 *प्रेषक:* ${userName || 'सुरक्षित नागरिक'}
🔋 *बैटरी शेष:* केवल ${batteryLevel}% (फोन स्विच ऑफ होने से ठीक पहले)
📍 *अंतिम ज्ञात स्थान (Last Location):* ${mapsUrl}
📌 *पता:* ${addressHint || 'सत्यापित जीपीएस पिन'}
⏰ *समय:* ${now}

यदि मेरा फोन न लगे तो कृपया मेरी इसी अंतिम लोकेशन पर संपर्क करें!
(E-Rahi India ऑटोमैटिक शटडाउन सुरक्षा गार्ड)`;
  }

  return `⚠️ *DEVICE SHUTTING DOWN - LAST KNOWN LOCATION ALERT* ⚠️
${contactName ? `Dear ${contactName}, ` : ''}My phone is about to power off / battery dying!

👤 *Sender:* ${userName || 'Protected User'}
🔋 *Critical Battery:* ${batteryLevel}% remaining
📍 *Last Known GPS Location:* ${mapsUrl}
📌 *Landmark:* ${addressHint || 'Verified GPS Pin'}
⏰ *Timestamp:* ${now}

If I become unreachable, this is where I was last active.
(Sent automatically by E-Rahi India Pre-Shutdown Safeguard)`;
}

// Format Device Restored / Turned Back On message
export function buildDeviceRestoredMessage(options: {
  userName: string;
  lat: number;
  lng: number;
  batteryLevel?: number;
  addressHint?: string;
  contactName?: string;
  isHindi?: boolean;
}): string {
  const {
    userName,
    lat,
    lng,
    batteryLevel = 100,
    addressHint,
    contactName,
    isHindi = true
  } = options;

  const mapsUrl = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isHindi) {
    return `✅ *फोन पुनः चालू हुआ - लाइव लोकेशन अपडेट (PHONE POWERED BACK ON)* ✅
${contactName ? `प्रिय ${contactName}, ` : ''}मेरा फोन फिर से ऑन (Switch On) हो गया है।

👤 *नाम:* ${userName || 'सुरक्षित नागरिक'}
📍 *वर्तमान लाइव लोकेशन:* ${mapsUrl}
📌 *स्थान:* ${addressHint || 'वर्तमान जीपीएस स्थान'}
🔋 *बैटरी:* ${batteryLevel}%
⏰ *समय:* ${now}

मेरी लोकेशन अपडेट हो गई है। सब सुरक्षित है!
(E-Rahi India सुरक्षा नेटवर्क)`;
  }

  return `✅ *DEVICE RESTORED - CURRENT LIVE LOCATION* ✅
${contactName ? `Dear ${contactName}, ` : ''}My phone is turned back on and active.

👤 *Name:* ${userName || 'Protected User'}
📍 *Current Live Location:* ${mapsUrl}
📌 *Location:* ${addressHint || 'Live GPS Fix'}
🔋 *Battery:* ${batteryLevel}%
⏰ *Time:* ${now}

Tracking is active and status is updated.
(E-Rahi India Safety Guard)`;
}

// Format live location share message for WhatsApp
export function buildLiveLocationShareMessage(options: {
  userName: string;
  lat: number;
  lng: number;
  accuracyMeters?: number;
  addressHint?: string;
  batteryLevel?: number;
  contactName?: string;
  isHindi?: boolean;
}): string {
  const {
    userName,
    lat,
    lng,
    accuracyMeters = 10,
    addressHint,
    batteryLevel,
    contactName,
    isHindi = true
  } = options;

  const mapsUrl = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date().toLocaleDateString();

  if (isHindi) {
    return `📍 *लाइव लोकेशन शेयर (LIVE LOCATION UPDATE)* 📍
${contactName ? `नमस्ते ${contactName}, ` : ''}यह मेरी वर्तमान लाइव GPS लोकेशन है:

👤 *प्रेषक:* ${userName || 'सुरक्षित नागरिक'}
🗺️ *Google Maps लिंक:* ${mapsUrl}
📌 *निकटतम स्थान:* ${addressHint || 'लाइव GPS स्थिति'}
🎯 *सटीकता:* ±${accuracyMeters} मीटर
🔋 *बैटरी स्थिति:* ${batteryLevel !== undefined ? `${batteryLevel}%` : 'N/A'}
⏰ *समय:* ${now}, ${dateStr}

✅ मैं सुरक्षित हूँ और अपनी वर्तमान यात्रा की लाइव स्थिति आपके साथ साझा कर रही हूँ।
(E-Rahi India विमेन सेफ्टी गार्ड)`;
  }

  return `📍 *LIVE LOCATION SHARE (SAFE JOURNEY UPDATE)* 📍
${contactName ? `Hello ${contactName}, ` : ''}Here is my current live GPS location:

👤 *Sender:* ${userName || 'Protected User'}
🗺️ *Google Maps Link:* ${mapsUrl}
📌 *Nearest Landmark:* ${addressHint || 'GPS Coordinates'}
🎯 *Accuracy:* ±${accuracyMeters} meters
🔋 *Battery:* ${batteryLevel !== undefined ? `${batteryLevel}%` : 'N/A'}
⏰ *Time:* ${now}, ${dateStr}

✅ I am safe and sharing my live journey coordinates with you.
(Sent via E-Rahi India Women Safety Guard)`;
}

// Open WhatsApp direct link (resilient against browser popup blockers)
export function openWhatsAppDirect(phone: string, message: string): boolean {
  const clean = phone.replace(/\D/g, '');
  // If no country code and 10 digits, add India 91 prefix
  const formattedPhone = clean.length === 10 ? `91${clean}` : clean;
  const encoded = encodeURIComponent(message);
  const url = formattedPhone 
    ? `https://wa.me/${formattedPhone}?text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;

  try {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      // Browser popup blocked - create and trigger hidden anchor
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener,noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        if (document.body.contains(anchor)) {
          document.body.removeChild(anchor);
        }
      }, 200);
      return true;
    }
    return true;
  } catch (err) {
    console.warn('WhatsApp direct link open exception, navigating:', err);
    try {
      window.location.href = url;
    } catch {
      // ignore
    }
    return false;
  }
}

// Open SMS composer
export function openSmsDirect(phone: string, message: string): void {
  const clean = phone.replace(/[^\d+]/g, '');
  const encoded = encodeURIComponent(message);
  // iOS and Android sms format compatibility
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? '&' : '?';
  const url = `sms:${clean}${separator}body=${encoded}`;
  window.location.href = url;
}
