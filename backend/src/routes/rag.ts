import { Router } from "express";
import { searchRag } from "../services/rag.service";

const r = Router();
r.get("/search", (req, res) => {
  const q = String(req.query.q || "");
  if (!q) return res.status(400).json({ error: "q required" });
  res.json({ results: searchRag(q, 5) });
});
export default r;
