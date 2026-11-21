import crypto from "node:crypto";
import { upsertContent } from "../_content-store.js";

function json(response, status, payload) {
  response
    .status(status)
    .setHeader("Content-Type", "application/json")
    .send(JSON.stringify(payload));
}

function bearerToken(request) {
  const raw = request.headers?.authorization || "";
  return raw.startsWith("Bearer ")
    ? raw.slice(7).trim()
    : "";
}

function tokenFingerprint(value) {
  if (!value) return null;

  return crypto
    .createHash("sha256")
    .update(String(value).trim())
    .digest("hex")
    .slice(0, 12);
}

function safeEqual(left, right) {
  if (!left || !right) return false;

  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));

  return (
    a.length === b.length &&
    crypto.timingSafeEqual(a, b)
  );
}

function clean(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeType(payload) {
  return (
    payload.type === "news" ||
    payload.contentType === "news"
  )
    ? "news"
    : "articles";
}

function normalizeAuthor(author) {
  if (typeof author === "string") {
    return { name: author, role: "" };
  }

  return {
    name: author?.name || "InthraCore Newsroom",
    role: author?.role || "",
  };
}

function normalizeImage(image) {
  if (typeof image === "string") {
    return { src: image, alt: "", credit: "" };
  }

  return {
    src: image?.src || image?.url || "",
    alt: image?.alt || "",
    credit: image?.credit || "",
  };
}

function normalizePayload(body) {
  const type = normalizeType(body);
  const slug =
    clean(body.slug) ||
    clean(body.source?.contentId);

  const author = normalizeAuthor(body.author);
  const image = normalizeImage(body.image);

  const publishedAt =
    body.publishedAt ||
    body.publication?.publishedAt ||
    new Date().toISOString();

  const updatedAt =
    body.updatedAt ||
    new Date().toISOString();

  return {
    id: body.source?.contentId || slug,
    sourceId: body.source?.contentId || slug,
    source: "inthracore",
    sourcePlatform: body.source?.platform || "inthracore",
    canonicalSource:
      body.source?.canonicalUrl ||
      body.origin?.sourceUrl ||
      "",
    requestId: body.requestId || "",
    contentVersion: body.source?.contentVersion || "",
    schemaVersion: body.schemaVersion || "1.0",
    event: body.event || "content.publish",
    type,
    contentType: type === "news" ? "news" : "article",
    slug,
    title: clean(body.title),
    description: clean(body.description),
    excerpt: clean(body.description || body.excerpt),
    content: body.content ?? body.body ?? "",
    contentFormat: body.contentFormat || "markdown",
    brand: body.brand || "inthracore",
    topic: body.topic || "",
    category:
      body.topic ||
      (type === "news" ? "News" : "Article"),
    author: author.name,
    position: author.role,
    image: image.src,
    featured_image: image.src,
    image_alt: image.alt,
    image_credit: image.credit,
    sources: Array.isArray(body.sources)
      ? body.sources
      : [],
    keywords: Array.isArray(body.secondaryKeywords)
      ? body.secondaryKeywords
      : [],
    seoTitle: body.seoTitle || body.title || "",
    metaDescription:
      body.metaDescription || body.description || "",
    shortAnswer: body.shortAnswer || "",
    primaryKeyword: body.primaryKeyword || "",
    secondaryKeywords: Array.isArray(body.secondaryKeywords)
      ? body.secondaryKeywords
      : [],
    geoQuestions: Array.isArray(body.geoQuestions)
      ? body.geoQuestions
      : [],
    publicationMode: body.publication?.mode || "native",
    status: body.publication?.state || "published",
    publishedAt,
    updatedAt,
    date: publishedAt,
  };
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, {
      success: false,
      code: "METHOD_NOT_ALLOWED",
      error: "POST required.",
    });
  }

  const expectedToken =
    String(
      process.env.ESTRATEJI_PUBLISH_TOKEN || ""
    ).trim();

  if (!expectedToken) {
    return json(response, 503, {
      success: false,
      code: "RECEIVER_NOT_CONFIGURED",
      error: "ESTRATEJI_PUBLISH_TOKEN is not configured.",
    });
  }

  const receivedToken =
    bearerToken(request);

  if (!safeEqual(receivedToken, expectedToken)) {
    console.warn("[estrateji-auth-debug]", {
      expectedPresent: Boolean(expectedToken),
      expectedLength: expectedToken.length,
      expectedFingerprint: tokenFingerprint(expectedToken),
      receivedPresent: Boolean(receivedToken),
      receivedLength: receivedToken.length,
      receivedFingerprint: tokenFingerprint(receivedToken),
    });

    return json(response, 401, {
      success: false,
      code: "UNAUTHORIZED",
      error: "Invalid publish token.",
    });
  }

  const body = request.body || {};

  if (
    body.destination &&
    body.destination !== "estrateji"
  ) {
    return json(response, 400, {
      success: false,
      code: "INVALID_DESTINATION",
      error: "Payload destination must be estrateji.",
    });
  }

  const record = normalizePayload(body);

  if (!record.slug || !record.title || !record.content) {
    return json(response, 400, {
      success: false,
      code: "VALIDATION_ERROR",
      error: "slug, title and content are required.",
    });
  }

  const idempotencyKey =
    request.headers["idempotency-key"] ||
    record.requestId ||
    `${record.sourceId}:${record.contentVersion || record.updatedAt}`;

  record.idempotencyKey = String(idempotencyKey);
  record.receivedAt = new Date().toISOString();

  const stored = await upsertContent(record);

  const siteUrl = (
    process.env.ESTRATEJI_SITE_URL ||
    "https://www.estrateji.com"
  ).replace(/\/$/, "");

  const path =
    stored.type === "news"
      ? `/news/${stored.slug}`
      : `/articles/${stored.slug}`;

  return json(response, 200, {
    success: true,
    action: "upserted",
    id: stored.id,
    slug: stored.slug,
    type: stored.type,
    url: `${siteUrl}${path}`,
    status: stored.status || "published",
    requestId: stored.requestId || null,
    sourceId: stored.sourceId,
  });
}
