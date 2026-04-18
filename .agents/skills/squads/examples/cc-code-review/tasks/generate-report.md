---
name: generate-report
description: "Consolidate all analysis findings into a structured code review report"
---

# Generate Report

## Input
- `output/standards-findings.json` from check-standards
- `output/bug-findings.json` from detect-bugs
- `output/performance-findings.json` from analyze-performance

## Steps
1. Read all three findings files.
2. Deduplicate: same file + same line → merge into one finding.
3. Sort by severity (critical → warning → info), then by file path.
4. Calculate metrics: total findings, breakdown by severity and category.
5. Write executive summary: 3 sentences (scope, health, top actions).
6. Write full Markdown report.

## Output
Markdown report at `output/code-review-report.md`

## Acceptance Criteria
- All findings from all analyzers included
- No duplicates
- Executive summary present
- Metrics table with counts by severity × category
- Top 3 recommendations ordered by impact
