import { Map, LayoutDashboard, TrainFront, FileText, HelpCircle, BookOpen } from 'lucide-react';
import { EmergencyAlertButton } from '@/4_features/emergency_alert/ui/EmergencyAlertButton';
import { useMapStore } from '@/6_shared/model/store';
import { summarizeFleetStatus } from '@/6_shared/lib/utils';

const NAV_ITEMS = [
  { icon: Map, label: 'Мапа мережі' },
  { icon: LayoutDashboard, label: 'Панель керування' },
  { icon: TrainFront, label: 'Парк', active: true },
  { icon: FileText, label: 'Логістичні звіти' },
];

export const Sidebar = () => {
  const { wagons, fleetStatus, graph } = useMapStore();
  const fleetSummary = summarizeFleetStatus(fleetStatus);
  const stationNameById = Object.fromEntries(
    (graph?.stations || [])
      .filter((station) => String(station.stationId || '').trim().length > 0)
      .map((station) => [String(station.stationId), station.name])
  ) as Record<string, string>;

  const recentWagons = wagons.slice(0, 10);

  return (
    <aside className="w-64 h-full bg-[#edf1f7] border-r border-slate-200/90 flex flex-col p-4 justify-between">
      <div>
        {/* Header */}
        <div className="mb-10 px-2">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Диспетчерський центр</h1>
          <p className="text-xs text-slate-500 font-medium">Київська центральна станція</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <div 
              key={item.label} 
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all ${
                item.active 
                  ? 'bg-white shadow-sm text-blue-600 border border-slate-100' 
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm font-semibold">{item.label}</span>
            </div>
          ))}
        </nav>

        <section className="mt-5 rounded-xl border border-slate-200 bg-white/70 p-3">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Парк вагонів</p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {fleetSummary.totalWagons}
            </span>
          </div>

          <div className="mb-2 grid grid-cols-3 gap-1 text-[10px]">
            <div className="rounded-md bg-blue-50 px-1.5 py-1 text-blue-700">Рух: {fleetSummary.moving}</div>
            <div className="rounded-md bg-amber-50 px-1.5 py-1 text-amber-700">Завантаж.: {fleetSummary.loading}</div>
            <div className="rounded-md bg-rose-50 px-1.5 py-1 text-rose-700">Стоять: {fleetSummary.stationary}</div>
          </div>

          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {recentWagons.length === 0 ? (
              <p className="py-3 text-center text-[11px] text-slate-400">Вагони ще не завантажені</p>
            ) : (
              recentWagons.map((wagon, idx) => {
                const stationName = wagon.currentStationId
                  ? stationNameById[wagon.currentStationId] || `ID: ${wagon.currentStationId}`
                  : 'Немає станції';

                return (
                  <div
                    key={wagon.id || wagon.number || idx}
                    className="rounded-lg border border-slate-100 bg-white px-2 py-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-700">{wagon.number || wagon.id || 'Вагон'}</p>
                      <span className="text-[10px] text-slate-400">{wagon.status || 'unknown'}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-slate-500">{wagon.type || 'unknown'} • {stationName}</p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Footer Section */}
      <div className="space-y-6">
        <EmergencyAlertButton />
        
        <div className="flex flex-col gap-2 px-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">
            <HelpCircle size={14} /> Підтримка
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">
            <BookOpen size={14} /> Документація
          </div>
        </div>
      </div>
    </aside>
  );
};