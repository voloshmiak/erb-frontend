import { useState } from 'react';
import { Link } from 'react-router-dom'; // ДОДАНО ІМПОРТ LINK
import { LiveManifest } from '../../3_widgets/live-manifest/LiveManifest';
import { CapacityOverview } from '../../3_widgets/capacity-overview/CapacityOverview';
import { CreateShipmentModal } from '../../4_features/create-shipment/CreateShipmentModal';
import { ManageAssetsModal } from '../../4_features/manage-assets/ManageAssetsModal';
import { useLiveOrders } from '../../5_entities/order/api/useLiveOrders';
import { Map, PlusCircle, LayoutDashboard, Train, FileText, AlertTriangle, HelpCircle, FileTerminal, Clock, Search, Bell, Settings, User } from 'lucide-react';

export const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  
  const { orders, isLoading, refetch } = useLiveOrders();

  const activeOrders = orders.filter(o => o.status === 'У дорозі').length;
  const pendingOrders = orders.filter(o => o.status === 'Очікує').length;
  const deliveredOrders = orders.filter(o => o.status === 'Доставлено').length;
  
  const efficiency = orders.length > 0 
    ? Math.round((deliveredOrders / orders.length) * 100) 
    : 100;

  return (
    <div className="flex h-screen bg-[#f4f7f9] overflow-hidden relative">
      
      <aside className="w-65 bg-[#f8fafc] border-r border-slate-200 flex flex-col z-10">
        <div className="p-6 pb-4">
          <h2 className="text-[22px] font-bold text-[#0f2e5a] leading-tight mb-1">Диспетчерський<br/>центр</h2>
          <div className="text-xs text-slate-500">Київська центральна станція</div>
        </div>

        {/* НАВІГАЦІЯ ЗА ДОПОМОГОЮ REACT ROUTER */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
            <Map className="w-5 h-5" /> Мап мережі
          </Link>
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#0f2e5a] bg-white border border-[#0f2e5a]/20 rounded-lg shadow-sm transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Панель керування
          </Link>
          <Link to="/fleet" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
            <Train className="w-5 h-5" /> Парк
          </Link>
          <Link to="/reports" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
            <FileText className="w-5 h-5" /> Логістичні звіти
          </Link>
        </nav>

        <div className="p-4 space-y-4 mb-4">
          <button className="w-full flex items-center justify-center gap-2 bg-[#b24d00] text-white py-3 rounded-lg font-bold text-xs shadow-sm hover:bg-[#8f3e00] transition-colors uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" /> Екстрена тривога
          </button>
          <div className="pt-2">
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"><HelpCircle className="w-4 h-4" /> Підтримка</a>
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"><FileTerminal className="w-4 h-4" /> Документація</a>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        
        <header className="h-16 bg-[#f4f7f9] flex items-center justify-between px-8">
          <div className="text-sm font-semibold text-[#0052cc]">Термінал управління вантажоперевезеннями</div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Пошук заявок..." className="pl-9 pr-4 py-1.5 bg-slate-200/50 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc]/20 w-64 text-slate-700 placeholder:text-slate-500" />
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <button className="hover:text-slate-800 transition-colors"><Bell className="w-5 h-5" /></button>
              <button className="hover:text-slate-800 transition-colors"><Settings className="w-5 h-5" /></button>
              <button className="hover:text-slate-800 transition-colors p-1 bg-slate-200 rounded-full"><User className="w-5 h-5 text-slate-600" /></button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 pt-4">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">Вантажні перевезення</h1>
              <p className="text-slate-500 font-medium text-sm">Керуйте та відстежуйте активні залізничні маршрути.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-[#003b8e] hover:bg-[#002f70] text-white px-5 py-2.5 rounded-lg font-bold shadow-md transition-all active:scale-95 text-sm flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Створити заявку
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group cursor-default transition-shadow hover:shadow-md">
               <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full z-0 transition-transform duration-500 ease-out group-hover:scale-125 group-hover:bg-blue-50/50 origin-top-right"></div>
               <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10">
                 <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md"><Train className="w-4 h-4" /></div> АКТИВНІ ПЕРЕВЕЗЕННЯ
               </div>
               <div className="relative z-10">
                 <div className="text-4xl font-black text-slate-900 transition-transform duration-300 group-hover:-translate-y-0.5">{activeOrders}</div>
                 <div className="text-xs font-bold text-[#0052cc] mt-2">Вагони у дорозі</div>
               </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group cursor-default transition-shadow hover:shadow-md">
               <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/30 rounded-bl-full z-0 transition-transform duration-500 ease-out group-hover:scale-125 group-hover:bg-orange-100/50 origin-top-right"></div>
               <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10">
                 <div className="p-1.5 bg-orange-50 text-[#b24d00] rounded-md"><AlertTriangle className="w-4 h-4" /></div> ОЧІКУЮТЬ ПІДТВЕРДЖЕННЯ
               </div>
               <div className="relative z-10">
                 <div className="text-4xl font-black text-slate-900 transition-transform duration-300 group-hover:-translate-y-0.5">{pendingOrders}</div>
                 <div className="text-xs font-bold text-[#b24d00] mt-2">! Потребують обробки</div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group cursor-default transition-shadow hover:shadow-md">
               <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full z-0 transition-transform duration-500 ease-out group-hover:scale-125 group-hover:bg-slate-100/80 origin-top-right"></div>
               <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10">
                 <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md"><Clock className="w-4 h-4" /></div> ЕФЕКТИВНІСТЬ МЕРЕЖІ
               </div>
               <div className="relative z-10">
                 <div className="text-4xl font-black text-slate-900 transition-transform duration-300 group-hover:-translate-y-0.5">{efficiency}%</div>
                 <div className="text-xs font-bold text-slate-500 mt-2">Успішно доставлено</div>
               </div>
            </div>
          </div>

          <div className="mb-8">
            <LiveManifest orders={orders} isLoading={isLoading} />
          </div>

          <div>
            <CapacityOverview onManageClick={() => setIsAssetsModalOpen(true)} />
          </div>
        </main>
      </div>

      <CreateShipmentModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          refetch();
        }} 
      />

      <ManageAssetsModal 
        isOpen={isAssetsModalOpen}
        onClose={() => setIsAssetsModalOpen(false)}
      />
    </div>
  );
};