import { useEffect } from 'react';
import { TrendingDown, TrendingUp, CheckCircle2, XCircle, Route, Banknote, BarChart3, Gauge } from 'lucide-react';
import { PageLayout } from '@/6_shared/ui/PageLayout';
import { MetricCard } from '@/6_shared/ui/MetricCard';
import { pageStyles } from '@/6_shared/ui/pageStyles';
import { useMapStore } from '@/6_shared/model/store';

export const MetricsPage = () => {
  const { metrics, fetchMetrics, fleetStatus, fetchFleet } = useMapStore();

  useEffect(() => {
    fetchMetrics();
    fetchFleet();
  }, [fetchMetrics, fetchFleet]);

  const avgEmptyRunKmToday = fleetStatus?.avgEmptyRunKmToday ?? null;
  const savingsPercent = metrics && metrics.naiveCost > 0
    ? Math.round((metrics.costSavedVsNaive / metrics.naiveCost) * 100)
    : 0;
  const naiveBarWidth = 100;
  const optimizedBarWidth = metrics && metrics.naiveCost > 0
    ? Math.round((metrics.optimizedCost / metrics.naiveCost) * 100)
    : 0;

  return (
    <PageLayout mainClassName="overflow-y-auto p-8 pt-4">
      <div className={pageStyles.surface}>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className={pageStyles.title}>Метрики оптимізації</h1>
            <p className="text-sm font-medium text-slate-500 max-w-2xl">
              Показники роботи алгоритму підбору вагонів: ефективність, економія та завантаженість мережі.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            <BarChart3 className="w-4 h-4 text-[#003b8e]" />
            GET /api/metrics
          </div>
        </div>

        {!metrics ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-sm text-slate-500">
            Завантаження даних з бекенду…
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <MetricCard
                label="Match Rate"
                value={`${Math.round(metrics.matchRate * 100)}%`}
                hint={`${metrics.ordersMatched} підібрано / ${metrics.ordersUnmatched} без підбору`}
                tone="primary"
                icon={<Gauge className="w-4 h-4" />}
              />
              <MetricCard
                label="Зекономлено"
                value={metrics.costSavedVsNaive.toLocaleString('uk-UA')}
                hint={`−${savingsPercent}% vs наївний підбір`}
                tone="success"
                icon={<TrendingDown className="w-4 h-4" />}
              />
              <MetricCard
                label="Сер. порожній пробіг"
                value={`${metrics.avgEmptyRunKm.toFixed(1)} км`}
                hint="на одне призначення"
                tone="warning"
                icon={<Route className="w-4 h-4" />}
              />
              <MetricCard
                label="Сер. пробіг сьогодні"
                value={avgEmptyRunKmToday !== null ? `${avgEmptyRunKmToday} км` : '—'}
                hint="порожній пробіг / день"
                tone="neutral"
                icon={<TrendingDown className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Cost comparison */}
              <div className={pageStyles.card}>
                <h2 className={pageStyles.sectionTitle}>Порівняння витрат</h2>

                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-2">
                      <span>Наївний підбір</span>
                      <span>{metrics.naiveCost.toLocaleString('uk-UA')}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full rounded-full bg-slate-400" style={{ width: `${naiveBarWidth}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-2">
                      <span>Оптимізований</span>
                      <span>{metrics.optimizedCost.toLocaleString('uk-UA')}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full rounded-full bg-[#003b8e]" style={{ width: `${optimizedBarWidth}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm font-semibold text-emerald-700 mb-2">
                      <span>Економія</span>
                      <span>{metrics.costSavedVsNaive.toLocaleString('uk-UA')} ({savingsPercent}%)</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${savingsPercent}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/80">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Загальний дохід</div>
                    <div className="text-2xl font-black text-slate-900">{metrics.totalRevenue.toLocaleString('uk-UA')}</div>
                    <div className="text-xs font-semibold text-slate-500 mt-1">всі виконані замовлення</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/80">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Витрати пор. пробігу</div>
                    <div className="text-2xl font-black text-slate-900">{metrics.totalCostEmptyRun.toLocaleString('uk-UA')}</div>
                    <div className="text-xs font-semibold text-slate-500 mt-1">загальні витрати</div>
                  </div>
                </div>
              </div>

              {/* Run km breakdown */}
              <div className={pageStyles.card}>
                <h2 className={pageStyles.sectionTitle}>Пробіг та замовлення</h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-lg bg-slate-50 border border-slate-200/80 px-4 py-3">
                    <div className="p-2 rounded-md bg-slate-100">
                      <TrendingDown className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Порожній пробіг</div>
                      <div className="text-xl font-black text-slate-900">{metrics.totalEmptyRunKm.toLocaleString('uk-UA')} км</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-lg bg-slate-50 border border-slate-200/80 px-4 py-3">
                    <div className="p-2 rounded-md bg-blue-50">
                      <TrendingUp className="w-4 h-4 text-[#003b8e]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Вантажний пробіг</div>
                      <div className="text-xl font-black text-slate-900">{metrics.totalLoadedRunKm.toLocaleString('uk-UA')} км</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-lg bg-slate-50 border border-slate-200/80 px-4 py-3">
                    <div className="p-2 rounded-md bg-green-50">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Підібрано / Доставлено</div>
                      <div className="text-xl font-black text-slate-900">
                        {metrics.ordersMatched} / {metrics.totalDeliveredAssignments}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-lg bg-slate-50 border border-slate-200/80 px-4 py-3">
                    <div className="p-2 rounded-md bg-amber-50">
                      <XCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Без підбору</div>
                      <div className="text-xl font-black text-amber-600">{metrics.ordersUnmatched}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-lg bg-slate-50 border border-slate-200/80 px-4 py-3">
                    <div className="p-2 rounded-md bg-blue-50">
                      <Banknote className="w-4 h-4 text-[#003b8e]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Сер. порожній пробіг</div>
                      <div className="text-xl font-black text-slate-900">{metrics.avgEmptyRunKm.toFixed(1)} км</div>
                      <div className="text-xs font-semibold text-slate-500">на одне призначення</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
};
