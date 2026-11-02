import type { Repo } from './github.js';

export type FeaturedEntry = {
  readonly repo?: string;
  readonly name?: string;
  readonly url?: string;
  readonly description?: string;
  readonly role: string;
  readonly summary?: string;
};

export type FeaturedProject = {
  readonly key: string;
  readonly owner: string | null;
  readonly name: string;
  readonly url: string | null;
  readonly description: string | null;
  readonly role: string;
  readonly summary: string | null;
};

export type NotableEntry = {
  readonly name: string;
  readonly repo: string;
  readonly url?: string;
  readonly description?: string;
  readonly showStars?: boolean;
};

export type NotableProject = {
  readonly key: string;
  readonly name: string;
  readonly url: string;
  readonly description: string | null;
  readonly stars: number | null;
};

export type OssFile = {
  readonly ownProjects: ReadonlyArray<FeaturedEntry>;
  readonly contributions: ReadonlyArray<FeaturedEntry>;
  readonly notable: ReadonlyArray<NotableEntry>;
};

export function parseOssFile(raw: unknown): OssFile;

export function listedRepos(file: OssFile): string[];

export function featuredProjects(options: {
  readonly entries: ReadonlyArray<FeaturedEntry>;
  readonly repos: ReadonlyArray<Repo>;
}): FeaturedProject[];

export function notableProjects(options: {
  readonly entries: ReadonlyArray<NotableEntry>;
  readonly repos: ReadonlyArray<Repo>;
}): NotableProject[];

export function firstSentence(text: string): string;

export function formatStars(count: number): string;

export function starsLabel(count: number): string;

export function contributingLede(counts: { readonly core: number; readonly notable: number }): string | null;
