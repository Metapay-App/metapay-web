export interface ApiErrorPayload {
  message: string;
  code: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  body?: unknown,
  options?: ApiRequestOptions
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options?.headers ?? {}),
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options?.signal,
  });

  const text = await response.text();
  const parsed: unknown = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const errObj =
      parsed && typeof parsed === "object"
        ? (parsed as Partial<ApiErrorPayload>)
        : {};
    throw new ApiClientError(
      response.status,
      errObj.code ?? "HTTP_ERROR",
      errObj.message ?? `Request failed with status ${response.status}`,
      errObj.details
    );
  }

  return parsed as T;
}

export const apiClient = {
  get<T>(url: string, options?: ApiRequestOptions): Promise<T> {
    return request<T>("GET", url, undefined, options);
  },
  post<T>(url: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return request<T>("POST", url, body, options);
  },
};
