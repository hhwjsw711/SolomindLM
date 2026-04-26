import { createContext, useContext, ReactNode } from "react";
import { Message, Note } from "@/shared/types/index";
import type { Doc } from "@convex/_generated/dataModel";

export interface ChatStreamingContextType {
  messages: Message[];
  isChatStreaming: boolean;
  /** Assistant response in progress on the server (may be streaming in another tab/device). */
  remoteChatGenerating: boolean;
  /** When true, block starting a new message (last DB row is not assistant while server refcount > 0). */
  remoteGenerationBlocksSend: boolean;
  onSendMessage: (messageText: string, deepResearch?: boolean, sourcePolicy?: { channels: string[] }) => void;
  onClearHistory: () => void;
  onSetFeedback: (messageId: string, feedback: "up" | "down" | null) => void;
  onRetry: (assistantMessageId: string) => void;
  onSaveChatOptimistic: (payload: { notebookId: string; note: Note } | null) => void;
  sourceCount: number;
  sourceSummary: string | null;
  suggestions: string[] | null;
  isLoadingSuggestions: boolean;
  activeConversationId: string | null;
  conversations: Doc<"conversations">[] | undefined;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => Promise<string | null>;
  onRenameConversation: (id: string, title: string) => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
}

const ChatStreamingContext = createContext<ChatStreamingContextType | undefined>(undefined);

interface ChatStreamingProviderProps {
  children: ReactNode;
  value: ChatStreamingContextType;
}

export function ChatStreamingProvider({ children, value }: ChatStreamingProviderProps) {
  return <ChatStreamingContext.Provider value={value}>{children}</ChatStreamingContext.Provider>;
}

export function useChatStreamingContext() {
  const context = useContext(ChatStreamingContext);
  if (!context)
    throw new Error("useChatStreamingContext must be used within ChatStreamingProvider");
  return context;
}
