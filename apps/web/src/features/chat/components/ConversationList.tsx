import { useState, useRef, useEffect } from "react";
import { Plus, MessageSquare, MoreHorizontal, Pencil, Trash2, X, Check } from "lucide-react";
import type { Doc } from "@convex/_generated/dataModel";
import { useConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { useToast } from "@/shared/contexts/ToastContext";

interface ConversationListProps {
  conversations: Doc<"conversations">[] | undefined;
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => Promise<string | null>;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: ConversationListProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const toast = useToast();

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const id = await onCreate();
      if (id) onSelect(id);
    } catch {
      toast.error("Failed to create conversation");
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartRename = (conv: Doc<"conversations">) => {
    setEditingId(conv._id);
    setEditTitle((conv.title as string | undefined) ?? "New Chat");
    setMenuOpenId(null);
  };

  const handleFinishRename = async () => {
    if (!editingId || !editTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await onRename(editingId, editTitle.trim());
    } catch {
      toast.error("Failed to rename conversation");
    }
    setEditingId(null);
  };

  const handleDelete = async (conv: Doc<"conversations">) => {
    setMenuOpenId(null);
    const ok = await confirm(
      "Delete conversation?",
      "This will permanently delete this conversation and all its messages.",
      { confirmText: "Delete", variant: "danger" }
    );
    if (!ok) return;
    try {
      await onDelete(conv._id);
    } catch {
      toast.error("Failed to delete conversation");
    }
  };

  return (
    <div className="flex flex-col gap-0.5 p-1">
      <button
        onClick={handleCreate}
        disabled={isCreating}
        className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
      >
        <Plus className="w-3.5 h-3.5 shrink-0" />
        <span>{isCreating ? "Creating..." : "New Chat"}</span>
      </button>

      {!conversations && (
        <div className="px-2 py-3 text-xs text-zinc-500">Loading...</div>
      )}

      {conversations?.length === 0 && (
        <div className="px-2 py-3 text-xs text-zinc-500">No conversations yet</div>
      )}

      {conversations?.map((conv) => {
        const isActive = conv._id === activeConversationId;
        const isEditing = conv._id === editingId;

        return (
          <div
            key={conv._id}
            className={`group relative flex items-center rounded transition-colors ${
              isActive
                ? "bg-zinc-700/60 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
            }`}
          >
            {isEditing ? (
              <div className="flex items-center gap-1 w-full px-2 py-1">
                <input
                  ref={editInputRef}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFinishRename();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 bg-zinc-900 border border-zinc-600 rounded px-1.5 py-0.5 text-xs text-zinc-100 outline-none focus:border-zinc-400"
                />
                <button
                  onClick={handleFinishRename}
                  className="p-0.5 text-zinc-400 hover:text-zinc-200"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-0.5 text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onSelect(conv._id)}
                  className="flex items-center gap-2 flex-1 min-w-0 px-2 py-1.5 text-left"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  <span className="truncate text-xs">
                    {(conv.title as string | undefined) ?? "New Chat"}
                  </span>
                </button>
                <span className="text-[10px] text-zinc-500 mr-1 shrink-0 hidden group-hover:hidden">
                  {formatRelativeTime((conv.updatedAt as number | undefined) ?? 0)}
                </span>
                <div className="relative shrink-0 mr-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === conv._id ? null : conv._id);
                    }}
                    className={`p-0.5 rounded hover:bg-zinc-600 transition-colors ${
                      menuOpenId === conv._id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </button>
                  {menuOpenId === conv._id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpenId(null)}
                      />
                      <div className="absolute right-0 top-6 z-50 w-36 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartRename(conv);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
                        >
                          <Pencil className="w-3 h-3" />
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(conv);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-400 hover:bg-zinc-700"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
      <ConfirmDialogComponent />
    </div>
  );
}
