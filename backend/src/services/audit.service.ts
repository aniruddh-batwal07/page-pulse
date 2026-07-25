import { AuditRequest, AuditResult } from "../types/audit.types.js";
import { fetchPage } from "../utils/pageFetcher.js";
import { parseHtml } from "../parsers/htmlParser.js";
import { analyzePage } from "../analyzers/pageAnalyzer.js";
import { scorePage } from "../scorers/pageScorer.js";
import { recommendPage } from "../recommenders/pageRecommender.js";

export async function runAudit(request: AuditRequest): Promise<AuditResult> {
  const { html, finalUrl, statusCode } = await fetchPage(request.url);

  const parsedData = parseHtml({ html, url: finalUrl });
  parsedData.statusCode = statusCode;

  const analysis = analyzePage(parsedData);
  const scores = scorePage(analysis);
  const recommendations = recommendPage(analysis);

  return { parsedData, analysis, scores, recommendations };
}
