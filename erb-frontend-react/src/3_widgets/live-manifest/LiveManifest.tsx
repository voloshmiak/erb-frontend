import { useState } from 'react';
import { Clock, CheckCircle2, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

// Приймаємо дані з пропсів, а не вантажимо самі
export const LiveManifest = ({ orders, isLoading }: { orders: any[], isLoading: boolean }) => {
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

  const renderStatus = (status: string) => {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
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
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
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
                    <td className="px-8 py-4">{renderStatus(order.status)}</td>
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
    </div>
  );
};