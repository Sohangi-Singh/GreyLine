import { NextRequest, NextResponse } from "next/server";
import { AnalysisResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const analysis: AnalysisResult = await req.json();
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210;
    const margin = 15;
    const contentW = pageW - margin * 2;
    let y = 20;

    const addPage = () => {
      doc.addPage();
      y = 20;
    };

    const checkPage = (needed = 20) => {
      if (y + needed > 275) addPage();
    };

    // Header
    doc.setFillColor(15, 22, 35);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(99, 102, 241);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("GREYLINE", margin, 18);
    doc.setTextColor(180, 180, 200);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("CONTRACT INTELLIGENCE REPORT", margin, 25);
    doc.text(`Analyzed: ${new Date(analysis.analyzedAt).toLocaleString()}`, pageW - margin, 25, { align: "right" });

    y = 40;

    // Executive Summary
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("EXECUTIVE SUMMARY", margin, y);
    y += 6;
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    const riskColor =
      analysis.overallRiskScore >= 70
        ? [239, 68, 68]
        : analysis.overallRiskScore >= 50
        ? [249, 115, 22]
        : analysis.overallRiskScore >= 30
        ? [234, 179, 8]
        : [34, 197, 94];

    doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.roundedRect(margin, y, 50, 18, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`RISK SCORE: ${analysis.overallRiskScore}/100`, margin + 5, y + 12);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Document Type: ${analysis.documentType.toUpperCase()}`, margin + 60, y + 6);
    doc.text(`Total Clauses: ${analysis.clauses.length}`, margin + 60, y + 12);

    const critical = analysis.judgeVerdicts.filter((v) => v.verdict === "DANGER").length;
    const high = analysis.judgeVerdicts.filter((v) => v.verdict === "WARNING").length;
    const medium = analysis.judgeVerdicts.filter((v) => v.verdict === "CAUTION").length;
    const safe = analysis.judgeVerdicts.filter((v) => v.verdict === "SAFE").length;

    doc.setTextColor(239, 68, 68);
    doc.text(`Critical: ${critical}`, margin + 130, y + 6);
    doc.setTextColor(249, 115, 22);
    doc.text(`High: ${high}`, margin + 155, y + 6);
    doc.setTextColor(234, 179, 8);
    doc.text(`Medium: ${medium}`, margin + 130, y + 12);
    doc.setTextColor(34, 197, 94);
    doc.text(`Safe: ${safe}`, margin + 155, y + 12);

    y += 28;

    // Compliance flags
    checkPage(30);
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("COMPLIANCE STATUS", margin, y);
    y += 7;

    const flags = [
      { name: "GDPR", ok: !analysis.complianceFlags.gdpr },
      { name: "CCPA", ok: !analysis.complianceFlags.ccpa },
      { name: "Labor Law", ok: analysis.complianceFlags.labor },
      { name: "UCPA", ok: !analysis.complianceFlags.ucpa },
    ];

    flags.forEach((flag) => {
      doc.setFillColor(flag.ok ? 34 : 239, flag.ok ? 197 : 68, flag.ok ? 94 : 68);
      doc.circle(margin + 3, y - 1, 2, "F");
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`${flag.name}: ${flag.ok ? "Appears Compliant" : "Issues Found"}`, margin + 8, y + 1);
      y += 7;
    });

    y += 5;

    // Contradictions
    if (analysis.contradictions.length > 0) {
      checkPage(20);
      doc.setFillColor(254, 240, 138);
      doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
      doc.setTextColor(120, 53, 15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`⚡ ${analysis.contradictions.length} CONTRADICTION(S) DETECTED`, margin + 5, y + 7);
      y += 15;

      analysis.contradictions.forEach((c) => {
        checkPage(25);
        doc.setTextColor(120, 53, 15);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`${c.clauseAId} vs ${c.clauseBId} — ${c.severity.toUpperCase()}`, margin, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(c.plainEnglish, contentW);
        doc.setTextColor(60, 60, 60);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 5;
      });
    }

    // Clause-by-clause
    checkPage(20);
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("CLAUSE ANALYSIS", margin, y);
    y += 6;
    doc.setDrawColor(99, 102, 241);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    const sortedVerdicts = [...analysis.judgeVerdicts].sort((a, b) => b.riskScore - a.riskScore);

    for (const verdict of sortedVerdicts) {
      checkPage(40);
      const clause = analysis.clauses.find((c) => c.id === verdict.clauseId);
      if (!clause) continue;

      const vc =
        verdict.verdict === "DANGER"
          ? [239, 68, 68]
          : verdict.verdict === "WARNING"
          ? [249, 115, 22]
          : verdict.verdict === "CAUTION"
          ? [234, 179, 8]
          : [34, 197, 94];

      doc.setFillColor(vc[0], vc[1], vc[2]);
      doc.roundedRect(margin, y, 25, 6, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(verdict.verdict, margin + 2, y + 4.5);

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${clause.id} — ${clause.type.toUpperCase()} (Score: ${verdict.riskScore}/100)`, margin + 28, y + 4.5);
      y += 10;

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(80, 80, 80);
      const clauseLines = doc.splitTextToSize(clause.text.substring(0, 300) + (clause.text.length > 300 ? "..." : ""), contentW);
      doc.text(clauseLines.slice(0, 3), margin, y);
      y += Math.min(clauseLines.length, 3) * 4 + 3;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(9);
      const summaryLines = doc.splitTextToSize(verdict.summary, contentW);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 5 + 3;

      if (verdict.shouldNegotiate) {
        const rewrite = analysis.negotiatorRewrites.find((r) => r.clauseId === verdict.clauseId);
        if (rewrite) {
          checkPage(25);
          doc.setFillColor(240, 240, 255);
          doc.roundedRect(margin, y, contentW, 5, 1, 1, "F");
          doc.setTextColor(99, 102, 241);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.text("NEGOTIATION TIP:", margin + 3, y + 3.5);
          y += 7;
          doc.setFont("helvetica", "italic");
          doc.setTextColor(60, 60, 60);
          const tipLines = doc.splitTextToSize(`"${rewrite.openingScript}"`, contentW - 6);
          doc.text(tipLines, margin + 3, y);
          y += tipLines.length * 4.5 + 3;
        }
      }

      doc.setDrawColor(200, 200, 220);
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageW - margin, y);
      y += 6;
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(15, 22, 35);
      doc.rect(0, 285, 210, 12, "F");
      doc.setTextColor(120, 120, 140);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text("Analyzed by Greyline — AI-powered contract intelligence. Not legal advice.", margin, 291);
      doc.text(`Page ${i} of ${pageCount}`, pageW - margin, 291, { align: "right" });
    }

    const pdfBytes = doc.output("arraybuffer");

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="greyline-analysis-${Date.now()}.pdf"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
