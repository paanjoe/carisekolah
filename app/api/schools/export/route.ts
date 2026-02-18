import { getAllSchools } from "@/lib/schools";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const schools = getAllSchools();
  const json = JSON.stringify(schools, null, 0);

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="schools.json"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
