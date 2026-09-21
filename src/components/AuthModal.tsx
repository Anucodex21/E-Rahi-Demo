import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Shield,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  Zap,
  ArrowRight,
  LogOut,
  Sparkles,
  MapPin,
  Car,
  AlertCircle
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
  language: 'en' | 'hi' | 'ur';
  cityName: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  language,
  cityName
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('commuter');
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const isHindi = language === 'hi';
  const isUrdu = language === 'ur';

  // Demo 1-Click accounts for instant testing
  const handleDemoLogin = (role: UserRole) => {
    let demoUser: UserProfile;

    if (role === 'driver') {
      demoUser = {
        id: 'usr_driver_01',
        name: isHindi ? 'राजेश कुमार (चालक)' : 'Rajesh Kumar (Driver)',
        phone: '+91 98370 12345',
        email: 'rajesh.erickshaw@bareilly.in',
        role: 'driver',
        avatar: '🛺',
        cityName: cityName,
        stateCode: 'UP',
        isVerifiedDriver: true,
        vehicleNumber: 'UP25 ET 8942',
        batteryCapacityKwh: 4.8,
        guardianPhone: '+91 94120 56789',
        reputationPoints: 240,
        reportsSubmitted: 18,
        favoriteRoutes: [{ from: 'bareilly_junction', to: 'satellite_bus_stand' }],
        memberSince: 'March 2025'
      };
    } else if (role === 'police_official') {
      demoUser = {
        id: 'usr_police_01',
        name: isHindi ? 'इंस्पेक्टर वी. के. सिंह' : 'Inspector V. K. Singh (Traffic)',
        phone: '+91 94544 01234',
        email: 'traffic.cell@bareillypolice.gov.in',
        role: 'police_official',
        avatar: '👮‍♂️',
        cityName: cityName,
        stateCode: 'UP',
        isVerifiedDriver: false,
        reputationPoints: 950,
        reportsSubmitted: 64,
        memberSince: 'January 2025'
      };
    } else {
      demoUser = {
        id: 'usr_commuter_01',
        name: isHindi ? 'प्रिया शर्मा (यात्री)' : 'Priya Sharma (Commuter)',
        phone: '+91 98971 67890',
        email: 'priya.bareilly@gmail.com',
        role: 'commuter',
        avatar: '👩',
        cityName: cityName,
        stateCode: 'UP',
        guardianPhone: '+91 94120 88888',
        reputationPoints: 85,
        reportsSubmitted: 6,
        favoriteRoutes: [{ from: 'kutubkhana_chauraha', to: 'delhi_road_trishul' }],
        memberSince: 'April 2025'
      };
    }

    onLoginSuccess(demoUser);
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (authMode === 'login') {
      if (!phone && !email) {
        setErrorMessage(isHindi ? 'कृपया मोबाइल नंबर या ईमेल दर्ज करें' : 'Please enter Phone number or Email');
        return;
      }

      const loggedUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: name || (phone ? `User (${phone.slice(-4)})` : 'Verified Commuter'),
        phone: phone || '+91 98370 00000',
        email: email || '',
        role: selectedRole,
        avatar: selectedRole === 'driver' ? '🛺' : selectedRole === 'police_official' ? '👮' : '👤',
        cityName: cityName,
        stateCode: 'UP',
        isVerifiedDriver: selectedRole === 'driver',
        vehicleNumber: vehicleNumber || (selectedRole === 'driver' ? 'UP25 ET 1001' : undefined),
        guardianPhone: guardianPhone || '',
        reputationPoints: 50,
        reportsSubmitted: 1,
        memberSince: 'Today'
      };

      onLoginSuccess(loggedUser);
      onClose();
    } else if (authMode === 'register') {
      if (!name.trim()) {
        setErrorMessage(isHindi ? 'कृपया अपना पूरा नाम दर्ज करें' : 'Please enter your full name');
        return;
      }
      if (!phone.trim()) {
        setErrorMessage(isHindi ? 'कृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें' : 'Please enter your mobile phone number');
        return;
      }

      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        role: selectedRole,
        avatar: selectedRole === 'driver' ? '🛺' : selectedRole === 'police_official' ? '👮‍♂️' : '👤',
        cityName: cityName,
        stateCode: 'UP',
        isVerifiedDriver: selectedRole === 'driver',
        vehicleNumber: selectedRole === 'driver' ? (vehicleNumber.trim() || 'UP25 ET 2025') : undefined,
        guardianPhone: guardianPhone.trim(),
        reputationPoints: 100, // Sign up bonus
        reportsSubmitted: 0,
        memberSince: 'Just joined'
      };

      setSuccessMessage(isHindi ? 'खाता सफलतापूर्वक बन गया!' : 'Account registered successfully!');
      setTimeout(() => {
        onLoginSuccess(newUser);
        onClose();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner">
              {currentUser ? currentUser.avatar : '🛺'}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>{currentUser ? currentUser.name : (isHindi ? 'ई-राही खाता' : 'E-Rahi Account')}</span>
                {currentUser?.isVerifiedDriver && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-400/30">
                    VERIFIED
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                {currentUser 
                  ? `${currentUser.role.toUpperCase()} • ${currentUser.cityName}`
                  : (isHindi ? 'लॉग इन व पंजीयन • 100% फ्री' : 'Login & Register for Live Transit')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer relative z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">

          {/* IF ALREADY LOGGED IN: View Profile Card */}
          {currentUser ? (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {isHindi ? 'खाता प्रकार' : 'Account Role'}
                  </span>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full capitalize">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-medium">{isHindi ? 'मोबाइल नंबर' : 'Phone'}</span>
                    <span className="font-bold text-slate-800">{currentUser.phone}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-medium">{isHindi ? 'ट्रैफिक कर्मा स्कोर' : 'Reputation Score'}</span>
                    <span className="font-black text-emerald-600 flex items-center gap-1">
                      ⭐ {currentUser.reputationPoints} pts
                    </span>
                  </div>
                </div>

                {currentUser.vehicleNumber && (
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-amber-700" />
                      {isHindi ? 'ई-रिक्शा नंबर:' : 'E-Rickshaw Plate:'}
                    </span>
                    <span className="font-mono font-black text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-300">
                      {currentUser.vehicleNumber}
                    </span>
                  </div>
                )}

                {currentUser.guardianPhone && (
                  <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-900 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-rose-600" />
                      {isHindi ? 'SOS गार्जियन नंबर:' : 'SOS Guardian Phone:'}
                    </span>
                    <span className="font-bold text-rose-950">
                      {currentUser.guardianPhone}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={onLogout}
                  className="w-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isHindi ? 'लॉग आउट करें' : 'Log Out'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{isHindi ? 'जारी रखें' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* IF NOT LOGGED IN: Show Login / Register Tabs & Form */
            <div className="space-y-4">
              
              {/* Mode Switcher Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    authMode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isHindi ? 'लॉग इन' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    authMode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {isHindi ? 'नया पंजीयन' : 'Register'}
                </button>
              </div>

              {/* Role Selection Pills */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {isHindi ? 'आपकी भूमिका चुनें (Select Role):' : 'Select Your Role:'}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('commuter')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'commuter'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-black shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg block">🚶‍♂️</span>
                    <span className="text-[11px] font-bold block mt-0.5">{isHindi ? 'यात्री' : 'Commuter'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('driver')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'driver'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-black shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg block">🛺</span>
                    <span className="text-[11px] font-bold block mt-0.5">{isHindi ? 'ई-रिक्शा चालक' : 'Driver'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('police_official')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'police_official'
                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-black shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg block">👮‍♂️</span>
                    <span className="text-[11px] font-bold block mt-0.5">{isHindi ? 'पुलिस / वार्डन' : 'Traffic Warden'}</span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-2.5 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* The Form */}
              <form onSubmit={handleFormSubmit} className="space-y-3">
                
                {authMode === 'register' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {isHindi ? 'पूरा नाम *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isHindi ? 'उदा. राजेश शर्मा' : 'e.g. Rajesh Sharma'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isHindi ? 'मोबाइल नंबर *' : 'Mobile Number *'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98370 XXXXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                {selectedRole === 'driver' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {isHindi ? 'ई-रिक्शा पंजीकरण नंबर (गाड़ी नंबर)' : 'E-Rickshaw Registration Plate'}
                    </label>
                    <div className="relative">
                      <Car className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="UP25 ET 8942"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 uppercase focus:outline-none focus:border-amber-500 font-mono font-bold"
                      />
                    </div>
                  </div>
                )}

                {selectedRole === 'commuter' && authMode === 'register' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {isHindi ? 'इमरजेंसी संपर्क नंबर (गार्जियन / परिवार)' : 'Emergency Guardian Phone (For 1-Click SOS)'}
                    </label>
                    <div className="relative">
                      <Shield className="w-4 h-4 text-rose-500 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        value={guardianPhone}
                        onChange={(e) => setGuardianPhone(e.target.value)}
                        placeholder="+91 94120 XXXXX"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isHindi ? 'पासवर्ड / पिन' : 'Password or PIN'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>{authMode === 'login' ? (isHindi ? 'लॉग इन करें' : 'Sign In') : (isHindi ? 'नया खाता बनाएं' : 'Create Account')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* 1-Click Instant Demo Profiles Section */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isHindi ? '1-क्लिक टेस्ट अकाउंट (Demo Sign-In)' : '1-Click Instant Test Accounts'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('driver')}
                    className="p-2 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 text-left transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span className="text-xl">🛺</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-amber-950 truncate">Rajesh Kumar</div>
                      <div className="text-[10px] text-amber-700">Verified Driver</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('commuter')}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-left transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span className="text-xl">👩</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">Priya Sharma</div>
                      <div className="text-[10px] text-slate-500">Commuter</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
