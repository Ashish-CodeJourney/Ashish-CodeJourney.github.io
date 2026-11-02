export type Essay = {
  readonly href: string;
  readonly title: string;
  readonly date: string;
};

export type YearGroup<T extends Essay> = { readonly year: string; readonly essays: ReadonlyArray<T> };

export function groupByYear<T extends Essay>(essays: ReadonlyArray<T>): YearGroup<T>[];

export function neighbours<T extends Essay>(options: {
  readonly essays: ReadonlyArray<T>;
  readonly href: string;
}): { readonly older: T | undefined; readonly newer: T | undefined };
