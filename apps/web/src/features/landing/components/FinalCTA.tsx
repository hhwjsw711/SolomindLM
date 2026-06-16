import { ArrowRight, Check } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";

interface FinalCTAProps {
  onGetStarted: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onGetStarted }) => {
  const { t } = useTranslation("landing");

  const benefits: string[] = t("finalCTA.benefits", { returnObjects: true }) as unknown as string[];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          {t("finalCTA.title")}
        </h2>

        <p className="text-lg text-muted-foreground">{t("finalCTA.description")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{benefit}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={onGetStarted}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold shadow-lg hover:shadow-xl px-12 py-6 text-lg transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
        >
          {t("finalCTA.createAccount")}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success" />
            {t("finalCTA.trustBadge")}
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success" />
            {t("finalCTA.cancelAnytime")}
          </span>
        </div>
      </div>
    </section>
  );
};
