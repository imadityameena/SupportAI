import { timingSafeEqual } from "crypto";
import { scalekit } from "@/lib/scalekit";
import { OAUTH_STATE_COOKIE, setAuthCookies } from "@/lib/authCookies";
import { NextRequest, NextResponse } from "next/server";

function statesMatch(a: string | null | undefined, b: string | null | undefined) {
    if (!a || !b || a.length !== b.length) return false;
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function GET(req: NextRequest) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const expectedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;

    if (!code) {
        return NextResponse.json({ message: "code is not found" }, { status: 400 });
    }
    if (!statesMatch(state, expectedState)) {
        return NextResponse.json({ message: "invalid login state, please try again" }, { status: 400 });
    }

    try {
        const session = await scalekit.authenticateWithCode(code, `${appUrl}/api/auth/callback`);
        const res = NextResponse.redirect(`${appUrl}`);
        setAuthCookies(res, session);
        res.cookies.delete(OAUTH_STATE_COOKIE);
        return res;
    } catch (error) {
        console.error("[auth] code exchange failed", error instanceof Error ? error.message : "unknown error");
        return NextResponse.redirect(`${appUrl}/?error=login_failed`);
    }
}
