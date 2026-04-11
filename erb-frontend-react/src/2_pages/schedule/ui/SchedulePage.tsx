import { useEffect, useMemo } from 'react';
import { PageLayout } from '@/6_shared/ui/PageLayout';
import { badgeClass, pageStyles } from '@/6_shared/ui/pageStyles';
import { useMapStore } from '@/6_shared/model/store';
import { operationTypeBadgeVariant, wagonOperationTypeFromStatus } from '@/6_shared/lib/statusMappers';

const toTimeLabel = (value: Date) =>
  `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;

export const SchedulePage = () => {
  const { wagons, graph, fetchFleet, fetchGraph } = useMapStore();

  useEffect(() => {
    fetchFleet();
    fetchGraph();
  }, [fetchFleet, fetchGraph]);

  const schedule = useMemo(
    () =>
      wagons.slice(0, 24).map((wagon) => {
        const station = graph?.stations.find(
          (s) => String(s.stationId || '') === String(wagon.currentStationId || '')
        );

        const baseDate = wagon.lastUnloadTime ? new Date(wagon.lastUnloadTime) : new Date();
        const departureDate = new Date(baseDate.getTime() + 2 * 60 * 60 * 1000);

        return {
          id: wagon.id || wagon.number,
          wagon: wagon.number || wagon.id,
          station: station?.name || 'Невизначено',
          arrivalTime: toTimeLabel(baseDate),
          departureTime: toTimeLabel(departureDate),
          type: wagonOperationTypeFromStatus(wagon.status),
        };
      }),
    [wagons, graph]
  );

  return (
    <PageLayout mainClassName="p-6">
      <div className={pageStyles.surface}>
            <h1 className={pageStyles.title}>Розклад операцій</h1>
            
            <div className={pageStyles.tableWrap}>
              <table className={pageStyles.table}>
                <thead className={pageStyles.thead}>
                  <tr>
                    <th className={pageStyles.th}>Вагон</th>
                    <th className={pageStyles.th}>Станція</th>
                    <th className={pageStyles.th}>Тип операції</th>
                    <th className={pageStyles.th}>Прибуття</th>
                    <th className={pageStyles.th}>Відправлення</th>
                    <th className={pageStyles.th}>Тривалість</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.length === 0 && (
                    <tr>
                      <td className={pageStyles.td} colSpan={6}>Дані розкладу ще завантажуються...</td>
                    </tr>
                  )}
                  {schedule.map((item, idx) => {
                    const [arr_h, arr_m] = item.arrivalTime.split(':').map(Number);
                    const [dep_h, dep_m] = item.departureTime.split(':').map(Number);
                    let duration = (dep_h * 60 + dep_m) - (arr_h * 60 + arr_m);
                    if (duration < 0) duration += 24 * 60;
                    const hours = Math.floor(duration / 60);
                    const minutes = duration % 60;

                    return (
                      <tr key={idx} className={pageStyles.row}>
                        <td className="px-4 py-3 font-mono text-sm font-semibold" style={{ color: '#002e7e' }}>{item.wagon}</td>
                        <td className={pageStyles.td}>{item.station}</td>
                        <td className={pageStyles.td}>
                          <span className={badgeClass(operationTypeBadgeVariant(item.type))}>
                            {item.type}
                          </span>
                        </td>
                        <td className={`${pageStyles.td} font-medium`}>{item.arrivalTime}</td>
                        <td className={`${pageStyles.td} font-medium`}>{item.departureTime}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{hours}г {minutes}хв</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
      </div>
    </PageLayout>
  );
};
