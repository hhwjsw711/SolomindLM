import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LegalPageShell } from "./LegalPageShell";

type Subprocessor = {
  name: string;
  description: string;
};

function translatedList(
  t: (key: string, options?: Record<string, unknown>) => unknown,
  key: string
) {
  return t(key, { returnObjects: true }) as string[];
}

function translatedSubprocessors(
  t: (key: string, options?: Record<string, unknown>) => unknown,
  key: string
) {
  return t(key, { returnObjects: true }) as Subprocessor[];
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

function SubprocessorList({ items }: { items: Subprocessor[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
      {items.map((item) => (
        <li key={item.name}>
          <span className="text-foreground">{item.name}</span> - {item.description}
        </li>
      ))}
    </ul>
  );
}

export const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();
  return (
    <LegalPageShell title={t("legal.privacy.title")} canonical="/privacy">
      <section className="space-y-3">
        <p className="text-muted-foreground">
          {t("legal.privacy.introBeforeTerms")}{" "}
          <Link
            to="/terms"
            className="text-foreground underline underline-offset-2 hover:no-underline"
          >
            {t("legal.termsOfService")}
          </Link>
          {t("legal.privacy.introAfterTerms")}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          {t("legal.sections.informationWeCollect")}
        </h2>

        {[
          ["accountAndAuthentication", "accountAndAuthentication"],
          ["contentYouProvide", "contentYouProvide"],
          ["usageDeviceAndBilling", "usageDeviceAndBilling"],
        ].map(([sectionKey, listKey]) => (
          <div key={sectionKey} className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">
              {t(`legal.sections.${sectionKey}`)}
            </h3>
            <BulletList items={translatedList(t, `legal.privacy.collect.${listKey}`)} />
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          {t("legal.sections.howWeUseInformation")}
        </h2>
        <BulletList items={translatedList(t, "legal.privacy.howWeUseInformation")} />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          {t("legal.sections.subprocessorsAndIntegrations")}
        </h2>
        <p className="text-muted-foreground">{t("legal.privacy.subprocessors.intro")}</p>
        <SubprocessorList items={translatedSubprocessors(t, "legal.privacy.subprocessors.items")} />
        <p className="text-muted-foreground">{t("legal.privacy.subprocessors.modelNotice")}</p>
      </section>

      {[
        ["security", "security"],
        ["retentionAndYourChoices", "retentionAndYourChoices"],
        ["cookiesLocalStorageAndAnalytics", "cookiesLocalStorageAndAnalytics"],
        ["children", "children"],
        ["canadianPrivacyLaw", "canadianPrivacyLaw"],
        ["internationalTransfers", "internationalTransfers"],
        ["changes", "changes"],
      ].map(([sectionKey, contentKey]) => (
        <section key={sectionKey} className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">
            {t(`legal.sections.${sectionKey}`)}
          </h2>
          <Paragraphs items={translatedList(t, `legal.privacy.sections.${contentKey}`)} />
        </section>
      ))}

      <section className="space-y-3 border-t border-border pt-10">
        <h2 className="text-base font-semibold text-foreground">{t("legal.sections.contact")}</h2>
        <p className="text-muted-foreground">
          {t("legal.privacy.contactPrefix")}{" "}
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
