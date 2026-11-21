import type { HeadConfig, TransformContext } from "vitepress";

// What search engines and link previews read on every page: the page's own address (canonical), title and description
// as Open Graph and Twitter card tags, and the site's social image. Built from the page itself at build time
// (`transformHead` in config.ts), so a new page gets them with no extra step; its frontmatter `description` is the text.

export interface Site {
  /** The site's address, with the trailing slash. */
  url: string;
  name: string;
  /** The social image's path in `public/`: a 1200 x 630 PNG (link previews do not show SVG). */
  image: string;
  imageAlt: string;
}

/** The address a page is served at: no `.md`, no `index` (the site uses clean URLs). */
export function pageUrl(site: Site, page: string): string {
  return new URL(page.replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, ""), site.url).href;
}

/** Whether the page names its own canonical address in its frontmatter: a page that only sends the visitor elsewhere. */
export function isRedirect(ctx: TransformContext): boolean {
  const head: HeadConfig[] = ctx.pageData.frontmatter.head ?? [];
  return head.some(([tag, attrs]) => tag === "link" && (attrs as Record<string, string>)?.rel === "canonical");
}

export function seoHead(site: Site, ctx: TransformContext): HeadConfig[] {
  if (ctx.pageData.isNotFound || isRedirect(ctx)) return [];
  const url = pageUrl(site, ctx.page);
  const og = (property: string, content: string): HeadConfig => ["meta", { property, content }];
  return [
    ["link", { rel: "canonical", href: url }],
    og("og:type", "website"),
    og("og:site_name", site.name),
    og("og:title", ctx.title),
    og("og:description", ctx.description),
    og("og:url", url),
    og("og:image", new URL(site.image, site.url).href),
    og("og:image:width", "1200"),
    og("og:image:height", "630"),
    og("og:image:alt", site.imageAlt),
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
  ];
}
