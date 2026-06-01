import type { Unit } from './types'

export const DEFAULT_MIN_CLEARANCE_CM = 60

export function convertToCm(value: number, unit: Unit): number {
  return unit === 'm' ? value * 100 : value
}

export function validatePositiveNumber(value: unknown): boolean {
  return typeof value === 'number' && isFinite(value) && value > 0
}
