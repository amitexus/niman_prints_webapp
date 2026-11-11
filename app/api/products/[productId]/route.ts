
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;

type RouteContext = {
  params: Promise<{ productId: string }>;
};

async function handleRequest(
  request: NextRequest,
  context: RouteContext,
  method: "PUT" | "DELETE"
) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { detail: "Backend API URL is not configured." },
        { status: 500 }
      );
    }

    const { productId } = await context.params;

    if (!/^[a-fA-F0-9]{24}$/.test(productId)) {
      return NextResponse.json(
        { detail: "Invalid product ID." },
        { status: 400 }
      );
    }

    const accessToken = request.cookies.get("np_access_token")?.value;
    const refreshToken = request.cookies.get("np_refresh_token")?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { detail: "Please log in again." },
        { status: 401 }
      );
    }

    const body =
      method === "PUT" ? await request.json() : undefined;

    async function send(token: string) {
      return fetch(
        `${BACKEND_URL}/api/v1/products/${productId}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            ...(body ? { "Content-Type": "application/json" } : {}),
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
          cache: "no-store",
        }
      );
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
        return NextResponse.json(
          { detail: "Authentication service is temporarily unavailable." },
          { status: 503 }
        );
      }

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();

        if (
          typeof data.access_token === "string" &&
          Number.isFinite(data.expires_in) &&
          data.expires_in > 0
        ) {
          newAccessToken = data.access_token;
          expiresIn = data.expires_in;
          backendResponse = await send(newAccessToken!);
        }
      }
    }

    if (!backendResponse) {
      return NextResponse.json(
        { detail: "Session expired. Please log in again." },
        { status: 401 }
      );
    }

    const data = await backendResponse.json().catch(() => ({
      detail: "Invalid response from backend.",
    }));

    const response = NextResponse.json(data, {
      status: backendResponse.status,
    });

    if (newAccessToken && expiresIn) {
      response.cookies.set("np_access_token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: expiresIn,
      });
    }

    return response;
  } catch (error) {
    console.error(`Product ${method} error:`, error);

    return NextResponse.json(
      { detail: "Unable to process product request." },
      { status: 502 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  return handleRequest(request, context, "PUT");
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  return handleRequest(request, context, "DELETE");
}
