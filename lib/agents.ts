import { callAgent, safeParseJSON, normalizeToArray } from "./gemini";
import {
  ExtractedClause,
  ProsecutorFinding,
  DefenderFinding,
  Contradiction,
  JudgeVerdict,
  NegotiatorRewrite,
  AnalysisResult,
} from "./types";

const EXTRACTOR_PROMPT = `You are a precision legal document parser. Extract EVERY distinct clause, provision, section, or legally meaningful statement. Return ONLY valid JSON array: [{ "id": string, "text": string, "location": string, "type": "liability"|"payment"|"termination"|"ip"|"privacy"|"dispute"|"non-compete"|"data-collection"|"auto-renewal"|"arbitration"|"general", "pageHint": string }] Be exhaustive. If in doubt, include it.`;

const PROSECUTOR_PROMPT = `You are an aggressive consumer rights attorney who assumes every corporation exploits users. For each clause, find EVERY risk, hidden liability, exploitative pattern, ambiguous language, or term that disadvantages the user. Also flag: GDPR violations, CCPA violations, labor law concerns. Return ONLY valid JSON: [{ "clauseId": string, "severity": "critical"|"high"|"medium"|"low", "riskType": string, "plainEnglish": string, "worstCaseScenario": string, "legalJargonUsed": string[], "complianceFlags": string[], "precedentWarning": string }]`;

const DEFENDER_PROMPT = `You are a corporate attorney defending a standard business contract. For each prosecutor finding, argue why the clause is reasonable, industry-standard, or why the risk is overstated. Return ONLY valid JSON: [{ "clauseId": string, "counterArgument": string, "isStandardIndustryPractice": boolean, "industryBenchmarkNote": string, "percentileEstimate": string }] For industryBenchmarkNote, write something like: 'This non-compete duration matches 67% of standard tech employment contracts' or 'This data retention clause is broader than 89% of typical SaaS agreements.'`;

const CONTRADICTION_PROMPT = `You are a legal consistency analyst. Review ALL clauses together and find any contradictions, conflicts, or inconsistencies between clauses within the same document. Also flag clauses that create circular obligations. Return ONLY valid JSON: [{ "clauseAId": string, "clauseBId": string, "contradiction": string, "severity": "critical"|"high"|"medium", "plainEnglish": string }] If no contradictions found, return empty array [].`;

const JUDGE_PROMPT = `You are a neutral judge reviewing both prosecution and defense arguments, and any contradictions found. Deliver a final verdict for each clause. Return ONLY valid JSON: [{ "clauseId": string, "riskScore": number, "verdict": "DANGER"|"WARNING"|"CAUTION"|"SAFE", "summary": string, "keyReason": string, "shouldNegotiate": boolean, "scenarioSimulations": [{ "scenario": string, "probability": "likely"|"possible"|"unlikely", "consequence": string, "prevention": string }] }] Include 2-3 scenarioSimulations per clause with risk above 40.`;

const NEGOTIATOR_PROMPT = `You are an expert contract negotiator and drafter. For every clause scored above 40 by the Judge, rewrite it to be fair, clear, and protective of the user while remaining legally valid and professionally worded. Return ONLY valid JSON: [{ "clauseId": string, "originalText": string, "rewrittenText": string, "whatChanged": string[], "negotiatingTip": string, "openingScript": string }] For openingScript write the exact words the user can say to the other party to request the change.`;

function sa<T>(data: T[] | unknown): T[] {
  return normalizeToArray<T>(data);
}

export async function runExtractor(documentText: string): Promise<ExtractedClause[]> {
  const raw = await callAgent(
    EXTRACTOR_PROMPT,
    `Extract all clauses from this document:\n\n${documentText}`
  );
  return sa<ExtractedClause>(safeParseJSON(raw, []));
}

export async function runProsecutor(clauses: ExtractedClause[]): Promise<ProsecutorFinding[]> {
  const raw = await callAgent(
    PROSECUTOR_PROMPT,
    `Analyze these clauses for risks:\n\n${JSON.stringify(sa(clauses), null, 2)}`
  );
  return sa<ProsecutorFinding>(safeParseJSON(raw, []));
}

export async function runDefender(
  clauses: ExtractedClause[],
  prosecutorFindings: ProsecutorFinding[]
): Promise<DefenderFinding[]> {
  const raw = await callAgent(
    DEFENDER_PROMPT,
    `Counter these prosecutor findings for the following clauses:\n\nClauses: ${JSON.stringify(sa(clauses), null, 2)}\n\nProsecutor Findings: ${JSON.stringify(sa(prosecutorFindings), null, 2)}`
  );
  return sa<DefenderFinding>(safeParseJSON(raw, []));
}

export async function runContradictionDetector(
  clauses: ExtractedClause[]
): Promise<Contradiction[]> {
  const raw = await callAgent(
    CONTRADICTION_PROMPT,
    `Find contradictions in these clauses:\n\n${JSON.stringify(sa(clauses), null, 2)}`
  );
  return sa<Contradiction>(safeParseJSON(raw, []));
}

export async function runJudge(
  clauses: ExtractedClause[],
  prosecutorFindings: ProsecutorFinding[],
  defenderFindings: DefenderFinding[],
  contradictions: Contradiction[]
): Promise<JudgeVerdict[]> {
  const raw = await callAgent(
    JUDGE_PROMPT,
    `Review all arguments and deliver verdicts:\n\nClauses: ${JSON.stringify(sa(clauses), null, 2)}\n\nProsecutor: ${JSON.stringify(sa(prosecutorFindings), null, 2)}\n\nDefender: ${JSON.stringify(sa(defenderFindings), null, 2)}\n\nContradictions: ${JSON.stringify(sa(contradictions), null, 2)}`
  );
  return sa<JudgeVerdict>(safeParseJSON(raw, []));
}

export async function runNegotiator(
  clauses: ExtractedClause[],
  judgeVerdicts: JudgeVerdict[]
): Promise<NegotiatorRewrite[]> {
  const safeVerdicts = sa<JudgeVerdict>(judgeVerdicts);
  const highRiskVerdicts = safeVerdicts.filter((v) => v.riskScore > 40);
  const safeClauses = sa<ExtractedClause>(clauses);
  const highRiskClauses = safeClauses.filter((c) =>
    highRiskVerdicts.some((v) => v.clauseId === c.id)
  );

  if (highRiskClauses.length === 0) return [];

  const raw = await callAgent(
    NEGOTIATOR_PROMPT,
    `Rewrite these high-risk clauses:\n\nClauses: ${JSON.stringify(highRiskClauses, null, 2)}\n\nJudge Verdicts: ${JSON.stringify(highRiskVerdicts, null, 2)}`
  );
  return sa<NegotiatorRewrite>(safeParseJSON(raw, []));
}

function computeOverallRisk(verdicts: JudgeVerdict[]): number {
  const safe = sa<JudgeVerdict>(verdicts);
  if (safe.length === 0) return 0;
  return Math.round(safe.reduce((sum, v) => sum + (v.riskScore ?? 0), 0) / safe.length);
}

function extractComplianceFlags(prosecutorFindings: ProsecutorFinding[]) {
  const allFlags = sa<ProsecutorFinding>(prosecutorFindings).flatMap((f) =>
    sa<string>(f.complianceFlags).map((flag) => flag.toUpperCase())
  );
  return {
    gdpr:  allFlags.some((f) => f.includes("GDPR")),
    ccpa:  allFlags.some((f) => f.includes("CCPA")),
    labor: !allFlags.some((f) => f.includes("LABOR")),
    ucpa:  allFlags.some((f) => f.includes("UCPA")),
  };
}

export async function runFullAnalysis(
  documentText: string,
  documentType: string,
  onProgress?: (event: {
    agent: string;
    status: string;
    clauseCount?: number;
    contradictionsFound?: number;
  }) => void
): Promise<AnalysisResult> {
  const emit = onProgress ?? (() => {});

  emit({ agent: "extractor", status: "running" });
  const clauses = await runExtractor(documentText);
  emit({ agent: "extractor", status: "complete", clauseCount: clauses.length });

  emit({ agent: "prosecutor",    status: "running" });
  emit({ agent: "defender",      status: "running" });
  emit({ agent: "contradiction", status: "running" });

  const [prosecutorFindings, contradictions] = await Promise.all([
    runProsecutor(clauses),
    runContradictionDetector(clauses),
  ]);

  emit({ agent: "prosecutor",    status: "complete" });
  emit({ agent: "contradiction", status: "complete", contradictionsFound: contradictions.length });

  const defenderFindings = await runDefender(clauses, prosecutorFindings);
  emit({ agent: "defender", status: "complete" });

  emit({ agent: "judge", status: "running" });
  const judgeVerdicts = await runJudge(clauses, prosecutorFindings, defenderFindings, contradictions);
  emit({ agent: "judge", status: "complete" });

  emit({ agent: "negotiator", status: "running" });
  const negotiatorRewrites = await runNegotiator(clauses, judgeVerdicts);
  emit({ agent: "negotiator", status: "complete" });

  return {
    clauses:            sa(clauses),
    prosecutorFindings: sa(prosecutorFindings),
    defenderFindings:   sa(defenderFindings),
    contradictions:     sa(contradictions),
    judgeVerdicts:      sa(judgeVerdicts),
    negotiatorRewrites: sa(negotiatorRewrites),
    overallRiskScore:   computeOverallRisk(judgeVerdicts),
    complianceFlags:    extractComplianceFlags(prosecutorFindings),
    documentType,
    analyzedAt:         new Date().toISOString(),
  };
}
