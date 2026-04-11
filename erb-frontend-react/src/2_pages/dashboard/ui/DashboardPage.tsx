import { Sidebar } from '@/3_widgets/sidebar/ui/Sidebar';
import { Header } from '@/3_widgets/header/ui/Header';

export const DashboardPage = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#e5e9f0]">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="relative flex-1 h-full overflow-hidden p-6">
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Панель керування</h1>
            <div className="grid grid-cols-3 gap-6">
              <div 
                className="rounded-lg p-6 border-2 rounded-lg p-6"
                style={{
                  background: 'linear-gradient(to bottom right, rgba(0, 46, 126, 0.08), rgba(0, 46, 126, 0.15))',
                  borderColor: '#002e7e',
                }}
              >
                <div className="text-sm font-semibold mb-2" style={{ color: '#002e7e' }}>Активних вагонів</div>
                <div className="text-4xl font-bold text-slate-900">124</div>
                <div className="text-xs text-slate-600 mt-2">+12 від минулої години</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                <div className="text-sm font-semibold text-green-600 mb-2">Завершених замовлень</div>
                <div className="text-4xl font-bold text-slate-900">856</div>
                <div className="text-xs text-slate-600 mt-2">+45 сьогодні</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                <div className="text-sm font-semibold text-orange-600 mb-2">Станцій у роботі</div>
                <div className="text-4xl font-bold text-slate-900">28</div>
                <div className="text-xs text-slate-600 mt-2">всі активні</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
