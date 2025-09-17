import { Router } from "express";
const r = Router();

r.get("/health", (_req, res) => res.json({ status: "ok" }));
r.get("/version", (_req, res) => res.json({ version: "1.0.0" }));

export default r;
