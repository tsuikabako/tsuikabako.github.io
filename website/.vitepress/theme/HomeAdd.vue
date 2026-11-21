<script setup lang="ts">
// The home page's hero actions: adding the repository is the page's one job, so it happens here, with no page in between.
// The buttons and the address are the shared AddButtons; the steps by hand fold away under them.
import AddButtons from "./AddButtons.vue";
import { APP_SITE } from "../constants";
</script>

<template>
  <div class="home-add">
    <AddButtons />
    <p class="needs">You need <a :href="APP_SITE">Kurobayomi</a> installed.</p>
    <details class="by-hand">
      <summary>Add it by hand</summary>
      <ol>
        <li>
          Open Kurobayomi and click <strong>Add a source repository</strong> on the welcome screen. Once you have a
          repository, the same is in <strong>Settings → Sources and tracking → Repositories</strong>, behind
          <strong>Add</strong>.
        </li>
        <li>Paste the address above.</li>
        <li>Click <strong>Add</strong>.</li>
      </ol>
      <p>
        Kurobayomi then lets you pick the sources to turn on; you can change them later in Browse. It checks the
        repository at every start, so new sources and fixes come by themselves.
      </p>
    </details>
    <a class="sources" href="/sources">See the sources →</a>
  </div>
</template>

<style scoped>
/* as wide as the tagline above it: 392 px on a phone, 576 px from 640 px up; centred with the hero below 960 px */
.home-add {
  max-width: 392px;
  margin: 0 auto;
  text-align: left;
}
@media (min-width: 640px) {
  .home-add {
    max-width: 576px;
  }
}
@media (min-width: 960px) {
  .home-add {
    margin: 0;
  }
}
/* the buttons centre with the hero's text below 960 px, as the hero's own actions do */
.home-add :deep(.add) {
  margin: 24px 0 0;
}
@media (max-width: 959px) {
  .home-add :deep(.buttons) {
    justify-content: center;
  }
  .needs,
  .sources,
  .by-hand summary {
    text-align: center;
  }
}
.needs {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 22px;
  color: var(--vp-c-text-2);
}
.needs a {
  color: var(--vp-c-text-1);
  font-weight: 600;
  text-decoration: underline;
}
.by-hand {
  margin-top: 16px;
  font-size: 14px;
  line-height: 22px;
  color: var(--vp-c-text-2);
}
.by-hand summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.by-hand ol {
  margin: 8px 0 0;
  padding-left: 20px;
  list-style: decimal;
}
.by-hand li + li {
  margin-top: 4px;
}
.by-hand p {
  margin: 8px 0 0;
}
.sources {
  display: block;
  margin-top: 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.sources:hover {
  text-decoration: underline;
}
</style>
