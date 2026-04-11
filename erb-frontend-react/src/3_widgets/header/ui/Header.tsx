import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Settings, User, X, LocateFixed, MapPinned, SlidersHorizontal, RotateCcw, Clock } from 'lucide-react';
import { useMapStore } from '@/6_shared/model/store';
import type { Station } from '@/5_entities/station/model/type';
import type { Wagon } from '@/5_entities/wagon/type';

type MenuKey = 'notifications' | 'settings' | 'profile' | null;
type SearchSuggestion =
  | { kind: 'station'; station: Station }
  | { kind: 'wagon'; wagon: Wagon };

const DEFAULT_CENTER = { lat: 48.3794, lng: 31.1656, zoom: 6 };

const NAV_TABS = [
  { id: 'main', label: 'Головна мапа', path: '/' },
  { id: 'live', label: 'Операції наживо', path: '/operations' },
  { id: 'schedule', label: 'Розклад', path: '/schedule' },
];

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    graph,
    wagons,
    searchQuery,
    setSearchQuery,
    setSelectedStation,
    selectedStation,
    eventLog,
    unreadCount,
    requestMapCenter,
    toggleTerrain,
    isTerrainEnabled,
    resetFilters,
    simulation,
  } = useMapStore();
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [activeMenu, setActiveMenu] = useState<MenuKey>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const hasSearchText = searchInput.trim().length > 0;

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const latestEvents = useMemo(() => eventLog.slice(0, 15), [eventLog]);

  const eventMeta: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
    wagonMoved:         { emoji: '🛤', label: 'Переміщення',       color: 'text-indigo-700',  bg: 'bg-indigo-50' },
    wagonArrived:       { emoji: '🏁', label: 'Прибуття',          color: 'text-green-700',   bg: 'bg-green-50' },
    wagonDispatched:    { emoji: '🚀', label: 'Відправлення',      color: 'text-orange-700',  bg: 'bg-orange-50' },
    wagonUnloaded:      { emoji: '📥', label: 'Розвантаження',     color: 'text-slate-700',   bg: 'bg-slate-100' },
    orderCreated:       { emoji: '📦', label: 'Нове замовлення',   color: 'text-blue-700',    bg: 'bg-blue-50' },
    assignmentCreated:  { emoji: '🗺', label: 'Маршрут',           color: 'text-cyan-700',    bg: 'bg-cyan-50' },
    orderFulfilled:     { emoji: '✅', label: 'Виконано',           color: 'text-emerald-700', bg: 'bg-emerald-50' },
    trainCreated:       { emoji: '🚄', label: 'Потяг',              color: 'text-sky-700',     bg: 'bg-sky-50' },
    trainDispatched:    { emoji: '🚀', label: 'Відправлення потяга',color: 'text-indigo-700',  bg: 'bg-indigo-50' },
    trainArrived:       { emoji: '🏁', label: 'Прибуття потяга',    color: 'text-orange-700',  bg: 'bg-orange-50' },
  };
  const defaultMeta = { emoji: '🔔', label: 'Подія', color: 'text-slate-600', bg: 'bg-slate-50' };

  const unreadCountLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  const closeMenus = () => setActiveMenu(null);

  const focusSelectedStation = () => {
    if (selectedStation) {
      requestMapCenter(selectedStation.lat, selectedStation.lng, 9);
    } else {
      requestMapCenter(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, DEFAULT_CENTER.zoom);
    }

    closeMenus();
  };

  const resetView = () => {
    requestMapCenter(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, DEFAULT_CENTER.zoom);
    closeMenus();
  };

  const clearSelection = () => {
    setSelectedStation(null);
    setSearchQuery('');
    setSearchInput('');
    closeMenus();
  };

  const stationSuggestions = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    if (!query || !graph) return [];

    return graph.stations
      .filter((station) => station.name.toLowerCase().includes(query))
      .slice(0, 6);
  }, [searchInput, graph]);

  const wagonSuggestions = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    if (!query) return [];

    return wagons
      .filter((wagon) => {
        const number = wagon.number.toLowerCase();
        const id = wagon.id.toLowerCase();
        const type = wagon.type.toLowerCase();
        const status = wagon.status.toLowerCase();
        return number.includes(query) || id.includes(query) || type.includes(query) || status.includes(query);
      })
      .slice(0, 6);
  }, [searchInput, wagons]);

  const searchSuggestions = useMemo<SearchSuggestion[]>(() => {
    const stations = stationSuggestions.map((station) => ({ kind: 'station', station }) as const);
    const assets = wagonSuggestions.map((wagon) => ({ kind: 'wagon', wagon }) as const);
    return [...stations, ...assets].slice(0, 6);
  }, [stationSuggestions, wagonSuggestions]);

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.kind === 'station') {
      const targetStation = suggestion.station;
      setSelectedStation(targetStation);
      setSearchQuery(targetStation.name);
      setSearchInput(targetStation.name);
      setShowSuggestions(false);
      setHighlightedIndex(0);
      return;
    }

    const targetWagon = suggestion.wagon;
    const stationByWagon = graph?.stations.find(
      (station) => String(station.stationId || '') === String(targetWagon.currentStationId || '')
    );

    if (stationByWagon) {
      setSelectedStation(stationByWagon);
      setSearchQuery(targetWagon.number || targetWagon.id);
      setSearchInput(targetWagon.number || targetWagon.id);
    } else {
      setSelectedStation(null);
      setSearchQuery(targetWagon.number || targetWagon.id);
      setSearchInput(targetWagon.number || targetWagon.id);
    }

    setShowSuggestions(false);
    setHighlightedIndex(0);
  };

  const commitSearch = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;

    const normalizedLower = normalized.toLowerCase();

    const exactStation = graph?.stations.find(
      (station) => station.name.toLowerCase() === normalized.toLowerCase()
    );

    const targetStation = exactStation || graph?.stations.find(
      (station) => station.name.toLowerCase().includes(normalized.toLowerCase())
    );

    if (targetStation) {
      selectSuggestion({ kind: 'station', station: targetStation });
      return;
    }

    const targetWagon = wagons.find((wagon) => {
      const number = wagon.number.toLowerCase();
      const id = wagon.id.toLowerCase();
      const type = wagon.type.toLowerCase();
      const status = wagon.status.toLowerCase();
      return (
        number === normalizedLower ||
        id === normalizedLower ||
        number.includes(normalizedLower) ||
        id.includes(normalizedLower) ||
        type.includes(normalizedLower) ||
        status.includes(normalizedLower)
      );
    });

    if (targetWagon) {
      selectSuggestion({ kind: 'wagon', wagon: targetWagon });
    } else {
      setSearchQuery(normalized);
      setSearchInput(normalized);
      setSelectedStation(null);
    }

    setShowSuggestions(false);
    setHighlightedIndex(0);
  };

  const renderHighlightedName = (stationName: string) => {
    const query = searchInput.trim();
    if (!query) return stationName;

    const stationLower = stationName.toLowerCase();
    const queryLower = query.toLowerCase();
    const matchStart = stationLower.indexOf(queryLower);

    if (matchStart === -1) return stationName;

    const matchEnd = matchStart + query.length;

    return (
      <>
        {stationName.slice(0, matchStart)}
        <span className="font-bold text-slate-900">{stationName.slice(matchStart, matchEnd)}</span>
        {stationName.slice(matchEnd)}
      </>
    );
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setShowSuggestions(false);
    setHighlightedIndex(0);
  };

  return (
    <header className="relative h-16 bg-[#f3f6fb] border-b border-slate-200/90 flex items-center justify-between px-6 z-[3000]">
      <div className="flex items-center gap-8">
        <div className="font-bold text-lg tracking-tight cursor-pointer" style={{ color: '#002e7e' }}>
          УЗ Логістика
        </div>
        
        <nav className="flex items-center gap-6">
          {NAV_TABS.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`text-sm font-medium transition-colors relative py-5 ${
                  isActive ? "font-semibold" : 'text-slate-500 hover:text-slate-800'
                }`} 
                style={isActive ? { color: '#002e7e' } : {}}
              >
                {tab.label}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#002e7e' }} />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* ГОДИННИК СИМУЛЯЦІЇ */}
        {simulation && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 mr-2">
            <Clock size={14} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-700 tabular-nums">
              {simulation.displayTime
                ? new Date(simulation.displayTime).toLocaleString('uk-UA', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : `Година ${simulation.currentHour}`}
            </span>
            {simulation.speed > 1 && (
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                x{simulation.speed}
              </span>
            )}
          </div>
        )}
        <div className="relative group">
          <button
            onClick={() => commitSearch(searchInput)}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors p-1 rounded-full" style={{ color: '#002e7e' }}  onMouseEnter={(e) => e.currentTarget.style.color = '#002e7e'} onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <Search size={18} />
          </button>
          <input 
            type="text" 
            placeholder="Пошук станцій або активів..." 
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setShowSuggestions(e.target.value.trim().length > 0);
              setHighlightedIndex(0);
            }}
            onFocus={() => {
              setShowSuggestions(searchInput.trim().length > 0);
              setHighlightedIndex(0);
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 120);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowSuggestions(false);
                return;
              }

              if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (searchSuggestions.length === 0) return;
                setHighlightedIndex((prev) => (prev + 1) % searchSuggestions.length);
                return;
              }

              if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (searchSuggestions.length === 0) return;
                setHighlightedIndex((prev) => (prev - 1 + searchSuggestions.length) % searchSuggestions.length);
                return;
              }

              if (e.key === 'Enter') {
                if (searchSuggestions[highlightedIndex]) {
                  selectSuggestion(searchSuggestions[highlightedIndex]);
                } else {
                  commitSearch(searchInput);
                }
              }
            }}
            className="bg-slate-100 border border-transparent rounded-full py-2 pl-11 pr-20 text-sm w-72 focus:ring-2 focus:ring-[#002e7e]/20 focus:border-[#002e7e]/30 outline-none transition-all placeholder:text-slate-400 group-hover:bg-slate-50"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {hasSearchText && (
              <button
                onClick={clearSearch}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
                title="Очистити пошук"
              >
                <X size={14} />
              </button>
            )}
            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-500 text-[10px] font-semibold">
              Enter
            </span>
          </div>

          {showSuggestions && hasSearchText && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden z-[3100]">
              {searchSuggestions.length > 0 ? (
                searchSuggestions.map((suggestion, idx) => (
                  <button
                    key={
                      suggestion.kind === 'station'
                        ? `station-${suggestion.station.stationId || suggestion.station.name}`
                        : `wagon-${suggestion.wagon.id || suggestion.wagon.number}`
                    }
                    onClick={() => selectSuggestion(suggestion)}
                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center justify-between ${
                      highlightedIndex === idx
                        ? 'font-medium'
                        : 'text-slate-700'
                    }`} style={{
                      backgroundColor: highlightedIndex === idx ? '#f0f4ff' : 'transparent',
                      color: highlightedIndex === idx ? '#002e7e' : '#374151'
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {suggestion.kind === 'station'
                          ? renderHighlightedName(suggestion.station.name)
                          : renderHighlightedName(suggestion.wagon.number || suggestion.wagon.id)}
                      </span>
                      {suggestion.kind === 'wagon' && (
                        <span className="text-[10px] text-slate-400">
                          {suggestion.wagon.type} • {suggestion.wagon.status}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <LocateFixed size={11} /> {suggestion.kind === 'station' ? 'станція' : 'вагон'}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2.5 text-sm text-slate-500 bg-slate-50/60">
                  Станції не знайдено. Спробуйте іншу назву.
                </div>
              )}
            </div>
          )}
        </div>

        <div ref={menuRef} className="relative flex items-center gap-3 ml-2">
          <button
            onClick={() => {
              setActiveMenu((prev) => (prev === 'notifications' ? null : 'notifications'));
              useMapStore.setState({ unreadCount: 0 });
            }}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors"
            aria-expanded={activeMenu === 'notifications'}
            aria-label="Сповіщення"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 -right-0.5 min-w-4 h-4.25 px-1 bg-red-500 text-white rounded-full text-[8px] leading-4 border-2 border-white">
                {unreadCountLabel}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveMenu((prev) => (prev === 'settings' ? null : 'settings'))}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            aria-expanded={activeMenu === 'settings'}
            aria-label="Швидкі налаштування"
          >
            <Settings size={20} />
          </button>
          <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-200">
            <button
              onClick={() => setActiveMenu((prev) => (prev === 'profile' ? null : 'profile'))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-transform hover:scale-105"
              style={{ backgroundColor: '#f0f4ff', color: '#002e7e' }}
              aria-expanded={activeMenu === 'profile'}
              aria-label="Профіль диспетчера"
            >
              AV
            </button>
            <button
              onClick={focusSelectedStation}
              className="p-1 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Центрувати на вибраній станції"
              title={selectedStation ? `Центрувати на ${selectedStation.name}` : 'Центрувати карту'}
            >
              <User size={20} />
            </button>
          </div>

          {activeMenu === 'notifications' && (
            <div className="absolute right-0 top-full mt-3 w-96 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden z-[3200]">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Сповіщення</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{eventLog.length} подій у журналі</p>
                </div>
                <button onClick={resetView} className="text-[10px] font-medium text-blue-600 hover:text-blue-700">
                  Центр
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {latestEvents.length > 0 ? (
                  latestEvents.map((event) => {
                    const meta = eventMeta[event.type] || defaultMeta;
                    return (
                      <div key={event.id} className="px-4 py-2.5 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <span className="text-base mt-0.5 shrink-0">{meta.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                                {meta.label}
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed truncate">{event.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center">
                    <span className="text-2xl block mb-2">🔕</span>
                    <p className="text-xs text-slate-400">Немає нових подій</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === 'settings' && (
            <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden z-[3200]">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Налаштування карти</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Швидкі дії для мапи та фільтрів</p>
              </div>
              <div className="p-3 space-y-2">
                <button
                  onClick={() => {
                    toggleTerrain();
                    closeMenus();
                  }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm text-slate-700">
                    <MapPinned size={16} className="text-slate-400" />
                    <span>Рельєф мапи</span>
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${isTerrainEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {isTerrainEnabled ? 'Увімкнено' : 'Вимкнено'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    resetFilters();
                    closeMenus();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors text-sm text-slate-700"
                >
                  <SlidersHorizontal size={16} className="text-slate-400" />
                  <span>Скинути фільтри карти</span>
                </button>
                <button
                  onClick={resetView}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors text-sm text-slate-700"
                >
                  <LocateFixed size={16} className="text-slate-400" />
                  <span>Повернути карту в центр</span>
                </button>
              </div>
            </div>
          )}

          {activeMenu === 'profile' && (
            <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden z-[3200]">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Профіль</p>
                <p className="text-[10px] text-slate-400 mt-0.5">AV · черговий диспетчер</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
                  <div className="font-medium text-slate-900">Поточний вибір</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {selectedStation ? selectedStation.name : 'Станція не вибрана'}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
                  <div className="font-medium text-slate-900">Пошук</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {searchInput.trim() ? searchInput : 'Пошук неактивний'}
                  </div>
                </div>
                <button
                  onClick={clearSelection}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors text-sm text-slate-700"
                >
                  <RotateCcw size={16} className="text-slate-400" />
                  <span>Очистити пошук і вибір</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};