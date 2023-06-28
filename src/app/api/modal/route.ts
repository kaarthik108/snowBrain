import uploadToCloudinary from "lib/uploadToCloudinary";
import { NextRequest, NextResponse } from "next/server";

const MODAL_API = process.env.MODAL_API_ENDPOINT!!;

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { pythonCode, sqlCode } = await req.json();

  const response = await fetch(MODAL_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
