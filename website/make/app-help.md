---
description: "What Kurobayomi does for every source: Cloudflare and Anubis checks, pages built by scripts, scrambled images, headers, rate limits, HLS video."
---

<script setup>
import { SOURCE_REPO, APP_REPO } from "../.vitepress/constants";
</script>

# What the app handles

Some sites are hard for reasons that have nothing to do with their lists and pages: a bot check in front of them, pages
built by a script, scrambled images, a video server that refuses the player. Kurobayomi handles each of these once, for
every source, so a source only has to say what it needs, and often not even that. Read this page before you write a
workaround: if the problem is here, use the app's way.

Each entry gives what the site does, what the app does, what your source writes, a source that shows it working, and
the first app version that has it. The exact contract of each one is in the app's
<a :href="`${APP_REPO}/blob/main/docs/source-abi.md`">source-abi.md</a>.

## Browser checks: Cloudflare and Anubis

**The site** answers plain clients with a check page that a real browser passes by itself:

- Cloudflare's "Just a moment...": a 403 or 503 from a Cloudflare `Server`.
- Anubis's "Making sure you're not a bot!": a proof of work the browser computes. It comes with any status (often 200),
  and with a cookie named `techaro.lol-anubis-cookie-verification-…`.

**The app** sees the check in the answer to your request. It opens the site once in a page that is never shown, in the
system's web engine (WebKitGTK on Linux, WebView2 on Windows), waits up to 25 s for the check to clear, and sends your
request again with that page's own `fetch`. Every later request that meets the check goes out from the same page, which
is already past it. You get the site's real answer. There is one page per site, closed after 10 minutes unused; its cookies stay, so it rarely meets the check
again. The page browses in English whatever the system's language, and reaches only the internet, never this computer
or the local network.

**Your source** writes nothing. Send requests as usual (`Request::get(url).send(host)`). What travels with a request
sent from the page:

- Your own headers (`Accept`, `X-Requested-With`, a site's custom header), except the ones the browser sets itself:
  `User-Agent`, `Cookie`, `Origin`, `Host`, `Connection`, `Content-Length`, `Accept-Encoding`, `Cache-Control` and
  `Pragma` are dropped.
- `Referer`, which becomes the page's referrer.
- The body, with its `Content-Type`: JSON, a form (`Request::form`), any text.

In `health.toml`, add `cloudflare = true` for a Cloudflare site, so the health check counts the check as "unknown"
rather than down. Anubis's check is known by its cookie and needs no line.

**Not handled:** a check that needs a person (a click, a puzzle, a captcha). The request comes back with the check, and
the source shows as not answering.

**Examples:** <a :href="`${SOURCE_REPO}/tree/main/sources/animepahe`">animepahe</a> (Cloudflare),
<a :href="`${SOURCE_REPO}/tree/main/sources/inkstory`">inkstory</a> (Anubis).
**Since:** Cloudflare 0.1.0 on Linux, 0.2.1 on Windows. Anubis in the release after 0.4.0.

## Pages built by a script: page reads

**The site** sends an empty shell and fills the page with its own script, so a plain request finds no titles or images.

**The app** opens the address in the same kind of hidden page, does the steps your source names, and hands back the
HTML they found.

**Your source** ends with `kuro_guest::plugin!(MySite, pages);` and reads with `PageRead`:

```rust
let page = PageRead::new(format!("{BASE}/title/1?page=2"))
    .wait("ul.chapters > li")
    .read("ul.chapters")
    .send(host)?;
parse_chapters(page.html())
```

Steps come from a fixed set: `wait`, `wait_gone`, `scroll` and `read`, each with a CSS selector. A source passes no
script. The page may ask only the hosts in the manifest and loads no images, media or fonts. Steps take 20 s by default
(`timeout_ms`, at most 60 s). A wait that is not met fails with the page's title and address, so you can tell a changed
page from a check page.

**Not handled:** a check that does not clear by itself fails the read.

**Example:** <a :href="`${SOURCE_REPO}/tree/main/sources/comix`">comix</a>.
**Since:** 0.4.0. An older app cannot load a plug-in that reads pages, so use it only when plain requests cannot work.

## Scrambled page images: `unscramble`

**The site** serves page images cut up or shuffled, and puts them back together in the browser.

**The app** calls your source's `unscramble` op after every successful image fetch, with the image bytes (base64) and
the response headers, and shows what you hand back.

**Your source** answers the op in `run`: `{"body": "<base64>"}` for the fixed image, `{"body": null}` when the image is
already right. A source without the op answers "unknown op", and the app shows images as fetched.

**Example:** comix (`descramble.rs`, and `docs/comix-image-hook.md` in extensions-source).
**Since:** 0.1.0.

## Headers for images and videos: `request_headers`

**The site's** image or video host wants particular headers: an `Accept`, or no `Referer` (some hosts answer 403 to the
site's own `Referer`).

**The app** sends its default set with every page image and video of a source, unless the source names its own list.
That list then **replaces** the default.

**Your source** returns the list from `Source::request_headers`. Leave out what must not be sent. For one video's own
headers (a `Referer` its host checks), use that `Video`'s `headers` instead.

**Examples:** comix (`Accept: */*`, no `Referer`), atsumaru, animegg.
**Since:** 0.1.0.

## Rate limits: `request_gap_ms`

**The site** blocks clients that ask too fast.

**The app** keeps at least the gap you name between two requests to one host, inside `http`. Your source never sleeps.

**Your source** sets `request_gap_ms: Some(ms)` in its `Info`.

**Examples:** comix (200 ms), animepahe.
**Since:** 0.1.0.

## Video servers that refuse the player: the HLS relay

**The video server** refuses the player's own connection. mpv speaks HTTP/1.1 only, and some CDNs (AnimePahe's)
answer that with 403.

**The app** plays every remote `.m3u8` stream through a relay on this computer. The relay fetches the playlist,
segments and keys the way a browser does, with the video's headers. Downloads of HLS episodes use the same relay.

**Your source** writes nothing beyond the `Video`'s `headers` the server needs.

**Example:** animepahe (its Kwik streams).
**Since:** 0.1.0; downloads since 0.2.3.

## Sites with no popular list: `supports_popular`

**The site** lists only its newest titles.

**The app** offers Latest only for the source, and opens it on Latest.

**Your source** returns `false` from `Source::supports_popular` and sets `supports_latest: true`. Older apps still ask
for Popular, so keep answering `popular` with the same list as `latest`.

**Example:** animepahe.
**Since:** the release after 0.4.0.

## When the app learns something new

A new way the app helps sources gets an entry on this page, with the same five parts, and its contract in
<a :href="`${APP_REPO}/blob/main/docs/source-abi.md`">source-abi.md</a>, in the same change.
