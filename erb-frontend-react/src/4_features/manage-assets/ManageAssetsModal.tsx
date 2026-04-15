import { useEffect, useMemo, useState } from 'react';
import { X, Search, Filter, Wrench, Train, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMapStore } from '@/6_shared/model/store';
import { badgeClass } from '@/6_shared/ui/pageStyles';
import { mapWagonTypeToLabel } from '@/6_shared/lib/statusMappers';

interface ManageAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AssetStatus = 'available' | 'maintenance' | 'in_transit';

interface AssetViewModel {
  id: string;
  type: string;
  status: AssetStatus;
  location: string;
  lastInspection: string | null;
}

const mapUiStatusToAssetStatus = (status: string): AssetStatus => {
  const normalized = status.toLowerCase();
  if (normalized.includes('maint')) return 'maintenance';
  if (normalized.includes('move') || normalized.includes('transit') || normalized.includes('dispatch') || normalized.includes('train')) return 'in_transit';
  return 'available';
};

export const ManageAssetsModal = ({ isOpen, onClose }: ManageAssetsModalProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'wagons' | 'locomotives'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { wagons, locomotives, graph, fetchFleet, fetchLocomotives, fetchGraph } = useMapStore();

  useEffect(() => {
    if (!isOpen) return;
    fetchFleet();
    fetchLocomotives();
    fetchGraph();
  }, [isOpen, fetchFleet, fetchLocomotives, fetchGraph]);

  const assets = useMemo<AssetViewModel[]>(() => {
    const wagonAssets = wagons.map((wagon) => {
      const station = graph?.stations.find(
        (s) => String(s.stationId || '') === String(wagon.currentStationId || '')
      );

      return {
        id: wagon.number || wagon.id,
        type: wagon.type,
        status: mapUiStatusToAssetStatus(wagon.status),
        location: station?.name || 'Невизначено',
        lastInspection: wagon.lastUnloadTime,
      };
    });

    const locomotiveAssets = locomotives.map((loco) => {
      const station = graph?.stations.find(
        (s) => String(s.stationId || '') === String(loco.currentStationId || '')
      );

      return {
        id: loco.number || loco.id,
        type: 'locomotive',
        status: mapUiStatusToAssetStatus(loco.status),
        location: station?.name || 'Невизначено',
        lastInspection: loco.availableAt || null,
      };
    });

    return [...wagonAssets, ...locomotiveAssets];
  }, [wagons, locomotives, graph]);

  const filteredAssets = assets.filter(asset => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'wagons' && asset.type !== 'locomotive') ||
      (activeTab === 'locomotives' && asset.type === 'locomotive');
    
    const matchesSearch = asset.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          mapWagonTypeToLabel(asset.type).toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'available': return <span className={badgeClass('success')}><CheckCircle2 className="w-3 h-3 mr-1" />Доступний</span>;
      case 'maintenance': return <span className={badgeClass('warning')}><Wrench className="w-3 h-3 mr-1" />На ТО</span>;
      case 'in_transit': return <span className={badgeClass('primary')}><Train className="w-3 h-3 mr-1" />В дорозі</span>;
      default: return null;
    }
  };

  const getTypeLabel = (type: string) => type === 'locomotive' ? 'Локомотив' : mapWagonTypeToLabel(type);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[5000] flex items-center justify-center p-4">
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
                <th className="px-8 py-4">Останнє ТО / Доступність</th>
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
                    <td className="px-8 py-4 text-sm text-slate-500">
                      {asset.lastInspection ? new Date(asset.lastInspection).toLocaleDateString('uk-UA') : '—'}
                    </td>
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
            Всього активів: <span className="text-slate-900">{filteredAssets.length}</span> із {assets.length}
          </div>
          <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#0f2e5a] hover:bg-[#002f70] transition-colors shadow-md">
            Експорт звіту
          </button>
        </div>
      </div>
    </div>
  );
};