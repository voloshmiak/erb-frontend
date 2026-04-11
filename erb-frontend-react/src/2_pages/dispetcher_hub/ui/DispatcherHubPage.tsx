import { useEffect } from 'react';
import { useMapStore } from '@/6_shared/model/store';
import { RailwayMap } from '@/3_widgets/railway_map/ui/RailwayMap';
import { MapOverlay } from '@/3_widgets/map_overlay/ui/MapOverlay';
import { StationDetails } from '@/3_widgets/station_details/ui/StationDetails';
import { PageLayout } from '@/6_shared/ui/PageLayout';

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
    <PageLayout>
      <RailwayMap />
      <MapOverlay />
      <StationDetails />
    </PageLayout>
  );
};