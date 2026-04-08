import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export interface FleetStatusBucketLike {
  emptyMoving?: number;
  idle?: number;
  loaded?: number;
  maintenance?: number;
  total?: number;
}

export interface FleetStatusLike {
  totalWagons?: number;
  byType?: Record<string, FleetStatusBucketLike>;
  avgEmptyRunKmToday?: number | null;
}

export interface FleetStatusSummary {
  totalWagons: number;
  moving: number;
  loading: number;
  stationary: number;
  avgEmptyRunKmToday: number | null;
}

const toCount = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : 0;
}

export function summarizeFleetStatus(fleetStatus?: FleetStatusLike | null): FleetStatusSummary {
  const byType = fleetStatus?.byType || {};

  let totalWagons = toCount(fleetStatus?.totalWagons);
  let moving = 0;
  let loading = 0;
  let stationary = 0;

  Object.values(byType).forEach((stats) => {
    const movingCount = toCount(stats?.emptyMoving);
    const loadingCount = toCount(stats?.loaded);
    const stationaryCount = toCount(stats?.idle) + toCount(stats?.maintenance);

    moving += movingCount;
    loading += loadingCount;
    stationary += stationaryCount;

    if (!totalWagons) {
      totalWagons += movingCount + loadingCount + stationaryCount;
    }
  });

  if (!totalWagons) {
    totalWagons = moving + loading + stationary;
  }

  return {
    totalWagons,
    moving,
    loading,
    stationary,
    avgEmptyRunKmToday: Number.isFinite(Number(fleetStatus?.avgEmptyRunKmToday))
      ? Number(fleetStatus?.avgEmptyRunKmToday)
      : null,
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
