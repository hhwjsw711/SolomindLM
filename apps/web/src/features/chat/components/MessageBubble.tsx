import React from 'react';
import { Check, Copy, ThumbsUp, ThumbsDown, Search } from 'lucide-react';
import { Message } from '@/shared/types/index';
import { renderMessageWithReferences, RefHandlers } from '../utils/messageRendering';
import { getStatusIcon, getStatusMessage } from '../utils/messageStatus';

interface MessageBubbleProps {
  message: Message;
  refHandlers: RefHandlers;
  onCopyMessage: (message: Message) => void;
  copiedMessageId: string | null;
  onSetFeedback?: (messageId: string, feedback: 'up' | 'down' | null) => void;
  onSendFollowUp?: (text: string) => void;
}

export const MessageBubble = React.memo<MessageBubbleProps>(
  ({ message, refHandlers, onCopyMessage, copiedMessageId, onSetFeedback, onSendFollowUp }) => {
    const isUser = message.role === 'user';
    const isCopied = copiedMessageId === message.id;

    const messageActions: Array<{
      id: string;
      label: string;
      icon: React.ElementType;
      onClick: () => void;
      className?: string;
    }> = [
      {
        id: 'copy',
        label: isCopied ? 'Copied' : 'Copy',
        icon: isCopied ? Check : Copy,
        onClick: () => onCopyMessage(message),
        className: isCopied ? 'text-green-600' : '',
      },
    ];

    if (!isUser && onSetFeedback) {
      messageActions.push(
        {
          id: 'thumbs-up',
          label: 'Good response',
          icon: ThumbsUp,
          onClick: () => onSetFeedback(message.id, message.feedback === 'up' ? null : 'up'),
          className: message.feedback === 'up' ? 'text-green-600 fill-green-600' : '',
        },
        {
          id: 'thumbs-down',
          label: 'Bad response',
          icon: ThumbsDown,
          onClick: () => onSetFeedback(message.id, message.feedback === 'down' ? null : 'down'),
          className: message.feedback === 'down' ? 'text-red-500 fill-red-500' : '',
        }
      );
    }

    const ActionBar = () => (
      <div
        className="flex items-center rounded-full border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm overflow-hidden opacity-0 group-hover/message:opacity-100 transition-opacity duration-200"
        role="toolbar"
        aria-label="Message actions"
      >
        {messageActions.map(({ id, label, icon: Icon, onClick, className = '' }) => (
          <button
            key={id}
            type="button"
            onClick={onClick}
            title={label}
            aria-label={label}
            className={`p-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors touch-manipulation first:pl-2.5 last:pr-2.5 ${className}`}
          >
            <Icon className="w-4 h-4" aria-hidden />
          </button>
        ))}
      </div>
    );

    const ToolCallTrace = () => {
      if (!message.toolCalls || message.toolCalls.length === 0) return null;
      return (
        <div className="flex flex-col gap-1 mb-2">
          {message.toolCalls.map((tc, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              {tc.status === 'searching' ? (
                <Search className="w-3 h-3 animate-pulse shrink-0" />
              ) : (
                <Check className="w-3 h-3 text-green-500 shrink-0" />
              )}
              <span>
                {tc.status === 'searching'
                  ? `Searching for "${tc.query}"...`
                  : `Found ${tc.resultCount ?? 0} passages`}
              </span>
            </div>
          ))}
        </div>
      );
    };

    const FollowUpChips = () => {
      if (!message.followUps || message.followUps.length === 0 || !onSendFollowUp) return null;
      return (
        <div className="flex flex-wrap gap-2 mt-3">
          {message.followUps.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSendFollowUp(q)}
              className="px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent text-sm text-foreground transition-colors text-left font-sans"
            >
              {q}
            </button>
          ))}
        </div>
      );
    };

    return (
      <div
        className={`group/message flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}
        data-message-id={message.id}
      >
        {isUser ? (
          <div className="flex flex-row items-start gap-2 max-w-[95%]">
            <div className="shrink-0 pt-4">
              <ActionBar />
            </div>
            <div className="p-4 rounded-xl font-serif text-lg leading-relaxed bg-primary/10 text-foreground shadow-sm">
              {renderMessageWithReferences(message.id, message.content, message.references, refHandlers)}
            </div>
          </div>
        ) : (
          <>
            {message.status && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                {getStatusIcon(message.status)}
                <span className="animate-pulse">{getStatusMessage(message.status)}</span>
              </div>
            )}
            <ToolCallTrace />
            <div className="w-full max-w-4xl font-serif text-lg leading-relaxed text-foreground">
              {message.content ? (
                renderMessageWithReferences(message.id, message.content, message.references, refHandlers)
              ) : (
                <div className="flex items-center gap-1.5 py-3">
                  <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.2s' }} />
                  <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.2s' }} />
                  <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.2s' }} />
                </div>
              )}
              <div className="flex justify-start mt-3">
                <ActionBar />
              </div>
              <FollowUpChips />
            </div>
          </>
        )}
      </div>
    );
  },
  (prev, next) =>
    prev.message.id === next.message.id &&
    prev.message.content === next.message.content &&
    prev.message.status === next.message.status &&
    prev.message.references === next.message.references &&
    prev.message.feedback === next.message.feedback &&
    prev.message.followUps === next.message.followUps &&
    prev.message.toolCalls === next.message.toolCalls &&
    prev.copiedMessageId === next.copiedMessageId
);

MessageBubble.displayName = 'MessageBubble';
