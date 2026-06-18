import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LegalPageShell } from "./LegalPageShell";

function translatedList(
  t: (key: string, options?: Record<string, unknown>) => unknown,
  key: string
) {
  return t(key, { returnObjects: true }) as string[];
}

function Paragraphs({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item) => (
        <p key={item} className="text-muted-foreground">
          {item}
        </p>
      ))}
    </>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export const TermsOfService: React.FC = () => {
  const { t } = useTranslation();
  return (
    <LegalPageShell title={t("legal.terms.title")} canonical="/terms">
      <section className="space-y-3">
        <p className="text-muted-foreground">
          {t("legal.terms.introBeforePrivacy")}{" "}
          <Link
            to="/privacy"
            className="text-foreground underline underline-offset-2 hover:no-underline"
          >
            {t("legal.privacyPolicy")}
          </Link>
          {t("legal.terms.introAfterPrivacy")}
        </p>
      </section>

      {[
        ["theService", "theService"],
        ["subscriptionsAndBilling", "subscriptionsAndBilling"],
        ["yourContent", "yourContent"],
        ["aiGeneratedOutput", "aiGeneratedOutput"],
        ["ourRights", "ourRights"],
        ["disclaimers", "disclaimers"],
        ["limitationOfLiability", "limitationOfLiability"],
        ["termination", "termination"],
        ["governingLawAndDisputes", "governingLawAndDisputes"],
        ["indemnity", "indemnity"],
      ].map(([sectionKey, contentKey]) => (
        <section key={sectionKey} className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">
            {t(`legal.sections.${sectionKey}`)}
          </h2>
          <Paragraphs items={translatedList(t, `legal.terms.sections.${contentKey}`)} />
        </section>
      ))}

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">{t("legal.sections.accounts")}</h2>
        <BulletList items={translatedList(t, "legal.terms.accounts")} />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          {t("legal.sections.acceptableUse")}
        </h2>
        <p className="text-muted-foreground">{t("legal.terms.acceptableUseIntro")}</p>
        <BulletList items={translatedList(t, "legal.terms.acceptableUse")} />
        <p className="text-muted-foreground">{t("legal.terms.acceptableUseOutro")}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">{t("legal.sections.general")}</h2>
        <BulletList items={translatedList(t, "legal.terms.general")} />
      </section>

      <section className="space-y-3 border-t border-border pt-10">
        <h2 className="text-base font-semibold text-foreground">{t("legal.sections.contact")}</h2>
        <p className="text-muted-foreground">
          {t("legal.terms.contactPrefix")}{" "}
          <a
            href="mailto:support@better-memory.com"
            className="text-foreground underline underline-offset-2 hover:no-underline"
          >
            support@better-memory.com
          </a>
        </p>
      </section>
    </LegalPageShell>
  );
};
