export type Period = { readonly start: string; readonly end?: string };

export function formatPeriod(period: Period): string;
export function byNewestStart(a: Period, b: Period): number;
export function formatFileSize(bytes: number): string;
