import { useMapStore } from '@/6_shared/model/store';
import { Zap, Pause, Package, RotateCcw, Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { summarizeFleetStatus } from '@/6_shared/lib/utils';

const stationFilterItems = [
  { id: 'freightStations', label: 'Вантажні', description: 'Вантажні станції', color: '#14b8a6', typeKey: 'freight' },
  { id: 'sortingStations', label: 'Сортувальні', description: 'Сортувальні вузли', color: '#f59e0b', typeKey: 'sorting' },
  { id: 'portStations', label: 'Портові', description: 'Портові станції', color: '#002e7e', typeKey: 'port' },
  { id: 'borderStations', label: 'Прикордонні', description: 'Прикордонні пункти', color: '#ef4444', typeKey: 'border' },
] as const;

const wagonFilterItems = [
  { id: 'movingWagons', label: 'У русі', icon: Zap, description: 'Рухомий склад у русі', color: 'text-blue-600' },
  { id: 'stationaryWagons', label: 'Стоять', icon: Pause, description: 'Зупинений склад', color: 'text-red-600' },
  { id: 'loadingWagons', label: 'Завантаження', icon: Package, description: 'На завантаженні', color: 'text-orange-600' },
] as const;

export const MapFilter = () => {
  const { filters, setFilter, resetFilters, fleetStatus, graph } = useMapStore();
  const [showDescription, setShowDescription] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const normalizeTypeKey = (rawType?: string): string =>
    (rawType || '')
      .toLowerCase()
      .replace(/[\s_-]+/g, '')
      .trim();

  const stationTypeCounts = stationFilterItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.typeKey] = graph?.stations.filter((station) => normalizeTypeKey(station.type) === item.typeKey).length || 0;
    return acc;
  }, {});

  const fleetSummary = summarizeFleetStatus(fleetStatus);

  const handleResetFilters = () => {
    resetFilters();
  };

  const allStationsEnabled = stationFilterItems.every(
    (item) => filters[item.id as keyof typeof filters]
  );

  const allWagonsEnabled = wagonFilterItems.every(
    (item) => filters[item.id as keyof typeof filters]
  );

  const visibleWagonCount = wagonFilterItems.reduce((sum, item) => {
    if (!filters[item.id as keyof typeof filters]) return sum;

    if (item.id === 'movingWagons') return sum + fleetSummary.moving;
    if (item.id === 'stationaryWagons') return sum + fleetSummary.stationary;
    if (item.id === 'loadingWagons') return sum + fleetSummary.loading;

    return sum;
  }, 0);

  const toggleAllStations = () => {
    const newValue = !allStationsEnabled;
    stationFilterItems.forEach((item) => {
      setFilter(item.id as keyof typeof filters, newValue);
    });
  };

  const toggleAllWagons = () => {
    const newValue = !allWagonsEnabled;
    wagonFilterItems.forEach((item) => {
      setFilter(item.id as keyof typeof filters, newValue);
    });
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 w-96 overflow-hidden">
      {/* Заголовок з кнопками */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Розширені фільтри</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Налаштуйте відображення карти</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleResetFilters}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
            title="Скинути всі фільтри"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
            title={isExpanded ? 'Згорнути блок' : 'Розгорнути блок'}
          >
            <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 max-h-[62vh] overflow-y-auto filter-scrollbar space-y-4">
          {/* СТАНЦІЇ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Станції</label>
              <button
                onClick={toggleAllStations}
                className="text-[10px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {allStationsEnabled ? 'Вимкнути все' : 'Увімкнути все'}
              </button>
            </div>

            <div className="space-y-2">
              {stationFilterItems.map((item) => {
                const isEnabled = filters[item.id as keyof typeof filters];

                return (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 group border ${
                      isEnabled
                        ? 'border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300'
                        : 'border-transparent bg-slate-50/60 hover:bg-slate-100/70'
                    }`}
                  >
                    <span className="relative inline-flex h-5 w-5 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => setFilter(item.id as keyof typeof filters, e.target.checked)}
                        className="peer absolute inset-0 m-0 h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white transition-all checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
                      />
                      <Check size={14} className="pointer-events-none absolute left-0.5 top-0.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                    </span>
                    <span
                      className={`relative h-3.5 w-3.5 rounded-full flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-active:scale-95 ${
                        isEnabled ? '' : 'grayscale opacity-60'
                      }`}
                      style={{
                        backgroundColor: item.color,
                        boxShadow: isEnabled ? `0 0 0 1px #ffffff inset, 0 0 8px ${item.color}` : '0 0 0 1px rgba(148,163,184,0.3) inset',
                      }}
                    >
                      <span
                        className={`absolute inset-0 rounded-full transition-opacity duration-200 ${
                          isEnabled ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{ boxShadow: `0 0 10px ${item.color}` }}
                      />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className={`text-sm font-medium transition-colors ${isEnabled ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-500'}`}>
                          {item.label}
                        </div>
                        <span className={`text-[11px] font-semibold ${isEnabled ? 'text-slate-400' : 'text-slate-300'}`}>
                          {stationTypeCounts[item.typeKey] || 0}
                        </span>
                      </div>
                      {showDescription && (
                        <div className={`text-[10px] mt-0.5 ${isEnabled ? 'text-slate-500' : 'text-slate-400'}`}>{item.description}</div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Сепаратор */}
          <div className="h-px bg-slate-100" />

          {/* СТАТУСИ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Статуси парку</label>
                <p className="text-[10px] text-slate-400 mt-0.5">Показано {visibleWagonCount} з {fleetSummary.totalWagons}</p>
              </div>
              <button
                onClick={toggleAllWagons}
                className="text-[10px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {allWagonsEnabled ? 'Вимкнути все' : 'Увімкнути все'}
              </button>
            </div>

            <div className="space-y-2">
              {wagonFilterItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group"
                >
                  <span className="relative inline-flex h-5 w-5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={filters[item.id as keyof typeof filters]}
                      onChange={(e) => setFilter(item.id as keyof typeof filters, e.target.checked)}
                      className="peer absolute inset-0 m-0 h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white transition-all checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70"
                    />
                    <Check size={14} className="pointer-events-none absolute left-0.5 top-0.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                  </span>
                  <item.icon size={16} className={`${item.color} group-hover:scale-110 transition-transform flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {item.id === 'movingWagons' && `${fleetSummary.moving} у русі`}
                      {item.id === 'stationaryWagons' && `${fleetSummary.stationary} стоять`}
                      {item.id === 'loadingWagons' && `${fleetSummary.loading} на завантаженні`}
                    </div>
                    {showDescription && (
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Кнопка для показу описань */}
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="w-full py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50"
          >
            {showDescription ? 'Сховати описи' : 'Показати описи'}
          </button>
        </div>
      )}
    </div>
  );
};