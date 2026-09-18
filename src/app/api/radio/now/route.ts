import { NextResponse } from "next/server";
import { getRadioSnapshot } from "@/services/radio";

/** Metadata feed for the client player. Public, cached briefly at the edge. */
export async function GET() {
  const snapshot = await getRadioSnapshot();
  return NextResponse.json(snapshot, {
    headers: { "cache-control": "public, s-maxage=15, stale-while-revalidate=30" },
  });
}
