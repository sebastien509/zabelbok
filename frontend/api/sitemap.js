import { listAllContent } from "./_content-store.js";

function escapeXml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export default async function handler(request, response) {
  const base = (
    process.env.ESTRATEJI_SITE_URL ||
    "https://www.estrateji.com"
  ).replace(/\/$/, "");

  const { articles, news } = await listAllContent();

  const staticPaths = [
    "/",
    "/magazine",
    "/news",
    "/about",
  ];

  const entries = [
    ...staticPaths.map((path) => ({
      url: `${base}${path}`,
      updatedAt: null,
    })),
    ...articles.map((item) => ({
      url: `${base}/articles/${item.slug}`,
      updatedAt: item.updatedAt || item.publishedAt,
    })),
    ...news.map((item) => ({
      url: `${base}/news/${item.slug}`,
      updatedAt: item.updatedAt || item.publishedAt,
    })),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map(
        (item) =>
          `  <url>\n` +
          `    <loc>${escapeXml(item.url)}</loc>\n` +
          (item.updatedAt
            ? `    <lastmod>${escapeXml(item.updatedAt)}</lastmod>\n`
            : "") +
          `  </url>`
      )
      .join("\n") +
    `\n</urlset>`;

  response.setHeader(
    "Content-Type",
    "application/xml; charset=utf-8"
  );
  response.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=3600"
  );

  return response.status(200).send(body);
}
