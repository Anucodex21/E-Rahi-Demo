import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  BedDouble, 
  GraduationCap, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star, 
  Search, 
  Activity, 
  Crown, 
  Lock, 
  Navigation, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  Compass, 
  Plus, 
  Filter, 
  CheckCircle,
  Stethoscope,
  Eye,
  EyeOff,
  ExternalLink,
  Percent,
  Bed,
  CalendarCheck,
  Ticket,
  SlidersHorizontal,
  RotateCcw,
  ArrowUpDown,
  Zap,
  Wifi,
  Wind
} from 'lucide-react';
import { 
  HospitalFacility, 
  HotelLodge, 
  LocalStoreClinic, 
  CollegeUniversity, 
  CityServicesTab,
  SpecialistDoctor,
  BookingRecord,
  BookingCategory
} from '../types';
import { calculateDistanceKm } from '../data/cityServicesData';
import { playCleanChime } from '../utils/audioAlerts';
import { BookingAppointmentModal, BookingTargetItem } from './BookingAppointmentModal';
import { MyBookingsManager } from './MyBookingsManager';

interface CityServicesDirectoryProps {
  cityName: string;
  userGpsLocation?: { lat: number; lng: number } | null;
  onNavigateToLocation?: (lat: number, lng: number, name: string) => void;
  isPremium: boolean;
  onOpenPremiumModal: () => void;
  onOpenStoreModal: () => void;
  hospitals: HospitalFacility[];
  hotels: HotelLodge[];
  colleges: CollegeUniversity[];
  stores: LocalStoreClinic[];
  language?: string;
  defaultUserName?: string;
  defaultUserPhone?: string;
}

export const CityServicesDirectory: React.FC<CityServicesDirectoryProps> = ({
  cityName,
  userGpsLocation,
  onNavigateToLocation,
  isPremium,
  onOpenPremiumModal,
  onOpenStoreModal,
  hospitals,
  hotels,
  colleges,
  stores,
  language = 'hi',
  defaultUserName = '',
  defaultUserPhone = ''
}) => {
  const isHindi = language === 'hi';
  const [activeTab, setActiveTab] = useState<CityServicesTab>('hospitals');

  // Main Section Toggle: Directory exploration vs My Bookings manager
  const [mainSection, setMainSection] = useState<'directory' | 'my_bookings'>('directory');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingTarget, setBookingTarget] = useState<BookingTargetItem | null>(null);
  const [bookingsCount, setBookingsCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('erahi_user_bookings');
      return stored ? JSON.parse(stored).length : 0;
    } catch {
      return 0;
    }
  });

  const refreshBookingsCount = () => {
    try {
      const stored = localStorage.getItem('erahi_user_bookings');
      setBookingsCount(stored ? JSON.parse(stored).length : 0);
    } catch {
      setBookingsCount(0);
    }
  };

  const openBooking = (target: BookingTargetItem) => {
    setBookingTarget(target);
    setIsBookingModalOpen(true);
  };

  // Unified Search Bar & Categories State
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hospitals' | 'hotels' | 'lodges' | 'colleges' | 'clinics'>('all');
  const [viewMode, setViewMode] = useState<'search_list' | 'detailed_directory'>('search_list');

  // Hospital Symptom GPS Finder State
  const [symptomQuery, setSymptomQuery] = useState('');
  const [selectedHospitalForModal, setSelectedHospitalForModal] = useState<HospitalFacility | null>(null);

  // Hotel Filter States (Hourly vs Night, Budget, Rating, Amenities, Sorting)
  const [hotelTypeFilter, setHotelTypeFilter] = useState<'all' | 'hourly_stay' | 'student_lodge' | 'budget_hotel' | 'family_hotel'>('all');
  const [maxHourlyBudget, setMaxHourlyBudget] = useState<number>(500);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [hotelSortBy, setHotelSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'rating_desc' | 'nearest'>('recommended');
  const [hotelAmenityFilter, setHotelAmenityFilter] = useState<'all' | 'ac' | 'wifi' | 'study_desk' | 'locker' | '24x7'>('all');
  const [nearHubFilter, setNearHubFilter] = useState<'all' | 'railway' | 'bus_stand' | 'university' | 'hospital'>('all');
  const [isHotelFilterExpanded, setIsHotelFilterExpanded] = useState<boolean>(false);

  const activeHotelFiltersCount = useMemo(() => {
    let count = 0;
    if (hotelTypeFilter !== 'all') count++;
    if (maxHourlyBudget < 500) count++;
    if (minRatingFilter > 0) count++;
    if (hotelSortBy !== 'recommended') count++;
    if (hotelAmenityFilter !== 'all') count++;
    if (nearHubFilter !== 'all') count++;
    return count;
  }, [hotelTypeFilter, maxHourlyBudget, minRatingFilter, hotelSortBy, hotelAmenityFilter, nearHubFilter]);

  const resetHotelFilters = () => {
    setHotelTypeFilter('all');
    setMaxHourlyBudget(500);
    setMinRatingFilter(0);
    setHotelSortBy('recommended');
    setHotelAmenityFilter('all');
    setNearHubFilter('all');
  };

  // College Filter States (Stream, Budget)
  const [selectedStream, setSelectedStream] = useState<string>('all');
  const [collegeBudgetFilter, setCollegeBudgetFilter] = useState<'all' | 'affordable' | 'moderate'>('all');

  // General search query
  const [searchFilter, setSearchFilter] = useState('');

  // Split hotels vs student lodges
  const regularHotels = useMemo(() => {
    return hotels.filter(h => h.type !== 'student_lodge' && !h.name.toLowerCase().includes('lodge'));
  }, [hotels]);

  const studentLodges = useMemo(() => {
    return hotels.filter(h => h.type === 'student_lodge' || h.name.toLowerCase().includes('lodge'));
  }, [hotels]);

  // Unified Places Directory (Hospitals, Hotels, Lodges, Colleges/Universities, Clinics)
  const allPlaces = useMemo(() => {
    const list: {
      id: string;
      name: string;
      categoryType: 'hospital' | 'hotel' | 'lodge' | 'college' | 'clinic';
      categoryLabel: string;
      categoryBadgeColor: string;
      rating: number;
      totalReviews?: number;
      address: string;
      phone?: string;
      timing?: string;
      highlightText?: string;
      tags?: string[];
      lat: number;
      lng: number;
      distanceKm?: number;
      hourlyRate?: number;
      perNightRate?: number;
      hotelType?: string;
      features?: string[];
      nearHub?: string;
    }[] = [];

    // 1. Hospitals
    hospitals.forEach(h => {
      const dist = userGpsLocation ? calculateDistanceKm(userGpsLocation.lat, userGpsLocation.lng, h.lat, h.lng) : undefined;
      list.push({
        id: h.id,
        name: h.name,
        categoryType: 'hospital',
        categoryLabel: isHindi ? 'हॉस्पिटल' : 'Hospital',
        categoryBadgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        rating: h.rating,
        totalReviews: h.totalReviews,
        address: h.address,
        phone: h.emergencyHelpline || h.phone,
        timing: h.timing,
        highlightText: h.category === 'government' ? (isHindi ? 'सरकारी अस्पताल' : 'Govt Hospital') : (isHindi ? 'मल्टीस्पेशलिटी' : 'Multispecialty'),
        tags: [h.timing, ...(h.services || []).slice(0, 2)],
        lat: h.lat,
        lng: h.lng,
        distanceKm: dist
      });
    });

    // 2. Hotels
    regularHotels.forEach(h => {
      const dist = userGpsLocation ? calculateDistanceKm(userGpsLocation.lat, userGpsLocation.lng, h.lat, h.lng) : undefined;
      list.push({
        id: h.id,
        name: h.name,
        categoryType: 'hotel',
        categoryLabel: isHindi ? 'होटल' : 'Hotel',
        categoryBadgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
        rating: h.rating,
        totalReviews: h.totalReviews,
        address: h.address,
        phone: h.phone,
        timing: '24x7 Check-in',
        highlightText: `₹${h.hourlyRate}/hr • ₹${h.perNightRate}/night`,
        tags: [h.nearHub, ...(h.features || []).slice(0, 2)],
        lat: h.lat,
        lng: h.lng,
        distanceKm: dist,
        hourlyRate: h.hourlyRate,
        perNightRate: h.perNightRate,
        hotelType: h.type,
        features: h.features,
        nearHub: h.nearHub
      });
    });

    // 3. Lodges
    studentLodges.forEach(h => {
      const dist = userGpsLocation ? calculateDistanceKm(userGpsLocation.lat, userGpsLocation.lng, h.lat, h.lng) : undefined;
      list.push({
        id: h.id,
        name: h.name,
        categoryType: 'lodge',
        categoryLabel: isHindi ? 'लॉज' : 'Lodge',
        categoryBadgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
        rating: h.rating,
        totalReviews: h.totalReviews,
        address: h.address,
        phone: h.phone,
        timing: 'Student & Transit Stay',
        highlightText: `₹${h.hourlyRate}/hr • ${isHindi ? 'किफायती लॉज' : 'Budget Lodge'}`,
        tags: [h.nearHub, ...(h.features || []).slice(0, 2)],
        lat: h.lat,
        lng: h.lng,
        distanceKm: dist,
        hourlyRate: h.hourlyRate,
        perNightRate: h.perNightRate,
        hotelType: h.type,
        features: h.features,
        nearHub: h.nearHub
      });
    });

    // 4. Colleges & Universities
    colleges.forEach(c => {
      const dist = userGpsLocation ? calculateDistanceKm(userGpsLocation.lat, userGpsLocation.lng, c.lat, c.lng) : undefined;
      list.push({
        id: c.id,
        name: c.name,
        categoryType: 'college',
        categoryLabel: c.type.includes('university') ? (isHindi ? 'यूनिवर्सिटी' : 'University') : (isHindi ? 'कॉलेज' : 'College'),
        categoryBadgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        rating: c.rating,
        totalReviews: c.totalReviews,
        address: c.address,
        phone: c.phone,
        timing: 'Campus 9 AM - 5 PM',
        highlightText: `${c.annualFeeRange} • ${c.type.replace('_', ' ').toUpperCase()}`,
        tags: (c.streams || []).slice(0, 3),
        lat: c.lat,
        lng: c.lng,
        distanceKm: dist
      });
    });

    // 5. Clinics & Stores
    stores.forEach(st => {
      const dist = userGpsLocation ? calculateDistanceKm(userGpsLocation.lat, userGpsLocation.lng, st.lat, st.lng) : undefined;
      list.push({
        id: st.id,
        name: st.businessName,
        categoryType: 'clinic',
        categoryLabel: isHindi ? 'क्लीनिक' : 'Clinic',
        categoryBadgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        rating: st.rating,
        address: st.address,
        phone: st.phone,
        timing: st.timing,
        highlightText: st.discountOffer || (isHindi ? 'वेरिफाइड पार्टनर' : 'Verified Partner'),
        tags: [st.timing, st.category.replace('_', ' ')],
        lat: st.lat,
        lng: st.lng,
        distanceKm: dist
      });
    });

    return list;
  }, [hospitals, regularHotels, studentLodges, colleges, stores, userGpsLocation, isHindi]);

  // Filtered Unified Places with Hotel Price & Rating Support
  const filteredUnifiedPlaces = useMemo(() => {
    let list = allPlaces;

    if (selectedCategory === 'hospitals') {
      list = list.filter(item => item.categoryType === 'hospital');
    } else if (selectedCategory === 'hotels') {
      list = list.filter(item => item.categoryType === 'hotel');
    } else if (selectedCategory === 'lodges') {
      list = list.filter(item => item.categoryType === 'lodge');
    } else if (selectedCategory === 'colleges') {
      list = list.filter(item => item.categoryType === 'college');
    } else if (selectedCategory === 'clinics') {
      list = list.filter(item => item.categoryType === 'clinic');
    }

    // Apply Hotel Filters when in hotel/lodge mode or general mode
    if (selectedCategory === 'hotels' || selectedCategory === 'lodges') {
      if (hotelTypeFilter !== 'all') {
        list = list.filter(item => item.hotelType === hotelTypeFilter);
      }
      if (maxHourlyBudget < 500) {
        list = list.filter(item => item.hourlyRate !== undefined && item.hourlyRate <= maxHourlyBudget);
      }
      if (minRatingFilter > 0) {
        list = list.filter(item => item.rating >= minRatingFilter);
      }
      if (hotelAmenityFilter !== 'all') {
        list = list.filter(item => item.features && item.features.some(f => {
          const lower = f.toLowerCase();
          if (hotelAmenityFilter === 'ac') return lower.includes('ac');
          if (hotelAmenityFilter === 'wifi') return lower.includes('wi-fi') || lower.includes('wifi') || lower.includes('internet');
          if (hotelAmenityFilter === 'study_desk') return lower.includes('study') || lower.includes('desk');
          if (hotelAmenityFilter === 'locker') return lower.includes('locker') || lower.includes('luggage');
          if (hotelAmenityFilter === '24x7') return lower.includes('24x7') || lower.includes('24/7');
          return false;
        }));
      }
      if (nearHubFilter !== 'all') {
        list = list.filter(item => item.nearHub && (
          (nearHubFilter === 'railway' && (item.nearHub.toLowerCase().includes('railway') || item.nearHub.toLowerCase().includes('station') || item.nearHub.toLowerCase().includes('junction'))) ||
          (nearHubFilter === 'bus_stand' && (item.nearHub.toLowerCase().includes('bus') || item.nearHub.toLowerCase().includes('satellite') || item.nearHub.toLowerCase().includes('stand'))) ||
          (nearHubFilter === 'university' && (item.nearHub.toLowerCase().includes('university') || item.nearHub.toLowerCase().includes('college') || item.nearHub.toLowerCase().includes('mjpru'))) ||
          (nearHubFilter === 'hospital' && (item.nearHub.toLowerCase().includes('hospital') || item.nearHub.toLowerCase().includes('medical') || item.nearHub.toLowerCase().includes('rohilkhand')))
        ));
      }
    }

    if (searchFilter.trim() !== '') {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        (item.highlightText && item.highlightText.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Sorting logic
    if (selectedCategory === 'hotels' || selectedCategory === 'lodges') {
      if (hotelSortBy === 'price_asc') {
        list = [...list].sort((a, b) => (a.hourlyRate ?? 999) - (b.hourlyRate ?? 999));
      } else if (hotelSortBy === 'price_desc') {
        list = [...list].sort((a, b) => (b.hourlyRate ?? 0) - (a.hourlyRate ?? 0));
      } else if (hotelSortBy === 'rating_desc') {
        list = [...list].sort((a, b) => b.rating - a.rating);
      } else if (hotelSortBy === 'nearest' && userGpsLocation) {
        list = [...list].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
      } else if (userGpsLocation) {
        list = [...list].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
      } else {
        list = [...list].sort((a, b) => b.rating - a.rating);
      }
    } else {
      if (userGpsLocation) {
        list = [...list].sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
      } else {
        list = [...list].sort((a, b) => b.rating - a.rating);
      }
    }

    return list;
  }, [allPlaces, selectedCategory, searchFilter, hotelTypeFilter, maxHourlyBudget, minRatingFilter, hotelAmenityFilter, nearHubFilter, hotelSortBy, userGpsLocation]);

  // 1. HOSPITAL FILTERING & SYMPTOM MATCHING
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      // General name/address search
      const matchesSearch = searchFilter.trim() === '' || 
        h.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        h.hindiName.includes(searchFilter.trim()) ||
        h.address.toLowerCase().includes(searchFilter.toLowerCase()) ||
        h.specialistDoctors.some(d => d.specialization.toLowerCase().includes(searchFilter.toLowerCase()));

      // Symptom / Health Problem Matching (GPS AI Search)
      const matchesSymptom = symptomQuery.trim() === '' || 
        h.treatedSymptoms.some(s => s.toLowerCase().includes(symptomQuery.toLowerCase())) ||
        h.services.some(srv => srv.toLowerCase().includes(symptomQuery.toLowerCase())) ||
        h.specialistDoctors.some(d => 
          d.specialization.toLowerCase().includes(symptomQuery.toLowerCase()) ||
          d.name.toLowerCase().includes(symptomQuery.toLowerCase())
        );

      return matchesSearch && matchesSymptom;
    }).sort((a, b) => {
      // If user GPS is available, sort nearest first
      if (userGpsLocation) {
        const distA = calculateDistanceKm(userGpsLocation.lat, userGpsLocation.lng, a.lat, a.lng);
        const distB = calculateDistanceKm(userGpsLocation.lat, userGpsLocation.lng, b.lat, b.lng);
        return distA - distB;
      }
      return b.rating - a.rating;
    });
  }, [hospitals, searchFilter, symptomQuery, userGpsLocation]);

  // 2. HOTEL & LODGE FILTERING
  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const matchesSearch = searchFilter.trim() === '' ||
        hotel.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        hotel.hindiName.includes(searchFilter.trim()) ||
        hotel.address.toLowerCase().includes(searchFilter.toLowerCase()) ||
        hotel.nearHub.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesType = hotelTypeFilter === 'all' || hotel.type === hotelTypeFilter;
      const matchesBudget = hotel.hourlyRate <= maxHourlyBudget;
      const matchesRating = hotel.rating >= minRatingFilter;

      const matchesAmenity = hotelAmenityFilter === 'all' ||
        hotel.features.some(f => {
          const lower = f.toLowerCase();
          if (hotelAmenityFilter === 'ac') return lower.includes('ac');
          if (hotelAmenityFilter === 'wifi') return lower.includes('wi-fi') || lower.includes('wifi') || lower.includes('internet');
          if (hotelAmenityFilter === 'study_desk') return lower.includes('study') || lower.includes('desk');
          if (hotelAmenityFilter === 'locker') return lower.includes('locker') || lower.includes('luggage');
          if (hotelAmenityFilter === '24x7') return lower.includes('24x7') || lower.includes('24/7');
          return false;
        });

      const matchesHub = nearHubFilter === 'all' ||
        (nearHubFilter === 'railway' && (hotel.nearHub.toLowerCase().includes('railway') || hotel.nearHub.toLowerCase().includes('station') || hotel.nearHub.toLowerCase().includes('junction'))) ||
        (nearHubFilter === 'bus_stand' && (hotel.nearHub.toLowerCase().includes('bus') || hotel.nearHub.toLowerCase().includes('satellite') || hotel.nearHub.toLowerCase().includes('stand'))) ||
        (nearHubFilter === 'university' && (hotel.nearHub.toLowerCase().includes('university') || hotel.nearHub.toLowerCase().includes('college') || hotel.nearHub.toLowerCase().includes('mjpru'))) ||
        (nearHubFilter === 'hospital' && (hotel.nearHub.toLowerCase().includes('hospital') || hotel.nearHub.toLowerCase().includes('medical') || hotel.nearHub.toLowerCase().includes('rohilkhand')));

      return matchesSearch && matchesType && matchesBudget && matchesRating && matchesAmenity && matchesHub;
    }).sort((a, b) => {
      if (hotelSortBy === 'price_asc') {
        return a.hourlyRate - b.hourlyRate;
      }
      if (hotelSortBy === 'price_desc') {
        return b.hourlyRate - a.hourlyRate;
      }
      if (hotelSortBy === 'rating_desc') {
        return b.rating - a.rating;
      }
      if (hotelSortBy === 'nearest' && userGpsLocation) {
        const distA = calculateDistanceKm(userGpsLocation.lat, userGpsLocation.lng, a.lat, a.lng);
        const distB = calculateDistanceKm(userGpsLocation.lat, userGpsLocation.lng, b.lat, b.lng);
        return distA - distB;
      }
      if (userGpsLocation) {
        const distA = calculateDistanceKm(userGpsLocation.lat, userGpsLocation.lng, a.lat, a.lng);
        const distB = calculateDistanceKm(userGpsLocation.lat, userGpsLocation.lng, b.lat, b.lng);
        return distA - distB;
      }
      return b.rating - a.rating;
    });
  }, [hotels, searchFilter, hotelTypeFilter, maxHourlyBudget, minRatingFilter, hotelAmenityFilter, nearHubFilter, hotelSortBy, userGpsLocation]);

  // 3. COLLEGE & UNIVERSITY FILTERING
  const filteredColleges = useMemo(() => {
    return colleges.filter((col) => {
      const matchesSearch = searchFilter.trim() === '' ||
        col.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        col.hindiName.includes(searchFilter.trim()) ||
        col.address.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesStream = selectedStream === 'all' || 
        col.streams.some(s => s.toLowerCase().includes(selectedStream.toLowerCase()));

      const matchesBudget = collegeBudgetFilter === 'all' || col.budgetCategory === collegeBudgetFilter;

      return matchesSearch && matchesStream && matchesBudget;
    }).sort((a, b) => b.rating - a.rating);
  }, [colleges, searchFilter, selectedStream, collegeBudgetFilter]);

  // 4. LOCAL STORES & CLINICS FILTERING
  const filteredStores = useMemo(() => {
    return stores.filter((st) => {
      return searchFilter.trim() === '' ||
        st.businessName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        st.ownerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        st.address.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (st.discountOffer && st.discountOffer.toLowerCase().includes(searchFilter.toLowerCase()));
    }).sort((a, b) => (b.isPromoted ? 1 : 0) - (a.isPromoted ? 1 : 0));
  }, [stores, searchFilter]);

  const handleNavigate = (lat: number, lng: number, name: string) => {
    playCleanChime('fare');
    if (onNavigateToLocation) {
      onNavigateToLocation(lat, lng, name);
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  const renderHotelFilterBar = () => {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3.5">
        {/* Top Header Row of Filter Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>{isHindi ? 'होटल, लॉज व प्रति घंटा कमरे फिल्टर' : 'Hourly Hotel & Lodge Filters'}</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                {isHindi ? 'किराया, रेटिंग, रहने का प्रकार व आवश्यक सुविधाएं चुनें' : 'Filter by hourly rates, star rating, stay duration & transit hub'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeHotelFiltersCount > 0 && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{activeHotelFiltersCount} {isHindi ? 'सक्रिय' : 'Active'}</span>
              </span>
            )}

            {activeHotelFiltersCount > 0 && (
              <button
                onClick={resetHotelFilters}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                title={isHindi ? 'सभी फिल्टर रीसेट करें' : 'Reset all filters'}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isHindi ? 'रीसेट' : 'Reset'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Stay Mode / Accommodation Type Filter */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            🏨 {isHindi ? 'कमरे का प्रकार (Stay Type):' : 'Accommodation Mode:'}
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setHotelTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                hotelTypeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs font-extrabold'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              {isHindi ? 'सभी (All Stays)' : 'All Stays'}
            </button>
            <button
              onClick={() => setHotelTypeFilter('hourly_stay')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                hotelTypeFilter === 'hourly_stay'
                  ? 'bg-slate-900 text-white shadow-2xs font-extrabold'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <span>⏰</span>
              <span>{isHindi ? 'प्रति घंटा कमरे (₹99/hr)' : 'Hourly Rest (2-4 hrs)'}</span>
            </button>
            <button
              onClick={() => setHotelTypeFilter('student_lodge')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                hotelTypeFilter === 'student_lodge'
                  ? 'bg-slate-900 text-white shadow-2xs font-extrabold'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <span>📚</span>
              <span>{isHindi ? 'छात्र व परीक्षा लॉज' : 'Student & Exam Lodges'}</span>
            </button>
            <button
              onClick={() => setHotelTypeFilter('budget_hotel')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                hotelTypeFilter === 'budget_hotel'
                  ? 'bg-slate-900 text-white shadow-2xs font-extrabold'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <span>💼</span>
              <span>{isHindi ? 'बजट होटल (Night Stay)' : 'Budget Hotel'}</span>
            </button>
            <button
              onClick={() => setHotelTypeFilter('family_hotel')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                hotelTypeFilter === 'family_hotel'
                  ? 'bg-slate-900 text-white shadow-2xs font-extrabold'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <span>👨‍👩‍👧</span>
              <span>{isHindi ? 'फैमिली होटल' : 'Family Hotel'}</span>
            </button>
          </div>
        </div>

        {/* 2. Hourly Price / Budget Selector */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <span>⚡</span>
              <span>{isHindi ? 'प्रति घंटा किराया बजट (Hourly Budget):' : 'Hourly Budget Filter:'}</span>
            </label>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
              {maxHourlyBudget >= 500 ? (isHindi ? 'सभी दरें (Any Price)' : 'Any Price (Max ₹500+)') : `₹${maxHourlyBudget} / hr max`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <button
              onClick={() => setMaxHourlyBudget(500)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                maxHourlyBudget >= 500
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isHindi ? 'सभी दरें' : 'All Rates'}
            </button>
            <button
              onClick={() => setMaxHourlyBudget(99)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                maxHourlyBudget === 99
                  ? 'bg-slate-900 text-white shadow-2xs font-black'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>≤ ₹99 / hr</span>
            </button>
            <button
              onClick={() => setMaxHourlyBudget(150)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                maxHourlyBudget === 150
                  ? 'bg-slate-900 text-white shadow-2xs font-black'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              ≤ ₹150 / hr
            </button>
            <button
              onClick={() => setMaxHourlyBudget(250)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                maxHourlyBudget === 250
                  ? 'bg-slate-900 text-white shadow-2xs font-black'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              ≤ ₹250 / hr
            </button>
            <button
              onClick={() => setMaxHourlyBudget(350)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                maxHourlyBudget === 350
                  ? 'bg-slate-900 text-white shadow-2xs font-black'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              ≤ ₹350 / hr
            </button>

            {/* Range Slider for fine tuning */}
            <div className="flex-1 min-w-[140px] flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold">₹50</span>
              <input
                type="range"
                min={50}
                max={500}
                step={25}
                value={maxHourlyBudget}
                onChange={(e) => setMaxHourlyBudget(Number(e.target.value))}
                className="flex-1 accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 font-bold">₹500</span>
            </div>
          </div>
        </div>

        {/* 3. Rating & Sorting Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
          {/* Minimum Rating Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{isHindi ? 'न्यूनतम रेटिंग (Min Rating):' : 'Star Rating:'}</span>
            </label>
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <button
                onClick={() => setMinRatingFilter(0)}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  minRatingFilter === 0
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {isHindi ? 'सभी' : 'All'}
              </button>
              <button
                onClick={() => setMinRatingFilter(4.0)}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  minRatingFilter === 4.0
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>⭐ 4.0+</span>
              </button>
              <button
                onClick={() => setMinRatingFilter(4.3)}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  minRatingFilter === 4.3
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>⭐ 4.3+</span>
              </button>
              <button
                onClick={() => setMinRatingFilter(4.5)}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  minRatingFilter === 4.5
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>⭐ 4.5+ {isHindi ? 'टॉप' : 'Top'}</span>
              </button>
            </div>
          </div>

          {/* Sort By Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-slate-500" />
              <span>{isHindi ? 'क्रमबद्ध करें (Sort By):' : 'Sort Results:'}</span>
            </label>
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <select
                value={hotelSortBy}
                onChange={(e) => setHotelSortBy(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/15"
              >
                <option value="recommended">{isHindi ? '✨ अनुशंसित (GPS/सर्वश्रेष्ठ)' : '✨ Recommended / Best Match'}</option>
                <option value="price_asc">{isHindi ? '💰 सबसे कम प्रति घंटा किराया (Low to High)' : '💰 Lowest Hourly Rate First'}</option>
                <option value="price_desc">{isHindi ? '🏷️ प्रीमियम / अधिक किराया (High to Low)' : '🏷️ Highest Rate First'}</option>
                <option value="rating_desc">{isHindi ? '⭐ उच्चतम रेटिंग पहले (High Rating)' : '⭐ Highest Rated First'}</option>
                {userGpsLocation && (
                  <option value="nearest">{isHindi ? '📍 सबसे नजदीक पहले (Nearest GPS)' : '📍 Nearest First (GPS)'}</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* 4. Fast Amenities & Landmark Quick Chips */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            🎯 {isHindi ? 'सुविधाएं व नजदीकी स्थान (Amenities & Hubs):' : 'Amenities & Location Hubs:'}
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setHotelAmenityFilter(hotelAmenityFilter === 'ac' ? 'all' : 'ac')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                hotelAmenityFilter === 'ac'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>{isHindi ? '❄️ एसी कमरे' : 'AC Rooms'}</span>
            </button>

            <button
              onClick={() => setHotelAmenityFilter(hotelAmenityFilter === 'wifi' ? 'all' : 'wifi')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                hotelAmenityFilter === 'wifi'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>{isHindi ? '📶 फ्री वाई-फाई' : 'Free Wi-Fi'}</span>
            </button>

            <button
              onClick={() => setHotelAmenityFilter(hotelAmenityFilter === 'study_desk' ? 'all' : 'study_desk')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                hotelAmenityFilter === 'study_desk'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>📖</span>
              <span>{isHindi ? 'स्टडी डेस्क (Exams)' : 'Study Desk'}</span>
            </button>

            <button
              onClick={() => setHotelAmenityFilter(hotelAmenityFilter === 'locker' ? 'all' : 'locker')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                hotelAmenityFilter === 'locker'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>🔒</span>
              <span>{isHindi ? 'लगेज लॉकर' : 'Luggage Locker'}</span>
            </button>

            <button
              onClick={() => setNearHubFilter(nearHubFilter === 'railway' ? 'all' : 'railway')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                nearHubFilter === 'railway'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>🚆</span>
              <span>{isHindi ? 'बरेली जंक्शन' : 'Bareilly Jn'}</span>
            </button>

            <button
              onClick={() => setNearHubFilter(nearHubFilter === 'bus_stand' ? 'all' : 'bus_stand')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                nearHubFilter === 'bus_stand'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>🚌</span>
              <span>{isHindi ? 'सैटेलाइट बस स्टैंड' : 'Satellite Bus Stand'}</span>
            </button>

            <button
              onClick={() => setNearHubFilter(nearHubFilter === 'university' ? 'all' : 'university')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                nearHubFilter === 'university'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>🎓</span>
              <span>{isHindi ? 'एमजेपीआरयू / कॉलेज' : 'MJPRU / Colleges'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Header: Clean Civic & Multi-Service Hub */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <span>Bareilly Services Hub</span>
              </h2>

              {isPremium ? (
                <span className="bg-amber-100 text-amber-900 text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                  <Crown className="w-3 h-3 fill-amber-700 text-amber-700" />
                  Gold Pass Active
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-slate-200">
                  {isHindi ? 'सत्यापित पब्लिक पोर्टल' : 'Official Portal'}
                </span>
              )}

              {userGpsLocation && (
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-medium px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-emerald-600" />
                  {isHindi ? 'जीपीएस सक्रिय' : 'GPS Active'}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-2 max-w-xl leading-relaxed">
              {isHindi
                ? 'नजदीकी अस्पताल, विशेषज्ञ डॉक्टर, प्रति घंटा होटल/लॉज, कॉलेज रेटिंग व स्थानीय क्लीनिक की सत्यापित सूची।'
                : 'GPS-guided hospitals with doctors, hourly lodges for exams/transit, college stream ratings, and verified local stores.'}
            </p>

            {/* Quick Count Badges */}
            <div className="flex items-center gap-2 flex-wrap pt-2 text-[11px] text-slate-600 font-medium">
              <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800">
                🏥 {hospitals.length} {isHindi ? 'अस्पताल' : 'Hospitals'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
                🏨 {hotels.length} {isHindi ? 'होटल व लॉज' : 'Hotels & Lodges'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800">
                🎓 {colleges.length} {isHindi ? 'कॉलेज' : 'Colleges'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800">
                🩺 {stores.length} {isHindi ? 'क्लीनिक' : 'Clinics'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {!isPremium && (
              <button
                onClick={onOpenPremiumModal}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{isHindi ? 'सभी अनलॉक करें (₹49/माह)' : 'Unlock All (₹49/mo)'}</span>
              </button>
            )}

            <button
              onClick={onOpenStoreModal}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <Plus className="w-3.5 h-3.5 text-slate-600" />
              <span>{isHindi ? 'दुकान / क्लीनिक जोड़ें' : 'Add Store / Clinic'}</span>
            </button>
          </div>
        </div>

        {/* Coming Soon Services Strip */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700">
              {isHindi ? 'आगामी सेवाएं:' : 'Coming Soon:'}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-medium flex items-center gap-1">
                <span>🚌</span> {isHindi ? 'बस सेवा' : 'Bus Service'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-medium flex items-center gap-1">
                <span>🚕</span> {isHindi ? 'कैब / टैक्सी' : 'Cab Service'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-medium flex items-center gap-1">
                <span>🚆</span> {isHindi ? 'ट्रेन ट्रैकर' : 'Train Service'}
              </span>
            </div>
          </div>
          {userGpsLocation && (
            <div className="flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <Compass className="w-3 h-3 text-emerald-600" />
              <span>{isHindi ? 'जीपीएस से नजदीकी पहले' : 'Nearest First (GPS Active)'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sub-Header / Main Section Switcher: Explore Directory vs My Bookings */}
      <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          onClick={() => setMainSection('directory')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mainSection === 'directory'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-amber-400" />
          <span>{isHindi ? '📍 खोजें व डायरेक्टरी' : 'Explore Directory'}</span>
        </button>

        <button
          onClick={() => {
            refreshBookingsCount();
            setMainSection('my_bookings');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mainSection === 'my_bookings'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isHindi ? '📋 मेरी बुकिंग्स व टोकन' : 'My Bookings & Tokens'}</span>
          {bookingsCount > 0 && (
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              mainSection === 'my_bookings' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-600 text-white'
            }`}>
              {bookingsCount}
            </span>
          )}
        </button>
      </div>

      {mainSection === 'my_bookings' ? (
        <MyBookingsManager
          onNavigateToVenue={handleNavigate}
          language={language}
          onExploreServices={() => setMainSection('directory')}
        />
      ) : (
        <>
      {/* =========================================================================
          UNIFIED SEARCH BAR & CATEGORY SELECTOR
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4.5 border border-slate-200/90 shadow-sm space-y-3">
        {/* Single Unified Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setViewMode('search_list');
                }
              }}
              placeholder={
                isHindi
                  ? 'हॉस्पिटल, डॉक्टर, होटल, लॉज, कॉलेज या क्लीनिक खोजें...'
                  : 'Search hospitals, doctors, hotels, lodges, colleges, clinics...'
              }
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-800 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-850/15 transition-all shadow-2xs"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Action Button */}
          <button
            onClick={() => {
              setViewMode('search_list');
              playCleanChime('alert');
            }}
            className="px-4.5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span>{isHindi ? 'खोजें' : 'Search'}</span>
          </button>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
            {/* 1. All Places Option */}
            <button
              onClick={() => {
                setSelectedCategory('all');
                setViewMode('search_list');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedCategory === 'all' && viewMode === 'search_list'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <span>{isHindi ? '🌐 सभी सेवाएं' : 'All Services'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'all' && viewMode === 'search_list' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {allPlaces.length}
              </span>
            </button>

            {/* 2. Hospital Option */}
            <button
              onClick={() => {
                setSelectedCategory('hospitals');
                setActiveTab('hospitals');
                setViewMode('search_list');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedCategory === 'hospitals' && viewMode === 'search_list'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100/80 text-rose-800 border border-rose-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-rose-500" />
              <span>{isHindi ? 'हॉस्पिटल' : 'Hospitals'}</span>
              <span className="text-[10px] opacity-80">({hospitals.length})</span>
            </button>

            {/* 3. Hotel Option */}
            <button
              onClick={() => {
                setSelectedCategory('hotels');
                setActiveTab('hotels');
                setViewMode('search_list');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedCategory === 'hotels' && viewMode === 'search_list'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-100'
              }`}
            >
              <BedDouble className="w-3.5 h-3.5 text-amber-600" />
              <span>{isHindi ? 'होटल' : 'Hotels'}</span>
              <span className="text-[10px] opacity-80">({regularHotels.length})</span>
            </button>

            {/* 4. Lodge Option */}
            <button
              onClick={() => {
                setSelectedCategory('lodges');
                setActiveTab('hotels');
                setViewMode('search_list');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedCategory === 'lodges' && viewMode === 'search_list'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-blue-50 hover:bg-blue-100/80 text-blue-900 border border-blue-100'
              }`}
            >
              <Bed className="w-3.5 h-3.5 text-blue-600" />
              <span>{isHindi ? 'लॉज' : 'Lodges'}</span>
              <span className="text-[10px] opacity-80">({studentLodges.length})</span>
            </button>

            {/* 5. College & Universities Option */}
            <button
              onClick={() => {
                setSelectedCategory('colleges');
                setActiveTab('colleges');
                setViewMode('search_list');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedCategory === 'colleges' && viewMode === 'search_list'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'bg-indigo-50 hover:bg-indigo-100/80 text-indigo-900 border border-indigo-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isHindi ? 'कॉलेज' : 'Colleges'}</span>
              <span className="text-[10px] opacity-80">({colleges.length})</span>
            </button>

            {/* 6. Clinic Option */}
            <button
              onClick={() => {
                setSelectedCategory('clinics');
                setActiveTab('local_stores');
                setViewMode('search_list');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedCategory === 'clinics' && viewMode === 'search_list'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-100'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isHindi ? 'क्लीनिक' : 'Clinics'}</span>
              <span className="text-[10px] opacity-80">({stores.length})</span>
            </button>
          </div>

          {/* Detailed Directory Switcher */}
          <button
            onClick={() => setViewMode(viewMode === 'search_list' ? 'detailed_directory' : 'search_list')}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-950 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            <span>
              {viewMode === 'search_list'
                ? (isHindi ? 'विस्तृत डायरेक्टरी ➔' : 'Detailed View ➔')
                : (isHindi ? '⬅ त्वरित सर्च' : '⬅ Quick Search')}
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          UNIFIED SEARCH RESULTS LIST (User finds where they want to go & navigates)
         ========================================================================= */}
      {viewMode === 'search_list' && (
        <div className="space-y-3">
          {/* If Hotel or Lodge category is selected, or if filter is toggled, render the hotel filter bar */}
          {(selectedCategory === 'hotels' || selectedCategory === 'lodges' || isHotelFilterExpanded) && (
            <div className="mb-3">
              {renderHotelFilterBar()}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-600 px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {isHindi ? `कुल ${filteredUnifiedPlaces.length} स्थान मिले` : `Found ${filteredUnifiedPlaces.length} places`}
                {searchFilter ? ` "${searchFilter}" के लिए` : ''}
              </span>

              {/* Quick Hotel Filter Toggle button if not already in hotel category */}
              {selectedCategory !== 'hotels' && selectedCategory !== 'lodges' && (
                <button
                  onClick={() => setIsHotelFilterExpanded(!isHotelFilterExpanded)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                    isHotelFilterExpanded || activeHotelFiltersCount > 0
                      ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3 text-amber-700" />
                  <span>{isHindi ? 'होटल / किराया फिल्टर' : 'Hotel Filters'}</span>
                  {activeHotelFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                      {activeHotelFiltersCount}
                    </span>
                  )}
                </button>
              )}
            </div>

            {userGpsLocation && (
              <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                <Compass className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>{isHindi ? 'जीपीएस से सबसे नजदीक पहले' : 'Nearest First (GPS Active)'}</span>
              </span>
            )}
          </div>

          {filteredUnifiedPlaces.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
              <div className="text-3xl">🔍</div>
              <p className="text-sm font-bold text-slate-700">
                {isHindi ? 'आपकी खोज के अनुसार कोई स्थान नहीं मिला' : 'No places found matching your search'}
              </p>
              <button
                onClick={() => {
                  setSearchFilter('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow-sm transition-all"
              >
                {isHindi ? 'सभी स्थान देखें' : 'View All Places'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredUnifiedPlaces.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header: Category Badge + Distance + Rating */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${item.categoryBadgeColor}`}>
                          {item.categoryType === 'hospital' && <Building2 className="w-3 h-3" />}
                          {item.categoryType === 'hotel' && <BedDouble className="w-3 h-3" />}
                          {item.categoryType === 'lodge' && <Bed className="w-3 h-3" />}
                          {item.categoryType === 'college' && <GraduationCap className="w-3 h-3" />}
                          {item.categoryType === 'clinic' && <Stethoscope className="w-3 h-3" />}
                          <span>{item.categoryLabel}</span>
                        </span>

                        {item.distanceKm !== undefined && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <span>📍</span>
                            <span>{item.distanceKm} km</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 shrink-0">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{item.rating}</span>
                      </div>
                    </div>

                    {/* Place Name */}
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-2">
                      {item.name}
                    </h3>

                    {/* Address */}
                    <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{item.address}</span>
                    </p>

                    {/* Highlight Text / Pricing */}
                    {item.highlightText && (
                      <p className="text-xs font-medium text-slate-700 mt-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        {item.highlightText}
                      </p>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {item.tags.map((t, idx) => (
                          <span key={idx} className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions: Direct Navigation & Info */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                    {item.phone && (
                      <a
                        href={`tel:${item.phone}`}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-600" />
                        <span>{isHindi ? 'कॉल' : 'Call'}</span>
                      </a>
                    )}

                    {item.categoryType === 'hospital' && (
                      <button
                        onClick={() => {
                          const hosp = hospitals.find(h => h.id === item.id);
                          if (hosp) setSelectedHospitalForModal(hosp);
                        }}
                        className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-slate-600" />
                        <span>{isHindi ? 'डॉक्टर' : 'Doctors'}</span>
                      </button>
                    )}

                    {/* Direct Booking Action Button for Hospital, Hotel, Lodge, Clinic */}
                    {(item.categoryType === 'hospital' || item.categoryType === 'hotel' || item.categoryType === 'lodge' || item.categoryType === 'clinic') && (
                      <button
                        onClick={() => {
                          if (item.categoryType === 'hospital') {
                            const hosp = hospitals.find(h => h.id === item.id);
                            if (hosp) openBooking({ type: 'hospital', hospital: hosp });
                          } else if (item.categoryType === 'hotel' || item.categoryType === 'lodge') {
                            const htl = hotels.find(h => h.id === item.id);
                            if (htl) openBooking({ type: item.categoryType === 'lodge' ? 'lodge' : 'hotel', hotel: htl });
                          } else if (item.categoryType === 'clinic') {
                            const cln = stores.find(s => s.id === item.id);
                            if (cln) openBooking({ type: 'clinic', clinic: cln });
                          }
                        }}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>
                          {item.categoryType === 'hospital'
                            ? (isHindi ? 'ओपीडी टोकन लें' : 'Book OPD Token')
                            : item.categoryType === 'clinic'
                            ? (isHindi ? 'अपॉइंटमेंट लें' : 'Book Slot')
                            : (isHindi ? 'कमरा बुक करें' : 'Book Room')}
                        </span>
                      </button>
                    )}

                    {/* Direct Navigation */}
                    <button
                      onClick={() => handleNavigate(item.lat, item.lng, item.name)}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer min-w-[100px]"
                    >
                      <Navigation className="w-3.5 h-3.5 text-slate-200" />
                      <span>{isHindi ? 'यहाँ जाएँ' : 'Go Here'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          DETAILED DIRECTORY VIEW (When user clicks "Detailed Directory")
         ========================================================================= */}
      {viewMode === 'detailed_directory' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-2xs ${
                activeTab === 'hospitals'
                  ? 'bg-rose-600 text-white shadow-rose-600/20 shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{isHindi ? 'अस्पताल व डॉक्टर (GPS)' : 'Hospitals & Doctors'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'hospitals' ? 'bg-white/20' : 'bg-slate-100'}`}>
                {hospitals.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('hotels')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-2xs ${
                activeTab === 'hotels'
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/20 shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <BedDouble className="w-4 h-4" />
              <span>{isHindi ? 'घंटे वाले होटल व लॉज' : 'Hourly Hotels & Lodges'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'hotels' ? 'bg-slate-900/20' : 'bg-slate-100'}`}>
                {hotels.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('colleges')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-2xs ${
                activeTab === 'colleges'
                  ? 'bg-indigo-600 text-white shadow-indigo-600/20 shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{isHindi ? 'कॉलेज व यूनिवर्सिटी' : 'Colleges & Universities'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'colleges' ? 'bg-white/20' : 'bg-slate-100'}`}>
                {colleges.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('local_stores')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-2xs ${
                activeTab === 'local_stores'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20 shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{isHindi ? 'क्लीनिक व दुकानें' : 'Clinics & Stores'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'local_stores' ? 'bg-white/20' : 'bg-slate-100'}`}>
                {stores.length}
              </span>
            </button>
          </div>

      {/* =========================================================================
          TAB 1: HOSPITALS & SPECIALIST DOCTORS (WITH SYMPTOM GPS AI RESOLVER)
         ========================================================================= */}
      {activeTab === 'hospitals' && (
        <div className="space-y-4">
          
          {/* Smart Symptom Problem Solver Search Bar */}
          <div className="bg-white border border-rose-200 rounded-2xl p-3 sm:p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Activity className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder={isHindi ? 'अपनी बीमारी / समस्या लिखें (जैसे: सीने में दर्द, बुखार, हड्डी फ्रैक्चर, डिलीवरी, एक्सीडेंट, दिल की धड़कन)...' : 'Type symptom or problem (e.g. chest pain, fever, fracture, delivery, heart, accident)...'}
                  value={symptomQuery}
                  onChange={(e) => setSymptomQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-rose-50/50 focus:bg-white border border-rose-200 focus:border-rose-500 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                />
                {symptomQuery && (
                  <button onClick={() => setSymptomQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs">
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Symptom Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
                {['सीने में दर्द (Heart)', 'हड्डी फ्रैक्चर', 'बुखार / OPD', 'डिलीवरी (Maternity)', 'एक्सीडेंट (Trauma)'].map((sym) => (
                  <button
                    key={sym}
                    onClick={() => setSymptomQuery(sym.split(' ')[0])}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-900 text-slate-700 font-medium whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {symptomQuery && (
              <div className="mt-2 text-[11px] text-rose-700 flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isHindi
                    ? `"${symptomQuery}" के समाधान हेतु अस्पताल व विशेषज्ञ डॉक्टर छांटे गए`
                    : `Showing hospitals equipped for "${symptomQuery}" with specialist doctors`}
                </span>
              </div>
            )}
          </div>

          {/* Hospitals List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredHospitals.map((hospital, index) => {
              // Freemium Blur Logic: If not premium, blur results after index 1
              const isBlurred = !isPremium && index >= 2;
              const distanceKm = userGpsLocation 
                ? calculateDistanceKm(userGpsLocation.lat, userGpsLocation.lng, hospital.lat, hospital.lng)
                : null;

              return (
                <div
                  key={hospital.id}
                  className={`bg-white rounded-2xl border transition-all p-4 relative overflow-hidden shadow-xs flex flex-col justify-between ${
                    isBlurred ? 'border-slate-200 select-none' : 'border-slate-200/90 hover:border-rose-400'
                  }`}
                >
                  {/* Premium Blur Shield Overlay */}
                  {isBlurred && (
                    <div className="absolute inset-0 z-20 backdrop-blur-md bg-slate-900/60 p-4 flex flex-col items-center justify-center text-center text-white">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold mb-2 shadow-lg">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h4 className="font-extrabold text-sm text-amber-300">
                        {hospital.name.slice(0, 18)}... (Locked)
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 max-w-xs">
                        {isHindi ? 'विशेषज्ञ डॉक्टर, मोबाइल नंबर, ईमेल व लाइव बेड देखने के लिए ₹49 का गोल्ड पास लें।' : 'Unlock full specialist doctor contacts, live bed count & timing with ₹49 pass.'}
                      </p>
                      <button
                        onClick={onOpenPremiumModal}
                        className="mt-3 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-md cursor-pointer hover:from-amber-300 hover:to-amber-400 flex items-center gap-1.5"
                      >
                        <Crown className="w-3.5 h-3.5 fill-slate-950" />
                        <span>{isHindi ? '₹49 में अनलॉक करें' : 'Unlock for ₹49'}</span>
                      </button>
                    </div>
                  )}

                  {/* Hospital Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 uppercase">
                            {hospital.category.replace('_', ' ')}
                          </span>
                          {hospital.ayushmanBharatAccepted && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              ✓ आयुष्मान भारत
                            </span>
                          )}
                          {distanceKm !== null && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-0.5">
                              <Compass className="w-3 h-3 text-rose-500" />
                              {distanceKm} km away
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mt-1.5">
                          {hospital.name}
                        </h3>
                      </div>

                      {/* Rating Badge */}
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-amber-900 font-black text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{hospital.rating}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {hospital.totalReviews} समीक्षा
                        </span>
                      </div>
                    </div>

                    {/* Timing & Beds */}
                    <div className="mt-2.5 p-2 bg-slate-50 rounded-xl flex items-center justify-between text-[11px] text-slate-700">
                      <div className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{hospital.timing}</span>
                      </div>
                      {hospital.bedsAvailableEst && (
                        <div className="flex items-center gap-1 font-bold text-emerald-700">
                          <Bed className="w-3.5 h-3.5" />
                          <span>~{hospital.bedsAvailableEst} बेड उपलब्ध</span>
                        </div>
                      )}
                    </div>

                    {/* Contact & Address */}
                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{hospital.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] flex-wrap">
                        <span className="flex items-center gap-1 text-slate-800 font-bold">
                          <Phone className="w-3 h-3 text-rose-500" />
                          {hospital.phone}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {hospital.email}
                        </span>
                      </div>
                    </div>

                    {/* Specialist Doctors Preview */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                        👨‍⚕️ {isHindi ? 'विशेषज्ञ डॉक्टर एवं ओपीडी:' : 'Specialist Doctors & OPD:'}
                      </span>
                      <div className="space-y-1.5">
                        {hospital.specialistDoctors.slice(0, 2).map((doc, dIdx) => (
                          <div key={dIdx} className="bg-rose-50/50 border border-rose-100 rounded-lg p-2 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-slate-900">{doc.name}</div>
                              <div className="text-[10px] text-rose-700 font-medium">{doc.specialization}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right text-[10px] text-slate-500">
                                <span className="font-bold text-slate-800">फीस: ₹{doc.consultationFee}</span>
                                <div className="text-[9px] text-slate-400">{doc.availableTiming}</div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openBooking({ type: 'hospital', hospital, doctor: doc });
                                }}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                              >
                                <span>{isHindi ? 'स्लॉट बुक करें' : 'Book'}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Services Tags */}
                    <div className="mt-2.5 flex items-center gap-1 flex-wrap">
                      {hospital.services.slice(0, 3).map((srv, sIdx) => (
                        <span key={sIdx} className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-md">
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Direct Dial, OPD Token & Navigation */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => openBooking({ type: 'hospital', hospital })}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isHindi ? 'ओपीडी टोकन बुक करें' : 'Book OPD Token'}</span>
                    </button>

                    <a
                      href={`tel:${hospital.emergencyHelpline || hospital.phone}`}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'कॉल' : 'Call'}</span>
                    </a>

                    <button
                      onClick={() => handleNavigate(hospital.lat, hospital.lng, hospital.name)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isHindi ? 'ई-राही रूट' : 'Directions'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: HOURLY HOTELS & STUDENT LODGES (FOR EXAMS, INTERVIEWS, REST)
         ========================================================================= */}
      {activeTab === 'hotels' && (
        <div className="space-y-4">
          
          {/* Hotel Filter Bar */}
          {renderHotelFilterBar()}

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <span className="font-semibold">
              {isHindi ? `कुल ${filteredHotels.length} होटल व लॉज उपलब्ध` : `Showing ${filteredHotels.length} hotels & lodges`}
              {maxHourlyBudget < 500 ? ` (≤ ₹${maxHourlyBudget}/hr)` : ''}
              {minRatingFilter > 0 ? ` (${minRatingFilter}+ ⭐)` : ''}
            </span>
            {userGpsLocation && (
              <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                <Compass className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>{isHindi ? 'जीपीएस द्वारा दूरी की गणना' : 'Live GPS Distance'}</span>
              </span>
            )}
          </div>

          {/* Empty State */}
          {filteredHotels.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-amber-200 space-y-3">
              <div className="text-3xl">🏨</div>
              <p className="text-sm font-bold text-slate-800">
                {isHindi ? 'दिए गए फिल्टर के अनुसार कोई होटल या लॉज नहीं मिला' : 'No hotels or lodges match your selected filters'}
              </p>
              <p className="text-xs text-slate-500">
                {isHindi ? 'कृपया किराया सीमा बढ़ाएं या फिल्टर रीसेट करें।' : 'Try increasing your hourly budget or clearing rating filters.'}
              </p>
              <button
                onClick={resetHotelFilters}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow-xs transition-all"
              >
                {isHindi ? 'सभी फिल्टर रीसेट करें' : 'Reset All Filters'}
              </button>
            </div>
          )}

          {/* Hotels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredHotels.map((hotel, index) => {
              const isBlurred = !isPremium && index >= 2;
              const distanceKm = userGpsLocation 
                ? calculateDistanceKm(userGpsLocation.lat, userGpsLocation.lng, hotel.lat, hotel.lng)
                : null;

              return (
                <div
                  key={hotel.id}
                  className={`bg-white rounded-2xl border transition-all p-4 relative overflow-hidden shadow-xs flex flex-col justify-between ${
                    isBlurred ? 'border-slate-200 select-none' : 'border-slate-200 hover:border-amber-400'
                  }`}
                >
                  {/* Premium Blur Shield */}
                  {isBlurred && (
                    <div className="absolute inset-0 z-20 backdrop-blur-md bg-slate-900/60 p-4 flex flex-col items-center justify-center text-center text-white">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold mb-2 shadow-lg">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h4 className="font-extrabold text-sm text-amber-300">
                        {hotel.name.slice(0, 20)}... (Locked)
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 max-w-xs">
                        {isHindi ? 'परीक्षा अभ्यर्थियों व माता-पिता के लिए घंटे वाले कमरे अनलॉक करने हेतु ₹49 का पास लें।' : 'Unlock direct hotel contact, wifi desk & hourly booking phone number with ₹49 pass.'}
                      </p>
                      <button
                        onClick={onOpenPremiumModal}
                        className="mt-3 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Crown className="w-3.5 h-3.5 fill-slate-950" />
                        <span>{isHindi ? '₹49 में अनलॉक करें' : 'Unlock for ₹49'}</span>
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                            {hotel.type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            ✓ सत्यापित लॉज
                          </span>
                          {distanceKm !== null && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {distanceKm} km
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mt-1.5">
                          {hotel.name}
                        </h3>
                        <p className="text-xs text-slate-500">{hotel.hindiName}</p>
                      </div>

                      {/* Pricing Highlight Pill */}
                      <div className="text-right shrink-0 bg-amber-50 border border-amber-200/80 rounded-xl p-2">
                        <div className="text-amber-900 font-black text-sm">
                          ₹{hotel.hourlyRate} <span className="text-[10px] font-normal text-slate-500">/{hotel.minHours || 2} hr</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 block">
                          ₹{hotel.perNightRate}/night
                        </span>
                      </div>
                    </div>

                    {/* Near Transit Hub */}
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-800 font-bold bg-amber-50/60 p-2 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{hotel.nearHub}</span>
                    </div>

                    {/* Ideal For Tags (Exams, Interviews) */}
                    <div className="mt-2.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        🎯 {isHindi ? 'विशेष उपयोगी:' : 'Ideal For:'}
                      </span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {hotel.idealFor.map((item, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap text-[11px] text-slate-600">
                      {hotel.features.slice(0, 3).map((feat, fIdx) => (
                        <span key={fIdx} className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>{feat}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Direct Book Room & E-Rickshaw Navigation */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => openBooking({ type: hotel.type === 'student_lodge' ? 'lodge' : 'hotel', hotel })}
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <BedDouble className="w-3.5 h-3.5 text-slate-950" />
                      <span>{isHindi ? 'कमरा बुक करें (ई-राही छूट)' : 'Book Room Now'}</span>
                    </button>

                    <a
                      href={`tel:${hotel.phone}`}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'कॉल' : 'Call'}</span>
                    </a>

                    <button
                      onClick={() => handleNavigate(hotel.lat, hotel.lng, hotel.name)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isHindi ? 'ई-राही रूट' : 'Directions'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: COLLEGES & UNIVERSITIES (STREAMS, REAL-TIME RATINGS & FEES)
         ========================================================================= */}
      {activeTab === 'colleges' && (
        <div className="space-y-4">
          
          {/* Stream & Budget Filter Bar */}
          <div className="bg-white border border-indigo-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {['all', 'Engineering', 'Medical', 'Law', 'Commerce', 'Sciences'].map((stream) => (
                <button
                  key={stream}
                  onClick={() => setSelectedStream(stream)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    selectedStream === stream ? 'bg-indigo-600 text-white font-black' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {stream === 'all' ? (isHindi ? 'सभी संकाय (All Streams)' : 'All Streams') : stream}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
              <span>{isHindi ? 'फीस बजट:' : 'Fee Budget:'}</span>
              <select
                value={collegeBudgetFilter}
                onChange={(e) => setCollegeBudgetFilter(e.target.value as any)}
                className="px-2 py-1 border border-slate-300 rounded-lg bg-white font-bold"
              >
                <option value="all">{isHindi ? 'सभी बजट' : 'All Budgets'}</option>
                <option value="affordable">{isHindi ? 'अति किफायती / सरकारी' : 'Affordable / Govt'}</option>
                <option value="moderate">{isHindi ? 'मध्यम प्राइवेट' : 'Moderate Private'}</option>
              </select>
            </div>
          </div>

          {/* Colleges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredColleges.map((college, index) => {
              const isBlurred = !isPremium && index >= 2;

              return (
                <div
                  key={college.id}
                  className={`bg-white rounded-2xl border transition-all p-4 relative overflow-hidden shadow-xs flex flex-col justify-between ${
                    isBlurred ? 'border-slate-200 select-none' : 'border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  {isBlurred && (
                    <div className="absolute inset-0 z-20 backdrop-blur-md bg-slate-900/60 p-4 flex flex-col items-center justify-center text-center text-white">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold mb-2 shadow-lg">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h4 className="font-extrabold text-sm text-amber-300">
                        {college.name.slice(0, 20)}... (Locked)
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 max-w-xs">
                        {isHindi ? 'कॉलेज प्रवेश हेल्पलाइन, छात्र समीक्षा व परीक्षा केंद्र विवरण देखने के लिए ₹49 का पास लें।' : 'Unlock student reviews, exam center helpline & complete fee charts with ₹49 pass.'}
                      </p>
                      <button
                        onClick={onOpenPremiumModal}
                        className="mt-3 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Crown className="w-3.5 h-3.5 fill-slate-950" />
                        <span>{isHindi ? '₹49 में अनलॉक करें' : 'Unlock for ₹49'}</span>
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase">
                            {college.type.replace('_', ' ')}
                          </span>
                          {college.examCenterActive && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 animate-pulse">
                              📝 परीक्षा केंद्र सक्रिय
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mt-1.5">
                          {college.name}
                        </h3>
                        <p className="text-xs text-slate-500">{college.hindiName}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-amber-900 font-black text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{college.rating}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {college.totalReviews} छात्र रेटिंग
                        </span>
                      </div>
                    </div>

                    {/* Fees & Establishment */}
                    <div className="mt-2.5 p-2 bg-indigo-50/60 rounded-xl flex items-center justify-between text-[11px] text-indigo-950 font-semibold">
                      <span>💰 {college.annualFeeRange}</span>
                      <span className="text-slate-500">Est. {college.establishedYear}</span>
                    </div>

                    {/* Streams offered */}
                    <div className="mt-2.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        🎓 {isHindi ? 'उपलब्ध पाठ्यक्रम (Streams):' : 'Available Streams:'}
                      </span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {college.streams.slice(0, 3).map((st, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                      {college.highlights.slice(0, 2).map((hl, hIdx) => (
                        <div key={hIdx} className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <a
                      href={`tel:${college.phone}`}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'एडमिशन / पूछताछ' : 'Admission Desk'}</span>
                    </a>

                    <button
                      onClick={() => handleNavigate(college.lat, college.lng, college.name)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isHindi ? 'ई-राही रूट' : 'Directions'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: LOCAL CLINICS & PROMOTED COMMUNITY STORES (DISCOUNTS)
         ========================================================================= */}
      {activeTab === 'local_stores' && (
        <div className="space-y-4">
          
          {/* Promotion CTA Bar */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                  {isHindi ? 'स्थानीय व्यापार व क्लीनिक पार्टनर नेटवर्क' : 'Local Business & Clinic Partner Network'}
                </h4>
                <p className="text-[11px] text-emerald-700">
                  {isHindi ? 'ई-राही यात्रियों के लिए दवाइयों, पैथोलॉजी व किताबों पर 15-25% विशेष छूट।' : 'Verified local pharmacies, labs & bookstores offering exclusive commuter discounts.'}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenStoreModal}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isHindi ? 'अपनी दुकान जोड़ें' : 'Add Your Business'}</span>
            </button>
          </div>

          {/* Stores List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 transition-all p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {store.isPromoted && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                            ⭐ {store.promotedBadge || 'प्रमोटेड पार्टनर'}
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {store.category.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mt-1.5">
                        {store.businessName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {isHindi ? 'संचालक:' : 'Owner:'} {store.ownerName}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-amber-900 font-black text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{store.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Special Commuter Discount Offer Highlight */}
                  {store.discountOffer && (
                    <div className="mt-2.5 p-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <Percent className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{store.discountOffer}</span>
                    </div>
                  )}

                  {/* Timing & Address */}
                  <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{store.timing}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{store.address}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  {(store.category === 'clinic_pharmacy' || store.category === 'diagnostic_lab') ? (
                    <button
                      onClick={() => openBooking({ type: 'clinic', clinic: store })}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'अपॉइंटमेंट बुक करें (15% छूट)' : 'Book Appointment (15% Off)'}</span>
                    </button>
                  ) : (
                    <a
                      href={`tel:${store.phone}`}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'कॉल करें' : 'Call Store'}</span>
                    </a>
                  )}

                  <a
                    href={`tel:${store.phone}`}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span>{isHindi ? 'फोन' : 'Call'}</span>
                  </a>

                  <button
                    onClick={() => handleNavigate(store.lat, store.lng, store.businessName)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isHindi ? 'ई-राही रूट' : 'Directions'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      )}
        </>
      )}

      {/* Direct Booking Modal */}
      <BookingAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        bookingTarget={bookingTarget}
        onBookingSuccess={() => {
          refreshBookingsCount();
        }}
        onNavigateToVenue={handleNavigate}
        language={language}
        defaultUserName={defaultUserName}
        defaultUserPhone={defaultUserPhone}
      />
    </div>
  );
};
