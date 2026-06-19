export const SITE = {
  title: 'Ashish',
  description: "This is where I think out loud. You're welcome to listen.",
  author: 'Ashish Vaghela',
  email: 'vaghelaashish111@gmail.com',
  url: 'https://ashish-codejourney.github.io',
  ga: 'G-ERND4QRRN0',
  socials: {
    twitter: 'https://twitter.com/codejourney_',
    linkedin: 'https://linkedin.com/in/ashish-codejourney',
    instagram: 'https://instagram.com/heyyy_ashish',
    github: 'https://github.com/Ashish-CodeJourney',
  },
} as const;

// Configure the /links linktree page here — add, remove, or reorder entries freely.
export const LINKS = [
  { label: 'Website', username: 'ashish-codejourney.github.io', url: SITE.url, icon: 'website' },
  { label: 'LinkedIn', username: 'ashish-codejourney', url: SITE.socials.linkedin, icon: 'linkedin' },
  { label: 'X', username: '@codejourney_', url: SITE.socials.twitter, icon: 'x' },
  { label: 'Instagram', username: '@heyyy_ashish', url: SITE.socials.instagram, icon: 'instagram' },
  { label: 'Dev.to', username: '@Ashish-CodeJourney', url: 'https://dev.to/Ashish-CodeJourney', icon: 'devto' },
  { label: 'GitHub', username: '@Ashish-CodeJourney', url: SITE.socials.github, icon: 'github' },
] as const;
