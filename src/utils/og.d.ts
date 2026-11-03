export type OgCard = { readonly kicker: string; readonly heading: string };
export function ogImagePath(pathname: string): string;
export function ogCardFor(page: { readonly path: string; readonly title: string }): OgCard;
