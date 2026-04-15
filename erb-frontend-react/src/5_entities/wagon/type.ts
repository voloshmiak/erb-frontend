export interface Wagon {
  id: string;
  number: string;
  type: string;
  status: 'idle' | 'moving' | 'loaded' | 'in_train' | string;
  currentStationId: string | null;
  lastUnloadTime: string | null;
  stateUntilHour: number | null;
}

export interface WagonsResponse {
  wagons?: unknown[];
}

const toText = (value: unknown): string => String(value || '').trim();

const toNullableText = (value: unknown): string | null => {
  const text = toText(value);
  return text.length > 0 ? text : null;
};

export const normalizeWagon = (raw: unknown): Wagon => {
  const source = (raw || {}) as Record<string, unknown>;

  const rawStateUntil = source.stateUntilHour;
  const stateUntilHour = rawStateUntil != null && Number.isFinite(Number(rawStateUntil))
    ? Number(rawStateUntil)
    : null;

  return {
    id: toText(source.id),
    number: toText(source.number),
    type: toText(source.type) || 'unknown',
    status: toText(source.status) || 'unknown',
    currentStationId: toNullableText(source.currentStationId),
    lastUnloadTime: toNullableText(source.lastUnloadTime),
    stateUntilHour,
  };
};

export const normalizeWagons = (raw: unknown): Wagon[] => {
  const source = (raw || {}) as WagonsResponse;
  const list = Array.isArray(source.wagons) ? source.wagons : [];

  return list
    .map(normalizeWagon)
    .filter((wagon) => wagon.id.length > 0 || wagon.number.length > 0);
};