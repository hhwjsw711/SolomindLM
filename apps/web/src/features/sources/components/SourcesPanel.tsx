
import React, { useState, useMemo } from 'react';
import {
  Plus, Search, FileText, Globe, CheckSquare, Square, ChevronLeft,
  X, Upload, Link as LinkIcon, Youtube, Clipboard, HardDrive, LayoutGrid, File,
  FileStack
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Source } from '@/shared/types/index';
import { DiscoverSourcesModal } from './DiscoverSourcesModal';

interface SourcesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sources: Source[];
  onToggleSource: (id: string) => void;
  onToggleAll: () => void;
  onAddSource: (source: Source) => void;
  width: number;
  isResizing: boolean;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({ 
  isOpen, 
  onClose, 
  sources, 
  onToggleSource,
  onToggleAll,
  onAddSource,
  width, 
  isResizing 
}) => {
  const [viewingSourceId, setViewingSourceId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);

  const viewingSource = useMemo(() => 
    sources.find(s => s.id === viewingSourceId), 
    [sources, viewingSourceId]
  );

  const allSelected = sources.length > 0 && sources.every(s => s.selected);
  const selectedCount = sources.filter(s => s.selected).length;

  return (
    <>
      <div
        style={{ width: isOpen ? width : 0 }}
        className={`
          relative flex-shrink-0 bg-sidebar border-r-2 border-border h-full flex flex-col
          overflow-hidden
          ${!isResizing ? 'panel-transition' : ''}
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-sidebar/50 backdrop-blur-sm sticky top-0 z-10 h-14">
          {viewingSource ? (
            <div className="flex items-center gap-2 text-sidebar-foreground overflow-hidden">
              <button 
                onClick={() => setViewingSourceId(null)}
                className="p-1 -ml-1 hover:bg-sidebar-accent rounded-sm transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-sans font-bold text-sm tracking-wide truncate" title={viewingSource.title}>
                {viewingSource.title}
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sidebar-foreground">
                <FileStack className="w-4 h-4" />
                <span className="font-sans font-bold text-sm tracking-wide uppercase">Sources</span>
                <span className="ml-2 text-xs text-muted-foreground bg-sidebar-accent px-1.5 py-0.5 rounded-full font-mono">
                  {selectedCount}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-sidebar-accent rounded-sm transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto w-full">
          {viewingSource ? (
            <div className="p-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono bg-sidebar-accent/50 px-2 py-1 rounded-sm">
                    {viewingSource.type} • {viewingSource.date}
                  </span>
                  
                  <button 
                    onClick={() => onToggleSource(viewingSource.id)}
                    className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {viewingSource.selected ? (
                      <>
                        <CheckSquare className="w-4 h-4" />
                        Included
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4" />
                        Include Source
                      </>
                    )}
                  </button>
              </div>
              
              <div className="prose prose-sm prose-stone dark:prose-invert max-w-none font-serif leading-relaxed text-foreground/90">
                <ReactMarkdown>{viewingSource.content || "No content available."}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-5">
              {/* Refined Action Bar */}
              <div className="flex gap-2 p-1.5 bg-background/50 border border-border rounded-lg shadow-inner">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all font-sans font-bold text-[11px] uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" />
                  Add Source
                </button>
                <button 
                  onClick={() => setIsDiscoverOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-card border border-border text-foreground rounded-md shadow-xs hover:bg-secondary hover:border-primary/30 transition-all font-sans font-bold text-[11px] uppercase tracking-wider"
                >
                  <Search className="w-4 h-4 text-primary" />
                  Discover
                </button>
              </div>

              {/* Search & List */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search sources..." 
                    className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-serif shadow-xs"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-1 mb-1 font-sans">
                    <span>{sources.length} items</span>
                    <button 
                      onClick={onToggleAll}
                      className="hover:text-primary transition-colors cursor-pointer select-none font-medium"
                    >
                      {allSelected ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  {sources.map((source) => (
                    <div 
                      key={source.id} 
                      className="group flex flex-col bg-card border border-border rounded-lg hover:shadow-md transition-all cursor-pointer overflow-hidden"
                      onClick={() => setViewingSourceId(source.id)}
                    >
                      <div className="flex items-start gap-3 p-3">
                        <div className="mt-0.5 text-muted-foreground">
                          {source.type === 'WEB' ? <Globe className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate leading-tight mb-1">{source.title}</h4>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-sans">{source.type} • {source.date}</p>
                        </div>
                        <div 
                          className="text-primary mt-0.5 p-1 -m-1 hover:bg-secondary rounded-full z-10 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSource(source.id);
                          }}
                        >
                          {source.selected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 opacity-50 group-hover:opacity-100" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Source Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl bg-card text-card-foreground border border-border rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden font-sans">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card">
                <div className="flex items-center gap-2">
                  <FileStack className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">NotebookLM</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 md:p-10 space-y-8 bg-card/50">
                  <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-medium">Add sources</h3>
                        <button 
                          onClick={() => { setIsModalOpen(false); setIsDiscoverOpen(true); }}
                          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:bg-secondary/50 transition-colors text-sm font-medium"
                        >
                            <Search className="w-4 h-4" />
                            Discover sources
                        </button>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
                          Sources let NotebookLM base its responses on the information that matters most to you.<br/>
                          (Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.)
                      </p>
                  </div>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center gap-4 bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-center space-y-2">
                          <h3 className="text-lg font-bold text-primary">Upload sources</h3>
                          <p className="text-sm text-muted-foreground">Drag & drop or <span className="text-primary underline decoration-dotted font-medium">choose file</span> to upload</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 text-center max-w-xl mt-4 font-mono">
                          Supported file types: PDF, .txt, Markdown, Audio (e.g. mp3), .docx, .avif, .bmp, .gif, .ico, .jp2, .png, .webp, .tif, .tiff, .heic, .heif, .jpeg, .jpg, .jpe
                      </p>
                  </div>

                  {/* Grid Options */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Column 1 */}
                      <div className="border border-border/50 rounded-xl p-5 space-y-4 bg-card shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                              <LayoutGrid className="w-4 h-4" />
                              Google Workspace
                          </div>
                          <div className="space-y-2">
                              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-border transition-all text-left group">
                                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border shadow-sm group-hover:scale-105 transition-transform">
                                      <HardDrive className="w-4 h-4 text-emerald-600" />
                                  </div>
                                  <span className="text-sm font-medium">Google Drive</span>
                              </button>
                          </div>
                      </div>

                      {/* Column 2 */}
                      <div className="border border-border/50 rounded-xl p-5 space-y-4 bg-card shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                              <LinkIcon className="w-4 h-4" />
                              Link
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                              <button className="flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-border transition-all group">
                                  <Globe className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
                                  <span className="text-sm font-medium">Website</span>
                              </button>
                              <button className="flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-border transition-all group">
                                  <Youtube className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                                  <span className="text-sm font-medium">YouTube</span>
                              </button>
                          </div>
                      </div>

                      {/* Column 3 */}
                      <div className="border border-border/50 rounded-xl p-5 space-y-4 bg-card shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                              <Clipboard className="w-4 h-4" />
                              Paste text
                          </div>
                          <div className="space-y-2">
                              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-border transition-all text-left group">
                                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border shadow-sm group-hover:scale-105 transition-transform">
                                      <FileText className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <span className="text-sm font-medium">Copied text</span>
                              </button>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Footer Limit */}
              <div className="p-4 bg-secondary/10 border-t border-border flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground shrink-0 font-medium">
                      <File className="w-4 h-4" />
                      <span>Source limit</span>
                  </div>
                  <div className="flex-1 h-2 bg-secondary/50 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[13%] rounded-full" />
                  </div>
                  <span className="text-muted-foreground font-mono font-medium">{sources.length} / 300</span>
              </div>
          </div>
        </div>
      )}

      {/* Discover Modal */}
      <DiscoverSourcesModal 
        isOpen={isDiscoverOpen} 
        onClose={() => setIsDiscoverOpen(false)} 
        onAddSource={onAddSource}
      />
    </>
  );
};
