import React from 'react';
import { Paperclip, ArrowUp, Sparkles, PanelLeftOpen, PanelRightOpen, GripVertical } from 'lucide-react';
import { Message } from '../types';

interface ChatPanelProps {
  messages: Message[];
  isLeftOpen: boolean;
  isRightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ 
  messages, 
  isLeftOpen, 
  isRightOpen,
  toggleLeft,
  toggleRight
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      
      {/* Dynamic Header for Toggles when panels are closed */}
      {(!isLeftOpen || !isRightOpen) && (
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between pointer-events-none">
          <div className="pointer-events-auto">
            {!isLeftOpen && (
              <button 
                onClick={toggleLeft}
                className="p-2 bg-card border border-border rounded-sm shadow-sm hover:bg-accent text-foreground transition-colors"
                title="Open Sources"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="pointer-events-auto">
            {!isRightOpen && (
              <button 
                onClick={toggleRight}
                className="p-2 bg-card border border-border rounded-sm shadow-sm hover:bg-accent text-foreground transition-colors"
                title="Open Studio"
              >
                <PanelRightOpen className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-12 md:px-20 lg:px-32 space-y-8 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`
                max-w-[85%] relative p-6 rounded-sm text-base leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-transparent text-foreground border-b-2 border-primary/20 font-handwriting italic' 
                  : 'bg-card border border-border shadow-sm text-card-foreground'}
              `}
            >
              {msg.role === 'assistant' && (
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-background border-2 border-border rounded-full flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {msg.citations.map((cite) => (
                    <span key={cite} className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-mono border border-border/50 cursor-pointer hover:bg-secondary/80 hover:border-primary/50 transition-colors">
                      {cite}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground mt-2 font-mono uppercase tracking-widest px-1">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {/* Spacer for bottom input */}
        <div className="h-32" />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-8 left-0 right-0 px-4 flex justify-center z-20">
        <div className="w-full max-w-3xl bg-card border-2 border-border shadow-lg rounded-sm p-2 flex flex-col gap-2 relative">
           
           <textarea 
             placeholder="Ask a question about your sources..."
             className="w-full bg-transparent border-none p-3 resize-none outline-none text-foreground placeholder:text-muted-foreground/70 min-h-[60px] font-serif text-lg"
             rows={2}
           />
           
           <div className="flex justify-between items-center px-2 pb-1">
             <div className="flex gap-2">
                <button className="p-2 hover:bg-secondary rounded-sm text-muted-foreground transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
             </div>
             
             <div className="flex items-center gap-3 text-xs text-muted-foreground font-sans">
                <span>2/50 Sources</span>
                <button className="p-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-all shadow-md active:translate-y-0.5">
                  <ArrowUp className="w-5 h-5" />
                </button>
             </div>
           </div>
        </div>
      </div>

      {/* Background Noise Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
    </div>
  );
};