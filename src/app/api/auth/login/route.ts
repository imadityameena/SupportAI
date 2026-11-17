import { randomBytes } from "crypto";
import { scalekit } from "@/lib/scalekit";
import { setStateCookie } from "@/lib/authCookies";
import { NextResponse } from "next/server";

export async function GET() {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
    // Random state ties the callback to this browser and prevents login CSRF.
    const state = randomBytes(32).toString("hex");
    const url = scalekit.getAuthorizationUrl(redirectUri, { state });
    const res = NextResponse.redirect(url);
    setStateCookie(res, state);
    return res;
}
