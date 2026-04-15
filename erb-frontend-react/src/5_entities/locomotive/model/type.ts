export type LocomotiveStatus = 'idle' | 'in_transit' | 'maintenance' | string;

export interface Locomotive {
  id: string;
  number: string;
  status: LocomotiveStatus;
  currentStationId: string | null;
  trainId?: string | null;
  availableAt?: string | null;
  availableAtHour?: number | null;
}
