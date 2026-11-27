
import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/lib/server-api";

export async function GET() {
  try {
    const data = await serverApi("/inventory/movements");
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Unable to fetch stock movements.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const data = await serverApi("/inventory/movements", {
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
            : "Unable to record stock movement.",
      },
      { status: 500 }
    );
  }
}
