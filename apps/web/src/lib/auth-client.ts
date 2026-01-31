import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

// SAME-DOMAIN SETUP: Auth requests go through Vercel proxy to Convex
// Frontend: https://www.solomindlm.com
// Auth API: https://www.solomindlm.com/api/auth/* → proxied to Convex
//
// This eliminates all cross-domain cookie issues - cookies just work!

// Use window.location.origin so auth works on both localhost and production
export const authBaseURL = `${window.location.origin}/api/auth`;

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [
    convexClient(),
    // NO crossDomainClient needed - same domain!
  ],
  fetchOptions: {
    credentials: "include", // Standard same-domain cookie handling
  },
});
