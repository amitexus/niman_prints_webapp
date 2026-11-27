
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_API_URL;

export class ServerApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ServerApiError";
    this.status = status;
    this.detail = detail;
  }
}

export async function serverApi(
  endpoint: string,
  options: RequestInit = {}
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("np_access_token")?.value;

  if (!BACKEND_URL) {
    throw new ServerApiError(
      500,
      "Backend API URL is not configured."
    );
  }

  if (!accessToken) {
    throw new ServerApiError(
      401,
      "Authentication required."
    );
  }

  const response = await fetch(
    `${BACKEND_URL}/api/v1${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new ServerApiError(
      response.status,
      message || "Backend API request failed."
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
