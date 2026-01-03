import React from 'react';
import { MoreVertical, Settings2, Trash2, Folder, ChevronDown, Book, BarChart3, Monitor, Search, Brain, Globe, FileText, GraduationCap, Lightbulb } from 'lucide-react';
import { FolderItem } from '@/shared/types/index';

const IconMap: Record<string, React.FC<any>> = {
  Folder, Book, BarChart: BarChart3, Monitor, Search, Brain, Globe, FileText, GraduationCap, Lightbulb
};

interface FolderCardProps {
  folder: FolderItem;
  viewMode: 'grid' | 'list';
  isMenuOpen: boolean;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onOpenFolderCustomize: () => void;
  onDeleteFolder: (id: string) => void;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  viewMode,
  isMenuOpen,
  isExpanded,
  onToggleExpansion,
  onOpenFolderCustomize,
  onDeleteFolder,
  onToggleMenu,
  onCloseMenu,
}) => {
  const FolderIcon = folder.icon ? IconMap[folder.icon] : Folder;

  if (viewMode === 'grid') {
    return (
      <div className="relative">
        {/* Folder Card */}
        <div
          className={`group relative aspect-16/10 rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col ring-1 ring-border/50 ${isExpanded ? 'ring-2 ring-primary/50' : ''}`}
        >
          {/* Top Decorative Half */}
          <div
            onClick={() => onToggleExpansion()}
            className={`h-[55%] ${folder.color || 'bg-blue-500'} bg-opacity-15 group-hover:bg-opacity-25 transition-colors p-5 relative flex items-start justify-between rounded-t-2xl`}
          >
            <FolderIcon className={`w-10 h-10 ${(folder.color || '').replace('bg-', 'text-')} opacity-90 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm`} />

            <div className="relative folder-kebab-menu z-20" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => isMenuOpen ? onCloseMenu() : onToggleMenu()}
                className={`p-1.5 -mr-1.5 -mt-1.5 hover:bg-black/10 rounded-full text-muted-foreground/70 hover:text-foreground transition-colors ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border shadow-xl rounded-md z-30 py-1 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={onOpenFolderCustomize}
                    className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-accent flex items-center gap-2 text-popover-foreground"
                  >
                    <Settings2 className="w-3.5 h-3.5" /> Customize
                  </button>
                  <button
                    onClick={() => { onDeleteFolder(folder.id); onCloseMenu(); }}
                    className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-destructive/10 text-destructive flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Info Half */}
          <div
            onClick={() => onToggleExpansion()}
            className="h-[45%] p-5 flex flex-col justify-between bg-card relative rounded-b-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent opacity-50" />

            <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 font-sans">{folder.name}</h3>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
              <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-0.5 rounded-full">
                <Folder className="w-3 h-3" />
                <span>{folder.notebookCount}</span>
              </div>
              <ChevronDown className="w-4 h-4 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="relative">
      <div
        className="group grid grid-cols-[1fr_auto_auto_40px] items-center gap-6 p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/20 cursor-pointer transition-all relative"
      >
        <div onClick={() => onToggleExpansion()} className="absolute inset-0 z-0" />

        {/* Title Column */}
        <div className="flex items-center gap-4 min-w-0 z-10 pointer-events-none">
          <div className={`w-10 h-10 rounded-lg ${folder.color || 'bg-blue-500'} bg-opacity-20 flex items-center justify-center shrink-0`}>
            <FolderIcon className={`w-5 h-5 ${(folder.color || '').replace('bg-', 'text-')}`} />
          </div>

          <span className="font-bold text-foreground font-serif">{folder.name}</span>
        </div>

        {/* Notebook Count Column */}
        <div className="w-32 text-sm text-muted-foreground font-mono z-10 pointer-events-none flex items-center gap-1.5">
          <Folder className="w-3 h-3" />
          <span>{folder.notebookCount}</span>
        </div>

        {/* Expand Indicator */}
        <div className="w-20 flex justify-center z-10 pointer-events-none">
          <ChevronDown className="w-4 h-4 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </div>

        {/* Action Column */}
        <div className="flex justify-end z-20 pointer-events-auto folder-kebab-menu relative">
          <button
            onClick={(e) => { e.stopPropagation(); isMenuOpen ? onCloseMenu() : onToggleMenu(); }}
            className={`p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center shrink-0 ${isMenuOpen ? 'opacity-100 bg-secondary' : 'opacity-0 group-hover:opacity-100'}`}
          >
            <MoreVertical className="w-4 h-4 shrink-0" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border shadow-xl rounded-md z-50 py-1 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={(e) => { e.stopPropagation(); onOpenFolderCustomize(); }}
                className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-accent flex items-center gap-2 text-popover-foreground"
              >
                <Settings2 className="w-3.5 h-3.5 shrink-0" /> Customize
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); onCloseMenu(); }}
                className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-destructive/10 text-destructive flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
