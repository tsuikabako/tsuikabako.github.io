# tsuikabako.github.io

The website of Tsuikabako, the source repository for [Kurobayomi](https://github.com/kurobayomi/kurobayomi):
<https://tsuikabako.github.io>. Built with [VitePress](https://vitepress.dev).

```sh
npm ci
npm run dev      # http://localhost:5173, reloads on save
npm run build    # the site in website/.vitepress/dist
```

- Pages are Markdown files in `website/`; the two components (the add buttons and the source list) are in
  `website/.vitepress/theme/`.
- Every address the site uses is in `website/.vitepress/constants.ts`.
- The source list is read from the repository's `index.min.json` in the browser, so new or fixed sources show without
  a rebuild.
- A push to `main` publishes the site (`.github/workflows/deploy.yml`). In the repository's settings, Pages must use
  "GitHub Actions" as its source.

Licence: Apache-2.0.
