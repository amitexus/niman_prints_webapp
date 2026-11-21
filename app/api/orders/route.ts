
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

    if (refreshResponse.status >= 500) {
      return {
        response: NextResponse.json(
          { detail: "Authentication service is temporarily unavailable." },
          { status: 503 }
        ),
      };
    }

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
    }
  }

  if (!backendResponse) {
    return {
      response: NextResponse.json(
        { detail: "Session expired. Please log in again." },
        { status: 401 }
      ),
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

  return { response: result };
}


export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const query = new URLSearchParams();

    const search = params.get("search");
    const status = params.get("status");
    const customerId = params.get("customer_id");
    const skip = params.get("skip");
    const limit = params.get("limit");

    if (search) query.set("search", search);
    if (status) query.set("status", status);
    if (customerId) query.set("customer_id", customerId);
    if (skip) query.set("skip", skip);
    if (limit) query.set("limit", limit);

    const endpoint = `/orders?${query.toString()}`;

    const result = await backendFetch(request, endpoint);
    return result.response;
  } catch (error) {
    console.error("Orders GET error:", error);

    return NextResponse.json(
      { detail: "Unable to load orders." },
      { status: 502 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await backendFetch(request, "/orders", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return result.response;
  } catch (error) {
    console.error("Orders POST error:", error);

    return NextResponse.json(
      { detail: "Unable to create order." },
      { status: 502 }
    );
  }
}
