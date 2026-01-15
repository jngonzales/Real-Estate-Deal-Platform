import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client for rate limiting (optional - only if env vars are set)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limiters for different routes
const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "10 s"), // 30 requests per 10 seconds
      analytics: true,
      prefix: "ratelimit:api",
    })
  : null;

const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 auth attempts per minute
      analytics: true,
      prefix: "ratelimit:auth",
    })
  : null;

const aiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 AI requests per minute
      analytics: true,
      prefix: "ratelimit:ai",
    })
  : null;

export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? 
             request.headers.get("x-real-ip") ?? 
             "127.0.0.1";
  
  const path = request.nextUrl.pathname;

  // Check for maintenance mode (from headers set by edge config or env)
  if (process.env.MAINTENANCE_MODE === "true" && !path.startsWith("/api/health")) {
    return NextResponse.json(
      { error: "Service temporarily unavailable for maintenance" },
      { status: 503 }
    );
  }

  // Rate limit API routes
  if (path.startsWith("/api")) {
    // Skip rate limiting if Redis is not configured
    if (!redis) {
      return await updateSession(request);
    }

    // Use stricter limits for auth endpoints
    if (path.startsWith("/api/auth") || path.includes("/login")) {
      if (authRateLimiter) {
        const { success, limit, remaining, reset } = await authRateLimiter.limit(ip);
        
        if (!success) {
          return NextResponse.json(
            { error: "Too many login attempts. Please try again later." },
            { 
              status: 429,
              headers: {
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": reset.toString(),
              }
            }
          );
        }
      }
    }
    
    // Use stricter limits for AI/expensive endpoints
    if (path.includes("/score") || path.includes("/analyze") || path.includes("/gemini")) {
      if (aiRateLimiter) {
        const { success, limit, remaining, reset } = await aiRateLimiter.limit(ip);
        
        if (!success) {
          return NextResponse.json(
            { error: "AI rate limit exceeded. Please wait a moment before trying again." },
            { 
              status: 429,
              headers: {
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": reset.toString(),
              }
            }
          );
        }
      }
    }
    
    // General API rate limiting
    if (apiRateLimiter) {
      const { success, limit, remaining, reset } = await apiRateLimiter.limit(ip);
      
      if (!success) {
        return NextResponse.json(
          { error: "Too many requests. Please slow down." },
          { 
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            }
          }
        );
      }
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
