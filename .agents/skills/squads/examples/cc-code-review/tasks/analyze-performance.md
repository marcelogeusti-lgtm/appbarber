---
name: analyze-performance
description: "Measure cyclomatic complexity and identify performance bottlenecks"
---

# Analyze Performance

## Input
- `sourceFiles`: array of file paths to analyze

## Steps
1. Read each target file.
2. For each function: count decision points (if/else/for/while/switch/&&/||/ternary) → cyclomatic complexity.
3. Flag: ≤10 good, 11-20 warning, >20 critical.
4. Scan for performance patterns: N+1 queries, O(n²) loops, blocking I/O, large bundle imports.
5. For React files: missing memoization, unnecessary re-renders, heavy computations in render.
6. Each finding includes: current metric, target metric, refactoring approach, estimated impact.
7. Write findings array to output artifact.

## Output
JSON array at `output/performance-findings.json`

## Acceptance Criteria
- Complexity score calculated for every function
- Each optimization suggestion has estimated impact
