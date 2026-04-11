import { useEffect, useMemo } from 'react';
import { PageLayout } from '@/6_shared/ui/PageLayout';
import { badgeClass, pageStyles } from '@/6_shared/ui/pageStyles';
import { MetricCard } from '@/6_shared/ui/MetricCard';
import { useLiveOrders } from '@/5_entities/order/api/useLiveOrders';
import { useMapStore } from '@/6_shared/model/store';

export const ReportsPage = () => {
  const { orders } = useLiveOrders();
  const { fleetStatus, fetchFleet } = useMapStore();

  useEffect(() => {
    fetchFleet();
  }, [fetchFleet]);

  const summary = useMemo(() => {
    const delivered = orders.filter((o) => o.status === 'Доставлено').length;
    const inProgress = orders.filter((o) => o.status === 'У дорозі' || o.status === 'Підтверджено').length;
    const delayed = orders.filter((o) => o.status === 'Очікує').length;

    const total = orders.length;
    const successRate = total > 0 ? Math.round((delivered / total) * 100) : 0;
    const fleetEfficiency = fleetStatus?.totalWagons
      ? Math.round(((fleetStatus.byType?._all?.loaded || 0) / fleetStatus.totalWagons) * 100)
      : 0;

    return { total, successRate, fleetEfficiency, delivered, inProgress, delayed };
  }, [orders, fleetStatus]);

  const reports = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('uk-UA', { month: 'long' });
    const grouped = new Map<string, { month: string; delivered: number; inProgress: number; delayed: number }>();

    orders.forEach((order) => {
      const parsedDate = new Date(order.date);
      const monthLabel = Number.isNaN(parsedDate.getTime())
        ? 'Невизначено'
        : formatter.format(parsedDate);

      const current = grouped.get(monthLabel) || {
        month: monthLabel,
        delivered: 0,
        inProgress: 0,
        delayed: 0,
      };

      if (order.status === 'Доставлено') current.delivered += 1;
      else if (order.status === 'Очікує') current.delayed += 1;
      else current.inProgress += 1;

      grouped.set(monthLabel, current);
    });

    return Array.from(grouped.values()).slice(0, 6);
  }, [orders]);

  return (
    <PageLayout mainClassName="p-6">
    <div className={pageStyles.surface}>
      <h1 className={pageStyles.title}>Логістичні звіти</h1>
            
            <div className={pageStyles.metricGrid}>
              <MetricCard
                label="Всього перевезено"
                value={summary.total}
                hint="заявок у системі"
                tone="primary"
                icon={<span className="text-xs font-black">Σ</span>}
              />
              <MetricCard
                label="Середня актуальність"
                value={`${summary.successRate}%`}
                hint="доставлених замовлень"
                tone="success"
                icon={<span className="text-xs font-black">OK</span>}
              />
              <MetricCard
                label="Ефективність мережі"
                value={`${summary.fleetEfficiency}%`}
                hint="завантажені вагони"
                tone="warning"
                icon={<span className="text-xs font-black">UZ</span>}
              />
            </div>

            <div className="mt-6">
              <h2 className={pageStyles.sectionTitle}>Статистика за місяцями</h2>
              <table className={pageStyles.table}>
                <thead className={pageStyles.thead}>
                  <tr>
                    <th className={pageStyles.th}>Місяць</th>
                    <th className={pageStyles.th}>Доставлено</th>
                    <th className={pageStyles.th}>В процесі</th>
                    <th className={pageStyles.th}>З затримками</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 && (
                    <tr>
                      <td className={pageStyles.td} colSpan={4}>Немає даних для відображення.</td>
                    </tr>
                  )}
                  {reports.map((report, idx) => (
                    <tr key={idx} className={pageStyles.row}>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">{report.month}</td>
                      <td className={pageStyles.td}>
                        <span className={badgeClass('success')}>{report.delivered}</span>
                      </td>
                      <td className={pageStyles.td}>
                        <span className={badgeClass('warning')}>{report.inProgress}</span>
                      </td>
                      <td className={pageStyles.td}>
                        <span className={badgeClass('danger')}>{report.delayed}</span>
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
