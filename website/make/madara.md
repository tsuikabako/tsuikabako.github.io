<script setup>
import { SOURCE_REPO } from "../.vitepress/constants";
</script>

# Theme sites

Many sites are built on the same ready-made site software, so they look and work alike. Tsuikabako reads each such
"theme" once in a library, and a site on it is only its settings. Two manga themes are covered: **Madara** and
**GroupLe**.

## Madara sites

Hundreds of manga sites run **Madara**, a WordPress theme. Tsuikabako reads all of them with one library,
`lib/madara`, so adding a Madara site means writing its settings, not its code. A page source that says
`Powered by Madara` or uses addresses like `/manga/<title>/chapter-12/` is a good sign.

### A Madara site is this

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

### Finding the settings

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

### The id

A port keeps the extension's id so existing backups load: the MD5 of `<name lower-case>/<lang>/<versionId>`, first 8
bytes, big-endian, top bit cleared ([how](./reference#source-ids)). Use the extension's exact name, even if the site has
been renamed since.

### What it reads

Popular (most viewed), latest (last updated) and search lists; a title's name, cover, summary, alternative names,
genres and type, author, artist and status; its chapters with dates ("2 days ago", "March 1, 2024", "01/05/2024",
and month names in Spanish, Portuguese, Italian and French); and the page images, asking for the site's list view when a
chapter shows one image at a time. Page images are requested with the site as Referer.

Not covered: filters, encrypted page lists (the "chapter protector"; such chapters fail with a clear message), and
sites behind Cloudflare's browser check. A site that needs more than settings can still use the library for most of
its work and add its own code.

## GroupLe sites

**GroupLe** runs Russian manga sites such as ReadManga, SelfManga and Usagi. `lib/grouple` reads them, and a site is:

```rust
use kuro_grouple::Site;

const SITE: Site = Site {
    id: 5,                          // ReadManga's extension sets this id itself; see "The id" below
    name: "ReadManga",
    lang: "ru",
    base: "https://a.zazaza.me",    // the site's current address, no trailing slash
};

kuro_guest::plugin!(SITE);
```

Copy `sources/readmanga`, change the settings, manifest, icon and README. GroupLe sites hide some titles from visitors
who are not signed in; the source says so in the chapter list ("sign-in required"), so test with a title anyone can read.

**The id:** most GroupLe extensions set an explicit id in their `build.gradle` (`id = 5L` for ReadManga) instead of the
usual name-based one. Use that number when it is there.

## Check it

```sh
cargo test -p kuro-<id>
```

then try every step against the live site before publishing, as in [Plug-ins: Try it live](./plugin#try-it-live).
