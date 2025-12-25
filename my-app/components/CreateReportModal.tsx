
import React, { useState, useEffect } from 'react';
import { X, Pencil, FilePlus2, ChevronLeft } from 'lucide-react';

interface ReportFormat {
  id: string;
  title: string;
  description: string;
  hasEdit?: boolean;
  prompt?: string;
}

const FORMATS: ReportFormat[] = [
  { 
    id: 'custom', 
    title: 'Create Your Own', 
    description: 'Craft reports your way by specifying structure, style, tone, and more',
    prompt: ''
  },
  { 
    id: 'briefing', 
    title: 'Briefing Doc', 
    description: 'Overview of your sources featuring key insights and quotes', 
    hasEdit: true,
    prompt: 'Create a comprehensive briefing document...'
  },
  { 
    id: 'study_guide', 
    title: 'Study Guide', 
    description: 'Short-answer quiz, suggested essay questions, and glossary of key terms', 
    hasEdit: true,
    prompt: 'Generate a comprehensive study guide...'
  },
  { 
    id: 'blog_post', 
    title: 'Blog Post', 
    description: 'Insightful takeaways distilled into a highly readable article', 
    hasEdit: true,
    prompt: 'Write an engaging and insightful blog post...'
  },
];

const SUGGESTED_FORMATS: ReportFormat[] = [
  { id: 'research_proposal', title: 'Research Proposal', description: 'A proposal for an experiment to optimize a process or product.', hasEdit: true },
  { id: 'technical_report', title: 'Technical Report', description: 'A comprehensive report analyzing the results of a multi-factor experiment.', hasEdit: true },
  { id: 'concept_explainer', title: 'Concept Explainer', description: "Explore the fundamental idea of 'Analysis of Variance' (ANOVA) using simple analogies.", hasEdit: true },
  { id: 'methodology_overview', title: 'Methodology Overview', description: 'Understand the iterative process of scientific investigation and experiment design.', hasEdit: true },
];

const ALL_FORMATS = [...FORMATS, ...SUGGESTED_FORMATS];

export const CreateReportModal: React.FC<CreateReportModalProps> = ({ isOpen, onClose, onSelectFormat }) => {
  const [configuringFormat, setConfiguringFormat] = useState<ReportFormat | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setConfiguringFormat(null);
      setCustomPrompt('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormatClick = (format: ReportFormat) => {
    if (format.id === 'custom') {
      setConfiguringFormat(format);
      setCustomPrompt('');
    } else {
      onSelectFormat(format.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent, format: ReportFormat) => {
    e.stopPropagation();
    setConfiguringFormat(format);
    setCustomPrompt(format.prompt || '');
  };

  const handleGenerate = () => {
    if (configuringFormat) {
      onSelectFormat(configuringFormat.id, customPrompt);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-card text-card-foreground rounded-xl shadow-2xl border border-border flex flex-col max-h-[90vh] overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card">
          <div className="flex items-center gap-3">
            {configuringFormat && (
              <button onClick={() => setConfiguringFormat(null)} className="p-2 hover:bg-secondary/50 rounded-full transition-colors -ml-2">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <FilePlus2 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold font-sans">Create report</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {configuringFormat ? (
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-card/50 animate-in slide-in-from-right-4 duration-300">
            <div className="p-6 rounded-xl bg-secondary/20 border border-border">
               <h4 className="text-lg font-bold mb-2 font-serif">{configuringFormat.title}</h4>
               <p className="text-sm text-muted-foreground font-serif leading-relaxed">{configuringFormat.description}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 font-sans">Describe the report you want to create</h3>
              <textarea 
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Tell NotebookLM how to structure and write your report..."
                className="w-full h-56 bg-background border border-border rounded-lg p-6 text-base font-serif leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring transition-all resize-none placeholder:text-muted-foreground/40"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleGenerate} 
                className="px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full transition-all shadow-md active:scale-95 text-sm"
              >
                Generate Report
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 bg-card/50 animate-in slide-in-from-left-4 duration-300">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 font-sans">Format</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ALL_FORMATS.map((format) => (
                  <FormatCard key={format.id} format={format} onClick={() => handleFormatClick(format)} onEditClick={(e) => handleEditClick(e, format)} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FormatCard: React.FC<{ format: ReportFormat; onClick: () => void; onEditClick: (e: React.MouseEvent) => void; }> = ({ format, onClick, onEditClick }) => (
  <div onClick={onClick} className="group relative flex flex-col p-5 rounded-xl bg-card border border-border/50 hover:border-primary/40 hover:bg-secondary/30 transition-all cursor-pointer h-48 shadow-sm hover:shadow-md">
    {format.hasEdit && (
      <button onClick={onEditClick} className="absolute top-3 right-3 p-1.5 rounded-full bg-background border border-border text-muted-foreground hover:text-primary transition-colors z-10">
        <Pencil className="w-3 h-3" />
      </button>
    )}
    <h4 className="text-md font-bold mb-2 font-serif pr-6 group-hover:text-primary transition-colors">{format.title}</h4>
    <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-4 font-serif">
      {format.description}
    </p>
  </div>
);

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormat: (formatId: string, customPrompt?: string) => void;
}
