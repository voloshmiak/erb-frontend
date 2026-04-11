export interface Station {
  stationId?: string;
  name: string;
  lat: number;
  lng: number;
  type?: string;
}

export interface Edge {
  from: string;
  to: string;
  distanceKm: number;
}

export interface RailwayGraph {
  stations: Station[];
  edges: Edge[];
}