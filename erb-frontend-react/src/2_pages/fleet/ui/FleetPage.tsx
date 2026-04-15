import { useEffect, useMemo, useState, useRef } from 'react';
import { PageLayout } from '@/6_shared/ui/PageLayout';
import { badgeClass, pageStyles } from '@/6_shared/ui/pageStyles';
import { useMapStore } from '@/6_shared/model/store';
import { mapWagonStatusToUi, wagonStatusBadgeVariant } from '@/6_shared/lib/statusMappers';
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Filter, X, MapPin, Layers, Check } from 'lucide-react';

export const FleetPage = () => {
  const { wagons, graph, fetchFleet, fetchGraph } = useMapStore();

  const [sortConfig, setSortConfig] = useState<{ key: 'id' | 'type', direction: 'asc' | 'desc' } | null>(null);

  // Фільтри
  const [statusFilter, setStatusFilter] = useState<string>('Всі');
  const [typeFilter, setTypeFilter] = useState<string>('Всі');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const typeMenuRef = useRef<HTMLDivElement>(null);

  // Стейти для пошуку станції
  const [stationSearch, setStationSearch] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [isStationFocused, setIsStationFocused] = useState(false);


  useEffect(() => {
    fetchFleet();
    fetchGraph();
  }, [fetchFleet, fetchGraph]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setIsStatusMenuOpen(false);
      }
      if (typeMenuRef.current && !typeMenuRef.current.contains(event.target as Node)) {
        setIsTypeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Мапимо всі вагони
  const allMappedWagons = useMemo(
    () =>
      wagons.map((wagon) => {
        const station = graph?.stations.find(
          (s) => String(s.stationId || '') === String(wagon.currentStationId || '')
        );

        return {
          id: wagon.number || wagon.id,
          type: wagon.type, // 'gondola', 'cement_hopper', 'grain_hopper'
          status: mapWagonStatusToUi(wagon.status),
          station: station?.name || 'Невизначено',
        };
      }),
    [wagons, graph]
  );

  // 2. Усі можливі статуси (незалежно від того, чи є вагони з такими статусами)
  const allStatuses = useMemo(() => {
    return ['Всі', 'в дорозі', 'завантажується', 'розвантажується', 'технічне обслуговування', 'припаркований', 'очікує'] as const;
  }, []);

  const uniqueTypes = useMemo(() => {
    // Автоматично збираємо типи: gondola, cement_hopper, grain_hopper і т.д.
    const types = new Set<string>(allMappedWagons.map(w => w.type));
    return Array.from(types).sort();
  }, [allMappedWagons]);

  // 3. Список станцій для підказок
  const stationsForSearch = useMemo(() => {
    return [...(graph?.stations || [])].sort((a, b) => 
      String(a.name || '').localeCompare(String(b.name || ''), 'uk-UA')
    );
  }, [graph]);

  // 4. Фільтрація та сортування
  const fleetData = useMemo(() => {
    let result = [...allMappedWagons];

    if (statusFilter !== 'Всі') result = result.filter(w => w.status === statusFilter);
    if (typeFilter !== 'Всі') result = result.filter(w => w.type === typeFilter);
    if (selectedStation) result = result.filter(w => w.station === selectedStation);

    if (sortConfig) {
      result.sort((a, b) => {
        if (sortConfig.key === 'id') {
          return sortConfig.direction === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
        }
        if (sortConfig.key === 'type') {
          return sortConfig.direction === 'asc' ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
        }
        return 0;
      });
    }

    return result;
  }, [allMappedWagons, statusFilter, typeFilter, selectedStation, sortConfig]);

  const handleSort = (key: 'id' | 'type') => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const renderSortIcon = (key: 'id' | 'type') => {
    if (sortConfig?.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'desc'
      ? <ArrowDown className="w-3.5 h-3.5 text-[#0052cc]" />
      : <ArrowUp className="w-3.5 h-3.5 text-[#0052cc]" />;
  };

  const formatTypeName = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <PageLayout mainClassName="p-6">
      <div className={pageStyles.surface}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className={pageStyles.title} style={{ marginBottom: 0 }}>Парк вагонів</h1>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Фільтр по ТИПУ (Gondola, Cement Hopper, Grain Hopper) */}
            <div className="relative" ref={typeMenuRef}>
              <button
                onClick={() => setIsTypeMenuOpen(!isTypeMenuOpen)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border ${typeFilter !== 'Всі' ? 'bg-blue-50 border-[#0052cc] text-[#0052cc]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <Layers className="w-4 h-4" />
                <span>{typeFilter === 'Всі' ? 'Всі типи' : formatTypeName(typeFilter)}</span>
              </button>

              {isTypeMenuOpen && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50 min-w-max">
                  <button
                    onClick={() => { setTypeFilter('Всі'); setIsTypeMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <span className="w-4">{typeFilter === 'Всі' && <Check size={16} className="text-[#0052cc]" />}</span>
                    <span>Всі типи</span>
                  </button>
                  {uniqueTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => { setTypeFilter(type); setIsTypeMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <span className="w-4">{typeFilter === type && <Check size={16} className="text-[#0052cc]" />}</span>
                      <span>{formatTypeName(type)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Фільтр по статусу */}
            <div className="relative" ref={statusMenuRef}>
              <button
                onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border ${statusFilter !== 'Всі' ? 'bg-blue-50 border-[#0052cc] text-[#0052cc]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <Filter className="w-4 h-4" />
                <span>{statusFilter === 'Всі' ? 'Всі статуси' : statusFilter}</span>
              </button>

              {isStatusMenuOpen && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50 min-w-max">
                  {allStatuses.map(status => (
                    <button
                      key={status}
                      onClick={() => { setStatusFilter(status); setIsStatusMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <span className="w-4">{statusFilter === status && <Check size={16} className="text-[#0052cc]" />}</span>
                      <span>{status === 'Всі' ? 'Всі статуси' : status}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Пошук станції */}
            <div className="relative min-w-55">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={stationSearch}
                onChange={(e) => { setStationSearch(e.target.value); setSelectedStation(''); }}
                onFocus={() => setIsStationFocused(true)}
                onBlur={() => setIsStationFocused(false)}
                placeholder="Місцезнаходження..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#0052cc]/20 outline-none"
              />
              {stationSearch && (
                <button onMouseDown={(e) => { e.preventDefault(); setStationSearch(''); setSelectedStation(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
              {isStationFocused && stationSearch && !selectedStation && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {stationsForSearch.filter(s => (s.name || '').toLowerCase().startsWith(stationSearch.toLowerCase())).map(s => (
                    <div key={s.stationId} onMouseDown={(e) => { e.preventDefault(); setStationSearch(s.name || ''); setSelectedStation(s.name || ''); setIsStationFocused(false); }} className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700 border-b border-slate-50 last:border-0">
                      {s.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.table}>
            <thead className={pageStyles.thead}>
              <tr>
                <th className={`${pageStyles.th} cursor-pointer group`} onClick={() => handleSort('id')}>
                  <div className="flex items-center gap-1.5">ID вагона {renderSortIcon('id')}</div>
                </th>
                <th className={`${pageStyles.th} cursor-pointer group`} onClick={() => handleSort('type')}>
                  <div className="flex items-center gap-1.5">Тип {renderSortIcon('type')}</div>
                </th>
                <th className={pageStyles.th}>Статус</th>
                <th className={pageStyles.th}>Місцезнаходження</th>
              </tr>
            </thead>
            <tbody>
              {fleetData.length === 0 ? (
                <tr><td className={pageStyles.td} colSpan={4}><div className="flex flex-col items-center py-8 text-slate-500"><Search className="w-8 h-8 text-slate-300 mb-2" /><p>Нічого не знайдено</p></div></td></tr>
              ) : (
                fleetData.map((wagon, idx) => (
                  <tr key={idx} className={pageStyles.row}>
                    <td className={pageStyles.tdMono}>{wagon.id}</td>
                    <td className={pageStyles.td}>{formatTypeName(wagon.type)}</td>
                    <td className={pageStyles.td}><span className={badgeClass(wagonStatusBadgeVariant(wagon.status))}>{wagon.status}</span></td>
                    <td className={pageStyles.td}>{wagon.station}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
};