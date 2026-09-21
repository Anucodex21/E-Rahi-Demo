import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Phone, 
  Send, 
  MessageSquare, 
  Check, 
  Heart, 
  Edit3, 
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { EmergencyContact, GuardianRelationship } from '../types';
import { openWhatsAppDirect, openSmsDirect, buildLiveLocationShareMessage } from '../utils/safetyGuardian';
import { triggerHapticBuzz } from '../utils/audioAlerts';

interface EmergencyContactsManagerProps {
  contacts: EmergencyContact[];
  onSaveContacts: (contacts: EmergencyContact[]) => void;
  userName: string;
  isHindi?: boolean;
}

const RELATIONSHIPS: GuardianRelationship[] = [
  'Husband',
  'Wife',
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Friend',
  'Police',
  'Guardian'
];

export const EmergencyContactsManager: React.FC<EmergencyContactsManagerProps> = ({
  contacts,
  onSaveContacts,
  userName,
  isHindi = true
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formRelation, setFormRelation] = useState<GuardianRelationship>('Husband');
  const [formPhone, setFormPhone] = useState('');
  const [formPrimary, setFormPrimary] = useState(false);
  const [formNotifyWa, setFormNotifyWa] = useState(true);
  const [formNotifySms, setFormNotifySms] = useState(true);
  const [testNotice, setTestNotice] = useState<string | null>(null);

  const resetForm = () => {
    setFormName('');
    setFormRelation('Husband');
    setFormPhone('');
    setFormPrimary(false);
    setFormNotifyWa(true);
    setFormNotifySms(true);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleStartEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setFormName(contact.name);
    setFormRelation(contact.relationship);
    setFormPhone(contact.phone);
    setFormPrimary(contact.isPrimary);
    setFormNotifyWa(contact.notifyViaWhatsapp);
    setFormNotifySms(contact.notifyViaSms);
    setIsAdding(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    let updatedList = [...contacts];

    if (editingId) {
      updatedList = updatedList.map(c => {
        if (c.id === editingId) {
          return {
            ...c,
            name: formName.trim(),
            relationship: formRelation,
            phone: formPhone.trim(),
            isPrimary: formPrimary,
            notifyViaWhatsapp: formNotifyWa,
            notifyViaSms: formNotifySms
          };
        }
        // If this one is set to primary, unset others
        if (formPrimary) {
          return { ...c, isPrimary: false };
        }
        return c;
      });
    } else {
      const newContact: EmergencyContact = {
        id: `guardian-${Date.now()}`,
        name: formName.trim(),
        relationship: formRelation,
        phone: formPhone.trim(),
        isPrimary: formPrimary || contacts.length === 0,
        notifyViaWhatsapp: formNotifyWa,
        notifyViaSms: formNotifySms
      };

      if (newContact.isPrimary) {
        updatedList = updatedList.map(c => ({ ...c, isPrimary: false }));
      }
      updatedList.push(newContact);
    }

    onSaveContacts(updatedList);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    // If deleted the primary, make the first one primary
    if (updated.length > 0 && !updated.some(c => c.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onSaveContacts(updated);
  };

  const handleSetPrimary = (id: string) => {
    const updated = contacts.map(c => ({
      ...c,
      isPrimary: c.id === id
    }));
    onSaveContacts(updated);
  };

  const handleSendTestWhatsapp = (contact: EmergencyContact) => {
    const testMsg = isHindi
      ? `👋 नमस्ते ${contact.name}, यह ${userName || 'आपकी प्रियजन'} द्वारा E-Rahi India सुरक्षा ऐप से भेजा गया टेस्ट मैसेज है। आपातकाल अथवा फोन स्विच-ऑफ होने की स्थिति में आपको मेरी लाइव लोकेशन सीधे प्राप्त होगी।`
      : `👋 Hello ${contact.name}, this is a test connection from ${userName || 'your family member'} via E-Rahi India Safety Guard. In an emergency or before phone shut-off, you will receive my live GPS location here.`;

    openWhatsAppDirect(contact.phone, testMsg);
    setTestNotice(`WhatsApp test alert sent to ${contact.name}`);
    setTimeout(() => setTestNotice(null), 4000);
  };

  const handleShareLiveLocation = (contact: EmergencyContact) => {
    let lat = 28.3620;
    let lng = 79.4200;
    try {
      const stored = localStorage.getItem('erahi_last_known_location');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lat && parsed.lng) {
          lat = parsed.lat;
          lng = parsed.lng;
        }
      }
    } catch {
      // fallback
    }

    const msg = buildLiveLocationShareMessage({
      userName: userName || 'Priya Sharma',
      lat,
      lng,
      accuracyMeters: 10,
      contactName: contact.name,
      isHindi
    });

    openWhatsAppDirect(contact.phone, msg);
    triggerHapticBuzz([100, 50, 150]);
    setTestNotice(
      isHindi
        ? `🟢 ${contact.name} (${contact.phone}) के WhatsApp पर लाइव लोकेशन भेजी जा रही है`
        : `🟢 Sharing live location with ${contact.name} on WhatsApp`
    );
    setTimeout(() => setTestNotice(null), 5000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 fill-rose-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {isHindi ? 'विश्वसनीय संपर्क (Husband / Family Guardians)' : 'Emergency Guardians / Contacts'}
              </h3>
              <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                {contacts.length} {isHindi ? 'व्यक्ति' : 'Added'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isHindi 
                ? 'SOS या फोन स्विच ऑफ होने पर इन व्यक्तियों को लाइव लोकेशन तुरंत प्राप्त होगी' 
                : 'Live location is sent here on SOS or before phone powers down'}
            </p>
          </div>
        </div>

        {!isAdding && (
          <button
            onClick={handleStartAdd}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isHindi ? 'नया व्यक्ति जोड़ें' : 'Add Person'}</span>
          </button>
        )}
      </div>

      {testNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{testNotice}</span>
        </div>
      )}

      {/* Add / Edit Form Modal/Drawer */}
      {isAdding && (
        <form onSubmit={handleSaveContact} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5 animate-in fade-in zoom-in-98 duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>{editingId ? (isHindi ? 'व्यक्ति की जानकारी बदलें' : 'Edit Contact') : (isHindi ? 'नया आपातकालीन व्यक्ति जोड़ें' : 'Add Emergency Guardian')}</span>
            </span>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {isHindi ? 'व्यक्ति का नाम (e.g. Husband name)' : 'Contact Name'} *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder={isHindi ? 'उदा. राहुल (पति) / पापा' : 'e.g. Rahul (Husband)'}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:border-slate-400 bg-white outline-none shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {isHindi ? 'संबंध (Relationship)' : 'Relationship'} *
              </label>
              <select
                value={formRelation}
                onChange={e => setFormRelation(e.target.value as GuardianRelationship)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:border-slate-400 bg-white outline-none shadow-2xs cursor-pointer"
              >
                {RELATIONSHIPS.map(rel => (
                  <option key={rel} value={rel}>
                    {rel === 'Husband' ? (isHindi ? 'Husband (पति)' : 'Husband') : 
                     rel === 'Wife' ? (isHindi ? 'Wife (पत्नी)' : 'Wife') : 
                     rel === 'Father' ? (isHindi ? 'Father (पिता जी)' : 'Father') : 
                     rel === 'Mother' ? (isHindi ? 'Mother (माता जी)' : 'Mother') : 
                     rel === 'Brother' ? (isHindi ? 'Brother (भाई)' : 'Brother') : 
                     rel === 'Sister' ? (isHindi ? 'Sister (बहन)' : 'Sister') : 
                     rel === 'Friend' ? (isHindi ? 'Friend (मित्र / सहेली)' : 'Friend') : 
                     rel === 'Police' ? (isHindi ? 'Police / Authority' : 'Police') : 
                     'Guardian'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {isHindi ? 'फोन / WhatsApp नंबर' : 'Phone / WhatsApp Number'} *
              </label>
              <input
                type="tel"
                required
                value={formPhone}
                onChange={e => setFormPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:border-slate-400 bg-white outline-none shadow-2xs"
              />
            </div>

            <div className="flex flex-col justify-end space-y-1.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={formPrimary}
                  onChange={e => setFormPrimary(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <span>{isHindi ? '⭐ मुख्य व्यक्ति (First Priority Responder)' : '⭐ Primary Responder'}</span>
              </label>

              <div className="flex items-center gap-4 text-[11px] text-slate-600 font-medium">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formNotifyWa}
                    onChange={e => setFormNotifyWa(e.target.checked)}
                    className="rounded text-emerald-600 w-3.5 h-3.5"
                  />
                  <span>WhatsApp</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formNotifySms}
                    onChange={e => setFormNotifySms(e.target.checked)}
                    className="rounded text-slate-900 w-3.5 h-3.5"
                  />
                  <span>SMS</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              {isHindi ? 'सहेजें (Save Person)' : 'Save Contact'}
            </button>
          </div>
        </form>
      )}

      {/* Contacts List */}
      <div className="space-y-2.5">
        {contacts.length === 0 ? (
          <div className="text-center py-6 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <AlertCircle className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-700">
              {isHindi ? 'कोई आपातकालीन व्यक्ति नहीं जुड़ा है' : 'No emergency contacts added yet'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isHindi ? 'कृपया अपने पति, माता-पिता अथवा निकट मित्र का नंबर जोड़ें' : 'Please add your husband or parents to keep you safe'}
            </p>
            <button
              onClick={handleStartAdd}
              className="mt-3 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isHindi ? 'पहला व्यक्ति जोड़ें' : 'Add First Contact'}</span>
            </button>
          </div>
        ) : (
          contacts.map(contact => (
            <div
              key={contact.id}
              className={`p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                contact.isPrimary
                  ? 'bg-rose-50/60 border-rose-200 shadow-2xs'
                  : 'bg-white border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  contact.isPrimary ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700'
                }`}>
                  {contact.relationship === 'Husband' ? '💍' :
                   contact.relationship === 'Father' || contact.relationship === 'Mother' ? '🏡' :
                   contact.relationship === 'Police' ? '👮' : '👤'}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {contact.name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {contact.relationship}
                    </span>
                    {contact.isPrimary && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-0.5 shadow-2xs">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <span>{isHindi ? 'प्राथमिक' : 'Primary'}</span>
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>{contact.phone}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                      {contact.notifyViaWhatsapp && '💬 WhatsApp'}
                      {contact.notifyViaSms && ' • ✉️ SMS'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 flex-wrap">
                <button
                  onClick={() => handleShareLiveLocation(contact)}
                  title="Share live GPS location with Google Maps on WhatsApp"
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                >
                  <Send className="w-3 h-3 text-white fill-white" />
                  <span>{isHindi ? '🟢 लोकेशन शेयर' : '🟢 Share Location'}</span>
                </button>

                <button
                  onClick={() => handleSendTestWhatsapp(contact)}
                  title="Test WhatsApp connection"
                  className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <Send className="w-3 h-3 text-emerald-600" />
                  <span>{isHindi ? 'टेस्ट पिंग' : 'Test WA'}</span>
                </button>

                <a
                  href={`tel:${contact.phone}`}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  title="Call Phone"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>

                {!contact.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(contact.id)}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    title={isHindi ? 'प्राथमिक बनाएं' : 'Set as Primary'}
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => handleStartEdit(contact)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
