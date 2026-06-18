import { RenderOptions, render } from "@testing-library/react";
import { ReactNode } from "react";
import { LanguageProvider } from "@/shared/contexts/LanguageContext";
import { ThemeProvider } from "@/shared/contexts/ThemeContext";
import { ToastProvider } from "@/shared/contexts/ToastContext";

interface ProviderOptions {
  withToast?: boolean;
  withTheme?: boolean;
  withLanguage?: boolean;
}

/**
 * Render a component wrapped with selected context providers.
 *
 * By default, wraps with ToastProvider, ThemeProvider, and LanguageProvider.
 * Pass `{ withToast: false }`, `{ withTheme: false }`, or `{ withLanguage: false }` to opt out.
 */
export function renderWithProviders(ui: ReactNode, options?: RenderOptions & ProviderOptions) {
  const {
    withToast = true,
    withTheme = true,
    withLanguage = true,
    ...renderOptions
  } = options ?? {};

  let wrapped = ui;
  if (withToast) {
    wrapped = <ToastProvider>{wrapped}</ToastProvider>;
  }
  if (withTheme) {
    wrapped = <ThemeProvider>{wrapped}</ThemeProvider>;
  }
  if (withLanguage) {
    wrapped = <LanguageProvider>{wrapped}</LanguageProvider>;
  }

  return render(wrapped, renderOptions);
}
