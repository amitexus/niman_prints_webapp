
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;

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
    return {
      response: NextResponse.json(
        { detail: "Please log in again." },
        { status: 401 }
      ),
      backendResponse: null,
    };
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
      return {
        response: NextResponse.json(
          {
            detail:
              "Authentication service is temporarily unavailable.",
          },
          { status: 503 }
        ),
        backendResponse: null,
      };
    }
  }

  if (!backendResponse) {
    return {
      response: NextResponse.json(
        { detail: "Session expired. Please log in again." },
        { status: 401 }
      ),
      backendResponse: null,
    };
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

  return {
    response: result,
    backendResponse,
  };
}

// GET: List and search customers
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const query = new URLSearchParams();

    const search = params.get("search");
    const customerType = params.get("customer_type");
    const activeOnly = params.get("active_only");

    if (search) query.set("search", search);
    if (customerType) {
      query.set("customer_type", customerType);
    }

    query.set(
      "active_only",
      activeOnly === "false" ? "false" : "true"
    );

    const result = await backendFetch(
      request,
      `/customers?${query.toString()}`
    );

    return result.response;
  } catch (error) {
    console.error("Customers GET error:", error);

    return NextResponse.json(
      { detail: "Unable to load customers." },
      { status: 502 }
    );
  }
}

// POST: Create a customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await backendFetch(request, "/customers", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return result.response;
  } catch (error) {
    console.error("Customers POST error:", error);

    return NextResponse.json(
      { detail: "Unable to create customer." },
      { status: 502 }
    );
  }
}
