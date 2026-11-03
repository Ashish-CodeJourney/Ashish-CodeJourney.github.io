export type CommunityRole = 'organiser' | 'maintainer' | 'volunteer' | 'mentor' | 'speaker' | 'contributor' | 'attendee';

export type CommunityEntry = {
  readonly title: string;
  readonly organisation: string;
  readonly role: CommunityRole;
  readonly date?: string;
  readonly endDate?: string;
  readonly location?: string;
  readonly url?: string;
  readonly description?: string;
  readonly order?: number;
  readonly note?: boolean;
  readonly communities?: ReadonlyArray<string>;
};

export type CommunityNote = {
  readonly communities: ReadonlyArray<string>;
  readonly description: string;
};

export type CommunityRow = {
  readonly title: string;
  readonly role: CommunityRole;
  readonly organisation: string;
  readonly start: string | null;
  readonly end: string | null;
  readonly location: string | null;
  readonly description: string | null;
  readonly href: string | null;
  readonly order: number | null;
};

export function monthYear(date: string): string;

export function communityRows(options: {
  readonly entries: ReadonlyArray<CommunityEntry>;
}): CommunityRow[];

export function describeWhen(row: Pick<CommunityRow, 'start' | 'end'>): string | null;

export function roleLine(row: CommunityRow): string | null;

export function communityNotes(entries: ReadonlyArray<CommunityEntry>): CommunityNote[];
