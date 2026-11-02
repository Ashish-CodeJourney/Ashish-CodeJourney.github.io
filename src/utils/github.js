const GITHUB_API = 'https://api.github.com';

export const GITHUB_USERNAME = 'Ashish-CodeJourney';

const sleepFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const RETRYABLE = new Set([403, 429]);

const headersFor = (token) => ({
  Accept: 'application/vnd.github+json',
  'User-Agent': 'ashishvaghela.in-build',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const fetchJsonWithRetry = async (url, { fetch, token, sleep = sleepFor, attempts = 3, delayMs = 5000 }) => {
  const response = await fetch(url, { headers: headersFor(token) });
  if (response.ok) {
    return response.json();
  }
  if (RETRYABLE.has(response.status) && attempts > 1) {
    await sleep(delayMs);
    return fetchJsonWithRetry(url, { fetch, token, sleep, attempts: attempts - 1, delayMs: delayMs * 2 });
  }
  throw new Error(`${response.status} from ${url}`);
};

export const repoApiUrl = (repo) => `${GITHUB_API}/repos/${repo}`;

const plainText = (text) => {
  const plain = (text ?? '').replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim();
  return plain.length > 0 ? plain : null;
};

export const toRepo = (item) => ({
  repo: item.full_name,
  url: item.html_url,
  description: plainText(item.description),
  language: item.language ?? null,
  stars: item.stargazers_count,
  topics: item.topics ?? [],
  pushedAt: item.pushed_at.slice(0, 10),
  fork: item.fork,
  archived: item.archived,
});

const canonicalRepoUrl = (url) => url.trim().toLowerCase().replace(/\.git$/, '').replace(/\/+$/, '');

export const linkForOwnRepo = ({ url, projects }) => {
  const target = canonicalRepoUrl(url);
  const project = projects.find((item) => item.github && canonicalRepoUrl(item.github) === target);
  return project ? project.href : url;
};

export const normaliseSnapshot = (snapshot) => ({ repos: Array.isArray(snapshot) ? [] : (snapshot.repos ?? []) });

const fetchRepo = async (fetchJson, repo) => toRepo(await fetchJson(repoApiUrl(repo)));

export const loadOssData = async ({ fetchJson, repos, snapshot, warn }) => {
  try {
    return { repos: await Promise.all(repos.map((repo) => fetchRepo(fetchJson, repo))) };
  } catch (error) {
    warn(`GitHub repository details skipped: ${error.message}`);
    return normaliseSnapshot(snapshot);
  }
};

export default {
  fetchJsonWithRetry,
  repoApiUrl,
  toRepo,
  linkForOwnRepo,
  normaliseSnapshot,
  loadOssData,
};
