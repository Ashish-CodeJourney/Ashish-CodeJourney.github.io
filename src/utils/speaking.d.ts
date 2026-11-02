export function topicsFromTalks(talks: ReadonlyArray<{ readonly tags: ReadonlyArray<string> }>): string[];

export function inviteMailto(options: { readonly email: string; readonly subject: string }): string;

export function isPastEvent(options: { readonly date: string; readonly today: Date }): boolean;
