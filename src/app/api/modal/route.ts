import uploadToCloudinary from "lib/uploadToCloudinary";
import { NextRequest, NextResponse } from "next/server";

const MODAL_API =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000/execute"
    : process.env.MODAL_API_ENDPOINT!;

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { pythonCode, sqlCode } = await req.json();

  const response = await fetch(MODAL_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MODAL_AUTH_TOKEN}`,
    },
    body: JSON.stringify({ script: pythonCode, sql: sqlCode }),
  });

  if (!response.ok) throw new Error("Response Error");

  const imageData = await response.blob();

  const imageUrl = await uploadToCloudinary(imageData);

  if (!imageUrl) {
    return NextResponse.json({ error: "Upload Error" });
  }
  return NextResponse.json({ imageUrl });
}
