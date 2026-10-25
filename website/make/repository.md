<script setup>
import { SOURCE_REPO } from "../.vitepress/constants";
</script>

# Your own repository

You do not need Tsuikabako to publish sources. A repository is a list file and the source files it names, at any public
https address. Kurobayomi treats every repository the same way.

## The quickest way: fork the tools

1. Fork or copy <a :href="SOURCE_REPO">extensions-source</a>. It brings the toolkit (`lib/guest`), the Madara library
   (`lib/madara`), the template, and the tools that build and list sources.
2. Delete the sources in `sources/` you do not want to publish, and add yours (see [Recipes](./recipe),
   [Theme sites](./madara), [Plug-ins](./plugin)).
3. Build and write the list, naming the address the files will be served from:

   ```sh
   tools/build.sh
   python3 tools/make-index.py \
     --base-url https://raw.githubusercontent.com/<you>/<repo>/<branch> \
     --name "My Sources" --website https://github.com/<you>/<repo>
   ```

   `build.sh` builds each plug-in to `dist/<id>.wasm`. `make-index.py` copies recipes and icons into `dist/`, checks
   every file, and writes `index.min.json` with each file's address and checksum.
4. Publish `index.min.json` and `dist/` at that address: commit them to the branch named in `--base-url` (or to a
   second repository, as Tsuikabako does with a CI job; see `.github/workflows/publish.yml`).
5. Give users the address of `index.min.json`. They add it in Kurobayomi under
   **Settings → Sources and tracking → Repositories → Add**, or with one click from a link to
   `kurobayomi://add-repo?url=<the address, URL-encoded>`, which opens the app's add dialog with the address filled in.

## The list file

`index.min.json` is plain JSON:

```json
{
  "version": 1,
  "name": "My Sources",
  "website": "https://github.com/me/my-sources",
  "url": "https://raw.githubusercontent.com/me/my-sources/main/index.min.json",
  "sources": [
    {
      "id": "mysite",
      "name": "My Site",
      "lang": "en",
      "kind": "manga",
      "version": 1,
      "type": "wasm",
      "file": "https://raw.githubusercontent.com/me/my-sources/main/dist/mysite.wasm",
      "sha256": "…64 hex digits…",
      "hosts": ["mysite.example"],
      "description": "Manga and webtoons, chapters with dates",
      "icon": "https://raw.githubusercontent.com/me/my-sources/main/dist/mysite.png",
      "iconSha256": "…"
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `name`, `website` | shown on the repository's card in the app (optional) |
| `url` | where this list lives now. If the repository moves, leave a copy at the old address naming the new one; the app follows it |
| `id` | the source's file name: lower-case letters, digits, `.`, `_`, `-` |
| `name`, `lang`, `kind` | shown in Browse; `kind` is `manga` or `anime` |
| `version` | raise it whenever the source changes |
| `type` | `wasm` for a plug-in, `recipe` for a recipe |
| `file`, `sha256` | the https address of the file and the SHA-256 of its bytes. The app refuses a file whose checksum differs, and downloads it again when the checksum in the list changes |
| `hosts` | the only hosts a plug-in may request (`*.example.org` covers subdomains). Empty for a recipe |
| `description` | one line, at most 120 characters, under the name |
| `icon`, `iconSha256` | a square PNG of about 192 px (optional) |
| `status` | `blocked` (the site refuses the app for now) or `broken` (needs a fix); left out when it works. The app shows it as a coloured dot |

Never edit the list by hand: `make-index.py` writes it, so the checksums always match the files.

## Updating

- Change a source, raise its `version`, rebuild, and publish the new list and files. Users who have the source on get
  the new file at the app's next update check, because its checksum changed.
- Mark a source that stopped working in `status.toml` (`mysite = "broken"`) so users see why; remove the line when it
  works again. Tsuikabako also runs `tools/check-health.py` every six hours to do this automatically.
- To remove a source, delete its folder (or move it to `parked/` to keep the code). The next list no longer names it.

## Trust

Users run your sources inside Kurobayomi's sandbox, which limits them to the hosts you list and gives them no access to
files. They still trust you to send what the source says it does. Keep your repository's code public, build the files
in CI from that code, and name the original of every port.
