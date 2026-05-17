export interface ExtractedClause {
  id: string;
  text: string;
  location: string;
  type:
    | "liability"
    | "payment"
    | "termination"
    | "ip"
    | "privacy"
    | "dispute"
    | "non-compete"
    | "data-collection"
    | "auto-renewal"
    | "arbitration"
    | "general";
  pageHint: string;
}

export interface ProsecutorFinding {
  clauseId: string;
  severity: "critical" | "high" | "medium" | "low";
  riskType: string;
  plainEnglish: string;
  worstCaseScenario: string;
  legalJargonUsed: string[];
  complianceFlags: string[];
  precedentWarning: string;
}

export interface DefenderFinding {
  clauseId: string;
  counterArgument: string;
  isStandardIndustryPractice: boolean;
  industryBenchmarkNote: string;
  percentileEstimate: string;
}

export interface Contradiction {
  clauseAId: string;
  clauseBId: string;
  contradiction: string;
  severity: "critical" | "high" | "medium";
  plainEnglish: string;
}

export interface ScenarioSimulation {
  scenario: string;
  probability: "likely" | "possible" | "unlikely";
  consequence: string;
  prevention: string;
}

export interface JudgeVerdict {
  clauseId: string;
  riskScore: number;
  verdict: "DANGER" | "WARNING" | "CAUTION" | "SAFE";
  summary: string;
  keyReason: string;
  shouldNegotiate: boolean;
  scenarioSimulations: ScenarioSimulation[];
}

export interface NegotiatorRewrite {
  clauseId: string;
  originalText: string;
  rewrittenText: string;
  whatChanged: string[];
  negotiatingTip: string;
  openingScript: string;
}

export interface AnalysisResult {
  clauses: ExtractedClause[];
  prosecutorFindings: ProsecutorFinding[];
  defenderFindings: DefenderFinding[];
  contradictions: Contradiction[];
  judgeVerdicts: JudgeVerdict[];
  negotiatorRewrites: NegotiatorRewrite[];
  overallRiskScore: number;
  complianceFlags: {
    gdpr: boolean;
    ccpa: boolean;
    labor: boolean;
    ucpa: boolean;
  };
  documentType: string;
  analyzedAt: string;
}

export interface EnrichedClause extends ExtractedClause {
  prosecutorFinding?: ProsecutorFinding;
  defenderFinding?: DefenderFinding;
  judgeVerdict?: JudgeVerdict;
  negotiatorRewrite?: NegotiatorRewrite;
}

export type ReadingLevel = "legal" | "simple" | "eli5";

export interface SSEEvent {
  agent:
    | "extractor"
    | "prosecutor"
    | "defender"
    | "contradiction"
    | "judge"
    | "negotiator";
  status: "running" | "complete" | "error";
  clauseCount?: number;
  contradictionsFound?: number;
  message?: string;
}
