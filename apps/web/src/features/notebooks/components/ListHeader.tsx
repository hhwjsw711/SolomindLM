import React from 'react';

export const ListHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_40px] gap-6 px-6 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border mb-2 font-sans">
      <span>Title</span>
      <span className="w-32">Last Modified</span>
      <span className="w-20 text-right">Sources</span>
      <span></span>
    </div>
  );
};
