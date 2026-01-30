import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { Components } from 'react-markdown';

export interface MarkdownRendererProps {
  children: string;
  components?: Components;
  className?: string;
}

/**
 * Shared markdown renderer (ReactMarkdown + GFM + math + KaTeX).
 * Lazy-load this component to avoid circular chunk dependency with react-vendor.
 */
export default function MarkdownRenderer({ children, components, className }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={components}
      className={className}
    >
      {children}
    </ReactMarkdown>
  );
}
