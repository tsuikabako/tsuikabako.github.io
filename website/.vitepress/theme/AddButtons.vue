<script setup lang="ts">
import { ref } from "vue";
import { ADD_LINK, INDEX_URL } from "../constants";

const copied = ref(false);
// the address may wrap only after a slash on a narrow screen, never inside a name
const addressParts = INDEX_URL.split(/(?<=\/)/);

async function copy() {
  try {
    await navigator.clipboard.writeText(INDEX_URL);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // no clipboard access (an old browser, a page not served over https): the address stays selectable below
  }
}
</script>

<template>
  <div class="add">
    <div class="buttons">
      <a class="button brand" :href="ADD_LINK">Add to Kurobayomi</a>
      <button class="button alt" type="button" @click="copy">{{ copied ? "Copied" : "Copy the address" }}</button>
    </div>
    <code class="address"><template v-for="part in addressParts" :key="part">{{ part }}<wbr /></template></code>
  </div>
</template>

<style scoped>
.add {
  margin: 24px 0;
}
.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.button {
  display: inline-block;
  padding: 0 20px;
  line-height: 40px;
  border: 1px solid transparent;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.25s;
}
.button.brand {
  color: var(--vp-button-brand-text);
  background: var(--vp-button-brand-bg);
}
.button.brand:hover {
  background: var(--vp-button-brand-hover-bg);
}
.button.alt {
  color: var(--vp-button-alt-text);
  background: var(--vp-button-alt-bg);
  border-color: var(--vp-button-alt-border);
}
.button.alt:hover {
  background: var(--vp-button-alt-hover-bg);
}
/* styled here in full: the home page's hero has none of a doc page's code styling */
.address {
  display: block;
  margin-top: 16px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--vp-code-block-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  user-select: all;
}
</style>
