import { NextRequest } from "next/server";
import { z } from "zod";
import { getSearchSuggestions } from "@/lib/schools";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().max(200).default("").transform((s) => s.trim()),
  limit: z.coerce.number().int().min(1).max(20).default(12),
});

export async function GET(request: NextRequest) {
  const id = getClientIdentifier(request);
  const limitResult = checkRateLimit(id);
  if (!limitResult.ok) {
    return new Response(
      JSON.stringify({ error: "Too many requests", retryAfter: limitResult.retryAfter }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(limitResult.retryAfter),
        },
      }
    );
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(searchParams);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { q, limit } = parsed.data;
  const suggestions = getSearchSuggestions(q, limit);
  return Response.json(suggestions);
}
