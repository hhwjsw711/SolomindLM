import React from 'react';
import { Search, FileText, Brain, Loader2 } from 'lucide-react';

export function getStatusIcon(status?: string): React.ReactNode {
  switch (status) {
    case 'searching': return <Search className="w-3.5 h-3.5" />;
    case 'reading': return <FileText className="w-3.5 h-3.5" />;
    case 'thinking': return <Brain className="w-3.5 h-3.5" />;
    case 'generating': return <Loader2 className="w-3.5 h-3.5 animate-spin" />;
    default: return null;
  }
}

export function getStatusMessage(status?: string): string | null {
  switch (status) {
    case 'searching': return 'Searching sources';
    case 'reading': return 'Reading sources';
    case 'thinking': return 'Thinking';
    case 'generating': return 'Generating response';
    default: return null;
  }
}
