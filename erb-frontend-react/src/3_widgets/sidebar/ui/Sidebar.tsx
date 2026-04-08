import { Map, LayoutDashboard, TrainFront, FileText, HelpCircle, BookOpen } from 'lucide-react';
import { EmergencyAlertButton } from '@/4_features/emergency_alert/ui/EmergencyAlertButton';
import { MapFilter } from '@/4_features/map_filter/ui/MapFilter';

const NAV_ITEMS = [
  { icon: Map, label: 'Мапа мережі' },
  { icon: LayoutDashboard, label: 'Панель керування' },
  { icon: TrainFront, label: 'Парк', active: true },
  { icon: FileText, label: 'Логістичні звіти' },
];

export const Sidebar = () => {
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

        <div className="mt-5">
          <MapFilter />
        </div>
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