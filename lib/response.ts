import { NextResponse } from "next/server";

export function success(data: unknown, message = "Succès") {
  return NextResponse.json({
    success: true,
    message,
    data,
  });
}

export function error(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}