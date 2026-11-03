import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);

  // Proxy /api requests to the backend
  if (pathname.startsWith("/api")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const targetUrl = `${apiUrl}${pathname}`;

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      return new NextResponse("API Error", { status: 503 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
