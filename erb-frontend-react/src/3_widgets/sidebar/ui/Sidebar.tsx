import { Map, TrainFront, HelpCircle, BookOpen, FilePlus2, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EmergencyAlertButton } from '@/4_features/emergency_alert/ui/EmergencyAlertButton';

const NAV_ITEMS = [
  { icon: Map, label: 'Мап мережі', path: '/' },
  { icon: FilePlus2, label: 'Вантажні перевезення', path: '/freight-request' },
  { icon: TrainFront, label: 'Парк вагонів', path: '/fleet' },
  { icon: BarChart3, label: 'Метрики', path: '/metrics' },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path: string) => {
    navigate(path);
  };

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
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all ${
                  isActive
                    ? 'bg-white shadow-sm border'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
                style={isActive ? { color: '#002e7e', borderColor: '#002e7e' } : {}}
              >
                <item.icon size={18} />
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>
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