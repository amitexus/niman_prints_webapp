
import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/lib/server-api";

export async function GET() {
  try {
    const data = await serverApi("/inventory");
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Unable to fetch inventory.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await serverApi("/inventory", {
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
            : "Unable to create inventory item.",
      },
      { status: 500 }
    );
  }
}
