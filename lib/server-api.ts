
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function serverApi(
  endpoint: string,
  options: RequestInit = {}
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("np_access_token")?.value;

  if (!BACKEND_URL) {
    throw new Error("Backend API URL is not configured.");
  }

  if (!accessToken) {
    throw new Error("Authentication required.");
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
    throw new Error(
      `Backend API error (${response.status}): ${message}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
