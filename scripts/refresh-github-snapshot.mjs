import { readFile, writeFile } from 'node:fs/promises';
import github from '../src/utils/github.js';
import { parseOssFile, listedRepos } from '../src/utils/featured.js';

const SNAPSHOT_PATH = new URL('../src/data/github-snapshot.json', import.meta.url);

const OSS_FILE_PATH = new URL('../content/oss.json', import.meta.url);

const readOssFile = async () => {
  try {
    return JSON.parse(await readFile(OSS_FILE_PATH, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
};

const repos = listedRepos(parseOssFile(await readOssFile()));

const failures = [];

const data = await github.loadOssData({
  fetchJson: (url) => github.fetchJsonWithRetry(url, { fetch, token: process.env.GITHUB_TOKEN }),
  repos,
  snapshot: { repos: [] },
  warn: (message) => failures.push(message),
});

if (failures.length > 0) {
  console.error(`Snapshot not written: ${failures.join('; ')}`);
  process.exitCode = 1;
} else {
  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Wrote ${data.repos.length} repositories to src/data/github-snapshot.json`);
}
