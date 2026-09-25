import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Plus, 
  CheckCircle, 
  X, 
  ShieldAlert, 
  Sparkles, 
  Building2, 
  Phone, 
  MapPin, 
  Tag, 
  CreditCard, 
  QrCode, 
  Clock, 
  Calendar, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  Award,
  ArrowRight,
  Info
} from 'lucide-react';
import { LocalStoreClinic } from '../types';
import { playCleanChime } from '../utils/audioAlerts';

interface StorePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStore: (store: LocalStoreClinic) => void;
  onRenewStore?: (storeId: string) => void;
  cityName: string;
  language?: string;
  storeToRenew?: LocalStoreClinic | null;
}

export const StorePromotionModal: React.FC<StorePromotionModalProps> = ({
  isOpen,
  onClose,
  onAddStore,
  onRenewStore,
  cityName,
  language = 'hi',
  storeToRenew = null,
}) => {
  const isHindi = language === 'hi';

  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<LocalStoreClinic['category']>('clinic_pharmacy');
  const [address, setAddress] = useState('');
  const [timing, setTiming] = useState('8:00 AM - 9:00 PM');
  const [discountOffer, setDiscountOffer] = useState('');
  
  // Payment states
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'qr'>('qr');
  const [upiRefId, setUpiRefId] = useState('');
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Pre-fill form if renewing existing store
  useEffect(() => {
    if (storeToRenew) {
      setBusinessName(storeToRenew.businessName);
      setOwnerName(storeToRenew.ownerName);
      setPhone(storeToRenew.phone);
      setCategory(storeToRenew.category);
      setAddress(storeToRenew.address);
      setTiming(storeToRenew.timing || '8:00 AM - 9:00 PM');
      setDiscountOffer(storeToRenew.discountOffer || '');
      setStep('payment'); // Go straight to ₹19 renewal payment
    } else {
      setStep('form');
      setIsSuccess(false);
    }
  }, [storeToRenew, isOpen]);

  if (!isOpen) return null;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !phone || !address) return;
    setStep('payment');
  };

  const handleCompleteListing = () => {
    setIsProcessingPay(true);

    setTimeout(() => {
      const now = new Date();
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 3); // 3 months validity

      if (storeToRenew && onRenewStore) {
        onRenewStore(storeToRenew.id);
      } else {
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
          discountOffer: discountOffer || (isHindi ? 'ई-राही यात्रियों के लिए 10% विशेष छूट' : '10% exclusive discount for E-Rahi commuters'),
          rating: 4.8,
          isPromoted: true,
          promotedBadge: isHindi ? 'वेरिफाइड पार्टनर (3 माह)' : 'Verified Partner (3 Mo)',
          listingFeePaid: 19,
          validityMonths: 3,
          listedAt: now.toISOString(),
          expiresAt: expiry.toISOString(),
          listingStatus: 'active',
          paymentUpiRef: upiRefId.trim() || `UPI-19-${Math.floor(100000 + Math.random() * 900000)}`
        };

        onAddStore(newStore);
      }

      playCleanChime('success');
      setIsProcessingPay(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setStep('form');
        onClose();
      }, 2000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[2600] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white font-bold shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                  {storeToRenew 
                    ? (isHindi ? 'दुकान लिस्टिंग नवीनीकरण (Renew Listing)' : 'Renew Store Listing')
                    : (isHindi ? 'दुकान या क्लीनिक लिस्ट करें' : 'List Store or Clinic')}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  ₹19 / 3 {isHindi ? 'माह' : 'Mo'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                {isHindi 
                  ? `${cityName} के 50,000+ यात्रियों व छात्रों को अपना कस्टमर बनाएं` 
                  : `Reach 50,000+ commuters & students across ${cityName}`}
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

        {/* Pricing Plan Notice Bar */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-950 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isHindi ? '₹19 शुल्क पर 3 महीने (90 दिन) तक एक्टिव लिस्टिंग' : '₹19 Listing Fee for 3 Months (90 Days) Active Validity'}
            </span>
          </div>
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-lg shrink-0">
            ~₹6.3 / {isHindi ? 'माह' : 'mo'}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                {storeToRenew 
                  ? (isHindi ? 'लिस्टिंग 3 महीने के लिए सफलतापूर्वक रिन्यू हो गई!' : 'Listing Renewed for 3 Months!')
                  : (isHindi ? 'दुकान सफलतापूर्वक लिस्ट हो गई!' : 'Store Listed & Activated Successfully!')}
              </h4>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl max-w-xs mx-auto text-left text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>{isHindi ? 'भुगतान किया:' : 'Paid Amount:'}</span>
                  <span className="font-bold text-slate-900">₹19.00</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>{isHindi ? 'वैधता अवधि:' : 'Validity Period:'}</span>
                  <span className="font-bold text-emerald-700">3 {isHindi ? 'महीने (90 दिन)' : 'Months (90 Days)'}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>{isHindi ? 'नवीनीकरण:' : 'Next Renewal:'}</span>
                  <span className="font-bold text-slate-700">3 {isHindi ? 'माह बाद (₹19)' : 'Months later (₹19)'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {isHindi 
                  ? 'आपकी दुकान अब ई-राही ऐप के लोकल डायरेक्टरी व रूट नेविगेटर पर लाइव है।' 
                  : 'Your business is now live with Verified badge in E-Rahi directory and GPS map.'}
              </p>
            </div>
          ) : step === 'form' ? (
            <form onSubmit={handleProceedToPayment} className="space-y-3.5">
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
                    {isHindi ? 'संचालक / डॉक्टर का नाम' : 'Owner / Doctor Name'}
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
                    {isHindi ? 'मोबाइल / WhatsApp नंबर *' : 'Phone / WhatsApp *'}
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
                  <span>{isHindi ? 'यात्रियों / छात्रों के लिए ऑफर व छूट' : 'Discount Offer for Commuters'}</span>
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

              {/* 3-Month Plan Inclusion Cards */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  ✨ {isHindi ? '₹19 लिस्टिंग में क्या मिलेगा (3 माह):' : 'Included in ₹19 Plan (3 Months):'}
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{isHindi ? 'सत्यापित पार्टनर बैज' : 'Verified Partner Badge'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{isHindi ? 'सीधा GPS नेविगेशन' : 'Direct GPS Navigation'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{isHindi ? '1-क्लिक कॉल व WhatsApp' : '1-Click Call & WhatsApp'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{isHindi ? '3 माह बाद ₹19 में रिन्यू' : 'Renew every 3 mo for ₹19'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{isHindi ? 'आगे बढ़ें: ₹19 भुगतान करें (3 माह)' : 'Proceed: Pay ₹19 for 3 Months'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Payment Step */
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Back to form button */}
              {!storeToRenew && (
                <button
                  onClick={() => setStep('form')}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  ← {isHindi ? 'दुकान विवरण बदलें' : 'Back to details'}
                </button>
              )}

              {/* Order Summary Card */}
              <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {isHindi ? 'व्यापार लिस्टिंग योजना' : 'Merchant Listing Plan'}
                    </span>
                    <h4 className="font-extrabold text-sm sm:text-base text-amber-300">
                      {businessName || storeToRenew?.businessName || 'Local Business Listing'}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">₹19</span>
                    <span className="text-[10px] text-slate-400 block">/ 3 {isHindi ? 'महीने' : 'Months'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isHindi ? 'वैधता: 90 दिन' : 'Validity: 90 Days (3 Months)'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                    {isHindi ? 'रिन्यूअल योग्य' : 'Renewable'}
                  </span>
                </div>
              </div>

              {/* UPI Options */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isHindi ? 'UPI भुगतान माध्यम चुनें:' : 'Select UPI Payment Mode:'}
                </label>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUpiApp('qr')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      selectedUpiApp === 'qr'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-600" />
                    <span className="text-[10px] font-bold">QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUpiApp('gpay')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      selectedUpiApp === 'gpay'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span className="text-[10px] font-bold">GPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUpiApp('phonepe')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      selectedUpiApp === 'phonepe'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <span className="text-[10px] font-bold">PhonePe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUpiApp('paytm')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      selectedUpiApp === 'paytm'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Award className="w-5 h-5 text-cyan-600" />
                    <span className="text-[10px] font-bold">Paytm</span>
                  </button>
                </div>

                {/* QR Display */}
                {selectedUpiApp === 'qr' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                    <div className="w-20 h-20 bg-white border border-slate-300 rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                      {/* Simulative Crisp UPI QR */}
                      <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white p-1 text-center">
                        <QrCode className="w-9 h-9 text-amber-300" />
                        <span className="text-[8px] font-mono tracking-tighter">₹19 PAY</span>
                      </div>
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-800">
                        {isHindi ? 'किसी भी UPI ऐप से स्कैन करें' : 'Scan via any UPI App'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        UPI ID: <span className="font-bold text-slate-800">erahi.merchant@icici</span>
                      </p>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        ✓ {isHindi ? 'सुरक्षित 128-बिट एन्क्रिप्टेड भुगतान' : 'Secure 128-bit Encrypted'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Optional UTR / Ref ID */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isHindi ? 'UPI संदर्भ संख्या / UTR (वैकल्पिक):' : 'UPI Reference / Transaction ID (Optional):'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 408271892019"
                    value={upiRefId}
                    onChange={(e) => setUpiRefId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Pay & Activate Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessingPay}
                  onClick={handleCompleteListing}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {isProcessingPay ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isHindi ? '₹19 भुगतान सत्यापित हो रहा है...' : 'Verifying ₹19 Payment...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-200" />
                      <span>
                        {storeToRenew 
                          ? (isHindi ? '₹19 देकर 3 माह के लिए रिन्यू करें' : 'Pay ₹19 & Renew for 3 Months')
                          : (isHindi ? '₹19 देकर दुकान 3 माह के लिए एक्टिव करें' : 'Pay ₹19 & Activate 3-Month Listing')}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Transparency Notice */}
              <p className="text-[10px] text-slate-400 text-center font-medium leading-relaxed">
                {isHindi 
                  ? 'यह ₹19 शुल्क 3 महीने (90 दिन) के लिए मान्य है। 3 महीने पूर्ण होने पर दुकान को पुनः ₹19 में रिन्यू किया जा सकता है।'
                  : 'This ₹19 fee is valid for 3 months (90 days). After 3 months, you can renew your listing anytime for ₹19.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
