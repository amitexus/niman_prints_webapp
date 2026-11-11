
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";

  const accessToken = request.cookies.get("np_access_token")?.value;
  const refreshToken = request.cookies.get("np_refresh_token")?.value;

  function redirectToLogin() {
    const response = NextResponse.redirect(
      new URL("/login", request.url)
    );

    response.cookies.delete("np_access_token");
    response.cookies.delete("np_refresh_token");

    return response;
  }

  // No credentials: allow the login page, protect everything else.
  if (!accessToken && !refreshToken) {
    return isLoginPage
      ? NextResponse.next()
      : redirectToLogin();
  }

  if (!BACKEND_URL) {
    return new NextResponse("Authentication server is not configured.", {
      status: 500,
    });
  }

  try {
    let validAccessToken = accessToken;

    // Verify the existing access token.
    if (validAccessToken) {
      const profileResponse = await fetch(
        `${BACKEND_URL}/api/v1/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${validAccessToken}`,
          },
          cache: "no-store",
        }
      );

      if (!profileResponse.ok) {
        if (profileResponse.status !== 401) {
          return new NextResponse(
            "Unable to verify your session. Please try again.",
            { status: 503 }
          );
        }

        validAccessToken = undefined;
      }
    }

    // Access token expired or missing: attempt renewal.
    let renewedToken: string | undefined;
    let expiresIn: number | undefined;

    if (!validAccessToken && refreshToken) {
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

      if (refreshResponse.status >= 500) {
        return new NextResponse(
          "Unable to refresh your session. Please try again.",
          { status: 503 }
        );
      }

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();

        if (
          typeof data.access_token === "string" &&
          data.access_token &&
          Number.isFinite(data.expires_in) &&
          data.expires_in > 0
        ) {
          renewedToken = data.access_token;
          expiresIn = data.expires_in;

          // Verify the newly issued token.
          const verification = await fetch(
            `${BACKEND_URL}/api/v1/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${renewedToken}`,
              },
              cache: "no-store",
            }
          );

          if (!verification.ok) {
            return new NextResponse(
              "Unable to verify renewed session.",
              { status: 503 }
            );
          }

          validAccessToken = renewedToken;
        }
      }
    }

    // No valid session remains.
    if (!validAccessToken) {
      return isLoginPage
        ? redirectToLogin()
        : redirectToLogin();
    }

    // Valid session: keep users away from login.
    const response = isLoginPage
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();

    // Save the renewed token when applicable.
    if (renewedToken && expiresIn) {
      response.cookies.set({
        name: "np_access_token",
        value: renewedToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: expiresIn,
      });
    }

    return response;
  } catch (error) {
    console.error("Authentication proxy error:", error);

    return new NextResponse(
      "Authentication service is temporarily unavailable.",
      { status: 503 }
    );
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
