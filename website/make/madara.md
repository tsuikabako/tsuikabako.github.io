<script setup>
import { SOURCE_REPO } from "../.vitepress/constants";
</script>

# Madara sites

Hundreds of manga sites run **Madara**, a WordPress theme. Tsuikabako reads all of them with one library,
`lib/madara`, so adding a Madara site means writing its settings, not its code. A page source that says
`Powered by Madara` or uses addresses like `/manga/<title>/chapter-12/` is a good sign.

## A Madara site is this

```rust
use kuro_madara::{Browse, Chapters, Site};

const SITE: Site = Site {
    id: 6293890187960663957,          // see "The id" below
    name: "TopManhua.fan",
    lang: "en",
    base: "https://www.topmanhua.fan", // no trailing slash
    manga_dir: "manhua",               // the folder of title pages: /manhua/<slug>
    browse: Browse::Pages,
    chapters: Chapters::MangaPage,
    request_gap_ms: 1000,
};

kuro_guest::plugin!(SITE);
```

Copy any Madara site in <a :href="`${SOURCE_REPO}/tree/main/sources`">sources/</a> (for example `topmanhuafan`),
rename the folder and package, and change the settings, the manifest (`hosts` is the site's host), the icon and the
README.

## Finding the settings

| Setting | How to tell |
|---|---|
| `manga_dir` | the folder in a title's address: `/manga/x/`, `/manhua/x/`, `/series/x/` |
| `browse: Browse::Ajax` | the site's lists load through `/wp-admin/admin-ajax.php` (most sites) |
| `browse: Browse::Pages` | `admin-ajax.php` answers 404 or is blocked; the lists are plain pages like `/manga/page/2/?m_orderby=views` |
| `chapters: Chapters::MangaAjax` | the title page loads its chapters from `<title address>/ajax/chapters/` (watch the network tab) |
| `chapters: Chapters::MangaPage` | the chapters are already in the title page's HTML |
| `chapters: Chapters::AdminAjax` | the chapters come from `admin-ajax.php` with `action=manga_get_chapters` |

When the site has an Aniyomi or Mihon extension (the keiyoushi repository has about 260 Madara sites), its Kotlin file
says the same: `MadaraNoAjax` means `Browse::Pages`, and `chapterMode = ChapterMode.MangaAjax` means
`Chapters::MangaAjax`. Check the live site anyway; sites change.

## The id

A port keeps the extension's id so existing backups load: the MD5 of `<name lower-case>/<lang>/<versionId>`, first 8
bytes, big-endian, top bit cleared ([how](./reference#source-ids)). Use the extension's exact name, even if the site has
been renamed since.

## What it reads

Popular (most viewed), latest (last updated) and search lists; a title's name, cover, summary, alternative names,
genres and type, author, artist and status; its chapters with dates ("2 days ago", "March 1, 2024", "01/05/2024",
and month names in Spanish, Portuguese, Italian and French); and the page images, asking for the site's list view when a
chapter shows one image at a time. Page images are requested with the site as Referer.

Not covered: filters, encrypted page lists (the "chapter protector"; such chapters fail with a clear message), and
sites behind Cloudflare's browser check. A site that needs more than settings can still use the library for most of
its work and add its own code.

## Check it

```sh
cargo test -p kuro-<id>
```

then try every operation against the live site (lists, search, a title, its chapters, a chapter's pages) before
publishing, as in [Plug-ins: Test](./plugin#test).
