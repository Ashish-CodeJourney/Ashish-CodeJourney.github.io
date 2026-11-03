export function inviteMailto(options: { readonly email: string; readonly subject: string }): string;

export function isPastEvent(options: { readonly date: string; readonly today: Date }): boolean;
