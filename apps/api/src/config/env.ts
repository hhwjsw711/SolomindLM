import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  DATABASE_URL: z.string(), // PostgreSQL connection for Graphile Worker
  COHERE_API_KEY: z.string(),
  MISTRAL_API_KEY: z.string(),
  TOGETHER_AI_API_KEY: z.string(),
  TOGETHER_AI_MODEL: z.string().default('meta-llama/Llama-3.2-3B-Instruct-Turbo'),
  REPORT_MAX_TOKENS: z.string().default('24000'), // Context window for report generation
  REPORT_MAP_BATCH_SIZE: z.string().default('10'),
  SUPADATA_API_KEY: z.string(),
  TAVILY_API_KEY: z.string(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);
