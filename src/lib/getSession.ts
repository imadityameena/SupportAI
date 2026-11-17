import { cache } from "react";
import { cookies } from "next/headers";
import { scalekit } from "./scalekit";
import { ACCESS_TOKEN_COOKIE, PROFILE_COOKIE, readProfileCookie } from "./authCookies";

export type SessionUser = {
    id: string;
    email: string;
};

// Fast path: the user id comes from the verified access token (a local signature check
// once Scalekit's keys are cached) and the email comes from the display-only profile
// cookie set at login. Only sessions without that cookie (e.g. from before it existed)
// fall back to the slow Scalekit getUser API call.
//
// cache() dedupes the work within a single request.
export const getSession = cache(async (): Promise<SessionUser | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    if (!token) {
        return null;
    }
    try {
        const claims = await scalekit.validateToken<{ sub?: string }>(token);
        if (!claims?.sub) {
            return null;
        }
        const profile = readProfileCookie(cookieStore.get(PROFILE_COOKIE)?.value);
        if (profile && profile.id === claims.sub) {
            return { id: claims.sub, email: profile.email };
        }
        const { user } = await scalekit.user.getUser(claims.sub);
        return { id: claims.sub, email: user?.email ?? "" };
    } catch {
        // Expired or invalid token: treat as logged out.
        return null;
    }
});
