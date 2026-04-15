import type { OrderStatus } from '@/5_entities/order/model/types';
import type { BadgeVariant } from '@/6_shared/ui/pageStyles';

export type WagonUiStatus = 'в дорозі' | 'завантажується' | 'розвантажується' | 'технічне обслуговування' | 'припаркований' | 'очікує';
export type WagonOperationType = 'Завантаження' | 'Розвантаження' | 'Перевантаження';

export const mapWagonTypeToLabel = (type: string): string => {
  switch (String(type || '').toLowerCase()) {
    case 'gondola':
      return 'Напіввагон';
    case 'grain_hopper':
      return 'Зерновоз';
    case 'cement_hopper':
      return 'Цементовоз';
    default:
      return type;
  }
};

export const mapBackendOrderStatusToUi = (status: string): OrderStatus => {
  switch (String(status || '').toLowerCase()) {
    case 'pending':
      return 'Очікує';
    case 'matched':
      return 'Узгоджено';
    case 'fulfilled':
      return 'Виконано';
    case 'cancelled':
      return 'Скасовано';
    default:
      return 'Очікує';
  }
};

export const mapWagonStatusToUi = (status: string): WagonUiStatus => {
  const normalized = String(status || '').toLowerCase();
  if (
    normalized.includes('transit') || 
    normalized.includes('move') || 
    normalized.includes('dispatch') ||
    normalized.includes('in_train')
  ) return 'в дорозі';
  if (normalized.includes('load')) return 'завантажується';
  if (normalized.includes('unload')) return 'розвантажується';
  if (normalized.includes('maint')) return 'технічне обслуговування';
  if (normalized.includes('idle') || normalized.includes('park') || normalized.includes('stop')) return 'припаркований';
  return 'очікує';
};

export const wagonLoadFromStatus = (status: string): number => {
  const uiStatus = mapWagonStatusToUi(status);
  switch (uiStatus) {
    case 'завантажується':
      return 100;
    case 'в дорозі':
      return 70;
    case 'розвантажується':
      return 85;
    case 'технічне обслуговування':
      return 15;
    default:
      return 0;
  }
};

export const wagonProgressFromStatus = (status: string): number => {
  const uiStatus = mapWagonStatusToUi(status);
  switch (uiStatus) {
    case 'завантажується':
      return 35;
    case 'в дорозі':
      return 65;
    case 'розвантажується':
      return 90;
    default:
      return 10;
  }
};

export const wagonOperationTypeFromStatus = (status: string): WagonOperationType => {
  const uiStatus = mapWagonStatusToUi(status);
  if (uiStatus === 'завантажується') return 'Завантаження';
  if (uiStatus === 'розвантажується') return 'Розвантаження';
  return 'Перевантаження';
};

export const wagonStatusBadgeVariant = (status: string): BadgeVariant => {
  const uiStatus = mapWagonStatusToUi(status);
  switch (uiStatus) {
    case 'в дорозі':
      return 'primary';
    case 'завантажується':
      return 'warning';
    case 'розвантажується':
      return 'neutral';
    case 'очікує':
      return 'neutral';
    case 'технічне обслуговування':
      return 'danger';
    case 'припаркований':
      return 'success';
    default:
      return 'neutral';
  }
};

export const operationTypeBadgeVariant = (type: string): BadgeVariant => {
  switch (type) {
    case 'Завантаження':
      return 'warning';
    case 'Розвантаження':
      return 'success';
    case 'Перевантаження':
      return 'primary';
    default:
      return 'neutral';
  }
};
