import { create } from 'zustand';
import type { RailwayGraph, Station } from '@/5_entities/station/model/type';
import { stationApi } from '@/5_entities/station/api/station-api';
import { fleetApi, type FleetStatusSummary } from '@/5_entities/station/api/fleet-api';
import type { Wagon } from '@/5_entities/wagon/type';
import { apiClient } from '@/6_shared/api/api-client';

export type EventType = "orderCreated" | "wagonMoved" | "wagonArrived" | "assignmentCreated" | "wagonDispatched" | "orderFulfilled" | "wagonUnloaded";

const EVENT_TYPES: EventType[] = [
  'orderCreated',
  'wagonMoved',
  'wagonArrived',
  'assignmentCreated',
  'wagonDispatched',
  'orderFulfilled',
  'wagonUnloaded',
];

const EVENT_TYPES_SET = new Set<string>(EVENT_TYPES);

const normalizeEventType = (value: unknown): EventType | null => {
  const normalized = String(value || '').trim();
  return EVENT_TYPES_SET.has(normalized) ? (normalized as EventType) : null;
};

const resolveEventMessage = (type: EventType, payload: Record<string, unknown>): string => {
  const fromStation = String(payload.fromStation || payload.from || payload.fromStationName || '').trim();
  const toStation = String(payload.toStation || payload.to || payload.toStationName || '').trim();
  const wagonId = String(payload.wagonId || payload.wagon || payload.assetId || '').trim();
  const orderId = String(payload.orderId || payload.order || '').trim();
  const explicitMessage = String(payload.message || '').trim();

  if (explicitMessage) return explicitMessage;

  switch (type) {
    case 'wagonMoved':
      return `Вагон ${wagonId || 'N/A'} перемістився ${fromStation || 'невідомо звідки'} → ${toStation || 'невідомо куди'}`;
    case 'wagonArrived':
      return `Вагон ${wagonId || 'N/A'} прибув на станцію ${toStation || 'призначення'}`;
    case 'wagonDispatched':
      return `Вагон ${wagonId || 'N/A'} почав рух зі станції ${fromStation || 'відправлення'}`;
    case 'wagonUnloaded':
      return `Вагон ${wagonId || 'N/A'} розвантажено, готовий до наступного транзиту`;
    case 'orderCreated':
      return `Створено нове замовлення ${orderId || ''}`.trim();
    case 'assignmentCreated':
      return `Маршрут прокладено для замовлення ${orderId || ''}`.trim();
    case 'orderFulfilled':
      return `Замовлення ${orderId || ''} виконано: усі одиниці прибули`.trim();
    default:
      return 'Отримано подію системи';
  }
};

let eventSource: EventSource | null = null;

interface MapEvent {
  id: string;
  type: EventType;
  message: string;
  timestamp: Date;
}

interface MapFilters {
  freightStations: boolean;
  sortingStations: boolean;
  portStations: boolean;
  borderStations: boolean;
  movingWagons: boolean;
  stationaryWagons: boolean;
  loadingWagons: boolean;
}

interface MapState {
  graph: RailwayGraph | null;
  fleetStatus: FleetStatusSummary | null;
  wagons: Wagon[];
  selectedWagon: Wagon | null;
  eventLog: MapEvent[]; // Лог для стрічки Live Feed
  isLoading: boolean;
  isTerrainEnabled: boolean;
  filters: MapFilters;
  selectedStation: Station | null;
  searchQuery: string;
  stationSearchQuery: string;
  mapCenterTarget: { lat: number; lng: number; zoom?: number; requestId: number } | null;

  fetchGraph: () => Promise<void>;
  fetchFleet: () => Promise<void>; // Оновлення агрегованого стану парку
  addEvent: (event: MapEvent) => void;
  setFilter: (key: keyof MapFilters, value: boolean) => void;
  setSelectedStation: (station: Station | null) => void;
  setSelectedWagon: (wagon: Wagon | null) => void;
  setSearchQuery: (query: string) => void;
  setStationSearchQuery: (query: string) => void;
  requestMapCenter: (lat: number, lng: number, zoom?: number) => void;
  toggleTerrain: () => void;
  connectEventStream: () => void;
  disconnectEventStream: () => void;
  resetFilters: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  graph: null,
  fleetStatus: null,
  wagons: [],
  selectedWagon: null,
  eventLog: [],
  isLoading: false,
  isTerrainEnabled: false,
  filters: {
    freightStations: true,
    sortingStations: true,
    portStations: true,
    borderStations: true,
    movingWagons: true,
    stationaryWagons: true,
    loadingWagons: true,
  },
  selectedStation: null,
  searchQuery: '',
  stationSearchQuery: '',
  mapCenterTarget: null,

  setFilter: (key, value) => set((state) => ({ 
    filters: { ...state.filters, [key]: value } 
  })),
  
  setSelectedStation: (station) => set({ selectedStation: station }),
  setSelectedWagon: (wagon) => set({ selectedWagon: wagon }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStationSearchQuery: (query) => set({ stationSearchQuery: query }),
  
  requestMapCenter: (lat, lng, zoom) =>
    set({
      mapCenterTarget: {
        lat,
        lng,
        zoom,
        requestId: Date.now(),
      },
    }),

  toggleTerrain: () =>
    set((state) => ({
      isTerrainEnabled: !state.isTerrainEnabled,
    })),
  
  resetFilters: () =>
    set({
      filters: {
        freightStations: true,
        sortingStations: true,
        portStations: true,
        borderStations: true,
        movingWagons: true,
        stationaryWagons: true,
        loadingWagons: true,
      },
      stationSearchQuery: '',
    }),

  connectEventStream: () => {
    if (eventSource) return;

    const baseUrl = String(apiClient.defaults.baseURL || '').replace(/\/$/, '');
    if (!baseUrl) return;

    eventSource = new EventSource(`${baseUrl}/events/stream`);

    eventSource.onmessage = (event) => {
      if (!event.data) return;

      try {
        const parsed = JSON.parse(event.data) as Record<string, unknown>;
        const type = normalizeEventType(parsed.type || parsed.eventType || parsed.event_type);
        if (!type) return;

        const timestampRaw = parsed.timestamp || parsed.createdAt || parsed.occurredAt;
        const timestamp = timestampRaw ? new Date(String(timestampRaw)) : new Date();

        const mapEvent: MapEvent = {
          id: String(parsed.id || parsed.eventId || `${Date.now()}-${Math.random()}`),
          type,
          message: resolveEventMessage(type, parsed),
          timestamp: Number.isNaN(timestamp.getTime()) ? new Date() : timestamp,
        };

        set((state) => ({
          eventLog: [mapEvent, ...state.eventLog].slice(0, 50),
        }));
      } catch (error) {
        console.warn('⚠️ Failed to parse SSE event payload:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE stream error:', error);
    };
  },

  disconnectEventStream: () => {
    if (!eventSource) return;
    eventSource.close();
    eventSource = null;
  },
  
  addEvent: (event) => set((state) => ({ 
    eventLog: [event, ...state.eventLog].slice(0, 50) // зберігаємо останні 50 подій
  })),

  fetchGraph: async () => {
    console.log('🚀 Starting fetchGraph...');
    set({ isLoading: true });
    try {
      const data = await stationApi.getStations();
      console.log('📦 Graph data received in store:', data);
      set({ graph: data, isLoading: false });
    } catch (error) { 
      console.error('❌ Store fetchGraph error:', error);
      set({ isLoading: false }); 
    }
  },

  fetchFleet: async () => {
    try {
      console.log('🚂 Starting fetchFleet...');
      const data = await fleetApi.getFleetStatus();
      console.log('📦 Fleet status received in store:', data);
      set({ fleetStatus: data, wagons: data.wagons || [] });
    } catch (error) { 
      console.error('❌ Store fetchFleet error:', error); 
    }
  },
}));