import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400){ super(message); this.statusCode = statusCode; }
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction){
  if (err instanceof ZodError){
    const msg = err.issues.map(i => i.path.join(".") + ": " + i.message).join("; ");
    return res.status(400).json({ ok: false, error: msg });
  }
  const status = err?.statusCode || 500;
  logger.error({ err }, "unhandled_error");
  res.status(status).json({ ok: false, error: err?.message || "Internal Server Error" });
}
