import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

function jsonWithCors(body: unknown, init?: ResponseInit) {
    return NextResponse.json(body, {
        ...init,
        headers: {
            ...corsHeaders,
            ...init?.headers,
        },
    });
}

function isTemporaryAiError(error: unknown) {
    const details = error as { status?: number | string; statusText?: string; message?: string };
    const serialized = error instanceof Error ? error.message : JSON.stringify(error);
    return details.status === 503
        || details.status === "UNAVAILABLE"
        || details.statusText === "UNAVAILABLE"
        || details.message?.includes("503")
        || serialized?.includes('"code":503')
        || serialized?.includes("UNAVAILABLE");
}

async function generateReply(ai: GoogleGenAI, prompt: string) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
            return await ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: prompt,
            });
        } catch (error) {
            if (!isTemporaryAiError(error) || attempt === 2) {
                throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
        }
    }
    throw new Error("AI reply unavailable");
}

export async function POST(req: NextRequest) {
    try {
        const { message, ownerId } = await req.json()
        if (!message || !ownerId) {
            return jsonWithCors(
                { message: "message and owner id is required" },
                { status: 400 }
            )
        }
    await connectDb()
        const setting = await Settings.findOne({ ownerId })
        if (!setting) {
            return jsonWithCors(
                { message: "chat bot is not configured yet." },
                { status: 400 }
            )
        }

        const KNOWLEDGE=`
        business name- ${setting.businessName || "not provided"}
        supportEmail- ${setting.supportEmail || "not provided"}
        knowledge- ${setting.knowledge ||" not provided"}
        `
     

       const prompt = `
You are a professional customer support assistant for this business.

Use ONLY the information provided below to answer the customer's question.
You may rephrase, summarize, or interpret the information if needed.
Do NOT invent new policies, prices, or promises.



--------------------
BUSINESS INFORMATION
--------------------
${KNOWLEDGE}

--------------------
CUSTOMER QUESTION
--------------------
${message}

--------------------
ANSWER
--------------------
`;

const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
 const res = await generateReply(ai, prompt);

return jsonWithCors(res.text)

    } catch (error) {
 const temporary = isTemporaryAiError(error);
 const response= jsonWithCors(
                                { message: temporary
                                        ? "Our support service is busy right now. Please try again in a moment."
                                        : "We could not generate a reply right now. Please try again." },
                                { status: temporary ? 503 : 500 }
            )
    return response
    }
}

export const OPTIONS=async ()=>{
    return new NextResponse(null, { status: 204, headers: corsHeaders })
}