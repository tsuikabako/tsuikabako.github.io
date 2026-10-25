<script setup>
import { SOURCE_REPO, APP_REPO } from "../.vitepress/constants";
</script>

# Plug-ins

A plug-in is a small Rust program compiled to WebAssembly. Use one when a [recipe](./recipe) is not enough: a JSON
API, POST requests, relative dates, a site that needs a cookie or a token, scrambled images, or video hosts.

You do not write the plumbing. The **Tsuikabako toolkit** (`lib/guest` in
<a :href="SOURCE_REPO">extensions-source</a>) answers the app's calls, parses what the app sends, sends HTTP requests
with uniform errors, and defines every JSON shape the app reads. Your code is only "how to read this site".

## Set up once

```sh
rustup target add wasm32-unknown-unknown
cargo install --locked wasm-component-ld   # the linker that turns the build into a plug-in
git clone https://github.com/tsuikabako/extensions-source
cd extensions-source
```

## Start from the template

```sh
cp -r template/example sources/mysite
```

Then in `sources/mysite/`:

1. `Cargo.toml`: rename the package to `kuro-mysite`.
2. `manifest.toml`: set `id = "mysite"` (the folder name), the name, a one-line description, `lang`, `kind`
   (`manga` or `anime`) and the `hosts` the source requests.
3. `src/lib.rs`: the template is a complete manga source for an imaginary site, with every part to change marked
   `CHANGE`. Replace its addresses and selectors with your site's.
4. `fixtures/`: replace the three sample pages with pages saved from your site.
5. Add the site's `icon.png` (square, about 192 px) and a `README.md`.

The template builds and its tests pass as it is, so you can change it one step at a time.

## The shape of a source

```rust
use kuro_guest::wire::{Manga, MangasPage, Page};
use kuro_guest::{Host, Info, Input, Request, Res, Source, to_value, unknown_op};
use serde_json::Value;

struct MySite;

impl Source for MySite {
    fn info(&self) -> Info {
        Info { id: 1234567890, name: "My Site", lang: "en", supports_latest: true, request_gap_ms: Some(1000) }
    }

    fn run(&self, op: &str, input: &Input, host: &dyn Host) -> Res<Value> {
        match op {
            "popular" => to_value(parse_list(&get(host, &format!("{BASE}/popular?page={}", input.page()))?)),
            "details" => { /* input.url("manga")? is the stored address */ }
            // ...
            _ => Err(unknown_op(op)),
        }
    }
}

kuro_guest::plugin!(MySite);
```

- `info` says who the source is. The `id` never changes after release (see [Reference](./reference#source-ids)).
- `run` answers one operation. An operation the source does not offer answers `unknown_op(op)`, which the app reads as
  "not offered".
- `kuro_guest::plugin!(MySite);` is the whole connection to the app.

### The operations

| Manga | Anime | Gets | Returns |
|---|---|---|---|
| `popular`, `latest`, `search` | the same | `input.page()`, `input.query()` | `MangasPage` / `AnimesPage` |
| `details` | `details` | `input.url("manga")` / `input.url("anime")` | `Manga` / `Anime` |
| `chapters` | `episodes` | `input.url("manga")` / `input.url("anime")` | `Vec<Chapter>` / `Vec<Episode>`, newest first |
| `pages` | `hosters` | `input.url("chapter")` / `input.url("episode")` | `Vec<Page>` / `Vec<Hoster>` |
| | `videos` | `input.require::<Hoster>("hoster")` | `Vec<Video>` |

`latest` is only asked when `supports_latest` is true. `input.show_adult` is the user's "show adult titles" switch: a
source that knows a title's rating leaves adult titles out of its lists while it is off.

### Requests

```rust
// a page as text; errors read the same in every source ("HTTP 404 from My Site", "My Site is limiting requests ...")
let html = Request::get(url).header("Referer", "https://mysite.example/").text(host, "My Site")?;

// a JSON API with a POST body
let json = Request::post(api, r#"{"page":1}"#).header("Content-Type", "application/json").text(host, "My Site")?;

// a form POST
let html = Request::form(ajax, "action=load&page=2").text(host, "My Site")?;

// when you need the status, a response header or the address after redirects
let response = Request::get(url).send(host)?;
let total = response.header("x-total-count");
let landed = response.url;
```

The app only sends requests to hosts in the manifest, follows redirects, and keeps `request_gap_ms` between two
requests to a host, so the source never sleeps or counts time itself.

### What the app gets back

The JSON shapes are Rust types in `kuro_guest::wire`. Fill what the site gives and leave the rest to the defaults:

```rust
Manga {
    url: "/manga/blue-lake".into(),          // the stored address: never change its form
    title: "Blue Lake".into(),
    thumbnail_url: Some(cover),
    ..Default::default()
}
Chapter { url, name, date_upload: millis, chapter_number: 12.0, ..Default::default() }
Page::image("https://img.mysite.example/1.jpg")
```

`date_upload` is milliseconds since 1970 (`host.unix_seconds()` is the clock for "2 days ago"); `status` uses the
constants in `kuro_guest::wire::status`.

### What to put in a stored address

The `url` of a title, chapter or episode is all the app gives back when it later asks for details, chapters or pages,
so it must hold **everything those later requests need**. Usually that is the path on the site (`/manga/blue-lake`). An
API that needs two ids for a chapter's pages gets both in the chapter's address (Desu stores
`/<title id>/chapters/<chapter id>`). Pick the form once: it never changes after release, because libraries and backups
keep it.

### HTML helpers

With the `html` feature (`kuro-guest = { workspace = true, features = ["html"] }`):

```rust
use kuro_guest::html::{Html, attr, first, own_text, sel, text_of};

let doc = Html::parse_document(&html);
for card in doc.select(&sel("div.card")) {
    let title = first(card, "a.title").map(text_of);      // text, whitespace tidied
    let cover = attr(card, "img", "data-src");            // an attribute, trimmed, None when empty
}
```

### Images and videos

- `fn request_headers(&self)` returns the headers the app sends with this source's page images (often the site as
  `Referer`). Without it the app sends its default set.
- A `Video` carries its own `headers` for the player, and `preferred: true` on the one to start with.

### Saved settings

`host.pref_get(key)` / `host.pref_set(key, json)` (or `kuro_guest::read_pref` / `write_pref`) keep small values between
calls: a token, the mirror that answered last, a cache of ids. `host.log(level, text)` writes to the app's log.

## Test

Tests run the source's operations against the saved pages, with no app and no network. `TestHost` answers each request
from a function you give it:

```rust
use kuro_guest::testing::TestHost;

let host = TestHost::answering(|request| match request.url.as_str() {
    url if url.contains("/popular") => (200, include_str!("../fixtures/popular.html").into()),
    _ => (404, String::new()),
});
let out = kuro_guest::invoke(&MySite, &host, "popular", r#"{"args":{"page":1}}"#)?;
```

`host.sent()` lists the requests the source made, so a test can also check the addresses and bodies.

```sh
cargo test -p kuro-mysite
```

## Try it live

Saved pages show the parsers work; only the live site shows the source works. Before you send it, check every step
once against the real site, as a user would:

1. The lists: popular, latest (if offered) and a search return titles, and the next-page flag is right.
2. A title: details, then its chapters (or episodes). Pick a title anyone can read without an account.
3. A chapter's pages (or an episode's servers and each server's videos).
4. One page image (or the first bytes of each video), downloaded with exactly the headers your source gives for it.

Then try it in the app: build an index that points at a test branch of your fork and add it in Kurobayomi (the steps
are in <a :href="`${SOURCE_REPO}/blob/main/CONTRIBUTING.md#try-it-in-the-app`">CONTRIBUTING.md</a>).

## Build

```sh
CARGO_TARGET_WASM32_UNKNOWN_UNKNOWN_LINKER=wasm-component-ld \
  cargo build -p kuro-mysite --release --target wasm32-unknown-unknown
python3 tools/make-index.py --check-wasm target/wasm32-unknown-unknown/release/kuro_mysite.wasm
```

The file must be under 1 MiB and import nothing but the app's interface (the check says so). Build for
`wasm32-unknown-unknown`, never `wasm32-wasip2`: the sandbox has no WASI. `tools/build.sh` builds every source into
`dist/`.

## Shared code: themes and languages

Sources that read the same kind of site share their code in a crate in `lib/`: a settings type that implements
`Source`, and one small source per site whose `lib.rs` is the settings and `kuro_guest::plugin!(SITE)`.

| Library | Reads | Sources on it |
|---|---|---|
| `lib/madara` | every Madara WordPress site | 18 manga sites ([Theme sites](./madara)) |
| `lib/grouple` | the GroupLe sites | Usagi, ReadManga, SelfManga ([Theme sites](./madara#grouple-sites)) |
| `lib/novelcool` | NovelCool in each language | NovelCool English and Spanish |
| `lib/extractors` | video hosts | anime sources ([Anime sources](./anime)) |

**One site in several languages** works the same way: one source per language (each has its own switch in the app and
its own id, from its own `lang`), and the code in a `lib/` crate. Name the crates apart: a library is `kuro-<name>`
and a source `kuro-<id>`, so a language's source folder is for example `novelcoolen`, not `novelcool`.

The full contract with the app (every operation and field) is in the [Reference](./reference) and the app's
<a :href="`${APP_REPO}/blob/main/docs/source-abi.md`">source-abi.md</a>.
