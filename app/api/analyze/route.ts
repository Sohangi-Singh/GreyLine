import { NextRequest } from "next/server";
import { runFullAnalysis } from "@/lib/agents";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        let documentText = "";
        let documentType = "unknown";

        const contentType = req.headers.get("content-type") ?? "";

        if (contentType.includes("multipart/form-data")) {
          const formData = await req.formData();
          const file = formData.get("file") as File | null;
          const text = formData.get("text") as string | null;
          const url = formData.get("url") as string | null;
          const sampleText = formData.get("sampleText") as string | null;

          if (sampleText) {
            documentText = sampleText;
            documentType = (formData.get("documentType") as string) ?? "sample";
          } else if (text) {
            documentText = text;
            documentType = "text";
          } else if (url) {
            const { extractFromURL } = await import("@/lib/extractors");
            documentText = await extractFromURL(url);
            documentType = "url";
          } else if (file) {
            const { extractText } = await import("@/lib/extractors");
            const result = await extractText(file);
            documentText = result.content;
            documentType = result.documentType;
          }
        } else {
          const body = await req.json();
          documentText = body.text ?? "";
          documentType = body.documentType ?? "text";
        }

        if (!documentText || documentText.trim().length < 50) {
          send({ type: "error", message: "Document text is too short or empty" });
          controller.close();
          return;
        }

        const analysis = await runFullAnalysis(documentText, documentType, (event) => {
          send(event);
        });

        send({ type: "final", analysis });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Analysis failed";
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
