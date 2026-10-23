import { h } from "vue";
import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import AddButtons from "./AddButtons.vue";
import HeroBox from "./HeroBox.vue";
import SourceList from "./SourceList.vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  // the home page's hero shows the animated box instead of an image
  Layout: () => h(DefaultTheme.Layout, null, { "home-hero-image": () => h(HeroBox) }),
  enhanceApp({ app }) {
    app.component("AddButtons", AddButtons);
    app.component("SourceList", SourceList);
  },
} satisfies Theme;
