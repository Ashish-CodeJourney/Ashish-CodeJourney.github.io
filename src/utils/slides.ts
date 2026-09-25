export function toEmbedSrc(url: string): string | null {
  if (!url.includes('docs.google.com/presentation')) return null;
  if (url.includes('/pub')) return url.replace('/pub?', '/pubembed?');
  return url.replace('/edit', '/embed').replace('/view', '/embed');
}

export function toThumbnailSrc(url: string | undefined): string | null {
  if (!url) return null;
  const embed = toEmbedSrc(url);
  if (!embed) return null;
  // Force first slide and minimal UI for thumbnail view
  // pubembed URLs already start at slide 1; append rm=minimal to hide controls where supported
  const hasQuery = embed.includes('?');
  const separator = hasQuery ? '&' : '?';
  // Use rm=minimal which hides navigation in embed mode; slide=id.p1 forces first slide
  // For pubembed we keep existing params and add rm=minimal
  if (embed.includes('pubembed')) {
    return `${embed}${separator}rm=minimal`;
  }
  return `${embed}${separator}rm=minimal&slide=id.p1`;
}
