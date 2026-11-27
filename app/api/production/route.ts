
import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/lib/server-api";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");

    const endpoint = status
      ? `/production?status=${encodeURIComponent(status)}`
      : "/production";

    const data = await serverApi(endpoint);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Unable to fetch production jobs.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const data = await serverApi("/production", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Unable to create production job.",
      },
      { status: 500 }
    );
  }
}
