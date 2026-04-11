import { AlertOctagon } from 'lucide-react';

export const EmergencyAlertButton = () => {
  const handleAlert = () => {
    alert("⚠️ ТРИВОГУ АКТИВОВАНО! Сповіщаємо всі станції...");
  };

  return (
    <button 
      onClick={handleAlert}
      className="w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white py-3 px-4 rounded-lg font-bold transition-all shadow-lg active:scale-95"
    >
      <AlertOctagon size={18} />
      Тривожне сповіщення
    </button>
  );
};