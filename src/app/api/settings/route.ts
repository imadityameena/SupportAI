import connectDb from "@/lib/db";
import { getSession } from "@/lib/getSession";
import Settings, { SETTINGS_LIMITS } from "@/model/settings.model";
import { NextRequest, NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function unauthorized() {
    return NextResponse.json({ message: "not signed in" }, { status: 401 });
}

function toPublic(s: { businessName?: string; supportEmail?: string; knowledge?: string } | null) {
    return {
        businessName: s?.businessName ?? "",
        supportEmail: s?.supportEmail ?? "",
        knowledge: s?.knowledge ?? "",
    };
}

// Returns the signed-in owner's settings. The owner always comes from the
// session, never from the request, so nobody can read another business's data.
export async function GET() {
    const session = await getSession();
    if (!session) return unauthorized();
    try {
        await connectDb();
        const settings = await Settings.findOne({ ownerId: session.id }).lean();
        return NextResponse.json(toPublic(settings));
    } catch (error) {
        console.error("[settings] read failed", error);
        return NextResponse.json({ message: "could not load settings" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return unauthorized();

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ message: "invalid JSON body" }, { status: 400 });
    }

    const { businessName = "", supportEmail = "", knowledge = "" } = (body ?? {}) as Record<string, unknown>;
    if (typeof businessName !== "string" || typeof supportEmail !== "string" || typeof knowledge !== "string") {
        return NextResponse.json({ message: "all fields must be text" }, { status: 400 });
    }
    const data = {
        businessName: businessName.trim(),
        supportEmail: supportEmail.trim(),
        knowledge: knowledge.trim(),
    };
    for (const key of Object.keys(SETTINGS_LIMITS) as (keyof typeof SETTINGS_LIMITS)[]) {
        if (data[key].length > SETTINGS_LIMITS[key]) {
            return NextResponse.json(
                { message: `${key} must be at most ${SETTINGS_LIMITS[key]} characters` },
                { status: 400 },
            );
        }
    }
    if (data.supportEmail && !EMAIL_RE.test(data.supportEmail)) {
        return NextResponse.json({ message: "support email is not valid" }, { status: 400 });
    }

    try {
        await connectDb();
        const settings = await Settings.findOneAndUpdate(
            { ownerId: session.id },
            { ...data, ownerId: session.id },
            { new: true, upsert: true, runValidators: true },
        ).lean();
        return NextResponse.json(toPublic(settings));
    } catch (error) {
        console.error("[settings] save failed", error);
        return NextResponse.json({ message: "could not save settings" }, { status: 500 });
    }
}
