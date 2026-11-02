export type NecklacePiece = {
  readonly href: string;
  readonly title: string;
  readonly date: string;
  readonly kind: 'technical' | 'writing' | 'talk';
};

export type NecklaceLight = NecklacePiece & { readonly x: number; readonly y: number };

export function layoutNecklace(options: {
  readonly pieces: ReadonlyArray<NecklacePiece>;
  readonly width: number;
  readonly height: number;
}): NecklaceLight[];

export function promenadePath(options: { readonly width: number; readonly height: number }): string;

export type LampPost = { readonly x: number; readonly top: number; readonly bottom: number };

export function lampPosts(options: { readonly width: number; readonly height: number }): [LampPost, LampPost];
