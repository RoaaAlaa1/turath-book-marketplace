export function apiBaseUrl() {
  return (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
}

export function authHeaders(includeJson = true): HeadersInit {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export function currentUserId(): string | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    return (
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
      decoded.nameid ??
      null
    );
  } catch {
    return null;
  }
}

export function currentUserRoles(): string[] {
  const token = localStorage.getItem("token");
  if (!token) return [];

  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    const raw = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    return Array.isArray(raw) ? raw : raw ? [raw] : [];
  } catch {
    return [];
  }
}

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${input}`, {
    ...init,
    headers: {
      ...authHeaders(init?.body !== undefined),
      ...(init?.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: string }).message)
        : typeof data === "string"
          ? data
          : "Request failed";
    throw new Error(message);
  }

  return data as T;
}
