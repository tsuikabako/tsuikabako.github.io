import { defineConfig } from "vitepress";
import { ORG, SOURCE_REPO } from "./constants";

export default defineConfig({
  title: "Tsuikabako",
  description: "Sources for Kurobayomi, the anime and manga app for Linux and Windows.",
  lang: "en",
  cleanUrls: true,
  lastUpdated: false,
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Add", link: "/add" },
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
            { text: "Madara sites", link: "/make/madara" },
            { text: "Plug-ins", link: "/make/plugin" },
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
