import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { rateLimiter } from "./../lib/rate-limiter";

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
  const ip = req.ip ?? "127.0.0.1";

  try {
    if (process.env.NODE_ENV != "development") {
      const { success } = await rateLimiter.limit(ip);

      if (!success)
        return new NextResponse(
          "There is a rate limit on this API. Please try again later."
        );

      return NextResponse.next();
    }
  } catch (error) {
    return new NextResponse(
      "Sorry, something went wrong processing your message. Please try again later."
    );
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/:path*",
};
