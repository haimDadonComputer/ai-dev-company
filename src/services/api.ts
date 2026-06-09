import type { ApiErrorBody } from "../types/app.js";

export class ApiError extends Error {
  public readonly status: number;

  public constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | Record<string, unknown>;
}

interface ApiErrorResponse {
  message?: string;
  error?: string | ApiErrorBody;
}

function isBodyInit(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  );
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  let body = options.body;

  if (body !== undefined && !isBodyInit(body)) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  const response = await fetch(path, {
    ...options,
    headers,
    body,
    credentials: "same-origin"
  });

  if (!response.ok) {
    let errorBody: ApiErrorResponse = {};
    try {
      errorBody = (await response.json()) as ApiErrorResponse;
    } catch {
      errorBody = {};
    }
    const nestedMessage =
      typeof errorBody.error === "object" ? errorBody.error.message : errorBody.error;
    throw new ApiError(
      errorBody.message ?? nestedMessage ?? "הבקשה נכשלה.",
      response.status
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const result = (await response.json()) as T | { data: T };
  if (typeof result === "object" && result !== null && "data" in result) {
    return result.data;
  }
  return result;
}
