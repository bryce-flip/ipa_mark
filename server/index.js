import express from "express";
import cors from "cors";
import morgan from "morgan";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { listLanguages } from "./dictLoader.js";
import { annotate } from "./annotator.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/languages", (_req, res) => {
  try {
    const languages = listLanguages();
    res.json({ languages });
  } catch (e) {
    res.status(500).json({ error: "Failed to list languages" });
  }
});

app.post("/api/annotate", (req, res) => {
  const { lang, text } = req.body || {};
  if (typeof lang !== "string" || !lang.trim()) {
    return res.status(400).json({ error: "Missing or invalid 'lang'" });
  }
  if (typeof text !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'text'" });
  }
  try {
    const spans = annotate(lang.trim(), text);
    res.json({ spans });
  } catch (e) {
    if (e.message?.startsWith("Dictionary not found")) {
      return res.status(404).json({ error: e.message });
    }
    res.status(500).json({ error: "Annotation failed" });
  }
});

const clientDist = join(__dirname, "..", "client", "dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(join(clientDist, "index.html"));
  });
}

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`IPA API listening on http://localhost:${PORT}`);
});
