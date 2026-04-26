import React, { useState } from "react";
import { Check, Pencil, X, Loader2 } from "lucide-react";

interface SubQuestion {
  id: string;
  question: string;
  searchQueries: string[];
  sourceChannels: string[];
}

interface ResearchPlanMessageProps {
  planId: string;
  subQuestions: SubQuestion[];
  onApprove: (planId: string) => void;
  onReject: (planId: string) => void;
}

export const ResearchPlanMessage: React.FC<ResearchPlanMessageProps> = ({
  planId,
  subQuestions,
  onApprove,
  onReject,
}) => {
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await onApprove(planId);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card border-2 border-primary/30 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-primary">Research Plan</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors"
            title={editing ? "Cancel editing" : "Edit plan"}
          >
            {editing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {subQuestions.map((sq, index) => (
          <div key={sq.id} className="flex gap-3 items-start text-sm">
            <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-foreground">{sq.question}</p>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {sq.sourceChannels.map((ch) => (
                  <span
                    key={ch}
                    className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <button
          onClick={handleApprove}
          disabled={submitting}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Approve & Research
        </button>
        <button
          onClick={() => onReject(planId)}
          disabled={submitting}
          className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
