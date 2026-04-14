import { useMapStore } from '@/6_shared/model/store';
import { RotateCcw, Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const stationFilterItems = [
  { id: 'freightStations', label: 'Вантажні', description: 'Вантажні станції', color: '#14b8a6', typeKey: 'freight' },
  { id: 'sortingStations', label: 'Сортувальні', description: 'Сортувальні вузли', color: '#f59e0b', typeKey: 'sorting' },
  { id: 'portStations', label: 'Портові', description: 'Портові станції', color: '#002e7e', typeKey: 'port' },
  { id: 'borderStations', label: 'Прикордонні', description: 'Прикордонні пункти', color: '#ef4444', typeKey: 'border' },
] as const;

const wagonFilterItems = [] as const;


export const MapFilter = () => {
  const { filters, setFilter, resetFilters, graph } = useMapStore();
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

  const handleResetFilters = () => {
    resetFilters();
  };

  const allStationsEnabled = stationFilterItems.every(
    (item) => filters[item.id as keyof typeof filters]
  );

  const enabledStationCount = stationFilterItems.filter(
    (item) => filters[item.id as keyof typeof filters]
  ).length;

  const totalEnabledFilters = enabledStationCount;
  const totalFilterCount = stationFilterItems.length;

  const toggleAllStations = () => {
    const newValue = !allStationsEnabled;
    stationFilterItems.forEach((item) => {
      setFilter(item.id as keyof typeof filters, newValue);
    });
  };



  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 shadow-xl backdrop-blur-md">
      <div className="border-b border-slate-200/80 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Розширені фільтри</h3>
            <p className="mt-1 text-[11px] text-slate-500">Налаштуйте вміст карти під поточну зміну</p>
          </div>
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            title={isExpanded ? 'Згорнути блок' : 'Розгорнути блок'}
          >
            <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
            Активно {totalEnabledFilters}/{totalFilterCount}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
              title="Скинути всі фільтри"
            >
              <RotateCcw size={12} />
              Скинути
            </button>
          </div>
        </div>

      </div>

      {isExpanded && (
        <div className="filter-scrollbar max-h-[62vh] space-y-4 overflow-y-auto p-4">
          <section className="space-y-2 rounded-xl border border-slate-200 bg-white/90 p-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Станції</label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-400">{enabledStationCount}/{stationFilterItems.length}</span>
                <button
                  onClick={toggleAllStations}
                  className="text-[10px] font-semibold uppercase tracking-wide text-blue-600 transition-colors hover:text-blue-700"
                >
                  {allStationsEnabled ? 'Вимкнути все' : 'Увімкнути все'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {stationFilterItems.map((item) => {
                const isEnabled = filters[item.id as keyof typeof filters];

                return (
                  <label
                    key={item.id}
                    className={`group flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-all duration-200 ${
                      isEnabled
                        ? 'border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:bg-slate-50'
                        : 'border-transparent bg-slate-100/70 hover:bg-slate-200/60'
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
                      className={`relative h-3.5 w-3.5 flex-shrink-0 rounded-full transition-all duration-200 group-hover:scale-110 ${
                        isEnabled ? '' : 'opacity-60 grayscale'
                      }`}
                      style={{
                        backgroundColor: item.color,
                        boxShadow: isEnabled ? `0 0 0 1px #ffffff inset, 0 0 9px ${item.color}` : '0 0 0 1px rgba(148,163,184,0.3) inset',
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className={`text-sm font-semibold transition-colors ${isEnabled ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-500'}`}>
                          {item.label}
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isEnabled ? 'bg-slate-100 text-slate-500' : 'bg-slate-200/80 text-slate-400'}`}>
                          {stationTypeCounts[item.typeKey] || 0}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

        </div>
      )}
    </div>
  );
};