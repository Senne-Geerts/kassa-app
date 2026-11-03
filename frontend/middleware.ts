import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname, search } = new URL(req.url);

  // Proxy /api requests to the backend
  if (pathname.startsWith("/api")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not configured");
      return new NextResponse("API configuration error", { status: 500 });
    }

    const targetUrl = `${apiUrl}${pathname}${search}`;

    // Filter headers - only forward standard HTTP headers
    const forwardHeaders = new Headers();
    const standardHeaders = [
      'accept', 'accept-encoding', 'accept-language', 'authorization',
      'cache-control', 'content-type', 'cookie', 'origin', 'referer',
      'user-agent', 'x-requested-with'
    ];

    standardHeaders.forEach(header => {
      const value = req.headers.get(header);
      if (value) {
        forwardHeaders.set(header, value);
      }
    });

    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: forwardHeaders,
        // Only include body for methods that support it
        body: (req.method === 'GET' || req.method === 'HEAD') ? null : req.body,
      });

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      console.error("API proxy error:", error);
      return new NextResponse("API Error", { status: 503 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
