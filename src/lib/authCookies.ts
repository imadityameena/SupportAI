import type { NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const OAUTH_STATE_COOKIE = "oauth_state";
// Display-only profile (user id + email) so pages don't need a Scalekit API call to show the avatar.
export const PROFILE_COOKIE = "profile";

// Cookie maxAge is in SECONDS.
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const DEFAULT_ACCESS_TOKEN_MAX_AGE = 60 * 60; // 1 hour

const baseCookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
};

export function setAuthCookies(
    res: NextResponse,
    tokens: { accessToken: string; refreshToken?: string; expiresIn?: number },
) {
    res.cookies.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
        ...baseCookie,
        maxAge: tokens.expiresIn && tokens.expiresIn > 0 ? tokens.expiresIn : DEFAULT_ACCESS_TOKEN_MAX_AGE,
    });
    if (tokens.refreshToken) {
        res.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
            ...baseCookie,
            maxAge: REFRESH_TOKEN_MAX_AGE,
        });
    }
}

export function clearAuthCookies(res: NextResponse) {
    res.cookies.delete(ACCESS_TOKEN_COOKIE);
    res.cookies.delete(REFRESH_TOKEN_COOKIE);
    res.cookies.delete(PROFILE_COOKIE);
}

// Never used for access decisions: the user id always comes from the verified access token.
// The stored id only lets us ignore a profile left over from a different account.
export function setProfileCookie(res: NextResponse, profile: { id: string; email: string }) {
    res.cookies.set(PROFILE_COOKIE, JSON.stringify(profile), { ...baseCookie, maxAge: REFRESH_TOKEN_MAX_AGE });
}

export function readProfileCookie(value: string | undefined): { id: string; email: string } | null {
    if (!value) return null;
    try {
        const parsed = JSON.parse(value);
        return typeof parsed?.id === "string" && typeof parsed?.email === "string" ? parsed : null;
    } catch {
        return null;
    }
}

export function setStateCookie(res: NextResponse, state: string) {
    res.cookies.set(OAUTH_STATE_COOKIE, state, { ...baseCookie, maxAge: 60 * 10 });
}
