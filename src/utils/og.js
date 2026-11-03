const NAME = 'Ashish Vaghela';

const SECTION_KICKERS = {
  technical: 'Technical',
  writings: 'Writing',
  speaking: 'Talk',
  projects: 'Project',
  sponsors: 'Sponsor',
};

const ENTITIES = { '&amp;': '&', '&#39;': "'", '&quot;': '"', '&lt;': '<', '&gt;': '>' };

const decode = (text) => text.replace(/&(amp|#39|quot|lt|gt);/g, (entity) => ENTITIES[entity]);

const withoutEmoji = (text) =>
  text.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').replace(/\s{2,}/g, ' ').trim();

const segmentsOf = (path) => path.split('/').filter(Boolean);

export const ogImagePath = (pathname) => {
  const segments = segmentsOf(pathname);
  return `/og/${segments.length === 0 ? 'index' : segments.join('/')}.png`;
};

export const ogCardFor = ({ path, title }) => {
  const segments = segmentsOf(path);
  if (segments.length === 0) return { kicker: 'Software engineer · Open source · Speaker', heading: NAME };

  const heading = withoutEmoji(decode(title.replace(` | ${NAME}`, '')));
  const kicker = segments.length > 1 ? SECTION_KICKERS[segments[0]] : undefined;
  return { kicker: kicker ?? NAME, heading };
};
