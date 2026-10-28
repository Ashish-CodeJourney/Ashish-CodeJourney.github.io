const DEVTO_API = 'https://dev.to/api';

export const DEVTO_USERNAME = 'ashish-codejourney';

export const DEVTO_OVERRIDES = {
  4311008: 'astro-7-satteri-silent-bugs',
  4271844: 'oracle-cloud-free-vps-from-india',
  4158532: 'dot-files-two-years-later',
  3959643: 'oss-mumbai-2026',
  3234721: 'using-google-sheets-as-a-cms',
  3053198: 'the-ai-testing-paradox',
  2976353: 'my-hacktoberfest-2025-journey',
  2721435: 'crafting-code-with-intent',
  2085860: 'mastering-junit-techniques',
  1953878: 'the-hidden-dangers-of-programming',
  1944662: 'why-beginners-fail-coding-tests',
  1925560: 'functional-programming-meets-tdd',
  1903677: 'does-test-driven-development-weaken-debugging-skills',
  1900100: 'dotfiles-the-developer-secret-to-the-perfect-setup',
  1894274: 'webhooks-the-secret-sauce',
  1894271: 'renaming-bugs-as-unwritten-test-cases',
};

const normaliseTitle = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const slugFromPath = (path) => path.split('/').filter(Boolean).pop();

export const toPostEntry = (article, body, id = slugFromPath(article.path)) => ({
  id,
  data: {
    title: article.title,
    date: article.published_at.slice(0, 10),
    description: article.description,
    tags: article.tag_list,
    ...(article.cover_image ? { banner: article.cover_image } : {}),
  },
  body,
});

export const isPublishedLocally = (article, localEntries) => {
  const localIds = new Set(localEntries.map((entry) => entry.id));
  const localTitles = new Set(localEntries.map((entry) => normaliseTitle(entry.data.title)));

  return localIds.has(slugFromPath(article.path)) || localTitles.has(normaliseTitle(article.title));
};

const sleepFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchJsonWithRetry = async (url, { fetch, sleep = sleepFor, attempts = 4, delayMs = 2000 }) => {
  const response = await fetch(url);
  if (response.ok) {
    return response.json();
  }
  if (response.status === 429 && attempts > 1) {
    await sleep(delayMs);
    return fetchJsonWithRetry(url, { fetch, sleep, attempts: attempts - 1, delayMs: delayMs * 2 });
  }
  throw new Error(`${response.status} from ${url}`);
};

const mapArticle = (fetchJson) => async (article, overrides) => {
  const { body_markdown: body } = await fetchJson(`${DEVTO_API}/articles/${article.id}`);
  return toPostEntry(article, body, overrides[article.id] ?? slugFromPath(article.path));
};

const mapSequentially = (articles, mapOne, overrides) =>
  articles.reduce(
    async (previous, article) => [...(await previous), await mapOne(article, overrides)],
    Promise.resolve([]),
  );

export const loadDevtoEntries = async ({ username, fetchJson, localEntries, overrides, snapshot, warn }) => {
  try {
    const articles = await fetchJson(`${DEVTO_API}/articles?username=${username}&per_page=1000`);
    const fresh = articles.filter((article) => !isPublishedLocally(article, localEntries));

    return await mapSequentially(fresh, mapArticle(fetchJson), overrides);
  } catch (error) {
    warn(`dev.to articles skipped: ${error.message}`);
    return snapshot;
  }
};

export default { toPostEntry, isPublishedLocally, loadDevtoEntries, fetchJsonWithRetry };
