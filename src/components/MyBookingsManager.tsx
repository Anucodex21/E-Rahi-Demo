import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Navigation, 
  Send, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  HeartPulse, 
  BedDouble, 
  Bed, 
  Stethoscope, 
  Building2, 
  FileText, 
  QrCode, 
  ArrowRight,
  Filter,
  Sparkles,
  Award
} from 'lucide-react';
import { BookingRecord, BookingCategory } from '../types';
import { triggerHapticBuzz } from '../utils/audioAlerts';

interface MyBookingsManagerProps {
  onNavigateToVenue: (lat: number, lng: number, name: string) => void;
  language?: string;
  onExploreServices?: () => void;
}

export const MyBookingsManager: React.FC<MyBookingsManagerProps> = ({
  onNavigateToVenue,
  language = 'hi',
  onExploreServices
}) => {
  const isHindi = language === 'hi';
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [filterType, setFilterType] = useState<'all' | BookingCategory>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  // Load bookings from localStorage
  const loadBookings = () => {
    try {
      const stored = localStorage.getItem('erahi_user_bookings');
      if (stored) {
        setBookings(JSON.parse(stored));
      } else {
        setBookings([]);
      }
    } catch (e) {
      console.error('Failed to parse bookings', e);
      setBookings([]);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Delete / Cancel Booking
  const handleCancelBooking = (bookingId: string) => {
    const confirmMsg = isHindi 
      ? 'क्या आप सच में इस बुकिंग / अपॉइंटमेंट को रद्द करना चाहते हैं?'
      : 'Are you sure you want to cancel this booking/appointment?';
    
    if (window.confirm(confirmMsg)) {
      triggerHapticBuzz(50);
      const updated = bookings.filter(b => b.id !== bookingId);
      setBookings(updated);
      localStorage.setItem('erahi_user_bookings', JSON.stringify(updated));
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(null);
      }
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filterType === 'all') return true;
    if (filterType === 'hotel') return b.bookingType === 'hotel' || b.bookingType === 'lodge';
    return b.bookingType === filterType;
  });

  // Share WhatsApp receipt
  const handleShareWhatsApp = (b: BookingRecord) => {
    let text = `*e-Rahi Official Booking Voucher*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🎫 *Booking ID:* ${b.id}\n`;
    text += `📍 *Venue:* ${b.venueName}\n`;
    text += `🏢 *Address:* ${b.venueAddress}\n`;
    text += `📅 *Date & Slot:* ${b.bookedDate} (${b.bookedTimeSlot})\n`;
    text += `👤 *Name:* ${b.customerName} (${b.customerPhone})\n`;

    if (b.bookingType === 'hotel' || b.bookingType === 'lodge') {
      text += `🛏️ *Stay Type:* ${b.stayType === 'hourly' ? `${b.durationHoursOrNights} Hours Stay` : `${b.durationHoursOrNights} Nights Stay`}\n`;
      text += `💰 *Payable:* ₹${b.finalPayableAmount} (${b.paymentMode === 'PAY_AT_VENUE' ? 'Pay at Venue' : 'Paid'})\n`;
    } else if (b.bookingType === 'hospital') {
      text += `👨‍⚕️ *Doctor:* ${b.doctorName || 'General OPD'}\n`;
      if (b.opdTokenNumber) text += `🎟️ *OPD Token:* ${b.opdTokenNumber}\n`;
      if (b.ayushmanCardHolder) text += `✨ *Ayushman Card:* Free 100%\n`;
      text += `💰 *Fee:* ₹${b.finalPayableAmount}\n`;
    } else {
      text += `🧪 *Service:* ${b.diagnosticTest || 'Clinic Consultation'}\n`;
      text += `💰 *Payable:* ₹${b.finalPayableAmount}\n`;
    }

    text += `📞 *Venue Phone:* ${b.venuePhone}\n`;
    text += `🗺️ *Google Maps:* https://maps.google.com/?q=${b.venueLat},${b.venueLng}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `Booked instantly via e-Rahi India.`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner with Stats */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
            {isHindi ? 'ई-राही डिजिटल बुकिंग वॉलेट' : 'e-Rahi Digital Reservation Hub'}
          </span>
          <h2 className="text-lg sm:text-xl font-black tracking-tight">
            {isHindi ? 'मेरी बुकिंग्स व डॉक्टर अपॉइंटमेंट्स' : 'My Bookings & Doctor Appointments'}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {isHindi 
              ? 'होटल, लॉज, अस्पताल ओपीडी व क्लीनिक के पुष्ट टोकन यहाँ सुरक्षित हैं।'
              : 'All your confirmed room stays, hospital OPD tokens and clinic slots in one place.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-white/10 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 block">{isHindi ? 'सक्रिय बुकिंग्स' : 'Active'}</span>
            <span className="text-sm font-black text-amber-300">{bookings.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'all', label: isHindi ? 'सभी बुकिंग्स' : 'All Bookings' },
          { key: 'hospital', label: isHindi ? '🏥 अस्पताल व ओपीडी' : 'Hospitals' },
          { key: 'hotel', label: isHindi ? '🏨 होटल व लॉज' : 'Hotels & Lodges' },
          { key: 'clinic', label: isHindi ? '🧪 क्लीनिक व लैब' : 'Clinics & Labs' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key as any)}
            className={`px-3.5 py-2 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterType === tab.key
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {isHindi ? 'कोई सक्रिय बुकिंग नहीं मिली' : 'No Bookings Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isHindi
              ? 'आप ई-राही से बरेली के शीर्ष अस्पताल, घंटे वाले लॉज, होटल या क्लीनिक तुरंत बिना किसी एडवांस चार्ज के बुक कर सकते हैं।'
              : 'You can directly book verified hotels, hourly student lodges, hospital OPD slots and diagnostic tests directly from e-Rahi.'}
          </p>
          {onExploreServices && (
            <button
              onClick={onExploreServices}
              className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>{isHindi ? 'सेवाएं देखें व बुक करें' : 'Explore & Book Services'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredBookings.map((booking) => {
            const isHosp = booking.bookingType === 'hospital';
            const isHtl = booking.bookingType === 'hotel' || booking.bookingType === 'lodge';
            const isCln = booking.bookingType === 'clinic';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between hover:border-slate-400 transition-all space-y-3.5"
              >
                <div>
                  {/* Top Bar with ID & Badge */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs ${
                        isHosp ? 'bg-rose-600' : isHtl ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600'
                      }`}>
                        {isHosp && <HeartPulse className="w-4 h-4" />}
                        {isHtl && <BedDouble className="w-4 h-4 text-slate-950" />}
                        {isCln && <Stethoscope className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                          {booking.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                          {booking.venueName}
                        </h4>
                      </div>
                    </div>

                    {booking.opdTokenNumber ? (
                      <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-rose-100 text-rose-900 border border-rose-200 shrink-0">
                        {booking.opdTokenNumber}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                        ✓ {isHindi ? 'कन्फर्म' : 'Confirmed'}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-700">
                    {booking.doctorName && (
                      <div className="flex items-center justify-between text-rose-950 font-bold bg-rose-50/60 p-1.5 rounded-lg">
                        <span>👨‍⚕️ {booking.doctorName}</span>
                        <span className="text-[10px] text-slate-500">{booking.doctorSpecialization}</span>
                      </div>
                    )}

                    {booking.roomType && (
                      <div className="flex items-center justify-between text-amber-950 font-bold bg-amber-50/60 p-1.5 rounded-lg">
                        <span>🛏️ {booking.roomType}</span>
                        <span className="text-[10px] text-amber-800">
                          {booking.stayType === 'hourly' ? `${booking.durationHoursOrNights} Hr Stay` : `${booking.durationHoursOrNights} Night Stay`}
                        </span>
                      </div>
                    )}

                    {booking.diagnosticTest && (
                      <div className="flex items-center justify-between text-emerald-950 font-bold bg-emerald-50/60 p-1.5 rounded-lg">
                        <span>🧪 {booking.diagnosticTest}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{booking.bookedDate} • {booking.bookedTimeSlot}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{booking.venueAddress}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 font-semibold text-[11px]">
                      <span className="text-slate-500">{isHindi ? 'यात्री/मरीज' : 'Patient/Guest'}: {booking.customerName}</span>
                      <span className="font-black text-emerald-700">₹{booking.finalPayableAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                  {/* WhatsApp Slip */}
                  <button
                    onClick={() => handleShareWhatsApp(booking)}
                    title={isHindi ? 'WhatsApp पर शेयर करें' : 'Share WhatsApp Voucher'}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>

                  {/* Call */}
                  <a
                    href={`tel:${booking.venuePhone}`}
                    title={isHindi ? 'कॉल करें' : 'Call Venue'}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  {/* Navigate */}
                  <button
                    onClick={() => onNavigateToVenue(booking.venueLat, booking.venueLng, booking.venueName)}
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isHindi ? 'ई-राही रूट' : 'Ride Here'}</span>
                  </button>

                  {/* Cancel */}
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    title={isHindi ? 'बुकिंग रद्द करें' : 'Cancel Booking'}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
