import React, { useState } from 'react';
import { Store, Plus, CheckCircle, X, ShieldAlert, Sparkles, Building2, Phone, MapPin, Tag } from 'lucide-react';
import { LocalStoreClinic } from '../types';
import { playCleanChime } from '../utils/audioAlerts';

interface StorePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStore: (store: LocalStoreClinic) => void;
  cityName: string;
  language?: string;
}

export const StorePromotionModal: React.FC<StorePromotionModalProps> = ({
  isOpen,
  onClose,
  onAddStore,
  cityName,
  language = 'hi'
}) => {
  const isHindi = language === 'hi';

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<LocalStoreClinic['category']>('clinic_pharmacy');
  const [address, setAddress] = useState('');
  const [timing, setTiming] = useState('8:00 AM - 9:00 PM');
  const [discountOffer, setDiscountOffer] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !phone || !address) return;

    const newStore: LocalStoreClinic = {
      id: `store-user-${Date.now()}`,
      businessName,
      ownerName: ownerName || 'Store Manager',
      phone,
      category,
      address,
      timing: timing || '9:00 AM - 9:00 PM',
      lat: 28.364 + (Math.random() - 0.5) * 0.02,
      lng: 79.42 + (Math.random() - 0.5) * 0.02,
      cityName,
      discountOffer: discountOffer || '10% exclusive discount for E-Rahi commuters',
      rating: 4.8,
      isPromoted: true,
      promotedBadge: 'New Verified Store'
    };

    playCleanChime('success');
    onAddStore(newStore);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[2600] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                {isHindi ? 'अपनी दुकान या क्लीनिक प्रमोट करें' : 'Promote Your Store or Clinic'}
              </h3>
              <p className="text-[11px] text-emerald-100">
                {isHindi ? `${cityName} के 50,000+ यात्रियों व छात्रों तक अपनी सेवा पहुंचाएं` : `Reach 50,000+ commuters & students in ${cityName}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {isSuccess ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                {isHindi ? 'दुकान सफलतापूर्वक लिस्ट हो गई!' : 'Store Listed Successfully!'}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {isHindi ? 'आपकी दुकान अब स्थानीय सेवा टैब में यात्रियों व छात्रों को दिखाई देगी।' : 'Your store is now featured in local directory with your special commuter discount.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHindi ? 'दुकान / क्लीनिक का नाम *' : 'Store / Clinic Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isHindi ? 'उदा: श्री श्याम मेडिकल स्टोर एवं पैथोलॉजी' : 'e.g. Apex Health Clinic & Pharmacy'}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'संचालक का नाम' : 'Owner / Doctor Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={isHindi ? 'उदा: डॉ. आर. के. गुप्ता' : 'e.g. R. K. Gupta'}
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'मोबाइल नंबर *' : 'Phone / WhatsApp *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'श्रेणी (Category)' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="clinic_pharmacy">{isHindi ? 'क्लीनिक व मेडिकल स्टोर' : 'Clinic & Medical Pharmacy'}</option>
                    <option value="diagnostic_lab">{isHindi ? 'पैथोलॉजी व डायग्नोस्टिक लैब' : 'Diagnostic Lab & Blood Test'}</option>
                    <option value="student_bookstore">{isHindi ? 'स्टेशनरी, बुक्स व फोटोकॉपी' : 'Student Books & Stationery'}</option>
                    <option value="repairs_battery">{isHindi ? 'ई-रिक्शा बैटरी चार्जिंग व रिपेयर' : 'EV Battery & Rickshaw Repair'}</option>
                    <option value="grocery_mart">{isHindi ? 'किराना व डेली नीड्स' : 'Grocery Mart & Refreshments'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'दुकान खुलने का समय' : 'Business Timings'}
                  </label>
                  <input
                    type="text"
                    placeholder="8:00 AM - 9:30 PM"
                    value={timing}
                    onChange={(e) => setTiming(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isHindi ? 'दुकान का पूरा पता *' : 'Store Address *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isHindi ? 'उदा: सिविल लाइन्स, बस स्टैंड के पास' : 'e.g. Civil Lines, Near Main Bus Stand'}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{isHindi ? 'यात्रियों / छात्रों के लिए ऑफर व छूट (प्रमोशन)' : 'Offer / Discount for E-Rahi Users'}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">{isHindi ? 'ग्राहकों को आकर्षित करें' : 'Boosts footfall'}</span>
                </label>
                <input
                  type="text"
                  placeholder={isHindi ? 'उदा: दवाओं पर 15% छूट + निःशुल्क बीपी जांच' : 'e.g. 15% off on Medicines + Free BP Checkup'}
                  value={discountOffer}
                  onChange={(e) => setDiscountOffer(e.target.value)}
                  className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/50 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{isHindi ? 'दुकान फ्री में लिस्ट करें' : 'Submit Free Business Listing'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
