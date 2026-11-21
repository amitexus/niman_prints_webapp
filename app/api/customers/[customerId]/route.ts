
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;

type RouteContext = {
  params: Promise<{ customerId: string }>;
};

async function backendFetch(
  request: NextRequest,
  endpoint: string,
  options: RequestInit = {}
) {
  if (!BACKEND_URL) {
    throw new Error("Backend API URL is not configured.");
  }

  const accessToken = request.cookies.get("np_access_token")?.value;
  const refreshToken = request.cookies.get("np_refresh_token")?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json(
      { detail: "Please log in again." },
      { status: 401 }
    );
  }

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  async function send(token: string) {
    headers.set("Authorization", `Bearer ${token}`);

    return fetch(`${BACKEND_URL}/api/v1${endpoint}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  }

  let backendResponse: Response | null = null;

  if (accessToken) {
    backendResponse = await send(accessToken);
  }

  let newAccessToken: string | undefined;
  let expiresIn: number | undefined;

  if (
    (!backendResponse || backendResponse.status === 401) &&
    refreshToken
  ) {
    const refreshResponse = await fetch(
      `${BACKEND_URL}/api/v1/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
      }
    );

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();

    if (
      typeof data.access_token === "string" &&
      Number.isFinite(data.expires_in) &&
      data.expires_in > 0
    ) {
      const refreshedAccessToken: string = data.access_token;

    newAccessToken = refreshedAccessToken;
    expiresIn = data.expires_in;

    backendResponse = await send(refreshedAccessToken);
    }
    
    } else if (refreshResponse.status >= 500) {
      return NextResponse.json(
        { detail: "Authentication service is temporarily unavailable." },
        { status: 503 }
      );
    }
  }

  if (!backendResponse) {
    return NextResponse.json(
      { detail: "Session expired. Please log in again." },
      { status: 401 }
    );
  }

  const result = NextResponse.json(
    await backendResponse.json().catch(() => ({
      detail: "Invalid response from backend.",
    })),
    { status: backendResponse.status }
  );

  if (newAccessToken && expiresIn) {
    result.cookies.set("np_access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn,
    });
  }

  return result;
}

// GET: Retrieve one customer
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { customerId } = await context.params;

    return await backendFetch(
      request,
      `/customers/${encodeURIComponent(customerId)}`
    );
  } catch (error) {
    console.error("Customer GET error:", error);

    return NextResponse.json(
      { detail: "Unable to load customer." },
      { status: 502 }
    );
  }
}

// PUT: Update customer
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { customerId } = await context.params;
    const body = await request.json();

    return await backendFetch(
      request,
      `/customers/${encodeURIComponent(customerId)}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    );
  } catch (error) {
    console.error("Customer PUT error:", error);

    return NextResponse.json(
      { detail: "Unable to update customer." },
      { status: 502 }
    );
  }
}

// DELETE: Archive customer
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { customerId } = await context.params;

    return await backendFetch(
      request,
      `/customers/${encodeURIComponent(customerId)}`,
      { method: "DELETE" }
    );
  } catch (error) {
    console.error("Customer DELETE error:", error);

    return NextResponse.json(
      { detail: "Unable to archive customer." },
      { status: 502 }
    );
  }
}

// PATCH: Restore or change customer status
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { customerId } = await context.params;
    const body = await request.json();

    if (typeof body.is_active !== "boolean") {
      return NextResponse.json(
        { detail: "is_active must be true or false." },
        { status: 400 }
      );
    }

    const query = new URLSearchParams({
      is_active: String(body.is_active),
    });

    return await backendFetch(
      request,
      `/customers/${encodeURIComponent(customerId)}/status?${query}`,
      { method: "PATCH" }
    );
  } catch (error) {
    console.error("Customer PATCH error:", error);

    return NextResponse.json(
      { detail: "Unable to update customer status." },
      { status: 502 }
    );
  }
}
