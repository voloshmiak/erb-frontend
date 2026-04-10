export const CapacityOverview = ({ onManageClick }: { onManageClick?: () => void }) => {
  return (
    <div className="flex flex-col xl:flex-row gap-6">
      
      <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-lg text-slate-900 mb-6">Завантаженість регіонів</h3>
        
        <div className="flex flex-col md:flex-row gap-8 items-center">
          
          <div className="w-full md:w-2/3 h-62.5 bg-slate-100 rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-[#f8f9fa]">
              <iframe 
              src="/map.html" 
              className="w-full h-full border-none"
              title="Regional Network Map"
              scrolling="no" 
            />
            </div>
          </div>

          <div className="w-full md:w-1/3 space-y-6">
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-2">
                <span className="text-slate-700 uppercase tracking-widest">Північно-Західний</span>
                <span className="text-slate-900">82%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold mb-2">
                <span className="text-slate-700 uppercase tracking-widest">Центральний коридор</span>
                <span className="text-slate-900">96%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#b24d00] rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold mb-2">
                <span className="text-slate-700 uppercase tracking-widest">Південний маршрут</span>
                <span className="text-slate-900">45%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0052cc] rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full xl:w-[320px] bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 mb-1">Статус парку</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Локомотиви та вагони</p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <span className="text-4xl font-black text-slate-900 w-16">842</span>
              <span className="text-xs font-bold text-slate-500 leading-tight">ДОСТУПНІ<br/>ОДИНИЦІ</span>
            </div>
            
            <div className="flex items-center gap-5">
              <span className="text-4xl font-black text-slate-900 w-16">56</span>
              <span className="text-xs font-bold text-slate-500 leading-tight">НА ТЕХНІЧНОМУ<br/>ОБСЛУГОВУВАННІ</span>
            </div>
          </div>
        </div>

        <button 
          onClick={onManageClick} 
          className="w-full mt-8 py-3 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors bg-white shadow-sm"
        >
          Управління активами
        </button>
      </div>

    </div>
  );
};