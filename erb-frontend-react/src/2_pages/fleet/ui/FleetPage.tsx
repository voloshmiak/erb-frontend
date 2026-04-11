import { useEffect, useMemo } from 'react';
import { PageLayout } from '@/6_shared/ui/PageLayout';
import { badgeClass, pageStyles, progressFillClass, progressTrackClass } from '@/6_shared/ui/pageStyles';
import { useMapStore } from '@/6_shared/model/store';
import { mapWagonStatusToUi, wagonLoadFromStatus, wagonStatusBadgeVariant } from '@/6_shared/lib/statusMappers';

export const FleetPage = () => {
  const { wagons, graph, fetchFleet, fetchGraph } = useMapStore();

  useEffect(() => {
    fetchFleet();
    fetchGraph();
  }, [fetchFleet, fetchGraph]);

  const fleetData = useMemo(
    () =>
      wagons.map((wagon) => {
        const station = graph?.stations.find(
          (s) => String(s.stationId || '') === String(wagon.currentStationId || '')
        );

        return {
          id: wagon.number || wagon.id,
          type: wagon.type,
          status: mapWagonStatusToUi(wagon.status),
          station: station?.name || 'Невизначено',
          load: wagonLoadFromStatus(wagon.status),
        };
      }),
    [wagons, graph]
  );

  return (
    <PageLayout mainClassName="p-6">
      <div className={pageStyles.surface}>
        <h1 className={pageStyles.title}>Парк вагонів</h1>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.table}>
            <thead className={pageStyles.thead}>
              <tr>
                <th className={pageStyles.th}>ID вагона</th>
                <th className={pageStyles.th}>Тип</th>
                <th className={pageStyles.th}>Статус</th>
                <th className={pageStyles.th}>Місцезнаходження</th>
                <th className={pageStyles.th}>Завантаженість</th>
              </tr>
            </thead>
            <tbody>
              {fleetData.length === 0 && (
                <tr>
                  <td className={pageStyles.td} colSpan={5}>Дані парку ще завантажуються...</td>
                </tr>
              )}
              {fleetData.map((wagon, idx) => (
                <tr key={idx} className={pageStyles.row}>
                  <td className={pageStyles.tdMono}>{wagon.id}</td>
                  <td className={`${pageStyles.td} capitalize`}>{wagon.type.replace('_', ' ')}</td>
                  <td className={pageStyles.td}>
                    <span className={badgeClass(wagonStatusBadgeVariant(wagon.status))}>
                      {wagon.status}
                    </span>
                  </td>
                  <td className={pageStyles.td}>{wagon.station}</td>
                  <td className={pageStyles.td}>
                    <div className={`${progressTrackClass('sm')} w-32`}>
                      <div className={progressFillClass('primary', 'sm')} style={{ width: `${wagon.load}%` }} />
                    </div>
                    <span className="text-xs text-slate-600">{wagon.load}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
};
