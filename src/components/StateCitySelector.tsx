import React, { useState, useRef, useEffect } from 'react';
import { ALL_INDIA_STATES } from '../data/indiaCitiesData';
import { CityData, StateData, TransitLocation, AppLanguage } from '../types';
import {
  MapPin,
  Search,
  ChevronDown,
  Building2,
  Navigation,
  ArrowRightLeft,
  Check,
  X
} from 'lucide-react';
import { playCleanChime } from '../utils/audioAlerts';

interface StateCitySelectorProps {
  selectedStateId: string;
  selectedCityId: string;
  onSelectStateAndCity: (stateId: string, cityId: string) => void;
  availableLocations?: TransitLocation[];
  selectedOrigin?: TransitLocation;
  selectedDestination?: TransitLocation;
  onSelectOrigin?: (loc: TransitLocation) => void;
  onSelectDestination?: (loc: TransitLocation) => void;
  onSwapLocations?: () => void;
  language?: AppLanguage;
}

export const StateCitySelector: React.FC<StateCitySelectorProps> = ({
  selectedStateId,
  selectedCityId,
  onSelectStateAndCity,
  availableLocations = [],
  selectedOrigin,
  selectedDestination,
  onSelectOrigin,
  onSelectDestination,
  onSwapLocations,
  language = 'hi'
}) => {
  const isHindi = language === 'hi';

  // Active state ID (allows browsing a state before picking a city)
  const [activeStateId, setActiveStateId] = useState<string>(selectedStateId);

  // Dropdown visibility states for the 4 Search Bars
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);

  // Search queries for all 4 bars
  const [stateQuery, setStateQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [originQuery, setOriginQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');

  // DOM Refs for click-outside and auto-focus
  const stateContainerRef = useRef<HTMLDivElement>(null);
  const cityContainerRef = useRef<HTMLDivElement>(null);
  const originContainerRef = useRef<HTMLDivElement>(null);
  const destContainerRef = useRef<HTMLDivElement>(null);

  const stateInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const originInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);

  // Sync state with props
  useEffect(() => {
    setActiveStateId(selectedStateId);
  }, [selectedStateId]);

  const currentState = ALL_INDIA_STATES.find(s => s.id === activeStateId) || ALL_INDIA_STATES[0];
  const selectedState = ALL_INDIA_STATES.find(s => s.id === selectedStateId) || ALL_INDIA_STATES[0];
  const currentCity = currentState.cities.find(c => c.id === selectedCityId) ||
    selectedState.cities.find(c => c.id === selectedCityId) ||
    currentState.cities[0];

  const cityLocations = (availableLocations && availableLocations.length > 0)
    ? availableLocations
    : currentCity.locations;

  const activeOrigin = selectedOrigin || cityLocations[0];
  const activeDestination = selectedDestination || cityLocations[1] || cityLocations[0];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (stateContainerRef.current && !stateContainerRef.current.contains(target)) {
        setIsStateOpen(false);
      }
      if (cityContainerRef.current && !cityContainerRef.current.contains(target)) {
        setIsCityOpen(false);
      }
      if (originContainerRef.current && !originContainerRef.current.contains(target)) {
        setIsOriginOpen(false);
      }
      if (destContainerRef.current && !destContainerRef.current.contains(target)) {
        setIsDestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter 1: States
  const filteredStates = ALL_INDIA_STATES.filter(s => {
    if (!stateQuery.trim()) return true;
    const q = stateQuery.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      s.hindiName.includes(stateQuery.trim()) ||
      s.code.toLowerCase().includes(q)
    );
  });

  // Filter 2: Cities
  const filteredCities = currentState.cities.filter(c => {
    if (!cityQuery.trim()) return true;
    const q = cityQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.hindiName.includes(cityQuery.trim())
    );
  });

  // Filter 3: Origin Locations ("कहाँ से" - user jaha hai)
  const filteredOrigins = cityLocations.filter(loc => {
    if (!originQuery.trim()) return true;
    const q = originQuery.toLowerCase().trim();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.hindiName.includes(originQuery.trim())
    );
  });

  // Filter 4: Destination Locations ("कहाँ तक" - jaha tak jayga)
  const filteredDestinations = cityLocations.filter(loc => {
    if (!destQuery.trim()) return true;
    const q = destQuery.toLowerCase().trim();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.hindiName.includes(destQuery.trim())
    );
  });

  // Step 1: State Selection Handler -> Focus Step 2 (City)
  const handleSelectState = (state: StateData) => {
    setActiveStateId(state.id);
    setIsStateOpen(false);
    setStateQuery('');

    setTimeout(() => {
      setIsCityOpen(true);
      setIsOriginOpen(false);
      setIsDestOpen(false);
      cityInputRef.current?.focus();
    }, 100);
  };

  // Step 2: City Selection Handler -> Focus Step 3 ("कहाँ से" / Origin)
  const handleSelectCity = (city: CityData) => {
    playCleanChime('fare');
    onSelectStateAndCity(city.stateId, city.id);
    setActiveStateId(city.stateId);
    setIsCityOpen(false);
    setCityQuery('');

    setTimeout(() => {
      setIsOriginOpen(true);
      setIsDestOpen(false);
      originInputRef.current?.focus();
    }, 120);
  };

  // Step 3: Origin Selection Handler ("कहाँ से") -> Focus Step 4 ("कहाँ तक")
  const handleSelectOrigin = (loc: TransitLocation) => {
    playCleanChime('fare');
    if (onSelectOrigin) {
      onSelectOrigin(loc);
    }
    setIsOriginOpen(false);
    setOriginQuery('');

    setTimeout(() => {
      setIsDestOpen(true);
      destInputRef.current?.focus();
    }, 120);
  };

  // Step 4: Destination Selection Handler ("कहाँ तक")
  const handleSelectDestination = (loc: TransitLocation) => {
    playCleanChime('fare');
    if (onSelectDestination) {
      onSelectDestination(loc);
    }
    setIsDestOpen(false);
    setDestQuery('');
  };

  const handleSwap = () => {
    playCleanChime('fare');
    if (onSwapLocations) {
      onSwapLocations();
    } else if (onSelectOrigin && onSelectDestination && activeOrigin && activeDestination) {
      onSelectOrigin(activeDestination);
      onSelectDestination(activeOrigin);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200/80 shadow-2xs relative z-30">
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-4 py-2">
        
        {/* 4 Dedicated Searching Bars in Sequential Transit Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-center">
          
          {/* 1. STATE SEARCHING BAR */}
          <div ref={stateContainerRef} className="relative min-w-0">
            <div
              onClick={() => {
                setIsStateOpen(true);
                setIsCityOpen(false);
                setIsOriginOpen(false);
                setIsDestOpen(false);
                setTimeout(() => stateInputRef.current?.focus(), 50);
              }}
              className={`group flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 border rounded-xl transition-all cursor-pointer shadow-2xs ${
                isStateOpen
                  ? 'border-slate-800 ring-2 ring-slate-800/10 bg-white'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-6 h-6 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {isHindi ? 'राज्य (State)' : 'State'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      ref={stateInputRef}
                      type="text"
                      value={isStateOpen ? stateQuery : currentState.name}
                      placeholder={isHindi ? 'राज्य खोजें...' : 'Search state...'}
                      onChange={(e) => {
                        setStateQuery(e.target.value);
                        if (!isStateOpen) setIsStateOpen(true);
                      }}
                      onFocus={() => {
                        setIsStateOpen(true);
                        setIsCityOpen(false);
                        setIsOriginOpen(false);
                        setIsDestOpen(false);
                      }}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden truncate"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 text-slate-400">
                {stateQuery && isStateOpen ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStateQuery('');
                    }}
                    className="p-1 hover:text-slate-600 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                    {currentState.code}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isStateOpen ? 'rotate-180 text-slate-800' : ''}`} />
              </div>
            </div>

            {/* State Dropdown Menu */}
            {isStateOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200 z-[1300] overflow-hidden animate-in fade-in duration-100 max-h-[280px] flex flex-col">
                <div className="p-2 bg-slate-50 border-b border-slate-100 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-700 text-[11px] flex items-center gap-1">
                    <Search className="w-3 h-3 text-slate-500" />
                    {isHindi ? 'राज्य चुनें' : 'Select State'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {filteredStates.length}
                  </span>
                </div>

                <div className="overflow-y-auto divide-y divide-slate-100 flex-1 scrollbar-thin">
                  {filteredStates.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400 font-medium">
                      {isHindi ? 'कोई राज्य नहीं मिला' : 'No state found'}
                    </div>
                  ) : (
                    filteredStates.map((state) => {
                      const isSelected = state.id === activeStateId;
                      return (
                        <button
                          key={state.id}
                          type="button"
                          onClick={() => handleSelectState(state)}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-slate-100 text-slate-900 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-slate-900">
                              {state.name}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-1">
                              ({state.hindiName})
                            </span>
                          </div>

                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                            {state.code}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. CITY SEARCHING BAR */}
          <div ref={cityContainerRef} className="relative min-w-0">
            <div
              onClick={() => {
                setIsCityOpen(true);
                setIsStateOpen(false);
                setIsOriginOpen(false);
                setIsDestOpen(false);
                setTimeout(() => cityInputRef.current?.focus(), 50);
              }}
              className={`group flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 border rounded-xl transition-all cursor-pointer shadow-2xs ${
                isCityOpen
                  ? 'border-slate-800 ring-2 ring-slate-800/10 bg-white'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-6 h-6 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    {isHindi ? 'शहर (City)' : 'City'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      ref={cityInputRef}
                      type="text"
                      value={isCityOpen ? cityQuery : currentCity.name}
                      placeholder={isHindi ? 'शहर खोजें...' : 'Search city...'}
                      onChange={(e) => {
                        setCityQuery(e.target.value);
                        if (!isCityOpen) setIsCityOpen(true);
                      }}
                      onFocus={() => {
                        setIsCityOpen(true);
                        setIsStateOpen(false);
                        setIsOriginOpen(false);
                        setIsDestOpen(false);
                      }}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden truncate"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 text-slate-400">
                {cityQuery && isCityOpen ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCityQuery('');
                    }}
                    className="p-1 hover:text-slate-600 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                    {currentCity.locations.length} {isHindi ? 'हब' : 'Hubs'}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCityOpen ? 'rotate-180 text-slate-800' : ''}`} />
              </div>
            </div>

            {/* City Dropdown Menu */}
            {isCityOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200 z-[1300] overflow-hidden animate-in fade-in duration-100 max-h-[280px] flex flex-col">
                <div className="p-2 bg-slate-50 border-b border-slate-100 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-700 text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {currentState.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {filteredCities.length}
                  </span>
                </div>

                <div className="overflow-y-auto divide-y divide-slate-100 flex-1 scrollbar-thin">
                  {filteredCities.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400 font-medium">
                      {isHindi ? 'शहर नहीं मिला' : 'No city found'}
                    </div>
                  ) : (
                    filteredCities.map((city) => {
                      const isSelected = city.id === selectedCityId;
                      return (
                        <button
                          key={`${city.stateId}-${city.id}`}
                          type="button"
                          onClick={() => handleSelectCity(city)}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-slate-100 text-slate-900 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-slate-900">
                              {city.name}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-1">
                              ({city.hindiName})
                            </span>
                          </div>

                          <span className="text-[10px] text-slate-500 font-medium shrink-0">
                            {city.locations.length} {isHindi ? 'हब' : 'Hubs'}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. ORIGIN SEARCHING BAR */}
          <div ref={originContainerRef} className="relative min-w-0">
            <div
              onClick={() => {
                setIsOriginOpen(true);
                setIsStateOpen(false);
                setIsCityOpen(false);
                setIsDestOpen(false);
                setTimeout(() => originInputRef.current?.focus(), 50);
              }}
              className={`group flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 border rounded-xl transition-all cursor-pointer shadow-2xs ${
                isOriginOpen
                  ? 'border-emerald-600 ring-2 ring-emerald-600/10 bg-white'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  <Navigation className="w-3.5 h-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium text-emerald-700 uppercase tracking-wider">
                    {isHindi ? 'कहाँ से (From)' : 'From'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      ref={originInputRef}
                      type="text"
                      value={isOriginOpen ? originQuery : (activeOrigin?.name || '')}
                      placeholder={isHindi ? 'From Location खोजें...' : 'Search From...'}
                      onChange={(e) => {
                        setOriginQuery(e.target.value);
                        if (!isOriginOpen) setIsOriginOpen(true);
                      }}
                      onFocus={() => {
                        setIsOriginOpen(true);
                        setIsStateOpen(false);
                        setIsCityOpen(false);
                        setIsDestOpen(false);
                      }}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden truncate"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 text-slate-400">
                {originQuery && isOriginOpen ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOriginQuery('');
                    }}
                    className="p-1 hover:text-slate-600 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwap();
                    }}
                    title={isHindi ? 'लोकेशन बदलें (Swap)' : 'Swap locations'}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </button>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOriginOpen ? 'rotate-180 text-emerald-700' : ''}`} />
              </div>
            </div>

            {/* Origin Dropdown Menu */}
            {isOriginOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200 z-[1300] overflow-hidden animate-in fade-in duration-100 max-h-[280px] flex flex-col">
                <div className="p-2 bg-slate-50 border-b border-slate-100 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-700 text-[11px] flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-emerald-600" />
                    {isHindi ? 'शुरुआती स्थान चुनें:' : 'Starting Point:'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {filteredOrigins.length}
                  </span>
                </div>

                <div className="overflow-y-auto divide-y divide-slate-100 flex-1 scrollbar-thin">
                  {filteredOrigins.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400 font-medium">
                      {isHindi ? 'लोकेशन नहीं मिली' : 'No location found'}
                    </div>
                  ) : (
                    filteredOrigins.map((loc) => {
                      const isSelected = loc.id === activeOrigin?.id;
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => handleSelectOrigin(loc)}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-950 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Navigation className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {loc.name}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-1">
                              ({loc.hindiName})
                            </span>
                          </div>

                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. DESTINATION SEARCHING BAR */}
          <div ref={destContainerRef} className="relative min-w-0">
            <div
              onClick={() => {
                setIsDestOpen(true);
                setIsStateOpen(false);
                setIsCityOpen(false);
                setIsOriginOpen(false);
                setTimeout(() => destInputRef.current?.focus(), 50);
              }}
              className={`group flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/80 border rounded-xl transition-all cursor-pointer shadow-2xs ${
                isDestOpen
                  ? 'border-rose-600 ring-2 ring-rose-600/10 bg-white'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium text-rose-700 uppercase tracking-wider">
                    {isHindi ? 'कहाँ तक (To)' : 'To'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      ref={destInputRef}
                      type="text"
                      value={isDestOpen ? destQuery : (activeDestination?.name || '')}
                      placeholder={isHindi ? 'To Location खोजें...' : 'Search To...'}
                      onChange={(e) => {
                        setDestQuery(e.target.value);
                        if (!isDestOpen) setIsDestOpen(true);
                      }}
                      onFocus={() => {
                        setIsDestOpen(true);
                        setIsStateOpen(false);
                        setIsCityOpen(false);
                        setIsOriginOpen(false);
                      }}
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden truncate"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 text-slate-400">
                {destQuery && isDestOpen ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDestQuery('');
                    }}
                    className="p-1 hover:text-slate-600 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[10px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                    {isHindi ? 'मंज़िल' : 'Dest'}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDestOpen ? 'rotate-180 text-rose-600' : ''}`} />
              </div>
            </div>

            {/* Destination Dropdown Menu */}
            {isDestOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200 z-[1300] overflow-hidden animate-in fade-in duration-100 max-h-[280px] flex flex-col">
                <div className="p-2 bg-slate-50 border-b border-slate-100 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-700 text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-600" />
                    {isHindi ? 'मंज़िल चुनें:' : 'Destination:'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {filteredDestinations.length}
                  </span>
                </div>

                <div className="overflow-y-auto divide-y divide-slate-100 flex-1 scrollbar-thin">
                  {filteredDestinations.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400 font-medium">
                      {isHindi ? 'लोकेशन नहीं मिली' : 'No location found'}
                    </div>
                  ) : (
                    filteredDestinations.map((loc) => {
                      const isSelected = loc.id === activeDestination?.id;
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => handleSelectDestination(loc)}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-rose-50 text-rose-950 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {loc.name}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-1">
                              ({loc.hindiName})
                            </span>
                          </div>

                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
