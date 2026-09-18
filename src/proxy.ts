import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Shared login with Download HQ: validate the hq_session cookie against the HQ backend.
// Not signed in → send to the HQ login. One account covers /hq and /workshop.
const HQ = "https://download-hq.onrender.com";
const LOGIN = "https://download.lol/hq/";

export async function proxy(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (
    p.includes("/_next") ||
    p.includes("/api/health") ||
    p.includes("/api/portal-brief") || // client-facing, gated by access code instead
    p.includes("/share/") || // client-facing read-only summary, gated by access code in the URL
    /\/share$/.test(p) ||
    /\.(ico|png|jpe?g|svg|webp|avif|gif|mp4|webm|mov|m4v|mp3|wav|ogg|woff2?|ttf|otf|eot|css|js|map|txt)$/.test(p)
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
        if (j && j.user) {
          // Belt and suspenders with force-dynamic: gated responses are
          // per-user and must never be stored by any shared cache.
          const res = NextResponse.next();
          res.headers.set("Cache-Control", "private, no-store");
          return res;
        }
      }
    } catch {}
  }
  // API calls must fail loudly with JSON, never silently redirect to an HTML
  // login page — that made every feature look broken with no explanation.
  if (p.includes("/api/")) {
    return NextResponse.json(
      { error: "Signed out. Open download.lol/hq, sign in, then reload the workshop." },
      { status: 401 }
    );
  }
  return NextResponse.redirect(LOGIN);
}

export const config = {
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
