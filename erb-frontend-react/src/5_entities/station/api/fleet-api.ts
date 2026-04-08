import { apiClient } from '@/6_shared/api/api-client';
import type { FleetStatusBucketLike, FleetStatusLike } from '@/6_shared/lib/utils';
import { normalizeWagons, type Wagon } from '@/5_entities/wagon/type';

export interface FleetStatusSummary extends FleetStatusLike {
  totalWagons: number;
  byType: Record<string, Required<FleetStatusBucketLike>>;
  avgEmptyRunKmToday: number | null;
  wagons: Wagon[];
}

const toCount = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : 0;
};

const normalizeFleetBucket = (stats?: FleetStatusBucketLike): Required<FleetStatusBucketLike> => {
  const emptyMoving = toCount(stats?.emptyMoving);
  const idle = toCount(stats?.idle);
  const loaded = toCount(stats?.loaded);
  const maintenance = toCount(stats?.maintenance);
  const total = toCount(stats?.total) || emptyMoving + idle + loaded + maintenance;

  return {
    emptyMoving,
    idle,
    loaded,
    maintenance,
    total,
  };
};

const toStatusBucketKey = (status: string): keyof FleetStatusBucketLike => {
  const normalized = status.toLowerCase().replace(/[^a-z]/g, '');

  if (normalized.includes('load')) return 'loaded';
  if (normalized.includes('maint')) return 'maintenance';
  if (
    normalized.includes('move') ||
    normalized.includes('transit') ||
    normalized.includes('dispatch') ||
    normalized.includes('travel')
  ) {
    return 'emptyMoving';
  }

  return 'idle';
};

const deriveByTypeFromWagons = (wagons: Wagon[]): Record<string, Required<FleetStatusBucketLike>> => {
  const bucketByType = new Map<string, Required<FleetStatusBucketLike>>();

  wagons.forEach((wagon) => {
    const type = wagon.type || 'unknown';
    const statusBucket = toStatusBucketKey(wagon.status);
    const current =
      bucketByType.get(type) ||
      normalizeFleetBucket({
        emptyMoving: 0,
        idle: 0,
        loaded: 0,
        maintenance: 0,
        total: 0,
      });

    current[statusBucket] = toCount(current[statusBucket]) + 1;
    current.total = toCount(current.total) + 1;
    bucketByType.set(type, current);
  });

  return Object.fromEntries(bucketByType.entries());
};

const normalizeFleetStatus = (rawData: unknown): FleetStatusSummary => {
  const raw = (rawData || {}) as FleetStatusLike;
  const wagons = normalizeWagons(rawData);
  const normalizedByTypeEntries = Object.entries(raw.byType || {}).map(
    ([type, stats]) => [type, normalizeFleetBucket(stats)] as const
  );
  const normalizedByType = Object.fromEntries(normalizedByTypeEntries);
  const byType = Object.keys(normalizedByType).length > 0 ? normalizedByType : deriveByTypeFromWagons(wagons);
  const byTypeEntries = Object.entries(byType);

  const totalWagons =
    toCount(raw.totalWagons) ||
    (wagons.length > 0 ? wagons.length : byTypeEntries.reduce((sum, [, stats]) => sum + stats.total, 0));

  return {
    totalWagons,
    byType,
    avgEmptyRunKmToday: Number.isFinite(Number(raw.avgEmptyRunKmToday))
      ? Number(raw.avgEmptyRunKmToday)
      : null,
    wagons,
  };
};

export const fleetApi = {
  async getFleetStatus(): Promise<FleetStatusSummary> {
    try {
      const response = await apiClient.get<unknown>('/wagons');
      const fleetStatus = normalizeFleetStatus(response.data);
      console.log('✅ Fleet status received:', fleetStatus.totalWagons);
      return fleetStatus;
    } catch (error) {
      console.warn('⚠️ Error fetching /wagons, fallback to /fleet/status:', error);

      try {
        const response = await apiClient.get<unknown>('/fleet/status');
        const fleetStatus = normalizeFleetStatus(response.data);
        return fleetStatus;
      } catch (fallbackError) {
        console.error('❌ Error fetching fleet status:', fallbackError);
        return {
          totalWagons: 0,
          byType: {},
          avgEmptyRunKmToday: null,
          wagons: [],
        };
      }
    }
  },
};