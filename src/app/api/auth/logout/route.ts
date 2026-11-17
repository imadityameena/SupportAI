import { clearAuthCookies } from "@/lib/authCookies";
import { NextResponse } from "next/server";

// POST only, so another site can't log users out with a plain link or <img>.
export async function POST() {
    const res = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}`, 303);
    clearAuthCookies(res);
    return res;
}
