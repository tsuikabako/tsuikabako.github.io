// Where the repository lives. Every page reads these, so a move is one edit here.
export const ORG = "tsuikabako";
export const INDEX_URL = `https://raw.githubusercontent.com/${ORG}/extensions/main/index.min.json`;
export const SOURCE_REPO = `https://github.com/${ORG}/extensions-source`;
export const OUTPUT_REPO = `https://github.com/${ORG}/extensions`;
export const APP_REPO = "https://github.com/kurobayomi/kurobayomi";
// the app's own link: it opens the app's add dialog with the address filled in, and the user confirms
export const ADD_LINK = `kurobayomi://add-repo?url=${encodeURIComponent(INDEX_URL)}`;
