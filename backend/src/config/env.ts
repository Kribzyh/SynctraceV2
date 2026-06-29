import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().default("postgresql://synctrace:synctrace@localhost:5432/synctrace"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().default("replace-with-a-long-random-secret"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  COOKIE_NAME: z.string().default("synctrace_token"),
  GOOGLE_CLIENT_ID: z.string().default("replace-me"),
  GOOGLE_CLIENT_SECRET: z.string().default("replace-me"),
  GOOGLE_REDIRECT_URI: z.string().default("http://localhost:4000/api/auth/google/callback"),
  MINIO_ENDPOINT: z.string().default("localhost"),
  MINIO_PORT: z.coerce.number().int().positive().default(9000),
  MINIO_ACCESS_KEY: z.string().default("synctrace"),
  MINIO_SECRET_KEY: z.string().default("synctrace-minio-secret"),
  MINIO_BUCKET: z.string().default("synctrace"),
  CORS_ORIGIN: z.string().default("http://localhost:5173")
});

export const env = envSchema.parse(process.env);