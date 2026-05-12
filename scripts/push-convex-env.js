/**
 * Push environment variables from .env files to Convex.
 * Usage:
 *   node scripts/push-convex-env.js              # pushes to dev
 *   node scripts/push-convex-env.js --prod       # pushes to prod
 *   node scripts/push-convex-env.js --dry-run    # prints what would be pushed
 *
 * Uses `npx convex env set` for each variable.
 * Never commits secrets — reads from local .env files only.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PROD_ENV_FILE = ".env";
const DEV_ENV_FILE = ".env.local";

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Env file not found: ${filePath}`);
    process.exit(1);
  }
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // Remove surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function main() {
  const args = process.argv.slice(2);
  const isProd = args.includes("--prod");
  const dryRun = args.includes("--dry-run");

  const envFile = isProd ? PROD_ENV_FILE : DEV_ENV_FILE;
  const envPath = path.resolve(process.cwd(), envFile);

  console.log(`Reading env from: ${envPath}`);
  const env = parseEnvFile(envPath);

  const deployFlag = isProd ? "--prod" : "";

  for (const [key, value] of Object.entries(env)) {
    if (dryRun) {
      console.log(`[DRY RUN] Would set: ${key}=***`);
    } else {
      console.log(`Setting: ${key}`);
      try {
        execSync(
          `npx convex env set ${deployFlag} ${key} "${value.replace(/"/g, '\\"')}"`,
          { stdio: "inherit" }
        );
      } catch (e) {
        console.error(`Failed to set ${key}`);
        process.exit(1);
      }
    }
  }

  console.log(`Done. ${Object.keys(env).length} variables processed.`);
}

main();
