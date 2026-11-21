import articlesData from "../components2/pages/platform/NewsRoom.jsx/articles.json";
import newsroomData from "../components2/pages/platform/NewsRoom.jsx/newsroom.json";

const INTHRACORE_BASE_URL =
  String(
    import.meta.env.VITE_INTHRACORE_BASE_URL ||
    ""
  ).replace(/\/$/, "");

const INTHRACORE_FEED_URL =
  import.meta.env.VITE_INTHRACORE_NEWSROOM_URL ||
  (
    INTHRACORE_BASE_URL
      ? `${INTHRACORE_BASE_URL}/api/public/estrateji`
      : ""
  );

const INTHRACORE_FEED_TIMEOUT_MS =
  7000;

const ESTRATEJI_RECEIVER_CONTENT_URL =
  import.meta.env.VITE_ESTRATEJI_CONTENT_URL ||
  "/api/content";

/* ============================================================
   NORMALIZATION
============================================================ */

function clean(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeReadTime(value) {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    const match =
      value.match(/\d+/);

    if (match) {
      return Number(
        match[0]
      );
    }
  }

  return null;
}

function normalizeAuthor(author) {
  if (
    typeof author ===
    "string"
  ) {
    return author;
  }

  if (
    author &&
    typeof author ===
      "object"
  ) {
    return (
      author.name ||
      author.label ||
      "E-strateji"
    );
  }

  return "E-strateji";
}

function normalizeImage(item) {
  const raw =
    item?.featured_image ||
    item?.coverImageUrl ||
    item?.cover_image_url ||
    item?.image ||
    item?.heroImage ||
    item?.thumbnail ||
    "";

  if (
    typeof raw ===
    "string"
  ) {
    return raw;
  }

  return (
    raw?.src ||
    raw?.url ||
    ""
  );
}

function normalizeImageAlt(item) {
  if (
    item?.image &&
    typeof item.image ===
      "object"
  ) {
    return (
      item.image.alt ||
      item.image_alt ||
      item.coverImageAlt ||
      item.title ||
      ""
    );
  }

  return (
    item?.image_alt ||
    item?.coverImageAlt ||
    item?.title ||
    ""
  );
}

function normalizeImageCredit(item) {
  if (
    item?.image &&
    typeof item.image ===
      "object"
  ) {
    return (
      item.image.credit ||
      item.image_credit ||
      item.coverImageCredit ||
      ""
    );
  }

  return (
    item?.image_credit ||
    item?.coverImageCredit ||
    ""
  );
}

function normalizeKeySentence(item) {
  if (
    clean(
      item?.key_sentence
    )
  ) {
    return item.key_sentence;
  }

  if (
    clean(
      item?.keySentence
    )
  ) {
    return item.keySentence;
  }

  if (
    Array.isArray(
      item?.quotableClaims
    ) &&
    item.quotableClaims.length
  ) {
    const claim =
      item.quotableClaims[0];

    if (
      typeof claim ===
      "string"
    ) {
      return claim;
    }

    if (
      claim &&
      typeof claim ===
        "object"
    ) {
      return (
        claim.text ||
        claim.claim ||
        claim.quote ||
        ""
      );
    }
  }

  return (
    item?.excerpt ||
    item?.subtitle ||
    item?.dek ||
    item?.description ||
    ""
  );
}

export function normalizeStory(
  item = {},
  fallbackType = "article"
) {
  const type =
    item.type === "news" ||
    item.contentType ===
      "news"
      ? "news"
      : fallbackType;

  const slug =
    item.slug ||
    item.id ||
    "";

  const readTime =
    normalizeReadTime(
      item.read_time ??
      item.readTime ??
      item.readingTime
    );

  const featuredImage =
    normalizeImage(item);

  return {
    /*
     * Preserve all legacy fields so current UI components
     * remain compatible.
     */
    ...item,

    id:
      item.id ||
      `${type}:${slug}`,

    slug,

    type,

    title:
      item.title ||
      "Untitled",

    excerpt:
      item.excerpt ||
      item.subtitle ||
      item.dek ||
      item.description ||
      "",

    category:
      item.category ||
      item.topicLabel ||
      item.topic ||
      (
        type === "news"
          ? "News"
          : "Article"
      ),

    author:
      normalizeAuthor(
        item.author
      ),

    position:
      item.position ||
      item.authorRole ||
      item.author?.role ||
      "",

    date:
      item.date ||
      item.publishedAt ||
      item.published_at ||
      "",

    read_time:
      readTime,

    /*
     * Compatibility aliases.
     */
    readTime:
      readTime
        ? `${readTime} min read`
        : "",

    featured_image:
      featuredImage,

    image:
      featuredImage,

    image_alt:
      normalizeImageAlt(
        item
      ),

    image_credit:
      normalizeImageCredit(
        item
      ),

    key_sentence:
      normalizeKeySentence(
        item
      ),

    keywords:
      Array.isArray(
        item.keywords
      )
        ? item.keywords
        : Array.isArray(
            item.tags
          )
          ? item.tags
          : [],

    content:
      item.content ??
      item.body ??
      "",

    canonical_url:
      item.canonical_url ||
      item.canonicalUrl ||
      "",

    source:
      item.source ||
      "estrateji",

    status:
      item.status ||
      "published",
  };
}

/* ============================================================
   LOCAL FALLBACK
============================================================ */

function newestFirst(
  items
) {
  return [
    ...items,
  ].sort(
    (a, b) => {
      const aTime =
        new Date(
          a.date ||
          a.publishedAt ||
          0
        ).getTime();

      const bTime =
        new Date(
          b.date ||
          b.publishedAt ||
          0
        ).getTime();

      return (
        (
          Number.isNaN(
            bTime
          )
            ? 0
            : bTime
        ) -
        (
          Number.isNaN(
            aTime
          )
            ? 0
            : aTime
        )
      );
    }
  );
}

export function getLocalNewsroomContent() {
  const articles =
    (
      articlesData?.articles ||
      []
    ).map(
      (item) =>
        normalizeStory(
          item,
          "article"
        )
    );

  const news =
    (
      newsroomData?.newsroom ||
      []
    ).map(
      (item) =>
        normalizeStory(
          item,
          "news"
        )
    );

  return {
    articles:
      newestFirst(
        articles
      ),

    news:
      newestFirst(
        news
      ),

    source:
      "local",
  };
}

/* ============================================================
   LIVE CONTENT
============================================================ */

function normalizePayload(
  payload
) {
  const root =
    payload?.content ||
    payload ||
    {};

  let articles =
    root.articles ||
    [];

  let news =
    root.news ||
    root.newsroom ||
    [];

  if (
    Array.isArray(
      root.items
    )
  ) {
    articles =
      root.items.filter(
        (item) =>
          item.type !==
          "news"
      );

    news =
      root.items.filter(
        (item) =>
          item.type ===
          "news"
      );
  }

  return {
    articles:
      newestFirst(
        (
          Array.isArray(
            articles
          )
            ? articles
            : []
        ).map(
          (item) =>
            normalizeStory(
              item,
              "article"
            )
        )
      ),

    news:
      newestFirst(
        (
          Array.isArray(
            news
          )
            ? news
            : []
        ).map(
          (item) =>
            normalizeStory(
              item,
              "news"
            )
        )
      ),

    source:
      "api",
  };
}

async function fetchNewsroomPayload(
  url,
  timeoutMs = INTHRACORE_FEED_TIMEOUT_MS
) {
  if (!url) return null;

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`${url} returned ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function mergeStories(fallback, incoming, sourceLabel) {
  const map = new Map();

  fallback.forEach((item) => {
    if (item?.slug) map.set(item.slug, item);
  });

  incoming.forEach((item) => {
    if (item?.slug) {
      map.set(item.slug, {
        ...item,
        source: item.source || sourceLabel,
      });
    }
  });

  return newestFirst([...map.values()]);
}

export async function getNewsroomContent() {
  const local = getLocalNewsroomContent();

  let result = {
    ...local,
    source: "local",
  };

  if (INTHRACORE_FEED_URL) {
    try {
      const payload = await fetchNewsroomPayload(
        INTHRACORE_FEED_URL
      );

      const live = normalizePayload(payload);

      result = {
        articles: mergeStories(
          result.articles,
          live.articles,
          "inthracore-feed"
        ),
        news: mergeStories(
          result.news,
          live.news,
          "inthracore-feed"
        ),
        source: "hybrid",
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.info(
          "[newsroom] InthraCore feed unavailable",
          error?.message || ""
        );
      }
    }
  }

  try {
    const payload = await fetchNewsroomPayload(
      ESTRATEJI_RECEIVER_CONTENT_URL
    );

    const received = normalizePayload(payload);

    result = {
      articles: mergeStories(
        result.articles,
        received.articles,
        "inthracore"
      ),
      news: mergeStories(
        result.news,
        received.news,
        "inthracore"
      ),
      source: "receiver",
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.info(
        "[newsroom] local receiver store unavailable",
        error?.message || ""
      );
    }
  }

  return result;
}

export async function getArticleBySlug(
  slug
) {
  const {
    articles,
  } =
    await getNewsroomContent();

  return (
    articles.find(
      (article) =>
        article.slug ===
        slug
    ) ||
    null
  );
}

export async function getNewsBySlug(
  slug
) {
  const {
    news,
  } =
    await getNewsroomContent();

  return (
    news.find(
      (article) =>
        article.slug ===
        slug
    ) ||
    null
  );
}

export default {
  getNewsroomContent,
  getArticleBySlug,
  getNewsBySlug,
  normalizeStory,
};
