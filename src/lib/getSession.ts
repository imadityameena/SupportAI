import { cache } from "react";
import { cookies } from "next/headers";
import { scalekit } from "./scalekit";
import { ACCESS_TOKEN_COOKIE } from "./authCookies";

export type SessionUser = {
    id: string;
    email: string;
};

// cache() dedupes the Scalekit round-trips within a single request
// (e.g. a page and an API helper both asking for the session).
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
        const { user } = await scalekit.user.getUser(claims.sub);
        if (!user?.id) {
            return null;
        }
        return { id: user.id, email: user.email ?? "" };
    } catch {
        // Expired or invalid token: treat as logged out.
        return null;
    }
});
