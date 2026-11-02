export type ArchivePost = {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly tags: ReadonlyArray<string>;
};

export type YearGroup<T extends ArchivePost> = { readonly year: string; readonly posts: T[] };

export type TagCount = { readonly tag: string; readonly count: number };

export type Heading = { readonly depth: number; readonly slug: string; readonly text: string };

export type TocEntry = Heading & { readonly children: TocEntry[] };

export function groupByYear<T extends ArchivePost>(posts: ReadonlyArray<T>): YearGroup<T>[];

export function tagCounts(options: { readonly posts: ReadonlyArray<ArchivePost>; readonly min: number }): TagCount[];

export function nestHeadings(headings: ReadonlyArray<Heading>): TocEntry[];

export function neighbours<T extends ArchivePost>(options: {
  readonly posts: ReadonlyArray<T>;
  readonly id: string;
}): { readonly older: T | undefined; readonly newer: T | undefined };
