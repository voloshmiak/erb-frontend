import { useEffect, useMemo, useState } from 'react';
import { X, MapPin, Flag, Calendar, Info, Save, ArrowRight, ChevronDown, User, ShieldCheck } from 'lucide-react';
import { orderService, type WagonType, type OrderType } from '../../5_entities/order/api/orderService';
import { useMapStore } from '@/6_shared/model/store';

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateShipmentModal = ({ isOpen, onClose }: CreateShipmentModalProps) => {
  const [orderType, setOrderType] = useState<OrderType>('external');
  const [clientName, setClientName] = useState('');
  const [cargoType, setCargoType] = useState<WagonType>('gondola');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState('EXPRESS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { graph, fetchGraph } = useMapStore();

  useEffect(() => {
    if (!isOpen) return;
    fetchGraph();
  }, [isOpen, fetchGraph]);

  const stations = useMemo(
    () =>
      [...(graph?.stations || [])].sort((a, b) =>
        String(a.name || '').localeCompare(String(b.name || ''), 'uk-UA')
      ),
    [graph]
  );

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 8) val = val.substring(0, 8); 
    let formattedDate = val;
    if (val.length > 4) formattedDate = `${val.substring(0, 2)}/${val.substring(2, 4)}/${val.substring(4, 8)}`;
    else if (val.length > 2) formattedDate = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    setDate(formattedDate);
  };

  const toApiDate = (uiDate: string): string | null => {
    const trimmed = uiDate.trim();
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
    if (!match) return null;

    const [, dd, mm, yyyy] = match;
    const asDate = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
    if (Number.isNaN(asDate.getTime())) return null;

    return `${yyyy}-${mm}-${dd}`;
  };

   // Валідація та відправка даних на сервер
  const handleSubmit = async () => {
    if (!clientName || !destination || !date) {
      alert('Будь ласка, заповніть обов\'язкові поля: Компанія, Станція призначення та Дата.');
      return;
    }

    const apiDate = toApiDate(date);
    if (!apiDate) {
      alert('Некоректна дата. Використайте формат дд/мм/рррр.');
      return;
    }

    setIsSubmitting(true);

    try {
      await orderService.createOrder({
        clientName: orderType === 'internal' ? 'Internal' : clientName, 
        desiredDate: apiDate,
        quantity: 1, 
        stationToId: destination,
        wagonType: cargoType,
        type: orderType
      });
      
      setClientName(''); 
      setOrigin(''); 
      setDestination(''); 
      setDate('');
      onClose(); 
      
    } catch (error) { 
      const message = error instanceof Error ? error.message : 'Невідома помилка';
      alert(`Помилка при створенні запиту на сервері: ${message}`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-225 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-8 py-6 flex justify-between items-start relative">
          <div>
            <h2 className="text-2xl font-bold text-[#0f2e5a]">Новий запит на перевезення</h2>
            <p className="text-sm text-slate-500 mt-1">Ініціюйте нове транспортування вантажу через мережу УЗ.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#0052cc] text-white flex items-center justify-center text-xs font-bold">1</div>
                <h3 className="font-bold text-slate-900">Деталі вантажу та клієнта</h3>
              </div>

              <div className="pl-9 mb-6">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Тип замовлення</label>
                <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                  <button 
                    onClick={() => {
                      setOrderType('external');
                      if (clientName === 'Internal') setClientName('');
                    }} 
                    className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${orderType === 'external' ? 'text-[#0052cc] bg-white shadow-sm border border-[#0052cc]/20' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                    ЗОВНІШНЄ
                  </button>
                  <button 
                    onClick={() => {
                      setOrderType('internal');
                      setClientName('Internal');
                    }} 
                    className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${orderType === 'internal' ? 'text-[#0052cc] bg-white shadow-sm border border-[#0052cc]/20' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                    ВНУТРІШНЄ
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pl-9 mb-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Назва компанії / Замовник <span className="text-red-500">*</span></label>
                  <div className="relative">
                    {orderType === 'internal' ? (
                      <ShieldCheck className="w-4 h-4 text-[#0052cc] absolute left-3 top-1/2 -translate-y-1/2" />
                    ) : (
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    )}
                    <input 
                      type="text" 
                      value={orderType === 'internal' ? 'Внутрішня логістика (Internal)' : clientName} 
                      onChange={(e) => setClientName(e.target.value)} 
                      disabled={orderType === 'internal'}
                      placeholder={orderType === 'internal' ? '' : "Введіть назву компанії..."} 
                      className={`w-full border-none rounded-lg pl-10 pr-4 py-3 text-sm font-medium outline-none transition-colors ${orderType === 'internal' ? 'bg-blue-50 text-blue-900' : 'bg-slate-100 text-slate-700 focus:ring-2 focus:ring-[#0052cc]/20'}`} 
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-9">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Тип вантажу</label>
                  <div className="relative">
                    <select 
                      value={cargoType} 
                      onChange={(e) => setCargoType(e.target.value as WagonType)} 
                      className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-sm font-medium text-slate-700 appearance-none focus:ring-2 focus:ring-[#0052cc]/20 outline-none cursor-pointer"
                    >
                      <option value="gondola">Напіввагон (Вугілля, руда)</option>
                      <option value="grain_hopper">Зерновоз (Агропродукція)</option>
                      <option value="cement_hopper">Цементовоз (Будматеріали)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Загальна вага (Тонн)</label>
                  <input type="text" placeholder="0.00" className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#0052cc]/20 outline-none" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#0052cc] text-white flex items-center justify-center text-xs font-bold">2</div>
                <h3 className="font-bold text-slate-900">Маршрут та мережа</h3>
              </div>
              
              <div className="pl-9 flex gap-4">
                <div className="flex flex-col items-center pt-1.25 pb-11.25">
                  <div className="w-3 h-3 rounded-full border-2 border-[#0052cc] bg-white z-10"></div>
                  <div className="w-0.5 flex-1 border-l-2 border-dashed border-slate-300 my-1"></div>
                  <div className="w-3 h-3 rounded-full border-2 border-[#b24d00] bg-white z-10"></div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Станція відправлення</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-10 py-3 text-sm font-medium text-slate-700 appearance-none focus:ring-2 focus:ring-[#0052cc]/20 outline-none cursor-pointer"
                      >
                        <option value="">Оберіть станцію відправлення (опціонально)...</option>
                        {stations.map((station) => (
                          <option key={`origin-${station.stationId}`} value={station.stationId}>
                            {station.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Станція призначення <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Flag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-10 py-3 text-sm font-medium text-slate-700 appearance-none focus:ring-2 focus:ring-[#0052cc]/20 outline-none cursor-pointer"
                      >
                        <option value="">Оберіть станцію призначення...</option>
                        {stations.map((station) => (
                          <option key={station.stationId} value={station.stationId}>
                            {station.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#0052cc] text-white flex items-center justify-center text-xs font-bold">3</div>
                <h3 className="font-bold text-slate-900">Графік</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-9">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Дата відправлення <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={date} 
                      onChange={handleDateChange} 
                      placeholder="дд/мм/рррр" 
                      maxLength={10} 
                      className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#0052cc]/20 outline-none" 
                    />
                    <Calendar className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Пріоритет</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setPriority('STANDARD')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${priority === 'STANDARD' ? 'text-[#0052cc] bg-white shadow-sm border border-[#0052cc]/20' : 'text-slate-500 hover:bg-slate-200'}`}>СТАНДАРТ</button>
                    <button onClick={() => setPriority('EXPRESS')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${priority === 'EXPRESS' ? 'text-[#0052cc] bg-white shadow-sm border border-[#0052cc]/20' : 'text-slate-500 hover:bg-slate-200'}`}>ЕКСПРЕС</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[320px] bg-slate-50 rounded-xl p-6 flex flex-col border border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6">Підсумок запиту</h4>
            <div className="space-y-4 text-sm font-medium border-b border-slate-200 pb-6 mb-6">
              <div className="flex justify-between text-slate-700"><span>Збір за коридор</span><span>₴1,240.00</span></div>
              <div className="flex justify-between text-slate-700"><span>Паливний збір</span><span>₴312.45</span></div>
              <div className="flex justify-between text-[#0052cc] font-bold"><span>Пріоритетне обслуг.</span><span>{priority === 'EXPRESS' ? '+₴450.00' : '₴0.00'}</span></div>
            </div>
            <div className="flex justify-between items-end mb-6">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Орієнт. Разом</span>
              <span className="text-2xl font-black text-[#0052cc]">{priority === 'EXPRESS' ? '₴2,002.45' : '₴1,552.45'}</span>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#0052cc] uppercase tracking-widest mb-2"><Info className="w-3 h-3" /> Нотатка</div>
              <p className="text-xs text-blue-900 leading-relaxed">Цей маршрут використовує Північно-Південний коридор. Час у дорозі: <span className="font-bold">34 години</span>.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-8 py-4 flex justify-between items-center rounded-b-2xl">
          <button className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
            <Save className="w-4 h-4" /> Зберегти чорнетку
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
              Скасувати
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#003b8e] hover:bg-[#002f70] disabled:bg-slate-400 transition-colors shadow-md"
            >
              {isSubmitting ? 'Відправка...' : 'Створити запит'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};