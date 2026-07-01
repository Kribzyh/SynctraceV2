import { z } from "zod";

import { env } from "./env.js";

const authConfigSchema = z.object({
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1).default("7d"),
  COOKIE_NAME: z.string().min(1).default("synctrace_token"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url()
});

export const authConfig = authConfigSchema.parse(env);