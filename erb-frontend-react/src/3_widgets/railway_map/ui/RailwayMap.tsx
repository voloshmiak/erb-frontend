// import React from 'react';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '@/6_shared/model/store';
import { summarizeFleetStatus } from '@/6_shared/lib/utils';
import { MapController } from './MapController';
import 'leaflet/dist/leaflet.css';

const UKRAINE_BOUNDS = L.latLngBounds([
  [40.75, 22.0],
  [52.35, 40.25],
]);

const WAGON_LABEL_MIN_ZOOM = 9.5;

type StationCategory = 'freightStations' | 'sortingStations' | 'portStations' | 'borderStations';

const STATION_LABELS: Record<StationCategory, string> = {
  freightStations: 'Вантажна станція',
  sortingStations: 'Сортувальна станція',
  portStations: 'Портова станція',
  borderStations: 'Прикордонна станція',
};

const STATION_TYPE_TO_CATEGORY: Record<string, StationCategory> = {
  // real backend types
  freight: 'freightStations',
  sorting: 'sortingStations',
  port: 'portStations',
  border: 'borderStations',
};

const STATION_TYPE_COLORS: Record<string, string> = {
  freight: '#14b8a6',
  sorting: '#f59e0b',
  port: '#002e7e',
  border: '#ef4444',
};

const normalizeTypeKey = (rawType?: string): string =>
  (rawType || '')
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
    .trim();

const normalizeEntityId = (value: unknown): string => String(value || '').trim().toLowerCase();

const getStationEntityId = (station: { stationId?: string }): string => {
  const primary = normalizeEntityId(station.stationId);
  if (primary) return primary;

  const fallback = normalizeEntityId((station as unknown as Record<string, unknown>).id);
  return fallback;
};

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const createStationWagonLabelIcon = (total: number, byTypeText: string) =>
  L.divIcon({
    className: 'station-wagon-label-icon',
    html: `
      <div style="
        min-width: 90px;
        max-width: 180px;
        padding: 3px 6px;
        border-radius: 8px;
        border: 1px solid rgba(148,163,184,.45);
        background: rgba(255,255,255,.96);
        box-shadow: 0 2px 8px rgba(15,23,42,.16);
        text-align: center;
        line-height: 1.15;
        pointer-events: none;
      ">
        <div style="font-size:11px;font-weight:800;color:#0f172a;white-space:nowrap;">${total} ваг.</div>
        <div style="font-size:10px;color:#475569;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(byTypeText)}</div>
      </div>
    `,
    iconSize: [120, 34],
    iconAnchor: [60, 44],
  });

const normalizeStationCategory = (rawType?: string): StationCategory => {
  const typeKey = normalizeTypeKey(rawType);
  return STATION_TYPE_TO_CATEGORY[typeKey] || 'freightStations';
};

const getStationTypeColor = (rawType?: string): string => {
  const typeKey = normalizeTypeKey(rawType);
  return STATION_TYPE_COLORS[typeKey] || '#94a3b8';
};

const getStationTypeLabel = (rawType?: string): string => {
  if (!rawType) return STATION_LABELS.freightStations;

  const typeKey = normalizeTypeKey(rawType);
  if (typeKey in STATION_TYPE_TO_CATEGORY) {
    return STATION_LABELS[STATION_TYPE_TO_CATEGORY[typeKey]];
  }

  const normalized = normalizeStationCategory(rawType);
  const cleanRaw = rawType
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanRaw) return STATION_LABELS[normalized];

  return cleanRaw
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

// 1. Іконка для СТАНЦІЇ
const createStationIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="station-pulse" style="--station-color: ${color}; border: 2px solid #ffffff;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const createSelectedStationIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon selected-station-icon',
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="position:absolute; inset:0; border-radius:9999px; border:2px solid ${color}; box-shadow:0 0 14px ${color}; opacity:0.45;"></div>
        <div class="station-pulse" style="--station-color: ${color}; border: 2px solid #ffffff; position:absolute; top:4px; left:4px;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Компонент для мягкой ограниченности границ
function DragLimitComponent() {
  const map = useMap();

  useEffect(() => {
    map.setMaxBounds(UKRAINE_BOUNDS);

    // Додаткова перевірка під час переміщення
    const onDragEnd = () => {
      const center = map.getCenter();
      if (!UKRAINE_BOUNDS.contains(center)) {
        const newLat = Math.max(
          UKRAINE_BOUNDS.getSouth(),
          Math.min(UKRAINE_BOUNDS.getNorth(), center.lat)
        );
        const newLng = Math.max(
          UKRAINE_BOUNDS.getWest(),
          Math.min(UKRAINE_BOUNDS.getEast(), center.lng)
        );
        map.setView([newLat, newLng], map.getZoom(), { animate: false });
      }
    };

    map.on('dragend', onDragEnd);

    return () => {
      map.off('dragend', onDragEnd);
    };
  }, [map]);

  return null;
}

function ZoomWatcher({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

export const RailwayMap = () => {
  const { graph, fleetStatus, wagons, isLoading, filters, selectedStation, setSelectedStation, setSelectedWagon, isTerrainEnabled } = useMapStore();
  const fleetSummary = summarizeFleetStatus(fleetStatus);
  const [currentZoom, setCurrentZoom] = useState(6);
  const showStationWagonLabels = currentZoom >= WAGON_LABEL_MIN_ZOOM;

  const mapLayer = isTerrainEnabled
    ? {
        key: 'terrain',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors, SRTM | OpenTopoMap',
      }
    : {
        key: 'light',
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; CARTO',
      };

  useEffect(() => {
    console.log('🗺️ Graph loaded:', graph);
    console.log('📊 Edges count:', graph?.edges?.length || 0);
  }, [graph]);

  const visibleStations = graph
    ? graph.stations.filter((station) => {
        const matchesFilter = filters[normalizeStationCategory(station.type)];
        return matchesFilter;
      })
    : [];

  const visibleStationNames = new Set(visibleStations.map((s) => s.name));
  const stationMatchKeyToName = visibleStations.reduce<Record<string, string>>((acc, station) => {
    const stationId = getStationEntityId(station);
    const stationNameKey = normalizeEntityId(station.name);

    if (stationId) acc[stationId] = station.name;
    if (stationNameKey) acc[stationNameKey] = station.name;
    return acc;
  }, {});

  const visibleEdges = graph
    ? graph.edges.filter((edge) => visibleStationNames.has(edge.from) && visibleStationNames.has(edge.to))
    : [];

  const statusToFilterKey = (status: string): keyof typeof filters => {
    const normalized = status.toLowerCase();

    if (normalized.includes('load')) return 'loadingWagons';
    if (
      normalized.includes('move') ||
      normalized.includes('transit') ||
      normalized.includes('dispatch') ||
      normalized.includes('travel')
    ) {
      return 'movingWagons';
    }

    return 'stationaryWagons';
  };

  const formatTypeLabel = (value: string): string => {
    const cleaned = String(value || 'unknown').trim();
    if (!cleaned) return 'unknown';
    return cleaned;
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900 text-blue-400">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-mono text-sm uppercase tracking-widest">Завантаження...</p>
      </div>
    );
  }

  if (!graph || graph.stations.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-500">
        <p>Дані недоступні</p>
      </div>
    );
  }

  // Словник координат
  const coordsMap: Record<string, [number, number]> = {};
  visibleStations.forEach(s => {
    coordsMap[s.name] = [s.lat, s.lng];
  });

  const visibleWagons = wagons
    .filter((wagon) => {
      const stationKey = normalizeEntityId(wagon.currentStationId);
      if (!stationKey) return false;
      const matchedStationName = stationMatchKeyToName[stationKey];
      if (!matchedStationName) return false;
      const filterKey = statusToFilterKey(wagon.status || '');
      return Boolean(filters[filterKey]);
    });

  const wagonsByStation = visibleWagons
    .reduce<Record<string, { total: number; byType: Record<string, number> }>>((acc, wagon) => {
      const stationKey = normalizeEntityId(wagon.currentStationId);
      if (!stationKey) return acc;
      const stationName = stationMatchKeyToName[stationKey];
      if (!stationName) return acc;

      if (!acc[stationName]) {
        acc[stationName] = { total: 0, byType: {} };
      }

      const typeKey = formatTypeLabel(wagon.type);
      acc[stationName].total += 1;
      acc[stationName].byType[typeKey] = (acc[stationName].byType[typeKey] || 0) + 1;
      return acc;
    }, {});

  const stationTypeCounts = {
    freight: graph.stations.filter((s) => normalizeTypeKey(s.type) === 'freight').length,
    sorting: graph.stations.filter((s) => normalizeTypeKey(s.type) === 'sorting').length,
    port: graph.stations.filter((s) => normalizeTypeKey(s.type) === 'port').length,
    border: graph.stations.filter((s) => normalizeTypeKey(s.type) === 'border').length,
  };

  return (
    <div className="h-full w-full relative overflow-hidden">
      <MapContainer 
        center={[48.3794, 31.1656]} 
        zoom={6} 
        className="h-full w-full railway-map-canvas" 
        zoomControl={false}
        maxBounds={UKRAINE_BOUNDS}
        maxBoundsViscosity={1.0}
        dragging={true}
        touchZoom={true}
        keyboard={true}
        scrollWheelZoom={true}
        minZoom={5}
        maxZoom={12}
      >
        <TileLayer
          key={mapLayer.key}
          url={mapLayer.url}
          attribution={mapLayer.attribution}
          noWrap={true}
        />
        <ZoomControl position="bottomright" />

        <DragLimitComponent />
        <ZoomWatcher onZoomChange={setCurrentZoom} />
        <MapController />

        {/* РЕНДЕР ЛІНІЙ */}
        {visibleEdges.length > 0 && visibleEdges.map((edge, idx) => {
          const start = coordsMap[edge.from];
          const end = coordsMap[edge.to];
          if (!start || !end) {
            return null;
          }

          return (
            <Polyline 
              key={`edge-${idx}`} 
              positions={[start, end]} 
              color="#002e7e" 
              weight={1.4} 
              opacity={0.75}
              lineCap="round"
              lineJoin="round"
              interactive={false}
            />
          );
        })}

        {/* РЕНДЕР СТАНЦІЙ */}
        {visibleStations.map((station) => {
          const stationTypeLabel = getStationTypeLabel(station.type);
          const stationColor = getStationTypeColor(station.type);
          const isSelected = selectedStation?.name === station.name;
          const stationWagons = wagonsByStation[station.name];
          const byTypeEntries = Object.entries(stationWagons?.byType || {}).sort((a, b) => b[1] - a[1]);
          const byTypeText = byTypeEntries.length > 0
            ? byTypeEntries.map(([type, count]) => `${type}: ${count}`).join(' • ')
            : 'типи відсутні';
          const showLabel = showStationWagonLabels;

          return (
            <>
              <Marker
                key={station.name}
                position={[station.lat, station.lng]}
                icon={isSelected ? createSelectedStationIcon(stationColor) : createStationIcon(stationColor)}
                eventHandlers={{
                  click: () => {
                    setSelectedStation(station);
                    setSelectedWagon(null);
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                  <div className="text-xs leading-tight">
                    <p className="font-bold text-slate-800">{station.name}</p>
                    <p className="text-slate-500">{stationTypeLabel}</p>
                  </div>
                </Tooltip>
              </Marker>

              {showLabel && (
                <Marker
                  key={`${station.name}-wagon-label`}
                  position={[station.lat, station.lng]}
                  icon={createStationWagonLabelIcon(stationWagons?.total || 0, byTypeText)}
                  interactive={false}
                  keyboard={false}
                />
              )}
            </>
          );
        })}

      </MapContainer>

      {/* ЛЕГЕНДА */}
      <div className="absolute bottom-6 right-6 z-[401] pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-slate-200 text-xs font-medium text-slate-600 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATION_TYPE_COLORS.freight, boxShadow: `0 0 5px ${STATION_TYPE_COLORS.freight}` }} /> 
            <span>Вантажні ({stationTypeCounts.freight})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATION_TYPE_COLORS.sorting, boxShadow: `0 0 5px ${STATION_TYPE_COLORS.sorting}` }} /> 
            <span>Сортувальні ({stationTypeCounts.sorting})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATION_TYPE_COLORS.port, boxShadow: `0 0 5px ${STATION_TYPE_COLORS.port}` }} /> 
            <span>Портові ({stationTypeCounts.port})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATION_TYPE_COLORS.border, boxShadow: `0 0 5px ${STATION_TYPE_COLORS.border}` }} /> 
            <span>Прикордонні ({stationTypeCounts.border})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-400" /> 
            <span>Залізничний шлях ({visibleEdges.length})</span>
          </div>
          <div className="pt-2 mt-2 border-t border-slate-100 space-y-1.5 text-slate-700">
            <div className="flex items-center justify-between gap-4">
              <span>Парк</span>
              <span className="font-semibold text-slate-900">{fleetSummary.totalWagons}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-slate-500">
              <span>У русі</span>
              <span className="font-medium text-blue-700">{fleetSummary.moving}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-slate-500">
              <span>На завантаженні</span>
              <span className="font-medium text-amber-600">{fleetSummary.loading}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-slate-500">
              <span>Стоять / обслуговування</span>
              <span className="font-medium text-rose-600">{fleetSummary.stationary}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-slate-500">
              <span>Відображено вагонів</span>
              <span className="font-medium text-slate-700">{visibleWagons.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};