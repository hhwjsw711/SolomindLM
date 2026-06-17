export const log = {
  info: (...args: unknown[]) => {
    if (__DEV__) console.log("[BETTER-MEMORY]", ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn("[BETTER-MEMORY]", ...args);
  },
  error: (...args: unknown[]) => {
    console.error("[BETTER-MEMORY]", ...args);
  },
};
