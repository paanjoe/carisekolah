import { NextRequest } from "next/server";
import { getSearchSuggestions } from "@/lib/schools";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 12, 20);
  const suggestions = getSearchSuggestions(q, limit);
  return Response.json(suggestions);
}
