import {
  get,
  list,
  put,
} from "@vercel/blob";

const PREFIX = "estrateji/newsroom";

function keyFor(type, slug) {
  return `${PREFIX}/${type}/${slug}.json`;
}

function normalizeType(value) {
  return value === "news"
    ? "news"
    : "articles";
}

async function readBlobJson(pathname) {
  try {
    const result = await get(pathname, {
      access: "private",
      useCache: false,
    });

    if (!result) return null;

    if (typeof result.json === "function") {
      return await result.json();
    }

    if (typeof result.text === "function") {
      return JSON.parse(await result.text());
    }

    if (result.stream) {
      return await new Response(result.stream).json();
    }

    return null;
  } catch {
    return null;
  }
}

export async function upsertContent(record) {
  const type = normalizeType(record.type);

  await put(
    keyFor(type, record.slug),
    JSON.stringify({
      ...record,
      type,
    }),
    {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    }
  );

  return {
    ...record,
    type,
  };
}

export async function listContent(type) {
  const normalizedType = normalizeType(type);

  const result = await list({
    prefix: `${PREFIX}/${normalizedType}/`,
  });

  const records = await Promise.all(
    (result.blobs || []).map(
      async (blob) => readBlobJson(blob.pathname)
    )
  );

  return records
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(
          b.updatedAt || b.publishedAt || 0
        ).getTime() -
        new Date(
          a.updatedAt || a.publishedAt || 0
        ).getTime()
    );
}

export async function listAllContent() {
  const [articles, news] = await Promise.all([
    listContent("articles"),
    listContent("news"),
  ]);

  return { articles, news };
}
