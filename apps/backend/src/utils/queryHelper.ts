import type { ParsedQs } from 'qs';
import { MediaType } from '../generated/client.js';
import AppError from './AppError.js';

export function asSingleString(
  value: string | ParsedQs | (string | ParsedQs)[] | undefined,
): string | undefined {
  if (typeof value === 'string') return value;
  return undefined; // 陣列或 nested object 一律視為不合法,不硬轉
}

function isMediaType(value: unknown): value is MediaType {
  return (
    typeof value === 'string' &&
    Object.values(MediaType).includes(value as MediaType)
  );
}

export function parseMediaType(
  value: string | undefined,
): MediaType | undefined {
  if (value === undefined) return undefined;
  if (!isMediaType(value)) {
    throw new AppError(`Invalid media type: ${value}`, 400);
  }
  return value;
}

export function parsePositiveInt(
  value: string | undefined,
  defaultValue: number,
): number {
  if (value === undefined) return defaultValue;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return defaultValue;
  return Math.max(1, parsed);
}
