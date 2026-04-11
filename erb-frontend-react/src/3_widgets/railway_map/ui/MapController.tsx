import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useMapStore } from '@/6_shared/model/store';

export const MapController = () => {
  const map = useMap();
  const { searchQuery, graph, mapCenterTarget } = useMapStore();

  useEffect(() => {
    if (!searchQuery || !graph) return;
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return;

    const exactStation = graph.stations.find(
      (s) => s.name.toLowerCase() === normalizedQuery
    );

    const foundStation =
      exactStation || graph.stations.find((s) => s.name.toLowerCase().includes(normalizedQuery));

    if (foundStation) {
      map.flyTo([foundStation.lat, foundStation.lng], 12, {
        duration: 1.5,
        easeLinearity: 0.5,
      });
    }
  }, [searchQuery, graph, map]);

  useEffect(() => {
    if (!mapCenterTarget) return;

    map.flyTo([mapCenterTarget.lat, mapCenterTarget.lng], mapCenterTarget.zoom ?? 10, {
      duration: 1.2,
      easeLinearity: 0.35,
    });
  }, [mapCenterTarget, map]);

  return null; // Цей компонент нічого не рендерить, він лише керує картою
};