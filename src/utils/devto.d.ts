export type DevtoArticle = {
  id: number;
  title: string;
  description: string;
  published_at: string;
  path: string;
  tag_list: string[];
  cover_image: string | null;
};

export type DevtoEntry = {
  id: string;
  data: {
    title: string;
    date: string;
    description: string;
    tags: string[];
  };
  body: string;
};

export type LocalEntry = {
  id: string;
  data: Record<string, unknown>;
};

export type FetchJson = (url: string) => Promise<unknown>;

export const DEVTO_USERNAME: string;

export const DEVTO_OVERRIDES: Record<number, string>;

export const toPostEntry: (article: DevtoArticle, body: string, id?: string) => DevtoEntry;

export const isPublishedLocally: (article: DevtoArticle, localEntries: readonly LocalEntry[]) => boolean;

export const fetchJsonWithRetry: (
  url: string,
  options: {
    fetch: (url: string) => Promise<Response>;
    sleep?: (ms: number) => Promise<void>;
    attempts?: number;
    delayMs?: number;
  },
) => Promise<unknown>;

export const loadDevtoEntries: (options: {
  username: string;
  fetchJson: FetchJson;
  localEntries: readonly LocalEntry[];
  overrides: Record<number, string>;
  snapshot: readonly DevtoEntry[];
  warn: (message: string) => void;
}) => Promise<DevtoEntry[]>;

declare const devto: {
  toPostEntry: typeof toPostEntry;
  isPublishedLocally: typeof isPublishedLocally;
  loadDevtoEntries: typeof loadDevtoEntries;
  fetchJsonWithRetry: typeof fetchJsonWithRetry;
};

export default devto;
