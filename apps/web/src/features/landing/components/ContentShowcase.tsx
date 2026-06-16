import {
  AudioLines,
  FileSpreadsheet,
  FileText,
  Globe,
  GraduationCap,
  HardDrive,
  Presentation,
  ScanLine,
  Youtube,
} from "lucide-react";
import React from "react";
import { useLandingContent } from "../constants";

export const ContentShowcase: React.FC = () => {
  const content = useLandingContent();
  const getIconForFormat = (iconName: string) => {
    switch (iconName) {
      case "FileText":
        return FileText;
      case "Youtube":
        return Youtube;
      case "Globe":
        return Globe;
      case "AudioLines":
        return AudioLines;
      case "Presentation":
        return Presentation;
      case "ScanLine":
        return ScanLine;
      case "GraduationCap":
        return GraduationCap;
      case "HardDrive":
        return HardDrive;
      case "FileSpreadsheet":
        return FileSpreadsheet;
      default:
        return FileText;
    }
  };

  return (
    <section className="py-32 md:py-40 px-6">
      <div className="max-w-[1500px] w-full mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            {content.contentShowcase.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.contentShowcase.description}
          </p>
        </div>

        {/* Format cards – responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {content.contentShowcase.formats.map((format) => {
            const Icon = getIconForFormat(format.icon);

            return (
              <div
                key={format.name}
                className="rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-1.5 min-h-0"
              >
                <Icon className="w-5 h-5 shrink-0 text-primary" />
                <span className="font-medium text-foreground text-center text-sm sm:text-base">
                  {format.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
