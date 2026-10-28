import { writeFile } from 'node:fs/promises';
import devto, { DEVTO_OVERRIDES, DEVTO_USERNAME } from '../src/utils/devto.js';

const SNAPSHOT_PATH = new URL('../src/data/devto-snapshot.json', import.meta.url);

const failures = [];

const entries = await devto.loadDevtoEntries({
  username: DEVTO_USERNAME,
  fetchJson: (url) => devto.fetchJsonWithRetry(url, { fetch }),
  localEntries: [],
  overrides: DEVTO_OVERRIDES,
  snapshot: [],
  warn: (message) => failures.push(message),
});

if (failures.length > 0) {
  console.error(`Snapshot not written: ${failures.join('; ')}`);
  process.exitCode = 1;
} else {
  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(entries, null, 2)}\n`);
  console.log(`Wrote ${entries.length} dev.to entries to src/data/devto-snapshot.json`);
}
