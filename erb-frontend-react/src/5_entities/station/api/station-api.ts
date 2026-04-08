import { apiClient } from '@/6_shared/api/api-client';
import type { RailwayGraph, Edge } from '../model/type';

interface Station {
  stationId: string;
  name: string;
  lat: number;
  lng: number;
}

interface RawRailwayData {
  stations: Station[];
  edges: Edge[];
}

export const stationApi = {
  async getStations(): Promise<RailwayGraph> {
    try {
      console.log('📡 Fetching stations from API...');
      const response = await apiClient.get<RawRailwayData>('/stations');
      
      // Создаём мап для преобразования ID в имена
      const idToName: Record<string, string> = {};
      response.data.stations?.forEach((station: Station) => {
        if (station.stationId) {
          idToName[station.stationId] = station.name;
        }
      });
      
      // Преобразуем edges - заменяем ID на имена
      const transformedEdges: Edge[] = (response.data.edges || []).map((edge: Edge) => ({
        from: idToName[edge.from] || edge.from,
        to: idToName[edge.to] || edge.to,
        distanceKm: edge.distanceKm
      }));
      
      const result: RailwayGraph = {
        stations: response.data.stations || [],
        edges: transformedEdges
      };
      
      console.log('✅ Stations API Response:', result);
      console.log('📊 Graph details:', {
        stationsCount: result.stations?.length,
        edgesCount: result.edges?.length,
        firstStation: result.stations?.[0],
        firstEdge: result.edges?.[0]
      });
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching stations:', error);
      throw error; 
    }
  },
};