export async function extractFromPDF(buffer: Buffer): Promise<string> {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs") as any;
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items as any[]).map((item: any) => ("str" in item ? item.str : "")).join(" ");
    fullText += pageText + "\n";
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return fullText;
}

export async function extractFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractFromImage(buffer: Buffer): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  const { data } = await worker.recognize(buffer);
  await worker.terminate();
  return data.text;
}

export async function extractFromURL(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Greyline/1.0; +https://greyline.app)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const cheerio = await import("cheerio");
  const $ = cheerio.load(html);

  // Remove scripts, styles, nav, footer
  $("script, style, nav, footer, header, .cookie-banner, .ad").remove();

  // Extract main content
  const mainSelectors = ["main", "article", ".content", ".terms", "#content", "body"];
  for (const sel of mainSelectors) {
    const el = $(sel);
    if (el.length && el.text().trim().length > 200) {
      return el.text().replace(/\s+/g, " ").trim();
    }
  }

  return $("body").text().replace(/\s+/g, " ").trim();
}

export function extractFromText(text: string): string {
  return text.trim();
}

export async function extractText(
  file: File | null,
  text?: string,
  url?: string
): Promise<{ content: string; documentType: string }> {
  if (text) {
    return { content: extractFromText(text), documentType: "text" };
  }

  if (url) {
    const content = await extractFromURL(url);
    return { content, documentType: "url" };
  }

  if (!file) throw new Error("No input provided");

  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    return { content: await extractFromPDF(buffer), documentType: "pdf" };
  }

  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.endsWith(".docx")
  ) {
    return { content: await extractFromDOCX(buffer), documentType: "docx" };
  }

  if (file.type.startsWith("image/")) {
    return { content: await extractFromImage(buffer), documentType: "image" };
  }

  if (file.type === "text/plain" || file.name.endsWith(".txt")) {
    return { content: buffer.toString("utf-8"), documentType: "text" };
  }

  throw new Error(`Unsupported file type: ${file.type}`);
}
