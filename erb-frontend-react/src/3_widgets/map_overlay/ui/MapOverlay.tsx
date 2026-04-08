// import React from 'react';
import { useMemo, useState } from 'react';
import { useMapStore } from '@/6_shared/model/store';
import { summarizeFleetStatus } from '@/6_shared/lib/utils';
import { MapFilter } from '@/4_features/map_filter/ui/MapFilter';
import { Activity, Clock, Package, Crosshair, Layers3, ChevronDown } from 'lucide-react';

export const MapOverlay = () => {
  // Витягуємо все необхідне зі стору
  const {
    eventLog,
    requestMapCenter,
    isTerrainEnabled,
    toggleTerrain,
    fleetStatus,
    wagons,
    graph,
    selectedWagon,
    setSelectedWagon,
  } = useMapStore();
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isFeedOpen, setIsFeedOpen] = useState(true);
  const [activeRightPanel, setActiveRightPanel] = useState<'events' | 'wagons'>('events');
  const isRightPanelOpen = isFeedOpen || Boolean(selectedWagon);
  const activeRightPanelView = selectedWagon ? 'wagons' : activeRightPanel;
  const fleetSummary = summarizeFleetStatus(fleetStatus);
  const totalActive = fleetSummary.moving + fleetSummary.loading + fleetSummary.stationary;
  const movingShare = totalActive > 0 ? Math.round((fleetSummary.moving / totalActive) * 100) : 0;

  const stationNameById = useMemo(() => {
    const mapping: Record<string, string> = {};
    (graph?.stations || []).forEach((station) => {
      const key = String(station.stationId || '').trim();
      if (key) {
        mapping[key] = station.name;
      }
    });
    return mapping;
  }, [graph]);

  const getWagonStatusTone = (status: string): string => {
    const normalized = status.toLowerCase();
    if (normalized.includes('load')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (normalized.includes('move') || normalized.includes('transit') || normalized.includes('dispatch')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (normalized.includes('maint')) return 'bg-violet-50 text-violet-700 border-violet-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const handleCenterOnMyLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported in this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        requestMapCenter(position.coords.latitude, position.coords.longitude, 10);
      },
      (error) => {
        console.error('Failed to read user location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );
  };

  // Функція для перетворення технічного типу події (backend) у красивий текст (frontend)
  const formatEventMessage = (type: string) => {
    const messages: Record<string, { text: string; icon: string; color: string }> = {
      orderCreated: { text: "Створено нове транспортне замовлення", icon: "📦", color: "text-blue-600" },
      wagonMoved: { text: "Вагон перемістився між станціями", icon: "🛤️", color: "text-indigo-600" },
      wagonArrived: { text: "Вагон прибув на станцію", icon: "🏁", color: "text-green-600" },
      assignmentCreated: { text: "Маршрут прокладено для замовлення", icon: "🗺️", color: "text-cyan-600" },
      wagonDispatched: { text: "Вагон почав рух", icon: "🚀", color: "text-orange-600" },
      orderFulfilled: { text: "Замовлення виконано: всі одиниці прибули", icon: "✅", color: "text-emerald-600" },
      wagonUnloaded: { text: "Вагон розвантажено і готовий до нового транзиту", icon: "📥", color: "text-slate-600" },
    };

    return messages[type] || { text: "Отримано системне оновлення", icon: "🔔", color: "text-slate-500" };
  };

  const formatEventTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      orderCreated: 'Створено замовлення',
      wagonMoved: 'Переміщення вагона',
      wagonArrived: 'Прибуття вагона',
      assignmentCreated: 'Створено маршрут',
      wagonDispatched: 'Відправлено вагон',
      orderFulfilled: 'Замовлення виконано',
      wagonUnloaded: 'Вагон розвантажено',
    };

    return labels[type] || 'Системна подія';
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-[1000]">
      
      {/* ВЕРХНЯ ЧАСТИНА: Статистика та Фільтри */}
      <div className="flex justify-between items-start pointer-events-none">
        
        {/* Ліва колонка */}
        <div className="flex flex-col gap-4 pointer-events-auto">
          
          {/* 1. NETWORK OVERVIEW (Статистика) */}
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl w-80 border border-slate-200 transition-all hover:shadow-2xl">
            <button
              onClick={() => setIsOverviewOpen((prev) => !prev)}
              className="w-full flex items-center justify-between text-left"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Огляд мережі</p>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-300 ${isOverviewOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOverviewOpen && (
              <>
                <div className="flex justify-between items-end mb-6 mt-4">
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Activity size={14} />
                      <p className="text-xs font-medium">Парк у системі</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-800 tracking-tight">{fleetSummary.totalWagons}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400 mb-1">
                      <Clock size={14} />
                      <p className="text-xs font-medium">У русі</p>
                    </div>
                    <p className="text-3xl font-bold tracking-tight" style={{ color: '#002e7e' }}>{movingShare}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Статуси парку</span>
                    <span>{fleetSummary.loading}/{totalActive || 0}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ backgroundColor: '#002e7e', width: `${movingShare}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>У русі: {fleetSummary.moving}</span>
                    <span>Стоять: {fleetSummary.stationary}</span>
                  </div>
                  {fleetSummary.avgEmptyRunKmToday !== null && (
                    <p className="text-[10px] text-slate-400">Порожній пробіг сьогодні: {fleetSummary.avgEmptyRunKmToday.toFixed(1)} км</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* 2. MAP FILTERS (Керування відображенням) */}
          {isFiltersOpen && (
            <div className="pointer-events-auto">
              <MapFilter />
            </div>
          )}
          
          {!isFiltersOpen && (
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200">
              <button
                onClick={() => setIsFiltersOpen(true)}
                className="flex items-center justify-between text-left w-full"
              >
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Фільтри мапи</p>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform duration-300 ${isFiltersOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Права колонка: LIVE FEED / WAGONS */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-96 border border-slate-200 flex flex-col transition-all hover:shadow-2xl pointer-events-auto">
          <button
            onClick={() => setIsFeedOpen((prev) => !prev)}
            className="p-5 border-b border-slate-100 flex items-center justify-between text-left"
          >
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {activeRightPanelView === 'events' ? 'Стрічка подій' : 'Список вагонів'}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {activeRightPanelView === 'events'
                  ? 'Оновлення терміналів у реальному часі'
                  : 'Оперативний стан рухомого складу'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-300 ${isRightPanelOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          {isRightPanelOpen && (
            <>
              <div className="px-4 pt-3">
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                  <button
                    onClick={() => setActiveRightPanel('events')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeRightPanelView === 'events' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Події
                  </button>
                  <button
                    onClick={() => setActiveRightPanel('wagons')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeRightPanelView === 'wagons' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Вагони ({wagons.length})
                  </button>
                </div>
              </div>

              {activeRightPanelView === 'events' ? (
                <div className="overflow-y-auto h-[430px] p-4 space-y-3 custom-scrollbar">
                  {eventLog.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                      <Package size={32} className="text-slate-300 mb-2" />
                      <p className="text-xs text-slate-400">Немає нещодавніх подій</p>
                    </div>
                  ) : (
                    eventLog.map((event, idx) => {
                      const info = formatEventMessage(event.type);
                      const renderedMessage = event.message?.trim() || info.text;
                      return (
                        <div
                          key={event.id || idx}
                          className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all animate-in slide-in-from-right-4 duration-300"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 ${info.color}`}>
                              {formatEventTypeLabel(event.type)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-sm">{info.icon}</span>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                              {renderedMessage}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="overflow-y-auto h-[430px] p-4 space-y-2 custom-scrollbar">
                  {selectedWagon && (
                    <div className="mb-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Обраний вагон</p>
                          <p className="text-sm font-bold text-slate-800">{selectedWagon.number || selectedWagon.id || 'Невідомий вагон'}</p>
                        </div>
                        <button
                          onClick={() => setSelectedWagon(null)}
                          className="rounded-md border border-blue-200 bg-white px-2 py-1 text-[10px] font-semibold text-blue-600 hover:bg-blue-100"
                        >
                          Очистити
                        </button>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-600">
                        <p>
                          <span className="text-slate-400">Статус:</span>{' '}
                          <span className={`inline-block rounded-full border px-1.5 py-0.5 ${getWagonStatusTone(selectedWagon.status)}`}>
                            {selectedWagon.status || 'unknown'}
                          </span>
                        </p>
                        <p>
                          <span className="text-slate-400">Тип:</span> {selectedWagon.type || 'unknown'}
                        </p>
                        <p>
                          <span className="text-slate-400">Станція:</span>{' '}
                          {selectedWagon.currentStationId
                            ? stationNameById[selectedWagon.currentStationId] || `ID: ${selectedWagon.currentStationId}`
                            : 'Станція не вказана'}
                        </p>
                        <p>
                          <span className="text-slate-400">Останнє розвантаження:</span> {selectedWagon.lastUnloadTime || 'немає даних'}
                        </p>
                      </div>
                    </div>
                  )}

                  {wagons.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                      <Package size={32} className="text-slate-300 mb-2" />
                      <p className="text-xs text-slate-400">Вагони ще не завантажені</p>
                    </div>
                  ) : (
                    wagons.map((wagon, idx) => {
                      const stationName = wagon.currentStationId
                        ? stationNameById[wagon.currentStationId] || `ID: ${wagon.currentStationId}`
                        : 'Станція не вказана';

                      return (
                        <div
                          key={wagon.id || wagon.number || idx}
                          className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm hover:border-slate-200 transition-colors"
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-slate-800">{wagon.number || wagon.id || 'Невідомий вагон'}</p>
                            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${getWagonStatusTone(wagon.status)}`}>
                              {wagon.status || 'unknown'}
                            </span>
                          </div>
                          <div className="space-y-1 text-[11px] text-slate-500">
                            <p>
                              <span className="text-slate-400">Тип:</span> {wagon.type || 'unknown'}
                            </p>
                            <p>
                              <span className="text-slate-400">Станція:</span> {stationName}
                            </p>
                            <p>
                              <span className="text-slate-400">Останнє розвантаження:</span>{' '}
                              {wagon.lastUnloadTime || 'немає даних'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* НИЖНЯ ЧАСТИНА: Керування та Легенда */}
      <div className="flex justify-between items-end pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          <button
            onClick={handleCenterOnMyLocation}
            className="group text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95" style={{ backgroundColor: '#002e7e' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#001f52'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#002e7e'}
          >
            <span className="flex items-center gap-2">
              <Crosshair size={16} className="transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
              <span>Центрувати на моїй локації</span>
            </span>
          </button>
          <button
            onClick={toggleTerrain}
            className={`group px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 ${
              isTerrainEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers3 size={16} className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
              <span>{isTerrainEnabled ? 'Рельєф: увімкнено' : 'Рельєф: вимкнено'}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};