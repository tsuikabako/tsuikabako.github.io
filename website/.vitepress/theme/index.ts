import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import AddButtons from "./AddButtons.vue";
import SourceList from "./SourceList.vue";
import "./style.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("AddButtons", AddButtons);
    app.component("SourceList", SourceList);
  },
} satisfies Theme;
