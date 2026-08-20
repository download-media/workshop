import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Shared login with Download HQ: validate the hq_session cookie against the HQ backend.
// Not signed in → send to the HQ login. One account covers /hq and /workshop.
const HQ = "https://download-hq.onrender.com";
const LOGIN = "https://download.lol/hq/";

export async function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (
    p.includes("/_next") ||
    p.includes("/api/health") ||
    /\.(ico|png|jpe?g|svg|webp|gif|woff2?|css|js|map|txt)$/.test(p)
  ) {
    return NextResponse.next();
  }
  const token = req.cookies.get("hq_session")?.value;
  if (token) {
    try {
      const r = await fetch(`${HQ}/auth/me`, {
        headers: { cookie: `hq_session=${token}` },
        cache: "no-store",
      });
      if (r.ok) {
        const j = await r.json();
        if (j && j.user) return NextResponse.next();
      }
    } catch {}
  }
  return NextResponse.redirect(LOGIN);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
