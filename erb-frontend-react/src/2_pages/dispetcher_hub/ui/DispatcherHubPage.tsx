import { useEffect } from 'react';
import { useMapStore } from '@/6_shared/model/store';
import { RailwayMap } from '@/3_widgets/railway_map/ui/RailwayMap';
import { MapOverlay } from '@/3_widgets/map_overlay/ui/MapOverlay';
import { Sidebar } from '@/3_widgets/sidebar/ui/Sidebar';
import { Header } from '@/3_widgets/header/ui/Header';
import { StationDetails } from '@/3_widgets/station_details/ui/StationDetails';

export const DispatcherHubPage = () => {
  const { fetchGraph, fetchFleet, connectEventStream, disconnectEventStream } = useMapStore();

  useEffect(() => {
    // 1. Початкове завантаження
    fetchGraph();
    fetchFleet();
    connectEventStream();

    // 2. Оновлюємо агрегований стан парку без перезавантаження карти
    const interval = setInterval(() => {
      fetchFleet();
    }, 10000);

    return () => {
      clearInterval(interval);
      disconnectEventStream();
    };
  }, [fetchGraph, fetchFleet, connectEventStream, disconnectEventStream]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#e5e9f0]">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="relative flex-1 h-full overflow-hidden">
          <RailwayMap />
          <MapOverlay />
          <StationDetails />
        </main>
      </div>
    </div>
  );
};