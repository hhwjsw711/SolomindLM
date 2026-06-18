import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { useAuth } from "@/features/auth/useAuth";
import { useLanguage } from "@/shared/contexts/useLanguage";
import { SEOMeta } from "@/shared/seo/SEOMeta";
import { isNativeShell } from "@/utils/platformDetection";
import { ContentShowcase } from "./components/ContentShowcase";
import { FAQSection } from "./components/FAQSection";
import { FeaturesGrid } from "./components/FeaturesGrid";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { NavigationHeader } from "./components/NavigationHeader";
import { PricingSection } from "./components/PricingSection";
import { UseCasesSection } from "./components/UseCasesSection";

const SEO_TITLE = {
  en: "Better Memory — Free AI Study Tool for PDFs, Flashcards & Research",
  zh: "Better Memory — 免费 AI 学习工具 | PDF、闪卡与研究",
};

const SEO_DESCRIPTION = {
  en: "Free AI study tool online: upload PDFs, videos, and articles, chat with your sources, and generate flashcards, quizzes, mind maps, and audio overviews—grounded in your documents.",
  zh: "免费的在线 AI 学习工具：上传 PDF、视频和文章，与来源对话，生成基于文档的闪卡、测验、思维导图和音频概览。",
};

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (isNativeShell()) {
    if (isLoading) {
      return <div className="min-h-screen bg-[#FDFBF7]" />;
    }
    return <Navigate to={isAuthenticated ? "/home" : "/sign-in"} replace />;
  }

  return (
    <>
      <SEOMeta pagePath="/" title={SEO_TITLE[language]} description={SEO_DESCRIPTION[language]} />
      <div className="min-h-screen landing-grid-pattern">
        <NavigationHeader onGetStarted={onGetStarted} onLogin={() => setAuthModalOpen(true)} />
        <HeroSection onGetStarted={onGetStarted} />
        <FeaturesGrid />
        <UseCasesSection />
        <ContentShowcase />
        <PricingSection onGetStarted={onGetStarted} />
        <FAQSection />
        <Footer />
      </div>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={() => navigate("/home", { replace: true })}
      />
    </>
  );
};
