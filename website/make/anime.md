<script setup>
import { SOURCE_REPO } from "../.vitepress/constants";
</script>

# Anime sources

An anime source is a [plug-in](./plugin) like a manga source, with a different second half: instead of chapters and
page images it gives episodes, the **servers** of an episode, and the **videos** each server plays. Most of the work in
anime is that last step, because the videos usually sit on separate file hosts.

## The flow

| Op | Gets | Returns |
|---|---|---|
| `popular`, `latest`, `search` | `input.page()`, `input.query()` | `AnimesPage` |
| `details` | `input.url("anime")` | `Anime` |
| `episodes` | `input.url("anime")` | `Vec<Episode>`, newest first |
| `hosters` | `input.url("episode")` | `Vec<Hoster>`: the servers of the episode |
| `videos` | `input.require::<Hoster>("hoster")` (one server), or `input.url("episode")` (all of them) | `Vec<Video>` |

The app shows the servers first and asks `videos` for the one the user picks, so a slow or broken server never blocks the
others. It hands the `Hoster` back exactly as the source returned it: put anything you need later in `hoster_url` or
`internal_data`. A source whose servers are cheap to read can fill `video_list` in `hosters` and skip the later call.

## Video hosts: `lib/extractors`

Many sites embed their videos from file hosts ("embeds"): a player page on another host whose real video address has to
be dug out. <a :href="`${SOURCE_REPO}/tree/main/lib/extractors`">`lib/extractors`</a> does that once for every
source:

```rust
// one server: its embed address and a label for the video's title
match kuro_extractors::videos(host, &hoster.hoster_url, "") {
    Some(Ok(videos)) => videos,                // playable videos, with the headers the player must send
    Some(Err(error)) => return Err(error),     // a host we know, but its page gave no video
    None => return Err("not supported".into()), // a host no extractor reads: leave the server out
}
```

Offer only the servers an extractor reads: in `hosters`, skip an embed whose host is not in `kuro_extractors::HOSTS`,
so users never pick a server that cannot play. Today the extractors read DoodStream (and its many domains), Hexload,
MixDrop and Mp4Upload.

### List the hosts in the manifest

A plug-in may request only the hosts its manifest lists, and the extractors request the embed pages. So the manifest
lists the site **and** every host in `kuro_extractors::HOSTS`. A test catches a missing one:

```rust
#[test]
fn the_manifest_lists_every_extractor_host() {
    let manifest = include_str!("../manifest.toml");
    for host in kuro_extractors::HOSTS {
        assert!(manifest.contains(&format!("\"{host}\"")), "manifest.toml misses {host}");
    }
}
```

The videos themselves load in the app from any host; only the embed pages need listing.

### Hosts that are not supported

Some popular hosts (VOE, Filemoon, StreamWish and their clones) move to new random domains all the time, on purpose. No
manifest can list domains that do not exist yet, so a sandboxed plug-in cannot follow them. Leave their servers out.

### Writing an extractor

An extractor is one file in `lib/extractors/src/`: a function `videos(host, embed_url, label) -> Res<Vec<Video>>`, its
hosts added to `HOSTS` and to the match in `videos()`, and tests against saved embed pages. Port it from the matching
Aniyomi extractor library when there is one. Things that bite:

- **Packed JavaScript**: many hosts hide the address in `eval(function(p,a,c,k,e,d)...)`;
  `kuro_extractors::unpacker::unpack_and_combine` unpacks it.
- **Redirects to another domain**: the app follows them, but the final domain must be in `HOSTS` too.
- **Headers the player must send**: put them in the `Video`'s `headers`. Most hosts want a `Referer`; some (MixDrop)
  serve the video only to the same `User-Agent` that opened the page, so send one fixed `User-Agent` for both.
- **Check the video really plays**: download its first bytes with exactly the video's headers; a 200 or 206 with a video
  content type means it works.

## Qualities and servers in the player

The player's **Quality** menu lists heights ("1080p"), merged across servers; its **Server** list (in the ⋮ menu) lists
the servers by `hoster_name`. A video's height comes from its `resolution` or a height in its title ("720p"). A video
with no known height shows its title in the Quality menu instead, and equal titles merge into one entry. So the title
is the height ("1080p") when the host says it, and **"Auto"** when it does not; never the server's name, which the
Server list already shows. The extractors title their videos this way.

## Check it

Run every step against the live site once: the lists, a title's episodes, the servers of an episode, and a video from
**each** server, downloading its first bytes with the video's own headers. Then play one in the app.
