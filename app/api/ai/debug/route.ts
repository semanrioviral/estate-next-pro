import { NextResponse } from "next/server";

export async function GET() {
    const key = process.env.OPENAI_API_KEY || "";
    const base = process.env.OPENAI_BASE_URL || "";
    return NextResponse.json({
        hasKey: !!key,
        keyPrefix: key ? key.slice(0, 8) + "..." : "MISSING",
        baseUrl: base || "default (api.deepseek.com/v1)",
        hasBaseUrl: !!base,
        nodeEnv: process.env.NODE_ENV || "unknown",
    });
}
