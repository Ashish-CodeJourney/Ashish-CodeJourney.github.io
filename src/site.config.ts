import data from '../content/site.json';

export const SITE = {
  title: data.title,
  description: data.description,
  author: data.author,
  email: data.email,
  url: new URL(import.meta.env.SITE).origin,
  socials: data.socials,
} as const;

type LinkIconName = 'website' | 'linkedin' | 'x' | 'instagram' | 'devto' | 'github';

// Configure the /links linktree page in content/site.json — add, remove, or reorder entries freely.
export const LINKS = data.links as ReadonlyArray<{
  label: string;
  username: string;
  url: string;
  icon: LinkIconName;
}>;

export const RESUME_PDF = '/Ashish_Vaghela_Software_Engineer.pdf';
