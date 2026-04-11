import { Sidebar } from '@/3_widgets/sidebar/ui/Sidebar';
import { Header } from '@/3_widgets/header/ui/Header';

export const ReportsPage = () => {
  const reports = [
    { month: 'Січень', delivered: 234, inProgress: 45, delayed: 8 },
    { month: 'Лютий', delivered: 289, inProgress: 32, delayed: 5 },
    { month: 'Березень', delivered: 312, inProgress: 28, delayed: 3 },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#e5e9f0]">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="relative flex-1 h-full overflow-hidden p-6">
          <div className="bg-white rounded-lg shadow-md p-6 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Логістичні звіти</h1>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                <div className="text-sm font-semibold text-purple-600 mb-2">Всього перевезено</div>
                <div className="text-4xl font-bold text-slate-900">835</div>
                <div className="text-xs text-slate-600 mt-2">за останні 3 місяці</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 border border-indigo-200">
                <div className="text-sm font-semibold text-indigo-600 mb-2">Середня актуальність</div>
                <div className="text-4xl font-bold text-slate-900">98%</div>
                <div className="text-xs text-slate-600 mt-2">без затримок</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-6 border border-cyan-200">
                <div className="text-sm font-semibold text-cyan-600 mb-2">Ефективність мережі</div>
                <div className="text-4xl font-bold text-slate-900">94%</div>
                <div className="text-xs text-slate-600 mt-2">використання потужностей</div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Статистика за місяцями</h2>
              <table className="w-full">
                <thead className="bg-slate-100 border-b-2 border-slate-300">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Місяць</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Доставлено</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">В процесі</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">З затримками</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">{report.month}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">{report.delivered}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">{report.inProgress}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">{report.delayed}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
