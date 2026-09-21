import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Building2, 
  BedDouble, 
  Bed, 
  Stethoscope, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CreditCard, 
  CheckCircle2, 
  Navigation, 
  Share2, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  ChevronRight, 
  QrCode, 
  FileText, 
  MapPin, 
  Percent, 
  ArrowRight,
  HeartPulse,
  Award,
  Download,
  Info
} from 'lucide-react';
import { 
  HospitalFacility, 
  HotelLodge, 
  LocalStoreClinic, 
  SpecialistDoctor, 
  BookingRecord, 
  BookingCategory 
} from '../types';
import { playCleanChime, triggerHapticBuzz } from '../utils/audioAlerts';

export interface BookingTargetItem {
  type: BookingCategory;
  hospital?: HospitalFacility;
  doctor?: SpecialistDoctor;
  hotel?: HotelLodge;
  clinic?: LocalStoreClinic;
}

interface BookingAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingTarget: BookingTargetItem | null;
  onBookingSuccess: (newBooking: BookingRecord) => void;
  onNavigateToVenue?: (lat: number, lng: number, name: string) => void;
  language?: string;
  defaultUserName?: string;
  defaultUserPhone?: string;
}

export const BookingAppointmentModal: React.FC<BookingAppointmentModalProps> = ({
  isOpen,
  onClose,
  bookingTarget,
  onBookingSuccess,
  onNavigateToVenue,
  language = 'hi',
  defaultUserName = '',
  defaultUserPhone = ''
}) => {
  const isHindi = language === 'hi';

  // Step in the modal: 1 = Form Input, 2 = Confirmed Voucher Slip
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  // Common User Info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAge, setCustomerAge] = useState<number | ''>('');
  const [customerGender, setCustomerGender] = useState<'male' | 'female' | 'other'>('male');
  const [guardianName, setGuardianName] = useState('');
  const [idProofType, setIdProofType] = useState<'Aadhaar Card' | 'Voter ID' | 'Student ID' | 'Driving License' | 'Passport'>('Aadhaar Card');

  // Common Date & Time
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [bookedDate, setBookedDate] = useState<string>(todayStr);
  const [bookedTimeSlot, setBookedTimeSlot] = useState<string>('10:00 AM');

  // Hotel / Lodge specifics
  const [stayType, setStayType] = useState<'hourly' | 'nightly'>('hourly');
  const [durationHours, setDurationHours] = useState<number>(3);
  const [durationNights, setDurationNights] = useState<number>(1);
  const [guestsCount, setGuestsCount] = useState<number>(1);
  const [roomType, setRoomType] = useState<string>('Standard Clean Room');
  const [specialRequest, setSpecialRequest] = useState<string>('');

  // Hospital & Doctor specifics
  const [selectedDoctorIndex, setSelectedDoctorIndex] = useState<number>(0);
  const [symptomsProblem, setSymptomsProblem] = useState<string>('');
  const [ayushmanCardHolder, setAyushmanCardHolder] = useState<boolean>(false);
  const [opdShift, setOpdShift] = useState<'morning' | 'afternoon' | 'emergency'>('morning');

  // Clinic & Lab specifics
  const [clinicServiceType, setClinicServiceType] = useState<'doctor_consult' | 'diagnostic_test' | 'medicine_pickup'>('doctor_consult');
  const [selectedDiagnosticTest, setSelectedDiagnosticTest] = useState<string>('Full Body Health Checkup');
  const [homeCollection, setHomeCollection] = useState<boolean>(false);

  // Payment choice
  const [paymentMode, setPaymentMode] = useState<'PAY_AT_VENUE' | 'UPI_ONLINE'>('PAY_AT_VENUE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate default user info when available
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setConfirmedBooking(null);
      if (defaultUserName) setCustomerName(defaultUserName);
      if (defaultUserPhone) setCustomerPhone(defaultUserPhone);

      // Initialize defaults based on target
      if (bookingTarget?.type === 'hospital') {
        setBookedTimeSlot('Morning OPD (9:00 AM - 1:00 PM)');
        if (bookingTarget.doctor && bookingTarget.hospital) {
          const docIdx = bookingTarget.hospital.specialistDoctors.findIndex(d => d.name === bookingTarget.doctor?.name);
          if (docIdx >= 0) setSelectedDoctorIndex(docIdx);
        }
      } else if (bookingTarget?.type === 'hotel' || bookingTarget?.type === 'lodge') {
        const minH = bookingTarget.hotel?.minHours || 2;
        setDurationHours(minH);
        setStayType('hourly');
        setBookedTimeSlot('Immediate Check-in (Next 30 mins)');
      } else if (bookingTarget?.type === 'clinic') {
        setBookedTimeSlot('Today Morning (10:00 AM - 12:00 PM)');
      }
    }
  }, [isOpen, bookingTarget, defaultUserName, defaultUserPhone]);

  if (!isOpen || !bookingTarget) return null;

  const { type, hospital, doctor, hotel, clinic } = bookingTarget;

  // Venue metadata calculation
  const venueTitle = hospital?.name || hotel?.name || clinic?.businessName || 'Venue';
  const venueHindiTitle = hospital?.hindiName || hotel?.hindiName || '';
  const venueAddress = hospital?.address || hotel?.address || clinic?.address || '';
  const venuePhone = hospital?.emergencyHelpline || hospital?.phone || hotel?.phone || clinic?.phone || '+91 94120 00000';
  const venueLat = hospital?.lat || hotel?.lat || clinic?.lat || 28.3685;
  const venueLng = hospital?.lng || hotel?.lng || clinic?.lng || 79.4210;
  const cityName = hospital?.cityName || hotel?.cityName || clinic?.cityName || 'Bareilly';

  // Selected doctor if hospital
  const currentDoctor = hospital?.specialistDoctors?.[selectedDoctorIndex] || doctor;

  // Price & Discount Calculation
  let estimatedAmount = 0;
  let discountApplied = 0;

  if (type === 'hotel' || type === 'lodge') {
    if (hotel) {
      if (stayType === 'hourly') {
        const baseHourly = hotel.hourlyRate || 99;
        const baseMinHrs = hotel.minHours || 2;
        // scale if duration exceeds minHours
        const ratePerHr = baseHourly / baseMinHrs;
        estimatedAmount = Math.round(ratePerHr * durationHours);
      } else {
        estimatedAmount = (hotel.perNightRate || 699) * durationNights;
      }
      // e-Rahi 10% direct booking discount
      discountApplied = Math.round(estimatedAmount * 0.10);
    }
  } else if (type === 'hospital') {
    if (ayushmanCardHolder) {
      estimatedAmount = currentDoctor?.consultationFee || 500;
      discountApplied = estimatedAmount; // 100% free under Ayushman
    } else {
      estimatedAmount = currentDoctor?.consultationFee || 250;
      discountApplied = 0;
    }
  } else if (type === 'clinic') {
    if (clinicServiceType === 'doctor_consult') {
      estimatedAmount = 300;
    } else if (clinicServiceType === 'diagnostic_test') {
      estimatedAmount = 650;
    } else {
      estimatedAmount = 200;
    }
    // 15% Commuter discount
    discountApplied = Math.round(estimatedAmount * 0.15);
  }

  const finalPayableAmount = Math.max(0, estimatedAmount - discountApplied);

  // Submit Booking Handler
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      alert(isHindi ? 'कृपया अपना नाम और मोबाइल नंबर दर्ज करें।' : 'Please enter your name and contact phone.');
      return;
    }

    if (customerPhone.trim().replace(/\D/g, '').length < 10) {
      alert(isHindi ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit phone number.');
      return;
    }

    setIsSubmitting(true);
    triggerHapticBuzz(60);

    setTimeout(() => {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      let prefix = 'ER-BKG';
      let opdToken = undefined;

      if (type === 'hotel') prefix = 'ER-HTL';
      else if (type === 'lodge') prefix = 'ER-LDG';
      else if (type === 'hospital') {
        prefix = 'ER-HSP';
        opdToken = `OPD-${Math.floor(10 + Math.random() * 90)}`;
      } else if (type === 'clinic') prefix = 'ER-CLN';

      const bookingId = `${prefix}-${randomId}`;

      const instructionsList: string[] = [];
      if (type === 'hotel' || type === 'lodge') {
        instructionsList.push(isHindi ? `होटल रिसेप्शन पर ${idProofType} दिखाना अनिवार्य है।` : `Please present your ${idProofType} at reception upon arrival.`);
        instructionsList.push(isHindi ? 'चेक-इन के समय ई-राही बुकिंग वाउचर दिखाएं।' : 'Show this digital e-Rahi voucher at check-in counter.');
        if (stayType === 'hourly') {
          instructionsList.push(isHindi ? `आपका कमरा ${durationHours} घंटे की अवधि के लिए आरक्षित है।` : `Room reserved for ${durationHours} hours slot.`);
        }
      } else if (type === 'hospital') {
        instructionsList.push(isHindi ? `ओपीडी रजिस्ट्रेशन काउंटर नं. 2 पर टोकन (${opdToken}) दिखाएं।` : `Show token (${opdToken}) at OPD Registration Counter No. 2.`);
        if (ayushmanCardHolder) {
          instructionsList.push(isHindi ? 'आयुष्मान गोल्डन कार्ड व आधार कार्ड साथ ले जाएं (निशुल्क जांच व दवाएं)।' : 'Carry Ayushman Card & Aadhaar card for 100% free treatment & medicines.');
        }
        instructionsList.push(isHindi ? 'कृपया दिए गए समय से 15 मिनट पहले अस्पताल पहुँचें।' : 'Please reach 15 minutes prior to appointment slot.');
      } else {
        instructionsList.push(isHindi ? 'क्लीनिक काउंटर पर 15% छूट हेतु ई-राही टोकन दिखाएं।' : 'Present e-Rahi token to avail exclusive 15% discount.');
      }

      const newBookingRecord: BookingRecord = {
        id: bookingId,
        bookingType: type,
        venueId: hospital?.id || hotel?.id || clinic?.id || 'venue-1',
        venueName: venueTitle,
        venueHindiName: venueHindiTitle,
        venueAddress: venueAddress,
        venuePhone: venuePhone,
        venueLat: venueLat,
        venueLng: venueLng,
        cityName: cityName,
        createdAt: new Date().toISOString(),
        status: 'CONFIRMED',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAge: customerAge ? Number(customerAge) : undefined,
        customerGender: customerGender,
        guardianName: guardianName.trim() || undefined,
        idProofType: idProofType,
        bookedDate: bookedDate,
        bookedTimeSlot: bookedTimeSlot,
        stayType: type === 'hotel' || type === 'lodge' ? stayType : undefined,
        durationHoursOrNights: type === 'hotel' || type === 'lodge' ? (stayType === 'hourly' ? durationHours : durationNights) : undefined,
        guestsCount: type === 'hotel' || type === 'lodge' ? guestsCount : undefined,
        roomType: type === 'hotel' || type === 'lodge' ? roomType : undefined,
        specialRequest: specialRequest.trim() || undefined,
        doctorName: currentDoctor?.name,
        doctorSpecialization: currentDoctor?.specialization,
        symptomsProblem: symptomsProblem.trim() || undefined,
        ayushmanCardHolder: ayushmanCardHolder,
        opdTokenNumber: opdToken,
        consultationFee: currentDoctor?.consultationFee,
        serviceType: clinicServiceType,
        diagnosticTest: clinicServiceType === 'diagnostic_test' ? selectedDiagnosticTest : undefined,
        homeCollection: homeCollection,
        estimatedAmount: estimatedAmount,
        discountApplied: discountApplied,
        finalPayableAmount: finalPayableAmount,
        paymentMode: paymentMode,
        isPaid: paymentMode === 'UPI_ONLINE',
        instructions: instructionsList
      };

      // Save to localStorage
      try {
        const existing = localStorage.getItem('erahi_user_bookings');
        const list: BookingRecord[] = existing ? JSON.parse(existing) : [];
        const updatedList = [newBookingRecord, ...list];
        localStorage.setItem('erahi_user_bookings', JSON.stringify(updatedList));
      } catch (err) {
        console.error('Failed to save booking to localStorage', err);
      }

      playCleanChime('fare');
      setConfirmedBooking(newBookingRecord);
      setStep(2);
      setIsSubmitting(false);
      onBookingSuccess(newBookingRecord);
    }, 450);
  };

  // WhatsApp Voucher Share Generator
  const handleShareWhatsAppVoucher = () => {
    if (!confirmedBooking) return;

    let text = `*e-Rahi Direct Booking Voucher*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🎫 *Booking ID:* ${confirmedBooking.id}\n`;
    text += `📍 *Venue:* ${confirmedBooking.venueName}\n`;
    text += `🏢 *Address:* ${confirmedBooking.venueAddress}\n`;
    text += `📅 *Date & Slot:* ${confirmedBooking.bookedDate} (${confirmedBooking.bookedTimeSlot})\n`;
    text += `👤 *Name:* ${confirmedBooking.customerName} (${confirmedBooking.customerPhone})\n`;

    if (confirmedBooking.bookingType === 'hotel' || confirmedBooking.bookingType === 'lodge') {
      text += `🛏️ *Stay Type:* ${confirmedBooking.stayType === 'hourly' ? `${confirmedBooking.durationHoursOrNights} Hours Stay` : `${confirmedBooking.durationHoursOrNights} Night Stay`}\n`;
      text += `👥 *Guests:* ${confirmedBooking.guestsCount || 1} Person\n`;
      text += `💰 *Payable:* ₹${confirmedBooking.finalPayableAmount} (${confirmedBooking.paymentMode === 'PAY_AT_VENUE' ? 'Pay at Hotel' : 'Paid'})\n`;
    } else if (confirmedBooking.bookingType === 'hospital') {
      text += `👨‍⚕️ *Doctor / Dept:* ${confirmedBooking.doctorName || 'General OPD'}\n`;
      if (confirmedBooking.opdTokenNumber) {
        text += `🎟️ *OPD Token No:* ${confirmedBooking.opdTokenNumber}\n`;
      }
      if (confirmedBooking.ayushmanCardHolder) {
        text += `✨ *Ayushman Bharat:* Yes (100% Free Treatment)\n`;
      }
      text += `💰 *Fee:* ₹${confirmedBooking.finalPayableAmount}\n`;
    } else {
      text += `🧪 *Service:* ${confirmedBooking.serviceType === 'diagnostic_test' ? confirmedBooking.diagnosticTest : 'Doctor Consultation'}\n`;
      text += `💰 *Payable:* ₹${confirmedBooking.finalPayableAmount} (e-Rahi 15% discount applied)\n`;
    }

    text += `📞 *Venue Helpline:* ${confirmedBooking.venuePhone}\n`;
    text += `🗺️ *Google Maps:* https://maps.google.com/?q=${confirmedBooking.venueLat},${confirmedBooking.venueLng}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Booked instantly via e-Rahi India Transit & City Directory.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* =========================================================================
            HEADER
           ========================================================================= */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
              type === 'hospital' ? 'bg-rose-600' :
              type === 'hotel' ? 'bg-amber-500 text-slate-950' :
              type === 'lodge' ? 'bg-blue-600' : 'bg-emerald-600'
            }`}>
              {type === 'hospital' && <HeartPulse className="w-5 h-5" />}
              {type === 'hotel' && <BedDouble className="w-5 h-5 text-slate-950" />}
              {type === 'lodge' && <Bed className="w-5 h-5" />}
              {type === 'clinic' && <Stethoscope className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white">
                  {type === 'hospital' ? (isHindi ? 'ओपीडी / डॉक्टर अपॉइंटमेंट' : 'Hospital OPD') :
                   type === 'hotel' ? (isHindi ? 'सीधा कमरा आरक्षण' : 'Direct Hotel Booking') :
                   type === 'lodge' ? (isHindi ? 'छात्र व ट्रांजिट लॉज' : 'Lodge Booking') :
                   (isHindi ? 'क्लीनिक व लैब अपॉइंटमेंट' : 'Clinic Appointment')}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" />
                  {isHindi ? 'त्वरित पुष्टि' : 'Instant Confirm'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1 mt-0.5">
                {step === 1 ? venueTitle : (isHindi ? 'बुकिंग वाउचर व टोकन' : 'Booking Voucher & Token')}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* =========================================================================
            BODY
           ========================================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">

          {/* -------------------------------------------------------------
              STEP 1: BOOKING FORM
             ------------------------------------------------------------- */}
          {step === 1 && (
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              
              {/* Venue Summary Pill */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{venueTitle}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{venueAddress}</div>
                  <div className="text-[11px] text-slate-600 font-semibold mt-1">
                    📞 {venuePhone} • 📍 {cityName}
                  </div>
                </div>
              </div>

              {/* A. SPECIFIC CONFIGURATION BY CATEGORY */}

              {/* 1. HOTEL & LODGE CONFIGURATION */}
              {(type === 'hotel' || type === 'lodge') && (
                <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-amber-950 flex items-center justify-between">
                    <span>{isHindi ? '1. ठहरने का प्रकार व समय चुनें' : '1. Select Stay Duration & Room'}</span>
                    <span className="text-[10px] text-amber-700 font-semibold">
                      {hotel?.hourlyRate ? `₹${hotel.hourlyRate}/${hotel.minHours || 2}hr` : 'Hourly Available'}
                    </span>
                  </div>

                  {/* Hourly vs Nightly Toggle */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStayType('hourly')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        stayType === 'hourly'
                          ? 'bg-amber-500 text-slate-950 shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'प्रति घंटा आराम (Hourly)' : 'Hourly Rest (2-6 hrs)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStayType('nightly')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        stayType === 'nightly'
                          ? 'bg-amber-500 text-slate-950 shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'रात भर का ठहराव (Nightly)' : 'Full Night Stay'}</span>
                    </button>
                  </div>

                  {/* Duration Slider / Select */}
                  {stayType === 'hourly' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isHindi ? `कितने घंटे का कमरा चाहिए? (${durationHours} घंटे)` : `Select Duration: (${durationHours} Hours)`}
                      </label>
                      <div className="flex items-center gap-2">
                        {[2, 3, 4, 6, 8].map((hrs) => (
                          <button
                            key={hrs}
                            type="button"
                            onClick={() => setDurationHours(hrs)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                              durationHours === hrs
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {hrs} {isHindi ? 'घंटे' : 'Hrs'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isHindi ? `कितनी रातें ठहरना है? (${durationNights} रात)` : `Number of Nights: (${durationNights} Nights)`}
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 5].map((nts) => (
                          <button
                            key={nts}
                            type="button"
                            onClick={() => setDurationNights(nts)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                              durationNights === nts
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {nts} {isHindi ? 'रात' : 'Night'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Room Category & Guests */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isHindi ? 'कमरे का प्रकार' : 'Room Type'}
                      </label>
                      <select
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="AC Smart Transit Room">AC Smart Transit Room</option>
                        <option value="Student Quiet Study Pod">Student Quiet Study Pod</option>
                        <option value="Non-AC Budget Room">Non-AC Budget Room</option>
                        <option value="Executive Family Suite">Executive Family Suite</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isHindi ? 'यात्रियों की संख्या' : 'No. of Guests'}
                      </label>
                      <select
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value={1}>1 {isHindi ? 'व्यक्ति' : 'Guest (Solo)'}</option>
                        <option value={2}>2 {isHindi ? 'व्यक्ति' : 'Guests (Double)'}</option>
                        <option value={3}>3 {isHindi ? 'व्यक्ति' : 'Guests (Triple)'}</option>
                        <option value={4}>4+ {isHindi ? 'व्यक्ति (परिवार)' : 'Family'}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. HOSPITAL & DOCTOR CONFIGURATION */}
              {type === 'hospital' && (
                <div className="p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-rose-950 flex items-center justify-between">
                    <span>{isHindi ? '1. डॉक्टर व ओपीडी विभाग चुनें' : '1. Doctor & OPD Department'}</span>
                    <span className="text-[10px] text-rose-700 font-semibold">
                      {hospital?.category === 'government' ? '₹1 Govt OPD Token' : 'Verified Specialist'}
                    </span>
                  </div>

                  {/* Doctor Selector */}
                  {hospital?.specialistDoctors && hospital.specialistDoctors.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isHindi ? 'विशेषज्ञ डॉक्टर:' : 'Specialist Doctor:'}
                      </label>
                      <select
                        value={selectedDoctorIndex}
                        onChange={(e) => setSelectedDoctorIndex(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-white border border-rose-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      >
                        {hospital.specialistDoctors.map((doc, idx) => (
                          <option key={idx} value={idx}>
                            {doc.name} — {doc.specialization} (फीस: ₹{doc.consultationFee})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Ayushman Bharat Golden Card Toggle */}
                  {hospital?.ayushmanBharatAccepted && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-emerald-950">
                            {isHindi ? 'आयुष्मान भारत / गोल्डन कार्ड धारक?' : 'Ayushman Golden Card Holder?'}
                          </div>
                          <div className="text-[10px] text-emerald-700">
                            {isHindi ? '100% निशुल्क इलाज व दवाइयां' : '100% Free Treatment & OPD'}
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={ayushmanCardHolder}
                        onChange={(e) => setAyushmanCardHolder(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                      />
                    </div>
                  )}

                  {/* Symptoms & Health Problem Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isHindi ? 'मुख्य लक्षण / समस्या (डॉक्टर के लिए):' : 'Primary Symptoms / Health Issue:'}
                    </label>
                    <input
                      type="text"
                      placeholder={isHindi ? 'जैसे: सीने में दर्द, बुखार, हड्डी फ्रैक्चर, डिलीवरी, शुगर चेक...' : 'e.g. chest pain, high fever, fracture, delivery...'}
                      value={symptomsProblem}
                      onChange={(e) => setSymptomsProblem(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
              )}

              {/* 3. CLINIC & LAB CONFIGURATION */}
              {type === 'clinic' && (
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-emerald-950 flex items-center justify-between">
                    <span>{isHindi ? '1. सेवा का प्रकार चुनें' : '1. Service & Test Selection'}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">15% e-Rahi Discount</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setClinicServiceType('doctor_consult')}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                        clinicServiceType === 'doctor_consult'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {isHindi ? '👨‍⚕️ डॉक्टर परामर्श' : 'Doctor Consult'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setClinicServiceType('diagnostic_test')}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                        clinicServiceType === 'diagnostic_test'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {isHindi ? '🧪 ब्लड / पैथोलॉजी' : 'Blood & Lab Test'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setClinicServiceType('medicine_pickup')}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                        clinicServiceType === 'medicine_pickup'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {isHindi ? '💊 दवाइयां पिकअप' : 'Medicine Pickup'}
                    </button>
                  </div>

                  {clinicServiceType === 'diagnostic_test' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isHindi ? 'जांच पैकेज:' : 'Diagnostic Package:'}
                      </label>
                      <select
                        value={selectedDiagnosticTest}
                        onChange={(e) => setSelectedDiagnosticTest(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      >
                        <option value="Full Body Health Profile (64 Tests)">Full Body Health Profile (64 Tests) — ₹650</option>
                        <option value="Blood Sugar Fasting + HbA1c + BP">Blood Sugar Fasting + HbA1c + BP — ₹250</option>
                        <option value="CBC + Typhoid + Dengue NS1">CBC + Typhoid + Dengue NS1 — ₹450</option>
                        <option value="Thyroid Profile (T3, T4, TSH)">Thyroid Profile (T3, T4, TSH) — ₹350</option>
                        <option value="Digital X-Ray / ECG">Digital X-Ray / ECG — ₹300</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* B. DATE & TIME SELECTION */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-900">
                  {isHindi ? '2. तारीख व समय स्लॉट' : '2. Appointment Date & Timing Slot'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="date"
                      min={todayStr}
                      value={bookedDate}
                      onChange={(e) => setBookedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={bookedTimeSlot}
                      onChange={(e) => setBookedTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      {type === 'hospital' ? (
                        <>
                          <option value="Morning OPD (9:00 AM - 1:00 PM)">Morning OPD (9:00 AM - 1:00 PM)</option>
                          <option value="Afternoon OPD (2:00 PM - 5:00 PM)">Afternoon OPD (2:00 PM - 5:00 PM)</option>
                          <option value="Evening OPD (5:30 PM - 8:00 PM)">Evening OPD (5:30 PM - 8:00 PM)</option>
                          <option value="Emergency (Immediate Token)">🚨 24x7 Emergency (Immediate Token)</option>
                        </>
                      ) : (
                        <>
                          <option value="Immediate Check-in (Next 30 mins)">Immediate (Next 30 mins)</option>
                          <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                          <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                          <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                          <option value="Night (9:00 PM - 11:30 PM)">Night (9:00 PM - 11:30 PM)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* C. CUSTOMER / PATIENT CONTACT DETAILS */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-900">
                  {type === 'hospital' 
                    ? (isHindi ? '3. मरीज एवं संपर्क विवरण' : '3. Patient & Contact Details')
                    : (isHindi ? '3. यात्री एवं संपर्क विवरण' : '3. Guest & Contact Details')}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder={type === 'hospital' ? (isHindi ? 'मरीज का पूरा नाम *' : 'Patient Full Name *') : (isHindi ? 'यात्री का पूरा नाम *' : 'Guest Full Name *')}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder={isHindi ? 'मोबाइल नंबर (WhatsApp वाउचर हेतु) *' : 'Mobile Number (for WhatsApp) *'}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      maxLength={12}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="number"
                      placeholder={isHindi ? 'उम्र (Age)' : 'Age'}
                      value={customerAge}
                      onChange={(e) => setCustomerAge(e.target.value ? Number(e.target.value) : '')}
                      min={1}
                      max={110}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <select
                      value={customerGender}
                      onChange={(e) => setCustomerGender(e.target.value as any)}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="male">{isHindi ? 'पुरुष' : 'Male'}</option>
                      <option value="female">{isHindi ? 'महिला' : 'Female'}</option>
                      <option value="other">{isHindi ? 'अन्य' : 'Other'}</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={idProofType}
                      onChange={(e) => setIdProofType(e.target.value as any)}
                      className="w-full px-1.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="Aadhaar Card">Aadhaar</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Student ID">Student ID</option>
                      <option value="Driving License">DL</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* D. PRICE BREAKDOWN & PAYMENT CHOICE */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{isHindi ? 'मूल अनुमानित शुल्क' : 'Base Estimated Fee'}:</span>
                  <span className="font-semibold line-through text-slate-400">₹{estimatedAmount}</span>
                </div>

                {discountApplied > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      <span>{ayushmanCardHolder ? (isHindi ? 'आयुष्मान भारत 100% छूट' : 'Ayushman 100% Subsidy') : (isHindi ? 'ई-राही डायरेक्ट छूट' : 'e-Rahi Direct Discount')}:</span>
                    </span>
                    <span>-₹{discountApplied}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-sm text-slate-900">
                  <span>{isHindi ? 'कुल देय राशि' : 'Final Payable Amount'}:</span>
                  <span className="text-base text-emerald-700 font-black">
                    {finalPayableAmount === 0 ? (isHindi ? 'निशुल्क (₹0 Free)' : '₹0 Free') : `₹${finalPayableAmount}`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <label className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                    paymentMode === 'PAY_AT_VENUE' ? 'bg-white border-slate-900 font-bold text-slate-900 shadow-2xs' : 'border-slate-200 text-slate-600'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === 'PAY_AT_VENUE'}
                      onChange={() => setPaymentMode('PAY_AT_VENUE')}
                      className="accent-slate-900"
                    />
                    <span className="text-xs">{isHindi ? 'स्थान पर नकद / UPI दें' : 'Pay at Counter'}</span>
                  </label>

                  <label className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                    paymentMode === 'UPI_ONLINE' ? 'bg-white border-slate-900 font-bold text-slate-900 shadow-2xs' : 'border-slate-200 text-slate-600'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === 'UPI_ONLINE'}
                      onChange={() => setPaymentMode('UPI_ONLINE')}
                      className="accent-slate-900"
                    />
                    <span className="text-xs">{isHindi ? 'UPI ऑनलाइन कन्फर्म' : 'UPI Online Pay'}</span>
                  </label>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>{isHindi ? 'पुष्टि हो रही है...' : 'Confirming Reservation...'}</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>
                        {type === 'hospital' ? (isHindi ? 'ओपीडी अपॉइंटमेंट तुरंत बुक करें' : 'Confirm Hospital Appointment') :
                         type === 'hotel' ? (isHindi ? 'कमरा तुरंत बुक करें (कन्फर्मेशन पाएं)' : 'Confirm Room Reservation') :
                         type === 'lodge' ? (isHindi ? 'लॉज स्लॉट बुक करें' : 'Confirm Lodge Booking') :
                         (isHindi ? 'क्लीनिक स्लॉट बुक करें' : 'Book Clinic Appointment')}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* -------------------------------------------------------------
              STEP 2: CONFIRMED VOUCHER & TOKEN RECEIPT
             ------------------------------------------------------------- */}
          {step === 2 && confirmedBooking && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              
              {/* Success Banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-emerald-950 mt-2">
                  {isHindi ? '🎉 बुकिंग सफलतापूर्वक कन्फर्म हो गई!' : '🎉 Reservation Confirmed Successfully!'}
                </h3>
                <p className="text-xs text-emerald-700">
                  {isHindi
                    ? 'आपका डिजिटल टोकन व वाउचर सुरक्षित रूप से जनरेट हो गया है।'
                    : 'Your official voucher & token have been generated.'}
                </p>
              </div>

              {/* Digital Slip Card */}
              <div className="bg-slate-50 rounded-3xl p-4 sm:p-5 border border-slate-200 space-y-3 relative overflow-hidden shadow-2xs">
                <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      e-Rahi Official Token
                    </span>
                    <div className="text-lg font-black text-slate-900 tracking-tight font-mono">
                      {confirmedBooking.id}
                    </div>
                  </div>

                  {confirmedBooking.opdTokenNumber && (
                    <div className="bg-rose-100 text-rose-900 border border-rose-200 px-3 py-1 rounded-xl text-center shrink-0">
                      <span className="text-[9px] font-bold block uppercase">OPD Token</span>
                      <span className="text-sm font-black">{confirmedBooking.opdTokenNumber}</span>
                    </div>
                  )}
                </div>

                {/* Details list */}
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500">{isHindi ? 'स्थान / प्रतिष्ठान' : 'Venue'}:</span>
                    <span className="font-bold text-slate-900 text-right">{confirmedBooking.venueName}</span>
                  </div>

                  {confirmedBooking.doctorName && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500">{isHindi ? 'डॉक्टर / विशेषज्ञ' : 'Doctor'}:</span>
                      <span className="font-bold text-slate-900 text-right">
                        {confirmedBooking.doctorName} ({confirmedBooking.doctorSpecialization})
                      </span>
                    </div>
                  )}

                  {confirmedBooking.roomType && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500">{isHindi ? 'कमरे का प्रकार' : 'Room'}:</span>
                      <span className="font-bold text-slate-900 text-right">
                        {confirmedBooking.roomType} ({confirmedBooking.stayType === 'hourly' ? `${confirmedBooking.durationHoursOrNights} Hrs` : `${confirmedBooking.durationHoursOrNights} Nights`})
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500">{isHindi ? 'दिनांक व समय' : 'Date & Slot'}:</span>
                    <span className="font-bold text-slate-900 text-right">
                      {confirmedBooking.bookedDate} • {confirmedBooking.bookedTimeSlot}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500">{isHindi ? 'मरीज / मुख्य अतिथि' : 'Name'}:</span>
                    <span className="font-bold text-slate-900 text-right">
                      {confirmedBooking.customerName} ({confirmedBooking.customerPhone})
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-500">{isHindi ? 'भुगतान स्थिति' : 'Payment'}:</span>
                    <span className="font-black text-emerald-700 text-right">
                      ₹{confirmedBooking.finalPayableAmount} ({confirmedBooking.paymentMode === 'PAY_AT_VENUE' ? (isHindi ? 'काउंटर पर भुगतान' : 'Pay at Counter') : 'Paid Online'})
                    </span>
                  </div>
                </div>

                {/* Important Instructions Box */}
                {confirmedBooking.instructions && confirmedBooking.instructions.length > 0 && (
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1 text-[11px] text-slate-600">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isHindi ? 'महत्वपूर्ण निर्देश:' : 'Important Instructions:'}</span>
                    </div>
                    {confirmedBooking.instructions.map((inst, iIdx) => (
                      <div key={iIdx} className="flex items-start gap-1.5">
                        <span className="text-slate-400">•</span>
                        <span>{inst}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2 pt-1">
                {/* 1. Share WhatsApp Voucher */}
                <button
                  onClick={handleShareWhatsAppVoucher}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>{isHindi ? 'WhatsApp पर रसीद व वाउचर शेयर करें' : 'Share Voucher on WhatsApp'}</span>
                </button>

                {/* 2. Navigate / Book E-Rickshaw Ride directly */}
                {onNavigateToVenue && (
                  <button
                    onClick={() => {
                      onNavigateToVenue(confirmedBooking.venueLat, confirmedBooking.venueLng, confirmedBooking.venueName);
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Navigation className="w-4 h-4 text-amber-400" />
                    <span>{isHindi ? '🛺 ई-रिक्शा रूट शुरू करें / यहाँ जाएँ' : 'Book E-Rickshaw Ride / Go Here'}</span>
                  </button>
                )}

                {/* 3. Call Reception */}
                <a
                  href={`tel:${confirmedBooking.venuePhone}`}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span>{isHindi ? 'हेल्पलाइन / रिसेप्शन पर कॉल करें' : 'Call Venue Helpline'}</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
