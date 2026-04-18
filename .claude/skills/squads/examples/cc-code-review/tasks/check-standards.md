---
name: check-standards
description: "Run code standards verification on target files"
---

# Check Standards

## Input
- `sourceFiles`: array of file paths to analyze
- Project config files (`.eslintrc.*`, `.prettierrc.*`, `tsconfig.json`) read automatically

## Steps
1. Read project lint/format configuration files.
2. Run `npx eslint --format json` on target files (if ESLint config exists).
3. Run `npx prettier --check` on target files (if Prettier config exists).
4. Check naming conventions manually: scan for PascalCase variables, snake_case functions, etc.
5. Check import organization: external before internal, no unused imports.
6. Classify each finding by severity: critical (build break), warning (style), info (suggestion).
7. Write findings array to output artifact.

## Output
JSON array at `output/standards-findings.json`:
```json
[{ "file": "...", "line": 0, "rule": "...", "severity": "warning", "message": "...", "fix": "..." }]
```

## Acceptance Criteria
- Every target file was checked
- Each finding has file, line, rule, severity, and fix
- Zero false positives from missing config files (skip gracefully)
