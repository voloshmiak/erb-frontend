import { useMapStore } from '@/6_shared/model/store';
import { Crosshair, Layers3 } from 'lucide-react';

export const MapOverlay = () => {
  const {
    requestMapCenter,
    isTerrainEnabled,
    toggleTerrain,
  } = useMapStore();

  const handleCenterOnMyLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        requestMapCenter(position.coords.latitude, position.coords.longitude, 10);
      },
      (error) => {
        console.error('Failed to read user location:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 },
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-[1000]">
      <div />

      {/* НИЖНЯ ЧАСТИНА: Керування */}
      <div className="flex justify-between items-end pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          <button
            onClick={handleCenterOnMyLocation}
            className="group text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95" style={{ backgroundColor: '#002e7e' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#001f52'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#002e7e'}
          >
            <span className="flex items-center gap-2">
              <Crosshair size={16} className="transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
              <span>Центрувати на моїй локації</span>
            </span>
          </button>
          <button
            onClick={toggleTerrain}
            className={`group px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 ${
              isTerrainEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers3 size={16} className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
              <span>{isTerrainEnabled ? 'Рельєф: увімкнено' : 'Рельєф: вимкнено'}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};