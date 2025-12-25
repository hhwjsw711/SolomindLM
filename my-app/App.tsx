
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { SourcesPanel } from './components/SourcesPanel';
import { ChatPanel } from './components/ChatPanel';
import { StudioPanel } from './components/StudioPanel';
import { HomePage } from './components/HomePage';
import { MOCK_SOURCES, MOCK_MESSAGES, STUDIO_TOOLS, SAVED_NOTES, MOCK_NOTEBOOKS } from './constants';
import { Source, Note, NotebookItem } from './types';

const MIN_PANEL_WIDTH = 220;
const MAX_PANEL_WIDTH = 600;

type ViewState = 'home' | 'notebook';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  
  // Notebook specific state
  const [isSourcesOpen, setIsSourcesOpen] = useState(true);
  const [isStudioOpen, setIsStudioOpen] = useState(true);
  const [sources, setSources] = useState<Source[]>(MOCK_SOURCES);
  const [notes, setNotes] = useState<Note[]>(SAVED_NOTES);
  const [notebookTitle, setNotebookTitle] = useState("CPSC 304");

  // Notebooks State
  const [notebooks, setNotebooks] = useState<NotebookItem[]>(MOCK_NOTEBOOKS);

  // Filter notebooks for home page
  const featuredNotebooks = notebooks.filter(nb => nb.isFeatured);
  const recentNotebooks = notebooks.filter(nb => !nb.isFeatured);

  // Resize State
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(320);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const toggleSources = () => setIsSourcesOpen(!isSourcesOpen);
  const toggleStudio = () => setIsStudioOpen(!isStudioOpen);

  const handleToggleSource = (id: string) => {
    setSources(prev => prev.map(source => 
      source.id === id ? { ...source, selected: !source.selected } : source
    ));
  };

  const handleToggleAll = () => {
    const allSelected = sources.every(s => s.selected);
    setSources(prev => prev.map(source => ({ ...source, selected: !allSelected })));
  };

  const handleAddSource = (source: Source) => {
    setSources(prev => [source, ...prev]);
  };
  
  const handleUpdateNote = (id: string, newTitle: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, title: newTitle } : n));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleAddNote = (note: Note) => {
    setNotes(prev => [note, ...prev]);
  };

  const handleUpdateNotebook = (id: string, updates: Partial<NotebookItem>) => {
    setNotebooks(prev => prev.map(nb => nb.id === id ? { ...nb, ...updates } : nb));
    if (activeNotebookId === id && updates.title) {
        setNotebookTitle(updates.title);
    }
  };

  const handleDeleteNotebook = (id: string) => {
    setNotebooks(prev => prev.filter(nb => nb.id !== id));
    if (activeNotebookId === id) {
        handleLogoClick();
    }
  };

  const startResizingLeft = useCallback(() => setIsResizingLeft(true), []);
  const startResizingRight = useCallback(() => setIsResizingRight(true), []);
  const stopResizing = useCallback(() => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizingLeft) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth >= MIN_PANEL_WIDTH && newWidth <= MAX_PANEL_WIDTH) {
          setLeftWidth(newWidth);
        }
      }
      if (isResizingRight) {
        const newWidth = window.innerWidth - mouseMoveEvent.clientX;
        if (newWidth >= MIN_PANEL_WIDTH && newWidth <= MAX_PANEL_WIDTH) {
          setRightWidth(newWidth);
        }
      }
    },
    [isResizingLeft, isResizingRight]
  );

  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizingLeft, isResizingRight, resize, stopResizing]);

  // Navigation Handlers
  const handleLogoClick = () => {
    setCurrentView('home');
    setActiveNotebookId(null);
  };

  const handleSelectNotebook = (notebook: NotebookItem) => {
    setActiveNotebookId(notebook.id);
    setNotebookTitle(notebook.title);
    setCurrentView('notebook');
  };

  const handleCreateNotebook = () => {
    setNotebookTitle("Untitled Notebook");
    setActiveNotebookId('new');
    setCurrentView('notebook');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden font-serif">
      <Header 
        title={notebookTitle} 
        onRename={setNotebookTitle} 
        isHome={currentView === 'home'}
        onLogoClick={handleLogoClick}
      />
      
      {currentView === 'home' ? (
        <HomePage 
          featuredNotebooks={featuredNotebooks}
          recentNotebooks={recentNotebooks}
          onSelectNotebook={handleSelectNotebook}
          onCreateNotebook={handleCreateNotebook}
          onUpdateNotebook={handleUpdateNotebook}
          onDeleteNotebook={handleDeleteNotebook}
        />
      ) : (
        <main className="flex-1 flex overflow-hidden relative animate-in fade-in duration-300">
          <SourcesPanel 
            isOpen={isSourcesOpen} 
            onClose={toggleSources} 
            sources={sources}
            onToggleSource={handleToggleSource}
            onToggleAll={handleToggleAll}
            onAddSource={handleAddSource}
            width={leftWidth}
            isResizing={isResizingLeft}
          />
          
          {/* Left Drag Handle */}
          {isSourcesOpen && (
            <div
              className="w-1 hover:w-1.5 -ml-0.5 z-50 cursor-col-resize flex-shrink-0 hover:bg-primary/50 transition-colors select-none"
              onMouseDown={startResizingLeft}
            />
          )}
          
          <ChatPanel 
            messages={MOCK_MESSAGES} 
            isLeftOpen={isSourcesOpen}
            isRightOpen={isStudioOpen}
            toggleLeft={toggleSources}
            toggleRight={toggleStudio}
          />
          
          {/* Right Drag Handle */}
          {isStudioOpen && (
            <div
              className="w-1 hover:w-1.5 -mr-0.5 z-50 cursor-col-resize flex-shrink-0 hover:bg-primary/50 transition-colors select-none"
              onMouseDown={startResizingRight}
            />
          )}

          <StudioPanel 
            isOpen={isStudioOpen} 
            onClose={toggleStudio} 
            tools={STUDIO_TOOLS}
            notes={notes}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onAddNote={handleAddNote}
            width={rightWidth}
            isResizing={isResizingRight}
          />
        </main>
      )}
    </div>
  );
};

export default App;
