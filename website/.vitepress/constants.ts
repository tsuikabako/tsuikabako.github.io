// Where the repository lives. Every page reads these, so a move is one edit here.
export const ORG = "tsuikabako";
// this website's own address (canonical links, the sitemap, link previews)
export const SITE_URL = `https://${ORG}.github.io/`;
export const INDEX_URL = `https://raw.githubusercontent.com/${ORG}/extensions/main/index.min.json`;
export const SOURCE_REPO = `https://github.com/${ORG}/extensions-source`;
export const OUTPUT_REPO = `https://github.com/${ORG}/extensions`;
export const APP_REPO = "https://github.com/kurobayomi/kurobayomi";
// the app's own website (its download page), where a visitor without the app gets it
export const APP_SITE = "https://kurobayomi.github.io/";
// the app's own link: it opens the app's add dialog with the address filled in, and the user confirms
export const ADD_LINK = `kurobayomi://add-repo?url=${encodeURIComponent(INDEX_URL)}`;
