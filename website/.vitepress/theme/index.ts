import { h } from "vue";
import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import HeroBox from "./HeroBox.vue";
import HomeAdd from "./HomeAdd.vue";
import SourceList from "./SourceList.vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  // the home page's hero shows the animated box instead of an image, and adds the repository right there (HomeAdd)
  Layout: () => h(DefaultTheme.Layout, null, { "home-hero-image": () => h(HeroBox), "home-hero-actions-after": () => h(HomeAdd) }),
  enhanceApp({ app }) {
    app.component("SourceList", SourceList);
  },
} satisfies Theme;
