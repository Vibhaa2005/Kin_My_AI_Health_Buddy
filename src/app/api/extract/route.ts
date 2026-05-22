import { NextRequest, NextResponse } from "next/server";
import { extractDocument, extractDocumentText } from "@/lib/extraction";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, text } = body as {
      imageBase64?: string;
      mimeType?: string;
      text?: string;
    };

    let extracted;
    if (imageBase64 && mimeType) {
      extracted = await extractDocument(imageBase64, mimeType);
    } else if (text) {
      extracted = await extractDocumentText(text);
    } else {
      return NextResponse.json({ error: "Provide imageBase64+mimeType or text" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: extracted });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";
    console.error("[extract]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
