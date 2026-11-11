
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function POST(request: NextRequest) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { detail: "Backend API URL is not configured" },
        { status: 500 }
      );
    }

    const refreshToken = request.cookies.get("np_refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { detail: "Refresh session not found. Please log in again." },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/v1/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
        cache: "no-store",
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      const response = NextResponse.json(
        { detail: data.detail || "Session expired. Please log in again." },
        { status: backendResponse.status }
      );

      response.cookies.delete("np_access_token");
      response.cookies.delete("np_refresh_token");

      return response;
    }

    const response = NextResponse.json({
      success: true,
      expires_in: data.expires_in,
    });

    response.cookies.set("np_access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: data.expires_in,
    });

    return response;
  } catch {
    return NextResponse.json(
      { detail: "Unable to refresh authentication session" },
      { status: 500 }
    );
  }
}
