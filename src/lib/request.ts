"use client";

type RequestOptions = RequestInit & {
  body?: unknown;
};

type ApiErrorPayload = {
  error?: string;
  message?: string;
  details?: string;
};

async function request<TResponse>(url: string, options: RequestOptions = {}): Promise<TResponse> {
  const { body, headers, ...rest } = options;

  const response = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (typeof data === "string") {
      throw new Error(data || "请求失败");
    }

    const errorData = data as ApiErrorPayload;
    throw new Error(errorData.error || errorData.message || errorData.details || "请求失败");
  }

  return data as TResponse;
}

export function post<TResponse, TBody = unknown>(url: string, body?: TBody) {
  return request<TResponse>(url, {
    method: "POST",
    body,
  });
}


