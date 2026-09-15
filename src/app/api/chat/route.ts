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
 const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

return jsonWithCors(res.text)

    } catch (error) {
 const response= jsonWithCors(
                { message:`chat error ${error}` },
                { status: 500 }
            )
    return response
    }
}

export const OPTIONS=async ()=>{
    return new NextResponse(null, { status: 204, headers: corsHeaders })
}