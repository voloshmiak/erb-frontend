import { useMemo, useState } from 'react';
import { X, Train as TrainIcon, Send } from 'lucide-react';
import { useMapStore } from '@/6_shared/model/store';
import { trainService } from '@/5_entities/train/api/trainService';
import { findShortestPath } from '@/6_shared/lib/routing';
import { Button } from '@/6_shared/ui/button';

const normalizeEntityId = (value: unknown): string => String(value || '').trim().toLowerCase();

const getStationEntityId = (station: { stationId?: string }): string => {
  const primary = normalizeEntityId(station.stationId);
  if (primary) return primary;

  const fallback = normalizeEntityId((station as unknown as Record<string, unknown>).id);
  return fallback;
};

export const StationDetails = () => {
  const { 
    selectedStation, 
    setSelectedStation, 
    wagons, 
    trains, 
    graph,
    simulation 
  } = useMapStore();

  const [selectedWagonIds, setSelectedWagonIds] = useState<Set<string>>(new Set());
  const [targetStationId, setTargetStationId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stationId = useMemo(() => selectedStation ? getStationEntityId(selectedStation) : '', [selectedStation]);

  const stationWagons = useMemo(() => {
    if (!selectedStation || !stationId) return [];
    const stationNameKey = normalizeEntityId(selectedStation.name);

    return wagons.filter(
      (wagon) => {
        const wagonStationKey = normalizeEntityId(wagon.currentStationId);
        return wagonStationKey === stationId || wagonStationKey === stationNameKey;
      }
    );
  }, [selectedStation, stationId, wagons]);

  const idleWagons = useMemo(() => 
    stationWagons.filter(w => w.status.toLowerCase() === 'idle'), 
    [stationWagons]
  );

  const formingTrains = useMemo(() => 
    trains.filter(t => t.sourceStationId === stationId && t.status === 'forming'),
    [trains, stationId]
  );

  const otherStations = useMemo(() => 
    graph?.stations.filter(s => getStationEntityId(s) !== stationId) || [],
    [graph, stationId]
  );

  const toggleWagonSelection = (id: string) => {
    const next = new Set(selectedWagonIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedWagonIds(next);
  };

  const handleCreateTrain = async () => {
    if (!stationId || !targetStationId || selectedWagonIds.size === 0) return;
    
    setIsSubmitting(true);
    try {
      const route = findShortestPath(graph, stationId, targetStationId);
      if (!route) {
        alert('Не вдалося побудувати маршрут до вибраної станції');
        return;
      }

      await trainService.createTrain({
        wagonIds: Array.from(selectedWagonIds),
        route
      });
      
      setSelectedWagonIds(new Set());
      setTargetStationId('');
    } catch (error) {
      console.error('Failed to create train:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispatchTrain = async (trainId: string) => {
    try {
      await trainService.dispatchTrain(trainId);
    } catch (error) {
      console.error('Failed to dispatch train:', error);
    }
  };

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
      <div className="p-6 flex flex-col h-full overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrainIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Деталі станції</h2>
          </div>
          <button 
            onClick={() => setSelectedStation(null)} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Станція</p>
            <p className="text-lg font-bold text-slate-800 leading-tight">{selectedStation.name}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Вагони</p>
              <p className="text-xl font-bold text-blue-600">{stationWagons.length}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Навантаження</p>
              <p className="text-xl font-bold text-emerald-600">{stationLoadPercent}%</p>
            </div>
          </div>

          {/* FORMING TRAINS */}
          {formingTrains.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Сформовані потяги</p>
              {formingTrains.map(train => (
                <div key={train.id} className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                        <TrainIcon className="w-4 h-4" />
                        Потяг #{train.id.slice(0, 4)}
                      </p>
                      <p className="text-[11px] text-indigo-600 mt-0.5 font-medium">
                        {train.wagonIds.length} вагонів • {train.route.length} станції
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 gap-2 shadow-md shadow-indigo-200"
                    onClick={() => handleDispatchTrain(train.id)}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Відправити в рейс
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* TRAIN FORMATION */}
          {idleWagons.length > 0 && (
            <div className="p-5 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Формування потяга</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Виберіть вагони ({selectedWagonIds.size})</label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 custom-scrollbar-dark">
                    {idleWagons.map(wagon => (
                      <button
                        key={wagon.id}
                        onClick={() => toggleWagonSelection(wagon.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                          selectedWagonIds.has(wagon.id)
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {wagon.number || wagon.id.slice(0, 4)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Пункт призначення</label>
                  <select
                    value={targetStationId}
                    onChange={(e) => setTargetStationId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none transition-all"
                  >
                    <option value="" disabled>Виберіть станцію...</option>
                    {otherStations.map(s => (
                      <option key={getStationEntityId(s)} value={getStationEntityId(s)}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button 
                  className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  disabled={selectedWagonIds.size === 0 || !targetStationId || isSubmitting}
                  onClick={handleCreateTrain}
                >
                  {isSubmitting ? 'Створення...' : 'Сформувати потяг'}
                </Button>
              </div>
            </div>
          )}

          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1.5">Поточний стан</p>
            <p className="text-sm text-blue-800/80 leading-relaxed font-medium">{stationStateText}</p>
          </div>

          {stationWagons.length > 0 && (
            <div className="pb-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Усі вагони ({stationWagons.length})</p>
              <div className="space-y-2">
                {stationWagons.map((wagon) => {
                  const hoursLeft = wagon.stateUntilHour != null && simulation
                    ? wagon.stateUntilHour - simulation.currentHour
                    : null;
                  
                  const isInTrain = wagon.status.toLowerCase() === 'in_train';

                  return (
                    <div
                      key={wagon.id || wagon.number}
                      className={`p-3 rounded-xl border transition-all ${
                        isInTrain 
                          ? 'bg-indigo-50/30 border-indigo-100' 
                          : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800">
                          {wagon.number || wagon.id.slice(0, 8)}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                          isInTrain 
                            ? 'bg-indigo-100 text-indigo-600' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {wagon.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{wagon.type}</p>
                      {hoursLeft != null && hoursLeft > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 font-bold">
                          <span>{wagon.status.toLowerCase().includes('load') ? 'ВИВАНТАЖЕННЯ' : 'ЗАЙНЯТИЙ'}</span>
                          <span className="opacity-40">•</span>
                          <span>ЩЕ {hoursLeft} ГОД.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};