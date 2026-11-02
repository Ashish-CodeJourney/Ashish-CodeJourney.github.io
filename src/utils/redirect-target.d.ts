export function safeDestination(options: {
  readonly url: string | null;
  readonly allowed: ReadonlyArray<string>;
}): string;
