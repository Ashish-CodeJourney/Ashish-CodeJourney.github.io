export type ApiRepo = {
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  topics?: string[];
  pushed_at: string;
  fork: boolean;
  archived: boolean;
};

export type Repo = {
  readonly repo: string;
  readonly url: string;
  readonly description: string | null;
  readonly language: string | null;
  readonly stars: number;
  readonly topics: readonly string[];
  readonly pushedAt: string;
  readonly fork: boolean;
  readonly archived: boolean;
};

export type OssData = {
  readonly repos: readonly Repo[];
};

export type OssSnapshot = readonly unknown[] | { readonly repos?: readonly Repo[] };

export type FetchJson = (url: string) => Promise<unknown>;

export const GITHUB_USERNAME: string;

export const fetchJsonWithRetry: (
  url: string,
  options: {
    fetch: (url: string, init: { headers: Record<string, string> }) => Promise<Response>;
    token?: string;
    sleep?: (ms: number) => Promise<void>;
    attempts?: number;
    delayMs?: number;
  },
) => Promise<unknown>;

export const repoApiUrl: (repo: string) => string;

export const toRepo: (item: ApiRepo) => Repo;

export const linkForOwnRepo: (options: {
  readonly url: string;
  readonly projects: ReadonlyArray<{ readonly href: string; readonly github?: string }>;
}) => string;


export const normaliseSnapshot: (snapshot: OssSnapshot) => OssData;

export const loadOssData: (options: {
  readonly fetchJson: FetchJson;
  readonly repos: readonly string[];
  readonly snapshot: OssSnapshot;
  readonly warn: (message: string) => void;
}) => Promise<OssData>;

declare const github: {
  fetchJsonWithRetry: typeof fetchJsonWithRetry;
  repoApiUrl: typeof repoApiUrl;
  toRepo: typeof toRepo;
  linkForOwnRepo: typeof linkForOwnRepo;
  normaliseSnapshot: typeof normaliseSnapshot;
  loadOssData: typeof loadOssData;
};

export default github;
