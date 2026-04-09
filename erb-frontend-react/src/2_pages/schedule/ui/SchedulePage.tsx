import { Sidebar } from '@/3_widgets/sidebar/ui/Sidebar';
import { Header } from '@/3_widgets/header/ui/Header';

export const SchedulePage = () => {
  const schedule = [
    { id: 'sched_1', wagon: 'вагон_1', station: 'Київ', arrivalTime: '09:00', departureTime: '12:30', type: 'Завантаження' },
    { id: 'sched_2', wagon: 'вагон_1', station: 'Харків', arrivalTime: '14:15', departureTime: '16:45', type: 'Перевантаження' },
    { id: 'sched_3', wagon: 'вагон_2', station: 'Харків', arrivalTime: '08:30', departureTime: '11:00', type: 'Завантаження' },
    { id: 'sched_4', wagon: 'вагон_2', station: 'Одеса', arrivalTime: '18:00', departureTime: '20:30', type: 'Розвантаження' },
    { id: 'sched_5', wagon: 'вагон_3', station: 'Львів', arrivalTime: '10:00', departureTime: '13:00', type: 'Завантаження' },
    { id: 'sched_6', wagon: 'вагон_3', station: 'Київ', arrivalTime: '23:30', departureTime: '02:00', type: 'Розвантаження' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#e5e9f0]">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="relative flex-1 h-full overflow-hidden p-6">
          <div className="bg-white rounded-lg shadow-md p-6 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Розклад операцій</h1>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b-2" style={{ borderColor: '#002e7e' }}>
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Вагон</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Станція</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Тип операції</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Прибуття</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Відправлення</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900">Тривалість</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item, idx) => {
                    const [arr_h, arr_m] = item.arrivalTime.split(':').map(Number);
                    const [dep_h, dep_m] = item.departureTime.split(':').map(Number);
                    let duration = (dep_h * 60 + dep_m) - (arr_h * 60 + arr_m);
                    if (duration < 0) duration += 24 * 60;
                    const hours = Math.floor(duration / 60);
                    const minutes = duration % 60;

                    return (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-sm font-semibold" style={{ color: '#002e7e' }}>{item.wagon}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{item.station}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.type === 'Завантаження' ? 'bg-yellow-100 text-yellow-700' :
                            item.type === 'Розвантаження' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 font-medium">{item.arrivalTime}</td>
                        <td className="px-4 py-3 text-sm text-slate-700 font-medium">{item.departureTime}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{hours}г {minutes}хв</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
