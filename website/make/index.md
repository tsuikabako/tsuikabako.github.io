<script setup>
import { SOURCE_REPO } from "../.vitepress/constants";
</script>

# Make sources

Anyone can write a source for Kurobayomi, for Tsuikabako or for a repository of their own. This section explains how
sources work, which of the three ways to write one fits a site, and how to test and publish it.

## How it works

- A **source** teaches Kurobayomi to read one website: its lists, its search, a title's page, its chapters or episodes,
  and the images or videos. Each source is **one small file**.
- A **repository** is a list of sources: one file, `index.min.json`, at a public address (a GitHub repository is enough).
  It names each source, its language, its file and the file's checksum.
- A user **adds a repository** once by pasting its address in Kurobayomi. Its sources then appear in Browse, each with
  its **own on/off switch**. Turning a source on downloads its file and checks it against the checksum; turning it off
  removes it. The app refreshes the files it has when the repository changes.
- A source runs in a **sandbox**: it can reach only the hosts its entry lists, has no access to files or the system, and
  gets a time and memory budget. Covers, page images and videos are loaded by the app itself.

So each website is its own source with its own switch, even when many sources share the same code behind the scenes.

## Three ways to write a source

Pick the first one that fits the site.

| | **Recipe** | **Theme site** | **Plug-in** |
|---|---|---|---|
| What you write | one text file of CSS selectors | a few lines of settings | a small Rust program |
| Good for | simple HTML sites: lists, a title page, image pages, direct video links | sites built on a known site template (Madara, for manga) | everything else: JSON APIs, POST requests, relative dates, scrambled images, video players |
| Programming | none | none (copy and fill in) | Rust, with the Tsuikabako toolkit doing the plumbing |
| Guide | [Recipes](./recipe) | [Madara sites](./madara) | [Plug-ins](./plugin) |

Three simple sites are three recipes; three Madara sites are three small settings files; three sites that need logic
are three small programs on the same toolkit. Either way the user sees three sources.

## The steps, whichever way

1. **Look at the site** in a browser with the developer tools open: which addresses list titles, how search works,
   where the chapter or episode links and the images or videos are. Check that it works without logging in.
2. **Save a few pages** (a list, a title page, a chapter or episode page). Tests read these saved pages, so a change
   on the site shows up as a failing test instead of a broken source.
3. **Write the source** the way that fits, and **test it** against the saved pages and once against the live site.
4. **Publish it**: send it to Tsuikabako (see <a :href="`${SOURCE_REPO}/blob/main/CONTRIBUTING.md`">CONTRIBUTING.md</a>)
   or put it in [your own repository](./repository).

## Rules every source follows

- **The id never changes** once users have the source: their library, history and backups refer to it. A port of an
  Aniyomi or Mihon extension keeps that extension's id, so existing backups load (see [Reference](./reference#source-ids)).
- **The stored address of a title, chapter or episode never changes form** (usually the path on the site, like
  `/manga/blue-lake`). Libraries keep it.
- **List only the hosts the source itself requests.** Images and videos load in the app and need not be listed.
- **Be gentle with the site**: set a gap between requests, and do not request more than one list page at a time.
- **Ports keep their licence**: most Aniyomi and Mihon extensions are Apache-2.0; name the original in the source's
  README.
