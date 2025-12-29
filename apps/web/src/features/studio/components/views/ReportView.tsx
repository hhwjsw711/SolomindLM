import React from 'react';
import ReactMarkdown from 'react-markdown';
import { XCircle, Loader2 } from 'lucide-react';
import { Note } from '@/shared/types/index';

export interface ReportViewProps {
  note: Note;
}

export const ReportView: React.FC<ReportViewProps> = ({ note }) => {
  // Map status to progress steps
  const phases = [
    { key: 'generating', label: 'Initializing' },
    { key: 'mapping', label: 'Processing sources' },
    { key: 'collapsing', label: 'Synthesizing content' },
    { key: 'reducing', label: 'Formatting document' },
  ];

  const currentPhaseIndex = phases.findIndex(p => p.key === note.status);
  const isFailed = note.status === 'failed';
  const isCompleted = note.status === 'completed';
  const isGenerating = note.status === 'generating' || note.status === 'mapping' ||
                        note.status === 'collapsing' || note.status === 'reducing';

  return (
      <div className="flex flex-col h-full bg-background animate-in fade-in slide-in-from-right-4 duration-300">
           {/* Progress Header */}
           {isGenerating && (
             <div className="p-4 border-b border-border bg-secondary/30">
               <div className="flex items-center justify-between mb-3">
                 <span className="text-xs font-medium text-muted-foreground">Generating Report</span>
                 <span className="text-xs text-primary">
                   {phases[currentPhaseIndex]?.label || 'Processing'}
                 </span>
               </div>
               <div className="flex gap-1">
                 {phases.map((phase, i) => (
                   <div
                     key={phase.key}
                     className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                       i < currentPhaseIndex ? 'bg-primary' : 'bg-muted'
                     }`}
                   />
                 ))}
               </div>
             </div>
           )}

           {/* Error State */}
           {isFailed && (
             <div className="p-4 border-b border-border bg-destructive/10">
               <div className="flex items-center gap-3">
                 <XCircle className="w-5 h-5 text-destructive shrink-0" />
                 <div className="flex-1">
                   <p className="text-sm font-medium text-destructive">Report generation failed</p>
                   <p className="text-xs text-destructive/70 mt-1">
                     {note.metadata?.error || 'An unknown error occurred'}
                   </p>
                 </div>
               </div>
             </div>
           )}

           <div className="flex-1 overflow-y-auto p-6 md:p-8">
               <div className="max-w-3xl mx-auto bg-card border border-border shadow-sm p-8 rounded-sm min-h-[500px]">
                   <div className="prose prose-stone dark:prose-invert max-w-none font-serif leading-relaxed select-text">
                      {note.content ? (
                          <ReactMarkdown
                              components={{
                                  img: () => null,
                                  a: ({ node, children, ...props }) => <span className="text-foreground">{children}</span>,
                                  video: () => null,
                                  audio: () => null,
                                  iframe: () => null,
                              }}
                          >
                              {note.content}
                          </ReactMarkdown>
                      ) : isFailed ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <XCircle className="w-12 h-12 text-destructive mb-4" />
                          <p className="text-muted-foreground">Report generation failed</p>
                        </div>
                      ) : (
                          <div className="space-y-4">
                            <div className="h-8 bg-muted/50 rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-muted/50 rounded w-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                            <div className="h-4 bg-muted/50 rounded w-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="h-4 bg-muted/50 rounded w-5/6 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-5 h-5 text-primary animate-spin mr-2" />
                              <p className="text-muted-foreground italic text-sm">Generating your report...</p>
                            </div>
                          </div>
                      )}
                   </div>
               </div>
           </div>
      </div>
  );
};
