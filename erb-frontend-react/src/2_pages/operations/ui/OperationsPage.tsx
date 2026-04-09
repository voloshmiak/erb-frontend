import { Sidebar } from '@/3_widgets/sidebar/ui/Sidebar';
import { Header } from '@/3_widgets/header/ui/Header';

export const OperationsPage = () => {
  const operations = [
    { id: 'op_1', wagon: 'вагон_1', from: 'Київ', to: 'Харків', status: 'в дорозі', progress: 65, eta: '2:30' },
    { id: 'op_2', wagon: 'вагон_2', from: 'Харків', to: 'Одеса', status: 'завантажується', progress: 30, eta: '1:45' },
    { id: 'op_3', wagon: 'вагон_3', from: 'Львів', to: 'Київ', status: 'в дорозі', progress: 45, eta: '4:00' },
    { id: 'op_4', wagon: 'вагон_4', from: 'Одеса', to: 'Харків', status: 'розвантажується', progress: 85, eta: '0:30' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#e5e9f0]">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="relative flex-1 h-full overflow-hidden p-6">
          <div className="bg-white rounded-lg shadow-md p-6 h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Операції наживо</h1>
            
            <div className="space-y-4">
              {operations.map((op) => (
                <div key={op.id} className="border-2 rounded-lg p-5" style={{ borderColor: '#002e7e' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900" style={{ color: '#002e7e' }}>{op.wagon}</h3>
                      <p className="text-sm text-slate-600">{op.from} → {op.to}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        op.status === 'в дорозі' ? 'bg-blue-100 text-blue-700' :
                        op.status === 'завантажується' ? 'bg-yellow-100 text-yellow-700' :
                        op.status === 'розвантажується' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {op.status}
                      </span>
                      <p className="text-sm text-slate-600 mt-2">Залишилось: {op.eta}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Прогрес</span>
                      <span className="font-semibold" style={{ color: '#002e7e' }}>{op.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-300"
                        style={{ width: `${op.progress}%`, backgroundColor: '#002e7e' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
