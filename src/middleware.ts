import { rateLimiter } from "@/../lib/rate-limiter";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const ip = req.ip ?? "127.0.0.1";

  try {
    if (process.env.NODE_ENV != "development") {
      const { success } = await rateLimiter.limit(ip);

      if (!success)
        return new NextResponse(
          "There is a rate limit on this API. Please try again later."
        );

      if (req.nextUrl.pathname.startsWith("/api")) {
        if (
          !req.headers
            .get("referer")
            ?.includes(
              `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` as string
            )
        ) {
          return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
          );
        }
      }

      return NextResponse.next();
    }
  } catch (error) {
    return new NextResponse(
      "Sorry, something went wrong processing your message. Please try again later."
    );
  }
}

export const config = {
  matcher: "/api/:path*",
};
