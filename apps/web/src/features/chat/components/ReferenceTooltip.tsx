import React from 'react';
import { ReferenceChunk } from '@/shared/types/index';

interface ReferenceTooltipProps {
  hoveredRefId: number;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  reference: ReferenceChunk;
  position: { x: number; y: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const ReferenceTooltip: React.FC<ReferenceTooltipProps> = ({
  hoveredRefId,
  tooltipRef,
  reference,
  position,
  onMouseEnter,
  onMouseLeave,
}) => (
  <div
    ref={tooltipRef}
    className="fixed z-50"
    style={{ left: `${position.x}px`, top: `${position.y}px`, pointerEvents: 'auto' }}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div className="bg-popover border border-border rounded-2xl shadow-xl p-5 w-96 max-h-64 overflow-y-auto text-sm animate-in fade-in zoom-in-95 duration-200 flex flex-col relative">
      <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-3 font-bold shrink-0">
        Reference {hoveredRefId} • {reference.sourceTitle}
      </p>
      <p className="text-popover-foreground whitespace-pre-wrap text-sm leading-relaxed">
        {reference.content}
      </p>
    </div>
  </div>
);
