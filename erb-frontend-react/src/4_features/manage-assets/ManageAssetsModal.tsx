import { useState } from 'react';
import { X, Search, Filter, Wrench, Train, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Asset } from '../../5_entities/order/api/orderService'; 

interface ManageAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Мокові дані (на хакатоні це нормально, якщо немає окремого бекенду для парку)
const mockAssets: Asset[] = [
  { id: 'WG-7732', type: 'gondola', status: 'available', location: 'Київ', lastInspection: '2026-10-15' },
  { id: 'WG-7733', type: 'grain_hopper', status: 'in_transit', location: 'Львів', lastInspection: '2026-09-20' },
  { id: 'WG-7734', type: 'cement_hopper', status: 'maintenance', location: 'Одеса', lastInspection: '2026-10-01' },
  { id: 'LC-104', type: 'locomotive', status: 'available', location: 'Дніпро', lastInspection: '2026-10-18' },
  { id: 'WG-7735', type: 'gondola', status: 'available', location: 'Харків', lastInspection: '2026-10-10' },
];

export const ManageAssetsModal = ({ isOpen, onClose }: ManageAssetsModalProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'wagons' | 'locomotives'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredAssets = mockAssets.filter(asset => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'wagons' && asset.type !== 'locomotive') ||
      (activeTab === 'locomotives' && asset.type === 'locomotive');
    
    const matchesSearch = asset.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: Asset['status']) => {
    switch (status) {
      case 'available': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 uppercase tracking-widest"><CheckCircle2 className="w-3 h-3" /> Доступний</span>;
      case 'maintenance': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-[10px] font-bold text-[#b24d00] uppercase tracking-widest"><Wrench className="w-3 h-3" /> На ТО</span>;
      case 'in_transit': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[10px] font-bold text-[#0052cc] uppercase tracking-widest"><Train className="w-3 h-3" /> В дорозі</span>;
      default: return null;
    }
  };

  const getTypeLabel = (type: Asset['type']) => {
    switch (type) {
      case 'gondola': return 'Напіввагон';
      case 'grain_hopper': return 'Зерновоз';
      case 'cement_hopper': return 'Цементовоз';
      case 'locomotive': return 'Локомотив';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Хедер */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start relative bg-white">
          <div>
            <h2 className="text-2xl font-bold text-[#0f2e5a]">Управління парком активів</h2>
            <p className="text-sm text-slate-500 mt-1">Огляд технічного стану та локації рухомого складу.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"><X className="w-5 h-5" /></button>
        </div>

        {/* Панель керування (Пошук + Вкладки) */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('all')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'all' ? 'bg-[#0f2e5a] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Всі активи</button>
            <button onClick={() => setActiveTab('wagons')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'wagons' ? 'bg-[#0f2e5a] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Вагони</button>
            <button onClick={() => setActiveTab('locomotives')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'locomotives' ? 'bg-[#0f2e5a] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>Локомотиви</button>
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Пошук за ID або локацією..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#0052cc]/20 w-64"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"><Filter className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Список активів */}
        <div className="flex-1 overflow-y-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest sticky top-0 z-10">
                <th className="px-8 py-4">ID Активу</th>
                <th className="px-8 py-4">Тип</th>
                <th className="px-8 py-4">Локація</th>
                <th className="px-8 py-4">Останнє ТО</th>
                <th className="px-8 py-4">Статус</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-4 font-bold text-slate-900">{asset.id}</td>
                    <td className="px-8 py-4 text-sm font-medium text-slate-600">{getTypeLabel(asset.type)}</td>
                    <td className="px-8 py-4 text-sm font-medium text-slate-900">{asset.location}</td>
                    <td className="px-8 py-4 text-sm text-slate-500">{new Date(asset.lastInspection).toLocaleDateString('uk-UA')}</td>
                    <td className="px-8 py-4">{getStatusBadge(asset.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">Активів не знайдено</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Футер */}
        <div className="bg-slate-50 border-t border-slate-200 px-8 py-4 flex justify-between items-center">
          <div className="text-sm font-bold text-slate-500">
            Всього активів: <span className="text-slate-900">{filteredAssets.length}</span>
          </div>
          <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#0f2e5a] hover:bg-[#002f70] transition-colors shadow-md">
            Експорт звіту
          </button>
        </div>
      </div>
    </div>
  );
};