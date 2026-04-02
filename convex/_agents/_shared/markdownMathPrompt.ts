/**
 * Shared LLM instructions for Markdown math rendered with remark-math + KaTeX in the web app.
 * Keeps chat and Studio prompts aligned and reduces broken equations from nested `$` or missing delimiters.
 */

export const MARKDOWN_MATH_RULES_BULLETS = `- Inline math: use one pair of dollar signs per expression, e.g. $Y_t$, $\\alpha$, $f(x)$. You may use \\(...\\) for inline instead of $...$ — do not mix both styles inside one expression.
- Display math (equations on their own line): wrap the full equation in exactly one pair of double-dollar delimiters, e.g. $$Y_t = \\beta_0 + R_t$$. For multi-line display math, keep every line inside the same $$ block.
- Inside $$ ... $$, never use the single-dollar delimiter $ — content is already math mode. Write B^m, \\Phi(B^m), (1-B)^d, \\epsilon_t. Do not write inner fragments as $B^m$ or similar inside display math.
- Do not nest or interleave $...$ regions (invalid examples: \\Phi($B^m$), $$\\alpha + $x$$, or opening $$ then closing with a stray $). The parser uses $ as math boundaries; nesting breaks rendering.
- Every expression that uses backslash-LaTeX (\\sum, \\beta, \\dots, \\tag, etc.), Greek letters, or subscripts/superscripts meant as math must lie entirely inside $...$ or $$...$$; undelimited lines show as broken raw text.
- Use KaTeX-supported LaTeX only (no custom packages or unsupported environments). \\tag{n} on display equations is allowed when needed.
- Place citation markers like [1] in normal text after math or on the following line — never between the opening and closing $ of one inline math span.
- Prefer citations after a closing parenthesis or delimiter, e.g. $(\\beta_0 + \\sum_j X_{j,t})$ [1], not $(\\beta_0 + \\sum_j X_{j,t} [1])$, so they stay clickable in the app.`;

export const MARKDOWN_MATH_NOTATION_FOR_APP =
  `**Math notation (Markdown + KaTeX — required for correct rendering):**\n${MARKDOWN_MATH_RULES_BULLETS}`;
