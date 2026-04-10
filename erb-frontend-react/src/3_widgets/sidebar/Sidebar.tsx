import { 
  Map, 
  PlusCircle, 
  LayoutDashboard, 
  TrainFront, 
  LineChart, 
  AlertTriangle, 
  HelpCircle, 
  FileText 
} from 'lucide-react';

// Выносим конфигурацию ссылок отдельно (SOLID: Open/Closed Principle)
const navItems = [
  { name: 'Network Map', icon: Map, href: '#', isActive: false },
  { name: 'Freight Request', icon: PlusCircle, href: '#', isActive: true },
  { name: 'Dashboard', icon: LayoutDashboard, href: '#', isActive: false },
  { name: 'Asset Fleet', icon: TrainFront, href: '#', isActive: false },
  { name: 'Logistics Reports', icon: LineChart, href: '#', isActive: false },
];

const supportItems = [
  { name: 'Support', icon: HelpCircle, href: '#' },
  { name: 'Documentation', icon: FileText, href: '#' },
];

export const Sidebar = () => {
  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-[#eceef1] dark:bg-slate-900 py-6 sticky top-0">
      {/* Логотип и заголовок */}
      <div className="px-8 mb-8">
        <div className="text-slate-500 font-medium text-[10px] tracking-widest uppercase mb-1">
          Dispatcher Hub
        </div>
        <div className="text-[#00408b] dark:text-blue-400 font-extrabold text-xl tracking-tighter">
          UZ Logistics
        </div>
        <div className="text-slate-500 text-xs mt-1">
          Kyiv Central Station
        </div>
      </div>

      {/* Основная навигация */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center px-8 py-3 transition-all duration-300 hover:translate-x-1 ${
                item.isActive
                  ? 'text-[#00408b] dark:text-blue-400 font-bold bg-white dark:bg-slate-800 rounded-l-full ml-4 pl-4'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#00408b] dark:hover:text-blue-300'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">{item.name}</span>
            </a>
          );
        })}
      </nav>

      {/* Нижняя часть с саппортом и алертом */}
      <div className="px-8 mt-auto pt-6 space-y-1">
        <button className="w-full mb-6 py-3 px-4 bg-[#9b3c00] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center hover:brightness-110 transition-all active:scale-95">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Emergency Alert
        </button>

        {supportItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center text-slate-600 dark:text-slate-400 py-2 hover:text-[#00408b] transition-all"
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">{item.name}</span>
            </a>
          );
        })}
      </div>
    </aside>
  );
};