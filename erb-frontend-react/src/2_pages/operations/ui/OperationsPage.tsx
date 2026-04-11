import { useEffect, useMemo } from 'react';
import { PageLayout } from '@/6_shared/ui/PageLayout';
import { badgeClass, pageStyles, progressFillClass, progressTrackClass } from '@/6_shared/ui/pageStyles';
import { useMapStore } from '@/6_shared/model/store';
import { mapWagonStatusToUi, wagonProgressFromStatus, wagonStatusBadgeVariant } from '@/6_shared/lib/statusMappers';

export const OperationsPage = () => {
  const { wagons, graph, fetchFleet, fetchGraph } = useMapStore();

  useEffect(() => {
    fetchFleet();
    fetchGraph();
  }, [fetchFleet, fetchGraph]);

  const operations = useMemo(
    () =>
      wagons.slice(0, 24).map((wagon) => {
        const currentStation = graph?.stations.find(
          (s) => String(s.stationId || '') === String(wagon.currentStationId || '')
        )?.name;

        const status = mapWagonStatusToUi(wagon.status);
        const progress = wagonProgressFromStatus(wagon.status);

        return {
          id: wagon.id || wagon.number,
          wagon: wagon.number || wagon.id,
          from: 'Маршрутна мережа',
          to: currentStation || 'Невизначено',
          status,
          progress,
          eta: `${Math.max(0, Math.ceil((100 - progress) / 15))}:00`,
        };
      }),
    [wagons, graph]
  );

  return (
    <PageLayout mainClassName="p-6">
      <div className={pageStyles.surface}>
            <h1 className={pageStyles.title}>Операції наживо</h1>
            
            <div className="space-y-4">
              {operations.length === 0 && (
                <div className={pageStyles.card}>Дані операцій ще завантажуються...</div>
              )}
              {operations.map((op) => (
                <div key={op.id} className={pageStyles.card}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900" style={{ color: '#002e7e' }}>{op.wagon}</h3>
                      <p className="text-sm text-slate-600">{op.from} → {op.to}</p>
                    </div>
                    <div className="text-right">
                      <span className={badgeClass(wagonStatusBadgeVariant(op.status))}>
                        {op.status}
                      </span>
                      <p className="text-sm text-slate-600 mt-2">Залишилось: {op.eta}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Прогрес</span>
                      <span className="font-semibold" style={{ color: '#002e7e' }}>{op.progress}%</span>
                    </div>
                    <div className={progressTrackClass('md')}>
                      <div 
                        className={progressFillClass('primary', 'md')}
                        style={{ width: `${op.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
      </div>
    </PageLayout>
  );
};
