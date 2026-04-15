import { useEffect, useMemo } from 'react';
import { Activity, Archive, BarChart3, Clock3, Route, ShieldCheck, Sparkles } from 'lucide-react';
import { PageLayout } from '@/6_shared/ui/PageLayout';
import { MetricCard } from '@/6_shared/ui/MetricCard';
import { badgeClass, pageStyles } from '@/6_shared/ui/pageStyles';
import { useLiveOrders } from '@/5_entities/order/api/useLiveOrders';
import { useMapStore } from '@/6_shared/model/store';

export const Dashboard = () => {
  const { orders, isLoading } = useLiveOrders();
  const { fleetStatus, fetchFleet, eventLog } = useMapStore();

  useEffect(() => {
    fetchFleet();
  }, [fetchFleet]);

  const summary = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status === 'У дорозі').length;
    const queuedOrders = orders.filter((order) => order.status === 'Очікує').length;
    const completedOrders = orders.filter((order) => order.status === 'Доставлено').length;
    const totalOrders = orders.length;

    const totalWagons = fleetStatus?.totalWagons || 0;
    const loadedWagons = fleetStatus?.byType?._all?.loaded || 0;
    const utilization = totalWagons > 0 ? Math.round((loadedWagons / totalWagons) * 100) : 0;
    const avgEmptyRunKmToday = fleetStatus?.avgEmptyRunKmToday ?? null;

    return { activeOrders, queuedOrders, completedOrders, totalOrders, totalWagons, loadedWagons, utilization, avgEmptyRunKmToday };

  }, [fleetStatus, orders]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const statusSeries = useMemo(
    () => [
      { label: 'У дорозі', value: summary.activeOrders, tone: 'bg-[#003b8e]' },
      { label: 'Очікує', value: summary.queuedOrders, tone: 'bg-amber-500' },
      { label: 'Доставлено', value: summary.completedOrders, tone: 'bg-emerald-600' },
    ],
    [summary.activeOrders, summary.completedOrders, summary.queuedOrders]
  );

  const recentEvents = useMemo(
    () =>
      [...eventLog]
        .slice(-6)
        .reverse()
        .map((event) => ({
          id: event.id,
          label: event.message,
          type: event.type,
          timestamp: new Date(event.timestamp),
        })),
    [eventLog]
  );

  const latestEventLabel = recentEvents[0]?.label || 'Подій поки немає';

  return (
    <PageLayout mainClassName="overflow-y-auto p-8 pt-4">
      <div className={pageStyles.surface}>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className={pageStyles.title}>Панель керування</h1>
            <p className="text-sm font-medium text-slate-500 max-w-2xl">
              Огляд ключових показників по заявках, руху вагонів і навантаженню мережі.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            <Activity className="w-4 h-4 text-[#003b8e]" />
            Оновлення в реальному часі
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <MetricCard
            label="Всього заявок"
            value={summary.totalOrders}
            hint="у системі зараз"
            tone="primary"
            icon={<Archive className="w-4 h-4" />}
          />
          <MetricCard
            label="Активні рейси"
            value={summary.activeOrders}
            hint="у дорозі"
            tone="warning"
            icon={<Route className="w-4 h-4" />}
          />
          <MetricCard
            label="Виконані заявки"
            value={summary.completedOrders}
            hint="доставлено"
            tone="success"
            icon={<ShieldCheck className="w-4 h-4" />}
          />
          <MetricCard
            label="Завантажені вагони"
            value={summary.loadedWagons}
            hint={`${summary.utilization}% завантаження`}
            tone="neutral"
            icon={<Clock3 className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className={pageStyles.card}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className={pageStyles.sectionTitle} style={{ marginBottom: 0 }}>Графік заявок</h2>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <BarChart3 className="w-3.5 h-3.5 text-[#003b8e]" />
                Статуси зараз
              </div>
            </div>

            <div className="space-y-4">
              {statusSeries.map((item) => {
                const maxValue = Math.max(...statusSeries.map((series) => series.value), 1);
                const width = item.value > 0 ? Math.max((item.value / maxValue) * 100, 12) : 0;

                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                      <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-4 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#003b8e]" />
                Останнє оновлення
              </div>
              <div className="text-sm font-semibold text-slate-900">{latestEventLabel}</div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/80">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Всього вагонів</div>
                <div className="text-3xl font-black text-slate-900">{summary.totalWagons}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">поточний парк</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/80">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Черга на обробку</div>
                <div className="text-3xl font-black text-slate-900">{summary.queuedOrders}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">очікують підтвердження</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-600 mb-2">
                <span>Завантаження мережі</span>
                <span>{summary.utilization}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-[#003b8e]" style={{ width: `${Math.max(summary.utilization, 6)}%` }} />
              </div>
            </div>
          </div>

          <div className={pageStyles.card}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className={pageStyles.sectionTitle} style={{ marginBottom: 0 }}>Стрічка подій</h2>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <Clock3 className="w-3.5 h-3.5 text-[#003b8e]" />
                Останні 6 подій
              </div>
            </div>

            <div className="space-y-3">
              {recentEvents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  Події ще не згенеровані.
                </div>
              ) : (
                recentEvents.map((event, index) => (
                  <div key={event.id} className="flex gap-3 rounded-lg border border-slate-200/80 bg-slate-50 px-4 py-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="h-3 w-3 rounded-full bg-[#003b8e]" />
                      {index !== recentEvents.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1 min-h-8" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-bold text-slate-900">{event.label}</div>
                          <div className="text-xs font-medium text-slate-500 mt-1">
                            {event.timestamp.toLocaleString('uk-UA', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <span className={badgeClass('neutral')}>{event.type}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className={pageStyles.card}>
            <h2 className={pageStyles.sectionTitle}>Останні заявки</h2>
            <div className="space-y-3">
              {isLoading && recentOrders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  Завантаження даних...
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  Поки немає заявок для відображення.
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200/80 bg-slate-50 px-4 py-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{order.id}</div>
                      <div className="text-xs font-medium text-slate-500">{order.from} → {order.to}</div>
                    </div>
                    <span className={badgeClass(order.status === 'Доставлено' ? 'success' : order.status === 'Очікує' ? 'warning' : 'primary')}>
                      {order.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};