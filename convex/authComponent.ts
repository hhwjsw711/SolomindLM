"use node";

import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { betterAuth } from "better-auth/minimal";
import { createAuthOptions } from "./betterAuth/options";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

/**
 * Better-Auth component for HTTP routes and actions.
 * This file uses "use node" and is only imported by http.ts and action files.
 * DO NOT import this from files with query/mutation functions!
 */

export const authComponent = createClient<DataModel>(
  components.betterAuth as unknown as Parameters<typeof createClient<DataModel>>[0]
);

export function createAuth(ctx: GenericCtx<DataModel>) {
  const options = createAuthOptions();
  const isDev = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');

  console.log("[AuthComponent] Creating auth with config:", {
    baseURL: options.baseURL,
    basePath: options.basePath,
    trustedOrigins: options.trustedOrigins,
    siteUrl,
    isDev,
  });

  return betterAuth({
    ...options,
    database: authComponent.adapter(ctx),
    plugins: [
      // SAME-DOMAIN SETUP: No crossDomain plugin needed!
      // Frontend and backend are on the same domain via Vercel/Vite proxy
      // Cookies just work with standard Set-Cookie headers
      convex({ authConfig, options: { basePath: "/auth" } }),
    ],
    // Enable debug logging for both dev and prod to debug auth issues
    _debug: {
      log: isDev, // Only log in dev to reduce production noise
    },
  });
}
