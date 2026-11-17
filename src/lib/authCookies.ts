import type { NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const OAUTH_STATE_COOKIE = "oauth_state";

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
}

export function setStateCookie(res: NextResponse, state: string) {
    res.cookies.set(OAUTH_STATE_COOKIE, state, { ...baseCookie, maxAge: 60 * 10 });
}
