import { z } from "zod";

export const completeProfileSchema = z.object({
  role: z.enum(["STUDENT", "ADVISER"])
});

export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;