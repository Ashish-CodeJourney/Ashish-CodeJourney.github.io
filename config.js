const CONFIG = {
  site: {
    title: "Ashish",
    description: "Welcome to my personal slice of the internet. I'm Ashish, a developer who loves building things.",
    author: "Ashish",
    avatar: "assets/avatar.jpg",
    email: "vaghelaashish111@gmail.com",
    socials: {
      twitter: "https://twitter.com/codejourney_",
      linkedin: "https://linkedin.com/in/ashish-codejourney",
      instagram: "https://instagram.com/heyyy_ashish",
      github: "https://github.com/Ashish-CodeJourney",
    }
  },
  // Set enabled: false to hide a page from the navigation
  pages: {
    home: { enabled: true, label: "Home", path: "#/" },
    blogs: { enabled: true, label: "Blog", path: "#/blogs" },
    talks: { enabled: false, label: "Talks", path: "#/talks" },
    sponsors: { enabled: false, label: "Sponsors", path: "#/sponsors" },
    now: { enabled: true, label: "Now", path: "#/now" }
  },
  theme: "system" // "light", "dark", or "system"
};
