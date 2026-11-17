import { unstable_cache } from "next/cache";
import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { Skeleton } from "./Loading";

// Businesses that have actually set up their bot (saved a name or knowledge),
// not every account that ever signed in. Cached for 5 minutes so the landing
// page doesn't query MongoDB on every visit.
const getBusinessCount = unstable_cache(
    async () => {
        await connectDb();
        return Settings.countDocuments({
            $or: [
                { businessName: { $nin: ["", null] } },
                { knowledge: { $nin: ["", null] } },
            ],
        });
    },
    ["business-count"],
    { revalidate: 300 },
);

function OnlineDot() {
    return (
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="online-ping absolute inline-flex h-full w-full rounded-full bg-online" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-online" />
        </span>
    );
}

export default async function BusinessCount() {
    let count: number;
    try {
        count = await getBusinessCount();
    } catch (error) {
        console.error("[landing] business count failed", error);
        return null; // hide rather than show a wrong number
    }
    if (!count) return null;

    return (
        <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-card px-3.5 py-1.5 text-sm text-ink-soft">
            <OnlineDot />
            <span>
                <strong className="font-semibold tabular-nums text-ink">{count.toLocaleString("en-IN")}</strong>{" "}
                {count === 1 ? "business is" : "businesses are"} using SupportAI
            </span>
        </p>
    );
}

export function BusinessCountSkeleton() {
    return <Skeleton className="h-8.5 w-64 rounded-full!" />;
}
