import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export const htmlFilesIn = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries.filter((entry) => entry.isFile() && entry.name.endsWith('.html')).map((entry) => join(entry.parentPath, entry.name));
};
