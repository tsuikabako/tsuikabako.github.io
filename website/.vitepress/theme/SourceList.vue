<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { INDEX_URL, SOURCE_REPO } from "../constants";

// one entry of index.min.json, the fields this page shows
interface Source {
  id: string;
  name: string;
  lang: string;
  kind: "manga" | "anime";
  version: number;
  icon?: string;
  status?: "active" | "blocked" | "broken";
}

const sources = ref<Source[]>([]);
const failed = ref(false);
const loading = ref(true);
const query = ref("");
const kind = ref<"" | "manga" | "anime">("");
const lang = ref("");

// read at each visit, so the list is always the index's and the site needs no rebuild when sources change
onMounted(async () => {
  try {
    const response = await fetch(INDEX_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(String(response.status));
    sources.value = (await response.json()).sources ?? [];
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
});

const names = new Intl.DisplayNames(["en"], { type: "language" });
function language(code: string): string {
  if (code === "all" || code === "other") return "Multiple";
  try {
    return names.of(code) ?? code;
  } catch {
    return code;
  }
}

const languages = computed(() => [...new Set(sources.value.map((s) => s.lang))].sort((a, b) => language(a).localeCompare(language(b))));

const shown = computed(() => {
  const words = query.value.trim().toLowerCase();
  return sources.value
    .filter((s) => (!kind.value || s.kind === kind.value) && (!lang.value || s.lang === lang.value))
    .filter((s) => !words || s.name.toLowerCase().includes(words))
    .sort((a, b) => a.name.localeCompare(b.name));
});

const STATUS: Record<string, string> = { active: "Works", blocked: "Blocked by the site", broken: "Broken" };
</script>

<template>
  <div class="sources">
    <div class="filters">
      <input v-model="query" type="search" placeholder="Search sources" aria-label="Search sources" />
      <select v-model="kind" aria-label="Kind">
        <option value="">Manga and anime</option>
        <option value="manga">Manga</option>
        <option value="anime">Anime</option>
      </select>
      <select v-model="lang" aria-label="Language">
        <option value="">All languages</option>
        <option v-for="code in languages" :key="code" :value="code">{{ language(code) }}</option>
      </select>
    </div>

    <p v-if="loading">Loading the source list…</p>
    <p v-else-if="failed">The source list could not be loaded. Try again later, or read it in <a :href="SOURCE_REPO">the source repository</a>.</p>
    <template v-else>
      <p class="count">{{ shown.length }} of {{ sources.length }} sources</p>
      <ul class="list">
        <li v-for="source in shown" :key="source.id" class="row">
          <img v-if="source.icon" :src="source.icon" alt="" width="40" height="40" loading="lazy" />
          <span v-else class="letter" aria-hidden="true">{{ source.name.charAt(0) }}</span>
          <span class="text">
            <span class="name">{{ source.name }}</span>
            <span class="meta">{{ source.kind === "anime" ? "Anime" : "Manga" }} · {{ language(source.lang) }} · version {{ source.version }}</span>
          </span>
          <span class="status" :class="source.status ?? 'active'">{{ STATUS[source.status ?? "active"] }}</span>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}
.filters input,
.filters select {
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}
.filters input {
  flex: 1 1 200px;
}
.count {
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  margin: 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.row img,
.letter {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
}
.letter {
  display: grid;
  place-items: center;
  background: var(--vp-c-default-soft);
  font-weight: 600;
}
.text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.name {
  font-weight: 600;
}
.meta {
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.status {
  flex: none;
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 999px;
}
.status.active {
  color: var(--vp-c-green-1);
  background: var(--vp-c-green-soft);
}
.status.blocked {
  color: var(--vp-c-yellow-1);
  background: var(--vp-c-yellow-soft);
}
.status.broken {
  color: var(--vp-c-red-1);
  background: var(--vp-c-red-soft);
}
</style>
