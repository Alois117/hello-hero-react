/**
 * Centralized safe fetch + JSON parsing utility.
 *
 * Guarantees:
 *  - Never throws on empty body, invalid JSON, non-2xx, or network errors.
 *  - Returns a discriminated union so callers can pattern-match.
 *  - User-facing messages never expose internals.
 *  - Full technical detail is logged to the console only.
 */

// ── Result types ────────────────────────────────────────────────────────────

export interface SafeFetchSuccess<T = unknown> {
  ok: true;
  data: T;
  status: number;
  userMessage?: undefined;
  debug?: undefined;
}

export interface SafeFetchError {
  ok: false;
  data: null;
  status: number;
  /** Safe for UI display – never contains internals */
  userMessage: string;
  /** Technical detail – logged to console, never shown to users */
  debug: string;
}

export type SafeFetchResult<T = unknown> = SafeFetchSuccess<T> | SafeFetchError;

// ── User-friendly message map ───────────────────────────────────────────────

const friendlyMessages: Record<string, string> = {
  network: "Network error. Please check your connection and try again.",
  timeout: "The request timed out. Please try again.",
  unauthorized: "Your session has expired. Please log in again.",
  forbidden: "You don't have permission to access this resource.",
  notFound: "The requested resource was not found.",
  server: "Service is temporarily unavailable. Please try again later.",
  parse: "We received an unexpected response. Please try again.",
  empty: "No data available yet.",
  default: "Something went wrong. Please try again.",
};

const getUserMessage = (status: number, isParseError = false, isEmpty = false): string => {
  if (isEmpty) return friendlyMessages.empty;
  if (isParseError) return friendlyMessages.parse;
  if (status === 0) return friendlyMessages.network;
  if (status === 401) return friendlyMessages.unauthorized;
  if (status === 403) return friendlyMessages.forbidden;
  if (status === 404) return friendlyMessages.notFound;
  if (status === 408) return friendlyMessages.timeout;
  if (status >= 500) return friendlyMessages.server;
  return friendlyMessages.default;
};

// ── Safe JSON body parser ───────────────────────────────────────────────────

/**
 * Safely reads the response body.
 * Handles empty body, non-JSON content-type, and malformed JSON.
 */
async function safeParseBody(response: Response): Promise<{
  data: unknown;
  isEmpty: boolean;
  parseError: string | null;
}> {
  // 204 No Content or Content-Length: 0 → treat as empty (not error)
  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return { data: null, isEmpty: true, parseError: null };
  }

  let text: string;
  try {
    text = await response.text();
  } catch {
    return { data: null, isEmpty: true, parseError: "Could not read response body" };
  }

  // Truly empty body
  if (!text || text.trim().length === 0) {
    return { data: null, isEmpty: true, parseError: null };
  }

  // Try JSON parse
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
    try {
      return { data: JSON.parse(text), isEmpty: false, parseError: null };
    } catch (e) {
      const snippet = text.length > 200 ? text.slice(0, 200) + "…" : text;
      return {
        data: null,
        isEmpty: false,
        parseError: `JSON parse error: ${e instanceof Error ? e.message : "unknown"}. Body snippet: ${snippet}`,
      };
    }
  }

  // Non-JSON text – return as-is (some endpoints return plain text)
  return { data: text, isEmpty: false, parseError: null };
}

// ── Main helper ─────────────────────────────────────────────────────────────

/**
 * Wraps a native `Response` (already fetched) into a safe result.
 * Use this inside hooks that already call `authenticatedFetch` or `fetch`.
 *
 * @example
 * const response = await authenticatedFetch(url, opts);
 * const result = await safeParseResponse<MyData[]>(response, url);
 * if (!result.ok) { setError(result.userMessage); return; }
 * setData(result.data);
 */
export async function safeParseResponse<T = unknown>(
  response: Response,
  url?: string
): Promise<SafeFetchResult<T>> {
  const { data, isEmpty, parseError } = await safeParseBody(response);

  // Non-2xx
  if (!response.ok) {
    const debug = `HTTP ${response.status} from ${url || response.url}. Body: ${parseError || JSON.stringify(data)?.slice(0, 300) || "(empty)"}`;
    console.error(`[safeFetch] ${debug}`);
    return {
      ok: false,
      data: null,
      status: response.status,
      userMessage: getUserMessage(response.status),
      debug,
    };
  }

  // Parse error on a 2xx response
  if (parseError) {
    console.error(`[safeFetch] ${parseError}`);
    return {
      ok: false,
      data: null,
      status: response.status,
      userMessage: getUserMessage(response.status, true),
      debug: parseError,
    };
  }

  // 2xx but empty body → success with null data (caller decides how to handle)
  if (isEmpty) {
    return { ok: true, data: null as unknown as T, status: response.status };
  }

  return { ok: true, data: data as T, status: response.status };
}

/**
 * Wraps a network-level error (e.g. fetch() threw) into a safe error result.
 */
export function networkError(err: unknown, url?: string): SafeFetchError {
  const message = err instanceof Error ? err.message : String(err);
  const debug = `Network error for ${url || "unknown URL"}: ${message}`;
  console.error(`[safeFetch] ${debug}`);
  return {
    ok: false,
    data: null,
    status: 0,
    userMessage: getUserMessage(0),
    debug,
  };
}
