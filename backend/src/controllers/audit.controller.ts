import { Request, Response, NextFunction } from "express";
import { auditRequestSchema } from "../schemas/audit.schema.js";
import { runAudit } from "../services/audit.service.js";
import { AuditResponse } from "../types/audit.types.js";

export async function auditController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const parsed = auditRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const result = await runAudit({ url: parsed.data.url });

    const response: AuditResponse = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
