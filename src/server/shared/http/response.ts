import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";

export function ok<T>(
  data: T,
  status = 200,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json(data, { status, headers });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 });
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        message: error.message,
        code: error.code,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
      { status: error.status }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: "Invalid request payload",
        code: "VALIDATION_ERROR",
        details: error.flatten(),
      },
      { status: 422 }
    );
  }

  console.error("[MetaPay API Error]", error);

  return NextResponse.json(
    {
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: 500 }
  );
}
