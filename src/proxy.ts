import { NextRequest, NextResponse } from "next/server";
import { scalekit } from "./lib/scalekit";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, clearAuthCookies, setAuthCookies } from "./lib/authCookies";

const PROTECTED_PREFIXES = ["/dashboard", "/embed"];

async function isValidToken(token: string | undefined) {
    if (!token) return false;
    try {
        await scalekit.validateToken(token);
        return true;
    } catch {
        return false;
    }
}

export async function proxy(req: NextRequest) {
    const isProtected = PROTECTED_PREFIXES.some((p) => req.nextUrl.pathname.startsWith(p));
    const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (await isValidToken(accessToken)) {
        return NextResponse.next();
    }

    // Access token missing or expired: try to refresh it silently.
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (refreshToken) {
        try {
            const tokens = await scalekit.refreshAccessToken(refreshToken);
            // Forward the new token to this request so the page sees the user as logged in.
            req.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken);
            const res = NextResponse.next({ request: { headers: req.headers } });
            setAuthCookies(res, tokens);
            return res;
        } catch {
            // Refresh token is invalid too; fall through to logged-out handling.
        }
    }

    const res = isProtected
        ? NextResponse.redirect(new URL("/", req.url))
        : NextResponse.next();
    if (accessToken || refreshToken) {
        clearAuthCookies(res);
    }
    return res;
}

export const config = {
    matcher: ["/", "/dashboard/:path*", "/embed/:path*"],
};
