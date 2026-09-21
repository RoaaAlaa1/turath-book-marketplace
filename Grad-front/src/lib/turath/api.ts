export function apiBaseUrl() {
  return (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
}

export function getStoredToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("token");
}

export function authHeaders(includeJson = true): HeadersInit {
  const token = getStoredToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export function safeDecodeJwtPayload(token: string | null): any {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonStr);
  } catch {
    try {
      let base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4 !== 0) {
        base64 += "=";
      }
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }
}

export function currentUserId(): string | null {
  const token = getStoredToken();
  const decoded = safeDecodeJwtPayload(token);
  if (!decoded) return null;

  return (
    decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
    decoded.nameid ??
    decoded.sub ??
    decoded.uid ??
    decoded.userId ??
    null
  );
}

export function currentUserRoles(): string[] {
  const token = getStoredToken();
  const decoded = safeDecodeJwtPayload(token);
  if (!decoded) return [];

  const raw =
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
    decoded.role ??
    decoded.roles;
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${input}`, {
    ...init,
    headers: {
      ...authHeaders(init?.body !== undefined),
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  let data: any = null;
  if (text && text.trim().length > 0) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: string }).message)
        : typeof data === "object" && data !== null && "title" in data
          ? String((data as { title?: string }).title)
          : typeof data === "string" && data.trim().length > 0
            ? data
            : response.statusText || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return (data ?? {}) as T;
}
