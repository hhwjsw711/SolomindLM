import { useAuthActions } from "@convex-dev/auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { getConvexAuthUserMessage } from "@/features/auth/utils/authErrorMessage";

export type AuthFormInitialMode = "signIn" | "signUp";

type AuthStep =
  | "signIn"
  | "signUp"
  | { kind: "emailVerification"; email: string }
  | "forgot"
  | { kind: "resetVerification"; email: string };

const inputClass =
  "w-full px-3 py-2.5 rounded-lg text-sm text-foreground placeholder:text-muted-foreground bg-vintage-amber-50 border border-border/70 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 font-sans shadow-none";

interface AuthFormPanelProps {
  authError?: string;
  onAuthenticated: () => void;
  initialMode?: AuthFormInitialMode;
  /** Merged onto the card root (e.g. extra top padding when a headline overlaps). */
  className?: string;
}

export function AuthFormPanel({
  authError,
  onAuthenticated,
  initialMode = "signIn",
  className,
}: AuthFormPanelProps) {
  const { t } = useTranslation("auth");
  const { signInWithGoogle } = useAuth();
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<AuthStep>(initialMode);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError("");
      await signInWithGoogle();
      onAuthenticated();
    } catch (err) {
      setError(getConvexAuthUserMessage(err, t("form.googleSignInFailed")));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailPasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");
    setPasswordLoading(true);
    void signIn("password", formData)
      .then(() => {
        setStep({
          kind: "emailVerification",
          email: formData.get("email") as string,
        });
      })
      .catch((err) => {
        setError(getConvexAuthUserMessage(err, t("form.signInFailed")));
      })
      .finally(() => setPasswordLoading(false));
  };

  const handleEmailVerificationSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");
    setPasswordLoading(true);
    void signIn("password", formData)
      .then(() => {
        onAuthenticated();
      })
      .catch((err) => {
        setError(getConvexAuthUserMessage(err, t("form.verificationFailed")));
      })
      .finally(() => setPasswordLoading(false));
  };

  const handleForgotSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");
    setPasswordLoading(true);
    void signIn("password", formData)
      .then(() => {
        setStep({
          kind: "resetVerification",
          email: formData.get("email") as string,
        });
      })
      .catch((err) => {
        setError(getConvexAuthUserMessage(err, t("form.couldNotSendCode")));
      })
      .finally(() => setPasswordLoading(false));
  };

  const handleResetVerificationSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");
    setPasswordLoading(true);
    void signIn("password", formData)
      .then(() => {
        onAuthenticated();
      })
      .catch((err) => {
        setError(getConvexAuthUserMessage(err, t("form.couldNotResetPassword")));
      })
      .finally(() => setPasswordLoading(false));
  };

  const modalTitle = (() => {
    if (step === "forgot") return t("form.resetPassword");
    if (typeof step === "object" && step.kind === "resetVerification")
      return t("form.enterResetCode");
    if (typeof step === "object" && step.kind === "emailVerification")
      return t("form.checkYourEmail");
    if (step === "signUp") return t("form.createAccount");
    return t("form.signIn");
  })();

  const disableAll = googleLoading || passwordLoading;

  const btnPrimary =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:opacity-95 disabled:pointer-events-none disabled:opacity-50";

  const btnOutline =
    "inline-flex w-full items-center justify-center gap-3 rounded-xl border-2 border-border bg-vintage-amber-100 px-4 py-3 text-sm font-medium text-vintage-amber-700 transition hover:bg-vintage-amber-200 disabled:pointer-events-none disabled:opacity-50";

  return (
    <div
      className={`rounded-2xl border border-border/90 bg-card/90 p-6 shadow-lg shadow-primary/5 backdrop-blur-sm sm:p-8${className ? ` ${className}` : ""}`}
    >
      <div className="mb-6 text-center">
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {modalTitle}
        </h2>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-vintage-red-200 bg-vintage-red-50 p-3">
          <p className="text-sm text-vintage-red-800 font-sans">{error}</p>
        </div>
      )}

      <div className="space-y-5">
        {step === "signIn" || step === "signUp" ? (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={disableAll}
              className={btnOutline}
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {googleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <>{t("form.connecting")}</>
                </>
              ) : (
                <>{t("form.continueWithGoogle")}</>
              )}
            </button>

            <div className="relative py-0.5">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 font-sans text-sm font-medium tracking-wide text-muted-foreground">
                  {t("form.orContinueWithEmail")}
                </span>
              </div>
            </div>

            <form className="space-y-3" onSubmit={handleEmailPasswordSubmit}>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder={t("form.emailPlaceholder")}
                className={inputClass}
              />
              <div className="relative">
                <input
                  name="password"
                  type={showAuthPassword ? "text" : "password"}
                  autoComplete={step === "signUp" ? "new-password" : "current-password"}
                  required
                  placeholder={t("form.passwordPlaceholder")}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition hover:bg-accent/60 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                  onClick={() => setShowAuthPassword((v) => !v)}
                  aria-label={showAuthPassword ? t("form.hidePassword") : t("form.showPassword")}
                >
                  {showAuthPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
              <input name="flow" type="hidden" value={step === "signUp" ? "signUp" : "signIn"} />
              <button type="submit" disabled={disableAll} className={btnPrimary}>
                {passwordLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <>{t("form.pleaseWait")}</>
                  </>
                ) : step === "signUp" ? (
                  <>{t("form.createAccount")}</>
                ) : (
                  <>{t("form.continueWithEmail")}</>
                )}
              </button>
            </form>

            <div className="flex flex-col gap-2 text-center text-sm font-sans">
              {step === "signIn" ? (
                <>
                  <button
                    type="button"
                    className="text-primary underline-offset-2 hover:underline"
                    onClick={() => {
                      setError("");
                      setStep("signUp");
                    }}
                  >
                    {t("form.createAnAccount")}
                  </button>
                  <button
                    type="button"
                    className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    onClick={() => {
                      setError("");
                      setStep("forgot");
                    }}
                  >
                    {t("form.forgotPassword")}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={() => {
                    setError("");
                    setStep("signIn");
                  }}
                >
                  {t("form.alreadyHaveAccount")}
                </button>
              )}
            </div>
          </>
        ) : null}

        {typeof step === "object" && step.kind === "emailVerification" ? (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground font-sans">
              {t("form.codeSentMessage", { email: step.email })}
            </p>
            <form className="space-y-3" onSubmit={handleEmailVerificationSubmit}>
              <input name="email" type="hidden" value={step.email} />
              <input name="flow" type="hidden" value="email-verification" />
              <input
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                placeholder={t("form.verificationCodePlaceholder")}
                className={inputClass}
              />
              <button type="submit" disabled={disableAll} className={btnPrimary}>
                {passwordLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <>{t("form.verifying")}</>
                  </>
                ) : (
                  <>{t("form.verifyAndContinue")}</>
                )}
              </button>
            </form>
            <button
              type="button"
              className="mx-auto block text-sm text-primary font-sans underline-offset-2 hover:underline"
              onClick={() => {
                setError("");
                setStep("signIn");
              }}
            >
              {t("form.backToSignIn")}
            </button>
          </>
        ) : null}

        {step === "forgot" ? (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground font-sans">
              {t("form.resetInstructions")}
            </p>
            <form className="space-y-3" onSubmit={handleForgotSubmit}>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder={t("form.emailLabel")}
                className={inputClass}
              />
              <input name="flow" type="hidden" value="reset" />
              <button type="submit" disabled={disableAll} className={btnPrimary}>
                {passwordLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <>{t("form.sending")}</>
                  </>
                ) : (
                  <>{t("form.sendCode")}</>
                )}
              </button>
            </form>
            <button
              type="button"
              className="mx-auto block text-sm text-primary font-sans underline-offset-2 hover:underline"
              onClick={() => {
                setError("");
                setStep("signIn");
              }}
            >
              {t("form.backToSignIn")}
            </button>
          </>
        ) : null}

        {typeof step === "object" && step.kind === "resetVerification" ? (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground font-sans">
              {t("form.resetCodeInstructions", { email: step.email })}
            </p>
            <form className="space-y-3" onSubmit={handleResetVerificationSubmit}>
              <input name="email" type="hidden" value={step.email} />
              <input name="flow" type="hidden" value="reset-verification" />
              <input
                name="code"
                type="text"
                inputMode="numeric"
                required
                placeholder={t("form.resetCodePlaceholder")}
                className={inputClass}
              />
              <div className="relative">
                <input
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder={t("form.newPasswordPlaceholder")}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition hover:bg-accent/60 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                  onClick={() => setShowNewPassword((v) => !v)}
                  aria-label={
                    showNewPassword ? t("form.hideNewPassword") : t("form.showNewPassword")
                  }
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
              <button type="submit" disabled={disableAll} className={btnPrimary}>
                {passwordLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <>{t("form.updating")}</>
                  </>
                ) : (
                  <>{t("form.updatePassword")}</>
                )}
              </button>
            </form>
            <button
              type="button"
              className="mx-auto block text-sm text-primary font-sans underline-offset-2 hover:underline"
              onClick={() => {
                setError("");
                setStep("forgot");
              }}
            >
              {t("form.resendCode")}
            </button>
          </>
        ) : null}

        {step === "signIn" || step === "signUp" ? (
          <div className="border-t border-border pt-5 text-center">
            <p className="text-sm text-muted-foreground font-sans">
              {t("form.bySigningIn")}{" "}
              <Link to="/legal/terms" className="underline underline-offset-2 hover:text-primary">
                {t("form.termsOfService")}
              </Link>{" "}
              {t("form.and")}{" "}
              <Link to="/legal/privacy" className="underline underline-offset-2 hover:text-primary">
                {t("form.privacyPolicy")}
              </Link>
              .
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
