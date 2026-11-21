import { defineConfig } from "vitepress";
import { ORG, SITE_URL, SOURCE_REPO } from "./constants";
import { seoHead, type Site } from "./seo";

const site: Site = {
  url: SITE_URL,
  name: "Tsuikabako",
  image: "/og-image.png",
  imageAlt: "Tsuikabako: sources for Kurobayomi",
};
// pages that only send the visitor elsewhere (add.md goes to the home page) stay out of the sitemap
const REDIRECTS = ["add"];

export default defineConfig({
  title: "Tsuikabako",
  description: "Sources for Kurobayomi, the anime and manga app for Linux and Windows.",
  lang: "en",
  cleanUrls: true,
  lastUpdated: false,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }],
    ["link", { rel: "apple-touch-icon", href: "/apple-touch-icon.png" }],
  ],
  sitemap: {
    hostname: SITE_URL,
    transformItems: (items) => items.filter((item) => !REDIRECTS.includes(item.url)),
  },
  transformHead: (ctx) => seoHead(site, ctx),
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      // adding the repository is the home page's hero (theme/HomeAdd.vue)
      { text: "Add", link: "/" },
      { text: "Sources", link: "/sources" },
      { text: "Make sources", link: "/make/" },
      { text: "Help", link: "/help" },
    ],
    sidebar: {
      "/make/": [
        {
          text: "Make sources",
          items: [
            { text: "How it works", link: "/make/" },
            { text: "Recipes", link: "/make/recipe" },
            { text: "Theme sites", link: "/make/madara" },
            { text: "Plug-ins", link: "/make/plugin" },
            { text: "Anime sources", link: "/make/anime" },
            { text: "What the app handles", link: "/make/app-help" },
            { text: "Your own repository", link: "/make/repository" },
            { text: "Reference", link: "/make/reference" },
          ],
        },
      ],
    },
    socialLinks: [{ icon: "github", link: `https://github.com/${ORG}` }],
    footer: {
      message: `Sources are community-made. Tsuikabako hosts no content; the <a href="${SOURCE_REPO}">source code</a> is Apache-2.0.`,
    },
  },
});
