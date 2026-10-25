<script setup>
import { APP_REPO } from "../.vitepress/constants";
</script>

# Recipes

A recipe is one TOML file of addresses and CSS selectors. No code runs: Kurobayomi's recipe engine reads the site with
the selectors you give. Try a recipe first; move to a [plug-in](./plugin) only when the site needs something a recipe
cannot say.

## When a recipe is enough

A recipe fits when every list, the title page, the chapter list and the images (or a direct video address) are in the
HTML the server sends. It does not cover:

- requests with a body (POST) or pages built by JavaScript;
- relative dates ("3 days ago"), filters, seasons;
- video players that hide the stream behind a script on another host (an "extractor"), and sites behind Cloudflare's
  browser check.

## A manga recipe

```toml
id = "example-manga"          # lower-case letters, digits, - and _; also the file name
name = "Example Manga"        # with lang and version, this makes the source id: never rename a published recipe
lang = "en"
kind = "manga"                # or "anime"
base_urls = ["https://manga.example.org"]   # the only hosts it may request; the first is the site root
rate_limit_ms = 1000          # at least this long between two requests

[headers]
Referer = "https://manga.example.org/"      # sent with every request, and with covers and page images

[urls]
popular = "/popular?page={page}"            # {page} starts at 1
latest = "/latest?page={page}"
search = "/search?q={query}&page={page}"    # {query} is percent-encoded

[popular]
items = "div.series-card"                   # one element per title
title = { select = "h3 a" }
url = { select = "h3 a", attr = "href" }
cover = { select = "img", attr = "data-src" }
next_page = "a.next"                        # matches when there is a next page

[latest]
items = "ul.updates li"
title = { select = "a.name" }
url = { select = "a.name", attr = "href" }
cover = { select = "img", attr = "src" }
last_page = { select = "span.pages", regex = "of (\\d+)" }

[search]
items = "div.series-card"
title = { select = "h3 a" }
url = { select = "h3 a", attr = "href" }
cover = { select = "img", attr = "data-src" }
next_page = "a.next"

[details]
title = { select = "h1.title" }
author = { select = "dl dd", nth = 0 }
description = { select = "div.summary p", all = true, join = "\n\n" }
genre = { select = "ul.genres li", all = true }
cover = { select = "div.poster img", attr = "src" }
status = { select = "span.status" }

[details.status_map]
ongoing = ["ongoing"]
completed = ["completed", "finished"]

[chapters]
items = "ol.chapters li"
name = { select = "a" }
url = { select = "a", attr = "href" }
number = { select = "a", regex = "Chapter ([0-9.]+)" }
date = { select = "time", attr = "datetime" }
date_format = "%Y-%m-%d"
reverse = true                              # the site lists the oldest first; the app wants the newest first

[pages]
items = "div.reader img"                    # one element per page
image = { attr = "data-src" }

[tests]                                     # saved pages for the checker, one per operation
popular = "popular.html"
latest = "latest.html"
search = "search.html"
details = "series.html"
chapters = "series.html"
pages = "chapter.html"
query = "one piece"
```

### How values are read

Every value (`title`, `url`, `cover`, ...) is a small table:

| Key | Meaning |
|---|---|
| `select` | a CSS selector, searched inside the current item; left out, the item itself |
| `nth` | which match to take, 0 first |
| `all` | take every match and join them (`join`, default `", "`) |
| `attr` | read this attribute instead of the text |
| `regex` | keep the first group of this regular expression (or the whole match) |
| `format` | applied last, `{}` is the value: `{ attr = "value", format = "/read?id={}" }` |

A required value (`title`, `url`, `name`, `image`) that matches nothing fails the page loudly, naming the item, so a
wrong selector is easy to find. Links are stored without the host (`/series/blue-lake`).

### Anime recipes

An anime recipe has `episodes` instead of `chapters` and `videos` instead of `pages`. `videos` reads direct stream
addresses (an mp4 file or an HLS `.m3u8` playlist) from the episode page, for example from a script:

```toml
[videos]
url = { select = "script", all = true, regex = "file: \"(https?://[^\"]+\\.m3u8)\"" }
```

## Check it

Save the pages named in `[tests]` into a folder, then, from a clone of the
<a :href="APP_REPO">Kurobayomi repository</a>:

```sh
cargo run -p kuro-source-scrape --example check_recipe -- recipe.toml fixtures/
cargo run -p kuro-source-scrape --example check_recipe -- recipe.toml fixtures/ --live
```

The first prints what every operation found in the saved pages and fails when one finds nothing. `--live` runs the
same operations once against the real site, one request a second.

To try it in the app without a repository, copy the recipe to the `scrapers` folder of Kurobayomi's data folder
(`~/.local/share/kurobayomi/scrapers/<id>.toml` on Linux) and restart the app.

## Publish it

In Tsuikabako, a recipe lives at `sources/<id>/recipe.toml` with its `fixtures/`, an `icon.png` and a `README.md`.
In your own repository, `make-index.py` lists it like any source: see [Your own repository](./repository).

The full list of keys is in the app's
<a :href="`${APP_REPO}/blob/main/docs/source-recipes.md`">source-recipes.md</a>.
