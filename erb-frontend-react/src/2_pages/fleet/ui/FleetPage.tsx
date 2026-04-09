import { Sidebar } from '@/3_widgets/sidebar/ui/Sidebar';
import { Header } from '@/3_widgets/header/ui/Header';

export const FleetPage = () => {
  const fleetData = [
    { id: 'вагон_1', type: 'gondola', status: 'в дорозі', station: 'Київ', load: 85 },
    { id: 'вагон_2', type: 'grain_hopper', status: 'завантажується', station: 'Харків', load: 45 },
    { id: 'вагон_3', type: 'cement_hopper', status: 'припаркований', station: 'Одеса', load: 0 },
    { id: 'вагон_4', type: 'gondola', status: 'в дорозі', station: 'Львів', load: 92 },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#e5e9f0]">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="relative flex-1 h-full overflow-hidden p-6">
          <div className="bg-white rounded-lg shadow-md p-6 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Парк вагонів</h1>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b-2 border-slate-300">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">ID вагона</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Тип</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Статус</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Місцезнаходження</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Завантаженість</th>
                  </tr>
                </thead>
                <tbody>
                  {fleetData.map((wagon, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm text-slate-900">{wagon.id}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 capitalize">{wagon.type.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          wagon.status === 'в дорозі' ? 'bg-blue-100 text-blue-700' :
                          wagon.status === 'завантажується' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {wagon.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{wagon.station}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="w-32 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${wagon.load}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{wagon.load}%</span>
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
