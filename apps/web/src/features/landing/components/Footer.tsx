import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useLanguage } from "@/shared/contexts/useLanguage";
import { getIntentPagesByCluster } from "../intentLandingPages";
import { getComparisonPages, getGuidePages } from "../seoContentPages";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WeChatIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.11.24-.245 0-.06-.024-.12-.04-.178l-.325-1.233a.49.49 0 0 1 .178-.554C23.028 18.48 24 16.82 24 14.98c0-3.21-2.931-5.952-7.062-6.122zm-2.18 2.769c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
    </svg>
  );
}

function FooterLinkColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h3 className="text-[15px] font-display font-semibold text-foreground mb-5">{title}</h3>
      <ul className="space-y-3">{children}</ul>
    </nav>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors leading-snug"
      >
        {children}
      </Link>
    </li>
  );
}

function WeChatQrDialog({
  open,
  onClose,
  hint,
}: {
  open: boolean;
  onClose: () => void;
  hint: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-label="WeChat QR Code"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 mx-4 flex flex-col items-center rounded-2xl border border-border bg-card p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        <img src="/wechat-qr.png" alt="WeChat QR Code" className="w-48 h-48 rounded-xl" />
        <p className="mt-4 text-sm text-muted-foreground text-center">{hint}</p>
      </div>
    </div>
  );
}

export const Footer: React.FC = () => {
  const { t } = useTranslation("landing");
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();
  const studentPages = getIntentPagesByCluster("students", language);
  const researchPages = getIntentPagesByCluster("research", language);
  const comparisonPages = getComparisonPages(language);
  const guidePages = getGuidePages(language);
  const [wechatQrOpen, setWechatQrOpen] = useState(false);

  const companyLinks = [
    { label: t("footer.features"), to: "/#features" },
    { label: t("footer.pricing"), to: "/#pricing" },
    { label: t("footer.faq"), to: "/faq" },
    { label: t("footer.privacyPolicy"), to: "/privacy" },
    { label: t("footer.terms"), to: "/terms" },
  ];

  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="max-w-[1500px] w-full mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-3">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
              <img
                src="/BETTER-MEMORY_logo.png"
                alt="BETTER-MEMORY"
                className="w-8 h-8 shrink-0 object-contain"
              />
              <span className="text-xl font-display font-bold text-foreground tracking-tight">
                BETTER-MEMORY
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              {t("footer.tagline")}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://discord.gg/rqfgwzqYjz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <DiscordIcon className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/hhwjsw711"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </a>
              <button
                type="button"
                onClick={() => setWechatQrOpen(true)}
                aria-label="微信"
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <WeChatIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <FooterLinkColumn title={t("footer.companyTitle")}>
              {companyLinks.map((link) => (
                <FooterLink key={link.to} to={link.to}>
                  {link.label}
                </FooterLink>
              ))}
            </FooterLinkColumn>
          </div>

          <div className="lg:col-span-2">
            <FooterLinkColumn title={t("footer.forStudentsTitle")}>
              <FooterLink to="/students">{t("footer.allStudentTools")}</FooterLink>
              {studentPages.map((page) => (
                <FooterLink key={page.path} to={page.path}>
                  {page.navLabel}
                </FooterLink>
              ))}
            </FooterLinkColumn>
          </div>

          <div className="lg:col-span-3">
            <FooterLinkColumn title={t("footer.forResearchTitle")}>
              <FooterLink to="/research">{t("footer.allResearchTools")}</FooterLink>
              {researchPages.map((page) => (
                <FooterLink key={page.path} to={page.path}>
                  {page.navLabel}
                </FooterLink>
              ))}
            </FooterLinkColumn>
          </div>

          <div className="lg:col-span-2">
            <FooterLinkColumn title={t("footer.comparisonsTitle")}>
              {comparisonPages.map((page) => (
                <FooterLink key={page.path} to={page.path}>
                  {page.navLabel}
                </FooterLink>
              ))}
            </FooterLinkColumn>
            <div className="mt-10">
              <FooterLinkColumn title={t("footer.guidesTitle")}>
                {guidePages.map((page) => (
                  <FooterLink key={page.path} to={page.path}>
                    {page.navLabel}
                  </FooterLink>
                ))}
              </FooterLinkColumn>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-border/60 text-center">
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright", { year: currentYear })}
          </p>
        </div>
      </div>
      <WeChatQrDialog
        open={wechatQrOpen}
        onClose={() => setWechatQrOpen(false)}
        hint={t("footer.wechatQrHint")}
      />
    </footer>
  );
};
