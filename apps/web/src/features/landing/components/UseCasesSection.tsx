import { BookOpen, Briefcase, GraduationCap, Languages, Microscope, Users } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface UseCase {
  icon: React.ElementType;
  title: string;
  description: string;
  example: string;
  color: string;
  borderColor: string;
  learnMorePath?: string;
}

export const UseCasesSection: React.FC = () => {
  const { t } = useTranslation("landing");

  const useCases: UseCase[] = [
    {
      icon: GraduationCap,
      title: t("useCases.items.medicalStudents.title"),
      description: t("useCases.items.medicalStudents.description"),
      example: t("useCases.items.medicalStudents.example"),
      color: "text-rose-600",
      borderColor: "border-l-rose-500",
      learnMorePath: "/students/ai-flashcards",
    },
    {
      icon: Microscope,
      title: t("useCases.items.researchers.title"),
      description: t("useCases.items.researchers.description"),
      example: t("useCases.items.researchers.example"),
      color: "text-blue-600",
      borderColor: "border-l-blue-500",
      learnMorePath: "/research/ai-literature-review",
    },
    {
      icon: Languages,
      title: t("useCases.items.languageLearners.title"),
      description: t("useCases.items.languageLearners.description"),
      example: t("useCases.items.languageLearners.example"),
      color: "text-emerald-600",
      borderColor: "border-l-emerald-500",
      learnMorePath: "/students/ai-quizzes",
    },
    {
      icon: Briefcase,
      title: t("useCases.items.professionals.title"),
      description: t("useCases.items.professionals.description"),
      example: t("useCases.items.professionals.example"),
      color: "text-amber-600",
      borderColor: "border-l-amber-500",
      learnMorePath: "/students/ai-reports",
    },
    {
      icon: BookOpen,
      title: t("useCases.items.lifelongLearners.title"),
      description: t("useCases.items.lifelongLearners.description"),
      example: t("useCases.items.lifelongLearners.example"),
      color: "text-purple-600",
      borderColor: "border-l-purple-500",
      learnMorePath: "/students/ai-written-questions",
    },
    {
      icon: Users,
      title: t("useCases.items.studyGroups.title"),
      description: t("useCases.items.studyGroups.description"),
      example: t("useCases.items.studyGroups.example"),
      color: "text-indigo-600",
      borderColor: "border-l-indigo-500",
      learnMorePath: "/students/share-notebooks",
    },
  ];

  return (
    <section id="use-cases" className="py-32 md:py-40 px-6">
      <div className="max-w-[1500px] w-full mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            {t("useCases.heading")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("useCases.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <div
                key={index}
                className="group bg-card rounded-xl p-12 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="mb-3">
                  <Icon
                    className={`w-8 h-8 ${useCase.color} group-hover:scale-105 transition-transform duration-300`}
                    strokeWidth={1.5}
                  />
                </div>

                <h3 className="text-lg font-display font-bold text-foreground mb-2">
                  {useCase.title}
                </h3>

                <p className="text-base text-foreground/80 font-normal leading-[1.65] mb-3">
                  {useCase.description}
                </p>

                <div className="mt-4 pt-4 border-t border-border/60">
                  <div className={`pl-3 border-l-2 ${useCase.borderColor} py-1`}>
                    <p className="text-sm text-foreground/75 font-normal leading-[1.6]">
                      {useCase.example}
                    </p>
                  </div>
                </div>

                {useCase.learnMorePath ? (
                  <Link
                    to={useCase.learnMorePath}
                    className="inline-block mt-4 text-sm font-medium text-primary hover:underline"
                  >
                    {t("useCases.learnMore")}
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
