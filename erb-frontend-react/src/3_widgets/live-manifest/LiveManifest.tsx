import { useState } from 'react';
import { Clock, CheckCircle2, Filter, Download, ChevronLeft, ChevronRight, ArrowRight, X } from 'lucide-react';
import type { FormattedOrder } from '@/5_entities/order/api/useLiveOrders';
import { pageStyles } from '@/6_shared/ui/pageStyles';

type LiveManifestProps = {
  orders: FormattedOrder[];
  isLoading: boolean;
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string | null) => void;
};

const statusSteps = ['Очікує', 'Підтверджено', 'У дорозі', 'Доставлено'] as const;

const statusBadge = (status: string) => {
  switch (status) {
    case 'У дорозі':
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[11px] font-bold text-[#0052cc]"><div className="w-1.5 h-1.5 rounded-full bg-[#0052cc]"></div> У дорозі</span>;
    case 'Очікує':
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[11px] font-bold text-[#b24d00]"><Clock className="w-3 h-3" /> Очікує</span>;
    case 'Підтверджено':
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-700"><CheckCircle2 className="w-3 h-3" /> Підтверджено</span>;
    case 'Доставлено':
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-500"><CheckCircle2 className="w-3 h-3" /> Доставлено</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">{status}</span>;
  }
};

// Приймаємо дані з пропсів, а не вантажимо самі
export const LiveManifest = ({ orders, isLoading, selectedOrderId, onSelectOrder }: LiveManifestProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('Всі');
  const itemsPerPage = 10;

  // 1. Фільтрація
  const filteredOrders = orders.filter(order => statusFilter === 'Всі' || order.status === statusFilter);
  
  // 2. Пагінація
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 3. Експорт у CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Тип', 'Дата', 'Звідки', 'Куди', 'Статус'];
    const csvContent = filteredOrders.map(o => `${o.id},${o.type},${o.date},${o.from},${o.to},${o.status}`).join('\n');
    // Додаємо BOM (\uFEFF) для коректного відображення кирилиці в Excel
    const blob = new Blob(['\uFEFF' + headers.join(',') + '\n' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_export_${new Date().toLocaleDateString('uk-UA')}.csv`;
    link.click();
  };

  const selectedOrder = filteredOrders.find((order) => order.id === selectedOrderId) || null;

  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <h2 className="text-xl font-bold text-slate-900">Журнал перевезень</h2>
        <div className="flex gap-4">
          {/* Фільтр */}
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none appearance-none cursor-pointer"
            >
              <option value="Всі">Всі статуси</option>
              <option value="Очікує">Очікують</option>
              <option value="Підтверджено">Підтверджені</option>
              <option value="У дорозі">У дорозі</option>
              <option value="Доставлено">Доставлені</option>
            </select>
          </div>
          {/* Експорт */}
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
            <Download className="w-4 h-4" /> Експорт
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center text-slate-400">Завантаження...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-8 py-4 w-[20%]">ID Запиту</th>
                  <th className="px-8 py-4 w-[20%]">Дата</th>
                  <th className="px-8 py-4 w-[30%]">Маршрут</th>
                  <th className="px-8 py-4 w-[20%]">Статус</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder(order.id)}
                    className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedOrder?.id === order.id ? 'bg-blue-50/40' : ''}`}
                  >
                    <td className="px-8 py-4">
                      <div className="font-bold text-slate-900">{order.id}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{order.type}</div>
                    </td>
                    <td className="px-8 py-4 text-sm font-medium text-slate-600">{order.date}</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <span className="font-bold">{order.from}</span>
                        <span className="text-slate-300">→</span>
                        <span className="font-bold">{order.to}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">{statusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагінація */}
          <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Показано {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} із {filteredOrders.length} запитів
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-50 transition-colors text-slate-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-md text-sm font-bold flex items-center justify-center transition-colors ${currentPage === i + 1 ? 'bg-[#0f2e5a] text-white' : 'text-slate-600 hover:bg-slate-200'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-50 transition-colors text-slate-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
          <button
            type="button"
            aria-label="Закрити меню ордера"
            onClick={() => onSelectOrder(null)}
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
          />

          <aside className="relative z-10 mt-4 flex w-full max-w-[720px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl max-h-[calc(100vh-2rem)] sm:mt-6 sm:max-h-[calc(100vh-3rem)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Меню ордера</p>
                <h3 className="text-xl font-bold text-slate-900">Деталі заявки</h3>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(selectedOrder.status)}
                <button
                  type="button"
                  onClick={() => onSelectOrder(null)}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ID заявки</p>
                    <p className="mt-1 text-lg font-black text-slate-900 break-all">{selectedOrder.id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white border border-slate-200 p-3">
                      <p className="text-[11px] font-bold uppercase text-slate-400">Тип вагона</p>
                      <p className="mt-1 font-bold text-slate-900">{selectedOrder.type}</p>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200 p-3">
                      <p className="text-[11px] font-bold uppercase text-slate-400">Дата</p>
                      <p className="mt-1 font-bold text-slate-900">{selectedOrder.date}</p>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200 p-3 col-span-2">
                      <p className="text-[11px] font-bold uppercase text-slate-400">Маршрут</p>
                      <p className="mt-1 font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                        <span>{selectedOrder.from}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <span>{selectedOrder.to}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900">Статусний ланцюжок</h4>
                    <span className="text-xs font-semibold text-slate-500">Поточний стан</span>
                  </div>
                  <div className="space-y-3">
                    {statusSteps.map((step, index) => {
                      const currentStatusIndex = statusSteps.indexOf(selectedOrder.status as (typeof statusSteps)[number]);
                      const isDone = index < currentStatusIndex;
                      const isActive = index === currentStatusIndex;

                      return (
                        <div key={step} className="flex items-start gap-3">
                          <div className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center border-2 ${isDone || isActive ? 'border-[#0f2e5a] bg-[#0f2e5a] text-white' : 'border-slate-200 bg-white text-slate-300'}`}>
                            <span className="text-[11px] font-black">{index + 1}</span>
                          </div>
                          <div className="flex-1 pb-3 border-b border-slate-100 last:border-b-0">
                            <p className={`font-bold ${isActive ? 'text-[#0f2e5a]' : 'text-slate-700'}`}>{step}</p>
                            <p className="text-sm text-slate-500">
                              {index === 0 && 'Заявка прийнята в обробку'}
                              {index === 1 && 'Підтвердження від диспетчера'}
                              {index === 2 && 'Вагон в дорозі до станції призначення'}
                              {index === 3 && 'Рейс завершено'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h4 className="font-bold text-slate-900 mb-3">Коротка історія</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Запит створено</p>
                        <p className="text-sm text-slate-500">Початок обробки заявки на перевезення</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Актуальний статус: {selectedOrder.status}</p>
                        <p className="text-sm text-slate-500">Останнє доступне оновлення по ордеру</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors">
                  Переглянути документацію
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};