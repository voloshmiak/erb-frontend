import { X, Flag, Train, Package, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

interface ViewShipmentPanelProps {
  order: any | null;
  onClose: () => void;
}

export const ViewShipmentPanel = ({ order, onClose }: ViewShipmentPanelProps) => {
  if (!order) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity animate-in fade-in" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 w-full max-w-112.5 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-[#f8fafc]">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Деталі маніфесту</div>
            <h2 className="text-xl font-black text-[#0f2e5a]">{order.id}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-800 bg-white shadow-sm border border-slate-200"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 rounded-bl-3xl z-0"></div>
             <div className="flex items-center gap-2 mb-6 relative z-10">
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                order.status === 'У дорозі' ? 'bg-blue-100 text-[#0052cc]' : 
                order.status === 'Очікує' ? 'bg-orange-100 text-[#b24d00]' : 
                order.status === 'Підтверджено' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-slate-200 text-slate-600'
                  }`}>
                  {order.status}
              </span>
               <span className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Оновлено 10 хв тому</span>
             </div>
             <div className="relative z-10 pl-2">
               <div className="absolute left-2.75 top-3.5 bottom-3.5 w-0.5 bg-slate-200"></div>
               <div className="flex gap-4 mb-6 relative">
                 <div className="w-6 h-6 rounded-full bg-white border-2 border-[#0052cc] flex items-center justify-center relative z-10 mt-0.5"><div className="w-2 h-2 rounded-full bg-[#0052cc]"></div></div>
                 <div><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Відправлення</div><div className="text-base font-bold text-slate-900">{order.from}</div></div>
               </div>
               <div className="flex gap-4 relative">
                 <div className="w-6 h-6 rounded-full bg-white border-2 border-[#b24d00] flex items-center justify-center relative z-10 mt-0.5"><Flag className="w-3 h-3 text-[#b24d00]" /></div>
                 <div><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Призначення</div><div className="text-base font-bold text-slate-900">{order.to}</div></div>
               </div>
             </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-slate-400" /> Специфікація вантажу</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Тип вантажу</div>
                <div className="text-sm font-semibold text-slate-900">{order.type}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Орієнт. вага</div>
                <div className="text-sm font-semibold text-slate-900">120.5 Тонн</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400" /> Історія переміщення</h3>
            <div className="space-y-4 pl-2">
              <div className="flex gap-4 relative">
                <div className="absolute left-2.75 top-6 -bottom-5 w-0.5 bg-slate-200"></div>
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center relative z-10 shrink-0"><CheckCircle2 className="w-4 h-4" /></div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Запит подано</div>
                  <div className="text-xs text-slate-500 mt-0.5">23 Жов, 14:00 • Диспетчерський центр УЗ</div>
                </div>
              </div>
              <div className="flex gap-4 relative">
                <div className="w-6 h-6 rounded-full bg-[#0052cc] text-white flex items-center justify-center relative z-10 shrink-0 shadow-md shadow-blue-500/20 animate-pulse"><Train className="w-3 h-3" /></div>
                <div>
                  <div className="text-sm font-bold text-[#0052cc]">Активне транспортування</div>
                  <div className="text-xs font-medium text-slate-600 mt-0.5">Рухається до станції призначення</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm">Переглянути документацію <ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </>
  );
};