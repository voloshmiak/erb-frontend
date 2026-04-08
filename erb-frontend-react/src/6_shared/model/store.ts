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

const resolveEventMessage = (type: EventType, payload: Record<string, unknown>, fulfilledOrderId?: string | null): string => {
  switch (type) {
    case 'orderCreated': {
      const client = String(payload.clientName || '').trim();
      const qty = Number(payload.quantity) || 0;
      const wType = String(payload.wagonType || '').trim();
      return `${client || 'Клієнт'}: ${qty} × ${wType || 'вагон'}`;
    }
    case 'assignmentCreated': {
      const km = Number(payload.EmptyRunKM) || 0;
      const eta = payload.EstimatedArrival ? new Date(String(payload.EstimatedArrival)).toLocaleDateString('uk-UA') : '';
      return `Маршрут ${km}км${eta ? `, ETA ${eta}` : ''}`;
    }
    case 'wagonDispatched': {
      const status = String(payload.Status || '').trim();
      return `Вагон відправлено${status ? ` (${status})` : ''}`;
    }
    case 'wagonMoved': {
      const num = String(payload.wagonNumber || '').trim();
      const station = String(payload.stationName || '').trim();
      const step = Number(payload.stepIndex) || 0;
      const total = Number(payload.totalSteps) || 0;
      return `${num || 'Вагон'} → ${station || '...'}${total ? ` [${step}/${total}]` : ''}`;
    }
    case 'wagonArrived': {
      const wId = String(payload.wagonId || '').trim();
      return `${wId ? wId.slice(0, 8) : 'Вагон'} прибув на станцію`;
    }
    case 'orderFulfilled': {
      const oId = fulfilledOrderId || String(payload.orderId || payload.id || '').trim();
      return `Замовлення ${oId ? oId.slice(0, 8) : ''} виконано`;
    }
    case 'wagonUnloaded': {
      const num = String(payload.number || '').trim();
      const wType = String(payload.type || '').trim();
      return `${num || 'Вагон'} розвантажено${wType ? ` (${wType})` : ''}`;
    }
    default:
      return 'Системна подія';
  }
};

let abortController: AbortController | null = null;

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

interface ActiveRoute {
  wagonId: string;
  wagonNumber: string;
  points: [number, number][];
}

export interface StationAnimation {
  orderId: string;
  stationId: string;
  lat: number;
  lng: number;
  type: 'orderCreated' | 'orderFulfilled';
  createdAt: number;
}

interface MapState {
  graph: RailwayGraph | null;
  fleetStatus: FleetStatusSummary | null;
  wagons: Wagon[];
  selectedWagon: Wagon | null;
  eventLog: MapEvent[];
  unreadCount: number;
  activeRoutes: Record<string, ActiveRoute>;
  stationAnimations: Record<string, StationAnimation>;
  orderStationMap: Record<string, string>; // orderId -> stationId
  isLoading: boolean;
  isTerrainEnabled: boolean;
  filters: MapFilters;
  selectedStation: Station | null;
  searchQuery: string;
  stationSearchQuery: string;
  mapCenterTarget: { lat: number; lng: number; zoom?: number; requestId: number } | null;

  fetchGraph: () => Promise<void>;
  fetchFleet: () => Promise<void>;
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

const WAGON_EVENTS = new Set<EventType>(['wagonMoved', 'wagonArrived', 'wagonDispatched', 'wagonUnloaded']);

export const useMapStore = create<MapState>((set, get) => ({
  graph: null,
  fleetStatus: null,
  wagons: [],
  selectedWagon: null,
  eventLog: [],
  unreadCount: 0,
  activeRoutes: {},
  stationAnimations: {},
  orderStationMap: {},
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
    if (abortController) return;

    const baseUrl = String(apiClient.defaults.baseURL || '').replace(/\/$/, '');
    if (!baseUrl) return;

    abortController = new AbortController();

    const processLine = (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>;
        const type = normalizeEventType(parsed.type || parsed.eventType);
        if (!type) return;

        // orderFulfilled має data як рядок (orderId), решта — об'єкт
        const rawData = parsed.data;
        const payload = (rawData && typeof rawData === 'object'
          ? rawData
          : parsed) as Record<string, unknown>;
        const orderFulfilledId = (type === 'orderFulfilled' && typeof rawData === 'string') ? rawData : null;

        const timestampRaw = payload.arrivedAt || payload.EstimatedArrival || payload.createdAt || payload.lastUnloadTime;
        const timestamp = timestampRaw ? new Date(String(timestampRaw)) : new Date();

        const eventId = orderFulfilledId
          || String(payload.ID || payload.id || payload.assignmentId || `${Date.now()}-${Math.random()}`);

        const mapEvent: MapEvent = {
          id: eventId,
          type,
          message: resolveEventMessage(type, payload, orderFulfilledId),
          timestamp: Number.isNaN(timestamp.getTime()) ? new Date() : timestamp,
        };

        set((state) => {
          const newState: Partial<MapState> = {
            eventLog: [mapEvent, ...state.eventLog].slice(0, 50),
            unreadCount: state.unreadCount + 1,
          };

          // Побудова активних маршрутів
          // wagonDispatched: Go default keys — WagonID
          // wagonMoved: json tags — wagonId, wagonNumber
          // wagonArrived: json tags — wagonId
          // wagonUnloaded: full Wagon — id, number
          const wagonId = String(payload.wagonId || payload.WagonID || payload.id || '').trim();
          const wagonNumber = String(payload.wagonNumber || payload.number || '').trim();
          const lat = Number(payload.lat);
          const lng = Number(payload.lng);

          if (type === 'wagonDispatched' && wagonId) {
            newState.activeRoutes = {
              ...state.activeRoutes,
              [wagonId]: { wagonId, wagonNumber: wagonNumber || wagonId, points: [] },
            };
          }

          if (type === 'wagonMoved' && wagonId && Number.isFinite(lat) && Number.isFinite(lng)) {
            const existing = state.activeRoutes[wagonId];
            newState.activeRoutes = {
              ...state.activeRoutes,
              [wagonId]: {
                wagonId,
                wagonNumber: wagonNumber || existing?.wagonNumber || wagonId,
                points: [...(existing?.points || []), [lat, lng]],
              },
            };
          }

          if ((type === 'wagonArrived' || type === 'wagonUnloaded') && wagonId) {
            const { [wagonId]: _, ...rest } = state.activeRoutes;
            newState.activeRoutes = rest;
          }

          // orderCreated — анімація на станції призначення
          if (type === 'orderCreated') {
            const stationToId = String(payload.stationToId || '').trim();
            const orderId = String(payload.id || payload.ID || '').trim();
            if (stationToId && orderId) {
              const targetStation = state.graph?.stations.find(
                (s) => String(s.stationId || '').trim() === stationToId
              );
              if (targetStation) {
                newState.stationAnimations = {
                  ...state.stationAnimations,
                  [orderId]: {
                    orderId,
                    stationId: stationToId,
                    lat: targetStation.lat,
                    lng: targetStation.lng,
                    type: 'orderCreated',
                    createdAt: Date.now(),
                  },
                };
                newState.orderStationMap = { ...state.orderStationMap, [orderId]: stationToId };
              }
            }
          }

          // orderFulfilled — замінити анімацію на "виконано"
          if (type === 'orderFulfilled') {
            const fulfilledOrderId = orderFulfilledId || String(payload.orderId || payload.OrderID || payload.id || '').trim();
            const stationToId = state.orderStationMap[fulfilledOrderId];
            if (fulfilledOrderId && stationToId) {
              const targetStation = state.graph?.stations.find(
                (s) => String(s.stationId || '').trim() === stationToId
              );
              if (targetStation) {
                newState.stationAnimations = {
                  ...state.stationAnimations,
                  [fulfilledOrderId]: {
                    orderId: fulfilledOrderId,
                    stationId: stationToId,
                    lat: targetStation.lat,
                    lng: targetStation.lng,
                    type: 'orderFulfilled',
                    createdAt: Date.now(),
                  },
                };
              }
            }
          }

          return newState;
        });

        if (WAGON_EVENTS.has(type)) {
          get().fetchFleet();
        }
      } catch {
        // не JSON рядок — пропускаємо
      }
    };

    (async () => {
      try {
        const response = await fetch(`${baseUrl}/events/stream`, {
          signal: abortController!.signal,
        });

        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            processLine(line);
          }
        }

        // обробити залишок буфера
        if (buffer.trim()) processLine(buffer);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('❌ Event stream error:', error);
        }
      }
    })();
  },

  disconnectEventStream: () => {
    if (!abortController) return;
    abortController.abort();
    abortController = null;
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