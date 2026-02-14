/**
 * Replaces citation markers [1], [2], etc. with `CITE:n` only in non-math segments.
 * This avoids corrupting LaTeX (e.g. matrix [1, 0] or intervals [1, 2]) inside $...$ or $$...$$.
 */
export function replaceCitationMarkersOutsideMath(content: string): string {
  const parts: string[] = [];
  let remaining = content;

  while (remaining.length > 0) {
    // Prefer $$ over $ so we don't split display math
    const nextDollar = remaining.indexOf('$');
    if (nextDollar === -1) {
      parts.push(remaining.replace(/\[(\d+)\]/g, '`CITE:$1`'));
      break;
    }

    const isDisplayMath = remaining.slice(nextDollar, nextDollar + 2) === '$$';
    const delim = isDisplayMath ? '$$' : '$';
    const afterOpen = nextDollar + delim.length;
    const closeIndex = remaining.indexOf(delim, afterOpen);

    if (closeIndex === -1) {
      // Unclosed delimiter: treat rest as text and replace citations
      parts.push(remaining.replace(/\[(\d+)\]/g, '`CITE:$1`'));
      break;
    }

    const textSegment = remaining.slice(0, nextDollar);
    const mathSegment = remaining.slice(nextDollar, closeIndex + delim.length);

    parts.push(textSegment.replace(/\[(\d+)\]/g, '`CITE:$1`'));
    parts.push(mathSegment);
    remaining = remaining.slice(closeIndex + delim.length);
  }

  return parts.join('');
}
