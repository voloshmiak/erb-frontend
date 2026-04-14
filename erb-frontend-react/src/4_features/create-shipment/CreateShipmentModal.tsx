import { useEffect, useMemo, useState, useRef } from 'react';
import { orderService, type WagonType, type OrderType } from '../../5_entities/order/api/orderService'; 
import { X, Flag, Calendar, Info, ArrowRight, ChevronDown, User, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';
import { useMapStore } from '@/6_shared/model/store';

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateShipmentModal = ({ isOpen, onClose }: CreateShipmentModalProps) => {
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Стейти полів форми
  const [orderType, setOrderType] = useState<'external' | 'internal'>('external');
  const [clientName, setClientName] = useState('');
  const [cargoType, setCargoType] = useState<WagonType>('gondola');
  const [quantity, setQuantity] = useState(''); // Змінено з ваги на кількість вагонів
  
  // Стейти для розумного пошуку станцій
  const [destination, setDestination] = useState(''); // Зберігає ID
  const [destSearch, setDestSearch] = useState(''); // Зберігає текст
  const [isDestFocused, setIsDestFocused] = useState(false);

  const [date, setDate] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null); // Реф для нативного календаря
  
  // Страхування (поки що закоментовано в UI)
  const [insuranceOption, setInsuranceOption] = useState<'BASE' | 'FULL'>('BASE');

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

  // Обробка ручного вводу дати
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 8) val = val.substring(0, 8); 
    let formattedDate = val;
    if (val.length > 4) formattedDate = `${val.substring(0, 2)}/${val.substring(2, 4)}/${val.substring(4, 8)}`;
    else if (val.length > 2) formattedDate = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    setDate(formattedDate);
  };

  // Обробка вибору з нативного календаря
  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // Приходить у форматі YYYY-MM-DD
    if (!val) return;
    const [year, month, day] = val.split('-');
    setDate(`${day}/${month}/${year}`);
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

  const handleNext = (currentStep: number) => {
    // Валідація: вимагаємо назву компанії ТІЛЬКИ якщо це зовнішнє замовлення
    if (currentStep === 1 && orderType === 'external' && !clientName) return alert('Введіть назву компанії');
    if (currentStep === 3 && !destination) return alert('Оберіть станцію призначення зі списку');
    setActiveStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    if ((orderType === 'external' && !clientName) || !destination || !date) {
      alert('Будь ласка, заповніть всі обов\'язкові поля.');
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
        // Якщо внутрішнє - відправляємо заглушку, інакше реальну назву
        clientName: orderType === 'internal' ? 'Службове (Укрзалізниця)' : clientName,
        desiredDate: apiDate,
        quantity: parseInt(quantity) || 1, // Відправляємо кількість вагонів
        stationToId: destination,
        wagonType: cargoType,
        type: orderType,
      });

      // Очищення форми
      setOrderType('external'); setClientName(''); setQuantity('');
      setDestination(''); setDestSearch('');
      setDate(''); setInsuranceOption('BASE');
      setActiveStep(1);
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

  const StepHeader = ({ stepNum, title, summary }: { stepNum: number, title: string, summary?: string }) => {
    const isActive = activeStep === stepNum;
    const isPassed = activeStep > stepNum;
    
    return (
      <div 
        className={`flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer ${isActive ? 'bg-[#0f2e5a] text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'}`}
        onClick={() => setActiveStep(stepNum)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isActive ? 'bg-white text-[#0f2e5a]' : isPassed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
            {isPassed ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
          </div>
          <div>
            <h3 className={`font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
            {isPassed && summary && <p className={`text-xs mt-0.5 ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>{summary}</p>}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isActive ? 'rotate-180 text-white/70' : 'text-slate-400'}`} />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-237.5 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-8 py-6 flex justify-between items-start border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-[#0f2e5a]">Оформлення перевезення</h2>
            <p className="text-sm text-slate-500 mt-1">Пройдіть 4 кроки для створення заявки в системі.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col lg:flex-row gap-8 bg-slate-50/50">
          
          {/* ЛІВА ЧАСТИНА */}
          <div className="flex-1 space-y-4">
            
            {/* КРОК 1: Замовник */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <StepHeader
                stepNum={1}
                title="Деталі замовника"
                summary={orderType === 'internal' ? 'Службове замовлення УЗ' : (clientName || 'Не вказано')}
              />
              {activeStep === 1 && (
                <div className="p-6 border-t border-slate-100 animate-in slide-in-from-top-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Тип замовлення</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                    <button
                      onClick={() => setOrderType('external')}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all flex justify-center items-center gap-2 ${orderType === 'external' ? 'text-[#0052cc] bg-white shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200'}`}
                    >
                      <Building2 className="w-4 h-4" /> ПРИВАТНА КОМПАНІЯ
                    </button>
                    <button
                      onClick={() => setOrderType('internal')}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all flex justify-center items-center gap-2 ${orderType === 'internal' ? 'text-emerald-700 bg-white shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200'}`}
                    >
                      <CheckCircle2 className="w-4 h-4" /> СЛУЖБОВЕ (УЗ)
                    </button>
                  </div>

                  {orderType === 'external' ? (
                    <div className="mb-6 animate-in fade-in">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Назва компанії <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Введіть назву компанії (ТОВ...)" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#0052cc]/20 outline-none" />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex gap-3 animate-in fade-in">
                      <Info className="w-5 h-5 text-emerald-600 shrink-0" />
                      <p className="text-sm text-emerald-800 font-medium leading-relaxed">Це внутрішнє замовлення для переміщення активів Укрзалізниці. Вводити назву компанії не потрібно.</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button onClick={() => handleNext(1)} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#0052cc] hover:bg-[#003b8e] transition-colors">Далі <ArrowRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>

            {/* КРОК 2: Вантаж */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <StepHeader stepNum={2} title="Характеристики вантажу" summary={cargoType === 'gondola' ? 'Напіввагон' : cargoType === 'grain_hopper' ? 'Зерновоз' : 'Цементовоз'} />
              {activeStep === 2 && (
                <div className="p-6 border-t border-slate-100 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Тип рухомого складу</label>
                      <div className="relative">
                        <select value={cargoType} onChange={(e) => setCargoType(e.target.value as WagonType)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium appearance-none focus:ring-2 focus:ring-[#0052cc]/20 outline-none cursor-pointer">
                          <option value="gondola">Напіввагон (Вугілля, руда, метал)</option>
                          <option value="grain_hopper">Зерновоз (Агропродукція)</option>
                          <option value="cement_hopper">Цементовоз (Будматеріали)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Кількість вагонів</label>
                      <input 
                        type="number" 
                        min="1"
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)} 
                        placeholder="напр. 5" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#0052cc]/20 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => handleNext(2)} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#0052cc] hover:bg-[#003b8e] transition-colors">Далі <ArrowRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>

            {/* КРОК 3: Маршрут (РОЗУМНИЙ ПОШУК) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <StepHeader stepNum={3} title="Маршрут прямування" summary={destSearch ? `До: ${destSearch}` : ''} />
              {activeStep === 3 && (
                <div className="p-6 border-t border-slate-100 animate-in slide-in-from-top-2">
                  <div className="space-y-6 mb-6">

                    {/* Станція призначення */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Станція призначення <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Flag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={destSearch}
                          onChange={(e) => {
                            setDestSearch(e.target.value);
                            setDestination(''); // Скидаємо ID
                          }}
                          onFocus={() => setIsDestFocused(true)}
                          onBlur={() => setIsDestFocused(false)}
                          placeholder="Почніть вводити назву..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#0052cc]/20 outline-none"
                        />
                        {/* Випадаючий список з підказками */}
                        {isDestFocused && destSearch && !destination && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                            {stations.filter(s => (s.name || '').toLowerCase().startsWith(destSearch.toLowerCase())).length > 0 ? (
                              stations.filter(s => (s.name || '').toLowerCase().startsWith(destSearch.toLowerCase())).map(s => (
                                <div
                                  key={`dest-${s.stationId || Math.random().toString()}`}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setDestination(s.stationId || ''); // ВИПРАВЛЕНО
                                    setDestSearch(s.name || '');
                                    setIsDestFocused(false);
                                  }}
                                  className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700 border-b border-slate-50 last:border-0"
                                >
                                  {s.name}
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-slate-500">Станцій не знайдено</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => handleNext(3)} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#0052cc] hover:bg-[#003b8e] transition-colors">Далі <ArrowRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>

            {/* КРОК 4: Графік */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <StepHeader stepNum={4} title="Графік та додаткові послуги" summary={date ? `Відправка: ${date}` : ''} />
              {activeStep === 4 && (
                <div className="p-6 border-t border-slate-100 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Дата відправлення <span className="text-red-500">*</span></label>
                      <div className="relative flex items-center">
                        <input 
                          type="text" 
                          value={date} 
                          onChange={handleDateChange} 
                          placeholder="дд/мм/рррр" 
                          maxLength={10} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-10 py-3 text-sm font-medium focus:ring-2 focus:ring-[#0052cc]/20 outline-none" 
                        />
                        {/* Кнопка календаря */}
                        <button 
                          type="button" 
                          onClick={() => dateInputRef.current?.showPicker()} 
                          className="absolute right-3 p-1 text-slate-400 hover:text-[#0052cc] transition-colors"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        {/* Прихований нативний інпут для відкриття пікера */}
                        <input 
                          type="date" 
                          ref={dateInputRef} 
                          onChange={handleNativeDateChange} 
                          className="absolute w-0 h-0 opacity-0 pointer-events-none" 
                        />
                      </div>
                    </div>
                    <div>
                      {/* ЗАКОМЕНТОВАНИЙ БЛОК СТРАХУВАННЯ */}
                      {/*
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Страхування вантажу</label>
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setInsuranceOption('BASE')} className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${insuranceOption === 'BASE' ? 'text-slate-700 bg-white shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200'}`}>БАЗОВЕ</button>
                        <button onClick={() => setInsuranceOption('FULL')} className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all flex justify-center items-center gap-1.5 ${insuranceOption === 'FULL' ? 'text-emerald-700 bg-emerald-50 shadow-sm border border-emerald-200' : 'text-slate-500 hover:bg-slate-200'}`}>
                          <ShieldCheck className="w-3.5 h-3.5" /> ПОВНЕ (1.5%)
                        </button>
                      </div>
                      */}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">Перевірте підсумок справа перед відправкою.</p>
                    <button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-bold text-white bg-[#003b8e] hover:bg-[#002f70] disabled:bg-slate-400 transition-colors shadow-md"
                    >
                      {isSubmitting ? 'Обробка...' : 'Підтвердити заявку'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ПРАВА ЧАСТИНА: ПІДСУМОК */}
          <div className="w-full lg:w-[320px] bg-white rounded-xl p-6 flex flex-col border border-slate-200 shadow-sm h-fit sticky top-0">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6">Попередній розрахунок</h4>
            
            <div className="space-y-4 text-sm font-medium border-b border-slate-100 pb-6 mb-6">
              <div className="flex justify-between text-slate-700">
                <span>Тариф за маршрут</span>
                <span>{orderType === 'internal' ? '₴0.00' : '₴1,240.00'}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Паливна надбавка</span>
                <span>{orderType === 'internal' ? '₴0.00' : '₴312.45'}</span>
              </div>
              {insuranceOption === 'FULL' && orderType === 'external' && (
                <div className="flex justify-between text-emerald-600 font-bold animate-in fade-in">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Повне страхування</span>
                  <span>+₴450.00</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-end mb-6">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Орієнтовна вартість</span>
              <span className="text-2xl font-black text-[#0f2e5a]">
                {orderType === 'internal' ? 'СЛУЖБОВЕ' : (insuranceOption === 'FULL' ? '₴2,002.45' : '₴1,552.45')}
              </span>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#0052cc] uppercase tracking-widest mb-2">
                <Info className="w-3 h-3" /> До відома
              </div>
              <p className="text-xs text-blue-900 leading-relaxed">
                {orderType === 'internal' ? 'Службові перевезення не тарифікуються.' : 'Остаточна вартість формується після затвердження заявки диспетчером УЗ.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};