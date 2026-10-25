<script setup>
import { OUTPUT_REPO, SOURCE_REPO } from "./.vitepress/constants";
</script>

# Help

## A source does not work

Check its status on the [source list](/sources) first: a source the site blocks or one already known to be broken is
being looked at. Otherwise open an issue in <a :href="`${OUTPUT_REPO}/issues`">extensions</a> with the source's
name, what you did and what happened. Do not include links to copyrighted content.

## Request a source

Open an issue in <a :href="`${OUTPUT_REPO}/issues`">extensions</a> with the site's name and language. Sources
are written by volunteers, so a request can take a while or be declined.

## Write a source

A source is a text recipe for simple sites, a few lines of settings for a Madara site, or a small WASM plug-in built
on the Tsuikabako toolkit. [Make sources](/make/) explains each way, how to test a source, and how to publish it here or
in a repository of your own. Sending one to Tsuikabako is described in
<a :href="`${SOURCE_REPO}/blob/main/CONTRIBUTING.md`">CONTRIBUTING.md</a>.

## About

Tsuikabako (追加箱, "add-on box") hosts sources, not content: each source reads a public website the way a browser
does. Kurobayomi itself ships with no sources and works without this repository.
