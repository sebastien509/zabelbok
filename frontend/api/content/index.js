import { listAllContent } from "../_content-store.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({
      success: false,
      error: "GET required.",
    });
  }

  const content = await listAllContent();

  response.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  );

  return response.status(200).json({
    success: true,
    source: "estrateji-receiver",
    content,
  });
}
