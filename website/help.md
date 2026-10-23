<script setup>
import { SOURCE_REPO } from "./.vitepress/constants";
</script>

# Help

## A source does not work

Check its status on the [source list](/sources) first: a source the site blocks or one already known to be broken is
being looked at. Otherwise open an issue in <a :href="`${SOURCE_REPO}/issues`">extensions-source</a> with the source's
name, what you did and what happened. Do not include links to copyrighted content.

## Request a source

Open an issue in <a :href="`${SOURCE_REPO}/issues`">extensions-source</a> with the site's name and language. Sources
are written by volunteers, so a request can take a while or be declined.

## Write a source

A source is a small WASM plug-in, or a text recipe for simple sites. How to write, test and submit one is in
<a :href="`${SOURCE_REPO}/blob/main/CONTRIBUTING.md`">CONTRIBUTING.md</a>; the formats themselves are documented with the
app: [source recipes](https://github.com/kurobayomi/kurobayomi/blob/main/docs/source-recipes.md) and
[plug-ins](https://github.com/kurobayomi/kurobayomi/blob/main/docs/source-abi.md).

## About

Tsuikabako (追加箱, "add-on box") hosts sources, not content: each source reads a public website the way a browser
does. Kurobayomi itself ships with no sources and works without this repository.
