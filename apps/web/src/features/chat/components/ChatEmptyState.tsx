import React from 'react';
import { BookOpen } from 'lucide-react';

const STARTER_PROMPTS = [
  'Summarize the key concepts',
  'What are the main arguments?',
  'Quiz me on this material',
  'Explain the most important topic simply',
];

interface ChatEmptyStateProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ onSendMessage, disabled }) => (
  <div className="flex flex-col items-center justify-center h-full px-6 pb-32 gap-6 select-none">
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="p-3 rounded-full bg-primary/10">
        <BookOpen className="w-6 h-6 text-primary" />
      </div>
      <h2 className="font-sans font-semibold text-lg text-foreground">
        Ask anything about your sources
      </h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        I'll search your uploaded documents and answer with citations.
      </p>
    </div>
    <div className="flex flex-wrap gap-2 justify-center max-w-md">
      {STARTER_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onSendMessage(prompt)}
          className="px-4 py-2 rounded-full border border-border bg-card hover:bg-accent text-sm text-foreground transition-colors font-sans disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {prompt}
        </button>
      ))}
    </div>
  </div>
);
