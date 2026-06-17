const SIGNUP_INTENT_KEY = "better-memory_signup_intent";

export function setSignupIntent(intentKey: string): void {
  try {
    sessionStorage.setItem(SIGNUP_INTENT_KEY, intentKey);
  } catch {
    // Private browsing or storage disabled
  }
}

export function consumeSignupIntent(): string | null {
  try {
    const value = sessionStorage.getItem(SIGNUP_INTENT_KEY);
    if (value) sessionStorage.removeItem(SIGNUP_INTENT_KEY);
    return value;
  } catch {
    return null;
  }
}

export function peekSignupIntent(): string | null {
  try {
    return sessionStorage.getItem(SIGNUP_INTENT_KEY);
  } catch {
    return null;
  }
}
