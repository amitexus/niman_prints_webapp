
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;

interface RefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function GET(request: NextRequest) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { detail: "Backend API URL is not configured" },
        { status: 500 }
      );
    }

    const accessToken = request.cookies.get("np_access_token")?.value;
    const refreshToken = request.cookies.get("np_refresh_token")?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ authenticated: false });
    }

    // First, try the existing access token.
    if (accessToken) {
      const profileResponse = await fetch(
        `${BACKEND_URL}/api/v1/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        }
      );

      if (profileResponse.ok) {
        const user = await profileResponse.json();

        return NextResponse.json({
          authenticated: true,
          user,
        });
      }

      if (profileResponse.status !== 401) {
        return NextResponse.json(
          { detail: "Unable to verify your session" },
          { status: 502 }
        );
      }
    }

    // Access token expired. Try the refresh token.
    if (!refreshToken) {
      const response = NextResponse.json({ authenticated: false });
      response.cookies.delete("np_access_token");
      response.cookies.delete("np_refresh_token");
      return response;
    }

    const refreshResponse = await fetch(
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

    if (!refreshResponse.ok) {
      if (refreshResponse.status >= 500) {
        return NextResponse.json(
          { detail: "Unable to refresh your session" },
          { status: 502 }
        );
      }

      const response = NextResponse.json({ authenticated: false });
      response.cookies.delete("np_access_token");
      response.cookies.delete("np_refresh_token");
      return response;
    }

    const refreshData =
      (await refreshResponse.json()) as RefreshResponse;

    const newAccessToken = refreshData.access_token;
    const expiresIn = Number(refreshData.expires_in);

    if (
      typeof newAccessToken !== "string" ||
      !newAccessToken ||
      !Number.isFinite(expiresIn) ||
      expiresIn <= 0
    ) {
      return NextResponse.json(
        { detail: "Invalid token response from backend" },
        { status: 502 }
      );
    }

    // Verify the renewed access token.
    const profileResponse = await fetch(
      `${BACKEND_URL}/api/v1/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${newAccessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!profileResponse.ok) {
      return NextResponse.json(
        { detail: "Unable to verify renewed session" },
        { status: 502 }
      );
    }

    const user = await profileResponse.json();

    const response = NextResponse.json({
      authenticated: true,
      user,
    });

    // Save renewed access token securely.
    response.cookies.set({
      name: "np_access_token",
      value: newAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn,
    });

    return response;
  } catch (error) {
    console.error("Session verification error:", error);

    return NextResponse.json(
      { detail: "Unable to connect to authentication server" },
      { status: 502 }
    );
  }
}
