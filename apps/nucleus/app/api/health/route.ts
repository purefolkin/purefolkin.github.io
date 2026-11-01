import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    service: "nucleus",
    status: "ok",
    environment: "development-scaffold",
    liveOperationsEnabled: false,
  });
}
