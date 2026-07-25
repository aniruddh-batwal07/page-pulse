import { z } from "zod";

export const auditRequestSchema = z.object({
  url: z.url({ error: "Must be a valid URL" }),
});

export type AuditRequestSchema = z.infer<typeof auditRequestSchema>;
