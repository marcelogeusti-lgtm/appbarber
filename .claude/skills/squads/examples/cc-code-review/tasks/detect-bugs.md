---
name: detect-bugs
description: "Scan code for potential bugs, null safety issues, and code smells"
---

# Detect Bugs

## Input
- `sourceFiles`: array of file paths to analyze

## Steps
1. Read each target file.
2. Trace execution paths looking for: null/undefined risks, unhandled promises, type assertion abuse.
3. Check for: empty catch blocks, missing await, `as any` casts, unchecked array access.
4. Identify code smells: functions >50 lines, >3 nesting levels, >5 parameters.
5. For each finding: extract code snippet, explain WHY it's a bug, suggest fix.
6. Classify severity: critical (runtime crash), warning (conditional failure), info (smell).
7. Write findings array to output artifact.

## Output
JSON array at `output/bug-findings.json`

## Acceptance Criteria
- Every target file was scanned
- Each finding has evidence (code snippet + failure scenario)
- Critical findings have reproduction steps
