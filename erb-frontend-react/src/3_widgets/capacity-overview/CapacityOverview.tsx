import { useEffect, useMemo } from 'react';
import { useMapStore } from '@/6_shared/model/store';
import { progressFillClass, progressTrackClass } from '@/6_shared/ui/pageStyles';
import { RailwayMap } from '@/3_widgets/railway_map/ui/RailwayMap';

const TYPE_LABELS: Record<string, string> = {
  gondola: 'Напіввагони',
  grain_hopper: 'Зерновози',
  cement_hopper: 'Цементовози',
  locomotive: 'Локомотиви',
  _all: 'Увесь парк',
};

export const CapacityOverview = ({ onManageClick: _onManageClick }: { onManageClick?: () => void }) => {
  const { fleetStatus, fetchFleet, fetchGraph } = useMapStore();

  useEffect(() => {
    fetchFleet();
    fetchGraph();
  }, [fetchFleet, fetchGraph]);

  const { utilizationRows, availableUnits: _availableUnits, maintenanceUnits: _maintenanceUnits } = useMemo(() => {
    const byType = fleetStatus?.byType || {};
    const totalWagons = Number(fleetStatus?.totalWagons || 0);

    const maintenance = Object.values(byType).reduce(
      (sum, bucket) => sum + Number(bucket?.maintenance || 0),
      0
    );

    const available = Math.max(0, totalWagons - maintenance);

    const rows = Object.entries(byType)
      .map(([type, bucket]) => {
        const typeTotal = Number(bucket?.total || 0);
        const percent = totalWagons > 0 ? Math.round((typeTotal / totalWagons) * 100) : 0;
        return {
          key: type,
          label: TYPE_LABELS[type] || type,
          percent,
        };
      })
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 3);

    return {
      utilizationRows:
        rows.length > 0
          ? rows
          : [
              { key: 'r1', label: 'Напрямок 1', percent: 0 },
              { key: 'r2', label: 'Напрямок 2', percent: 0 },
              { key: 'r3', label: 'Напрямок 3', percent: 0 },
            ],
      availableUnits: available,
      maintenanceUnits: maintenance,
    };
  }, [fleetStatus]);

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      
      <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-lg text-slate-900 mb-6">Завантаженість регіонів</h3>
        
        <div className="flex flex-col md:flex-row gap-8 items-center">
          
          <div className="w-full md:w-2/3 h-62.5 bg-slate-100 rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-[#f8f9fa]">
              <RailwayMap compact />
            </div>
          </div>

          <div className="w-full md:w-1/3 space-y-6">
            {utilizationRows.map((row, index) => (
              <div key={row.key}>
                <div className="flex justify-between text-[11px] font-bold mb-2">
                  <span className="text-slate-700 uppercase tracking-widest">{row.label}</span>
                  <span className="text-slate-900">{row.percent}%</span>
                </div>
                <div className={progressTrackClass('sm')}>
                  <div
                    className={progressFillClass(index === 0 ? 'neutral' : index === 1 ? 'warning' : 'primary', 'sm')}
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
};