import { useMemo } from 'react';
import { X } from 'lucide-react';
import { useMapStore } from '@/6_shared/model/store';

const normalizeEntityId = (value: unknown): string => String(value || '').trim().toLowerCase();

const getStationEntityId = (station: { stationId?: string }): string => {
  const primary = normalizeEntityId(station.stationId);
  if (primary) return primary;

  const fallback = normalizeEntityId((station as unknown as Record<string, unknown>).id);
  return fallback;
};

export const StationDetails = () => {
  const { selectedStation, setSelectedStation, wagons } = useMapStore();

  const stationWagons = useMemo(() => {
    if (!selectedStation) return [];

    const stationId = getStationEntityId(selectedStation);
    const stationNameKey = normalizeEntityId(selectedStation.name);
    if (!stationId && !stationNameKey) return [];

    return wagons.filter(
      (wagon) => {
        const wagonStationKey = normalizeEntityId(wagon.currentStationId);
        return wagonStationKey === stationId || wagonStationKey === stationNameKey;
      }
    );
  }, [selectedStation, wagons]);

  const loadingWagons = stationWagons.filter((wagon) =>
    String(wagon.status || '').toLowerCase().includes('load')
  ).length;

  const stationLoadPercent = stationWagons.length > 0
    ? Math.round((loadingWagons / stationWagons.length) * 100)
    : 0;

  const stationStateText = stationWagons.length > 0
    ? `На станції ${stationWagons.length} вагон(ів), із них ${loadingWagons} на завантаженні.`
    : 'На станції зараз немає вагонів за поточними даними API.';

  if (!selectedStation) return null;

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl z-[2000] border-l border-slate-200 transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-slate-800">Деталі станції</h2>
          <button 
            onClick={() => setSelectedStation(null)} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Назва</p>
            <p className="text-lg font-semibold text-slate-800">{selectedStation.name}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Вагони</p>
              <p className="text-xl font-bold text-blue-600">{stationWagons.length}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Навантаження</p>
              <p className="text-xl font-bold text-green-600">{stationLoadPercent}%</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-600 uppercase mb-2">Поточний стан</p>
            <p className="text-sm text-blue-800">{stationStateText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};