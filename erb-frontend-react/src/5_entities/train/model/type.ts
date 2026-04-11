export type TrainStatus = 'forming' | 'in_transit' | 'arrived';

export interface Train {
  id: string;
  wagonIds: string[];
  route: string[];
  stepIndex: number;
  sourceStationId: string;
  nextStationId: string;
  status: TrainStatus;
  createdAt: string;
  departedAt: string | null;
  arrivedAt: string | null;
}
