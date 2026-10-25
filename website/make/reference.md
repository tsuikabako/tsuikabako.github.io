<script setup>
import { SOURCE_REPO, APP_REPO } from "../.vitepress/constants";
</script>

# Reference

The contract between a plug-in and Kurobayomi, as the toolkit exposes it. The underlying interface is
`wit/kuro-source.wit` in <a :href="SOURCE_REPO">extensions-source</a>; the JSON shapes are documented with the app in
<a :href="`${APP_REPO}/blob/main/docs/source-abi.md`">source-abi.md</a>.

## Operations

The app calls `invoke(op, input)`. The toolkit answers `info`, `create-sources` and `request-headers` from your
`Source`, and passes every other op to `Source::run` with the parsed input.

| Op | Input (`args`) | Answer |
|---|---|---|
| `info` | | `{id, name, lang, supportsLatest, requestGapMs?}` |
| `request-headers` | | `[[name, value], …]`: headers for this source's page images and videos; "unknown op" keeps the app's default |
| `popular`, `latest` | `page` (from 1) | `{mangas: [Manga], hasNextPage}` or `{animes: [Anime], hasNextPage}` |
| `search` | `page`, `query`, `filters` | the same |
| `details` | `manga` or `anime` (as stored) | `Manga` or `Anime` |
| `chapters` | `manga` | `[Chapter]`, newest first |
| `pages` | `chapter` | `[Page]` |
| `episodes` | `anime` | `[Episode]`, newest first |
| `hosters` | `episode` | `[Hoster]` |
| `videos` | `hoster` (as returned), or `episode` | `[Video]` |
| `subtitles` | `video` | `[Track]` |
| `unscramble` | `body` (base64 image), `headers` | `{body: base64 or null}`: for sites that scramble page images |

Every input also carries `showAdult` (`input.show_adult`): the user's "Show adult (18+) titles" switch. An op a source
does not offer must answer exactly `unknown op: <op>` (`kuro_guest::unknown_op`).

## Shapes

All in `kuro_guest::wire`; every field has a default, camelCase on the wire.

| Type | Fields |
|---|---|
| `Manga` | `url`, `title`, `artist`, `author`, `description`, `genre` (joined with ", "), `status`, `thumbnailUrl` |
| `Chapter` | `url`, `name`, `dateUpload` (ms since 1970, 0 unknown), `chapterNumber` (-1 unknown), `scanlator` |
| `Page` | `url`, `imageUrl` |
| `Anime` | `url`, `title`, `description`, `thumbnailUrl`, `author` (studio), `artist`, `genre`, `status` |
| `Episode` | `url`, `name`, `episodeNumber` (-1 unknown), `fillermark`, `scanlator`, `dateUpload`, `summary` |
| `Hoster` | `hosterUrl`, `hosterName`, `videoList` (or absent to fetch later with `videos`), `internalData`, `lazy` |
| `Video` | `videoUrl`, `videoTitle`, `resolution`, `bitrate`, `headers`, `preferred`, `subtitleTracks`, `audioTracks`, `internalData` |
| `Track` | `url`, `lang` |

`status`: 0 unknown, 1 ongoing, 2 completed, 3 licensed, 4 publishing finished, 5 cancelled, 6 on hiatus.

## What the app lends a source

| `Host` method | |
|---|---|
| `http(request)` | one request (`kuro_guest::Request`). Only to hosts in the manifest; redirects are followed; the request gap is kept per host |
| `unix_seconds()` | the clock, for dates |
| `pref_get(key)`, `pref_set(key, json)` | small saved values, per source |
| `log(level, text)` | 0 debug, 1 info, 2 warning, 3 error |

## Limits

- A plug-in file is at most 1 MiB, built for `wasm32-unknown-unknown`, importing nothing but the app's interface.
- Each call has a time and memory budget; waiting for the network does not count against the time.
- A plug-in reaches only its listed hosts. Covers, page images and videos are loaded by the app on any host.

## Source ids

A source's id is a positive 64-bit number that never changes; the library, history and backups refer to it.

- **A port of an Aniyomi or Mihon extension keeps that extension's id**, so backups made with those apps load into
  Kurobayomi. The id is the MD5 of `"<name lower-case>/<lang>/<versionId>"` (versionId is 1 unless the extension sets
  it), its first 8 bytes read big-endian, with the top bit cleared:

  ```sh
  python3 -c 'import hashlib; d = hashlib.md5(b"mangapill/en/1").digest(); print(int.from_bytes(d[:8], "big") & (2**63 - 1))'
  ```

- **Some extensions set the id themselves** in their `build.gradle` (`id = 5L`, often an old built-in source's
  number). Then that number is the id, not the formula's.
- **A new source** uses the same formula with its own name and language, which keeps ids unique between repositories.

## Stored addresses

What a source returns as `url` for a title, chapter or episode is stored in the user's library and backups and handed
back to the source later. Use the path on the site (`/manga/blue-lake`), and never change its form once the source is
published; if a site moves to another domain, change the source's base address, not the stored paths.
