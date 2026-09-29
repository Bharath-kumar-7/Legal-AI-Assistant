import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

import path from "node:path";
import fs from "node:fs";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const allowedOrigin = process.env["ALLOWED_ORIGIN"];
app.use(cors({
  origin: allowedOrigin ? [allowedOrigin, "http://localhost:5173"] : true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve frontend static assets if built
const frontendDistCandidates = [
  path.resolve(process.cwd(), "artifacts/legal-assistance/dist/public"),
  path.resolve(process.cwd(), "dist/public"),
];
const frontendDist = frontendDistCandidates.find(dir => fs.existsSync(dir));

if (frontendDist) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(frontendDist, "index.html"));
    }
    next();
  });
} else {
  app.get("/", (_req, res) => {
    res.json({
      name: "Nyaya Legal AI Assistant API",
      status: "online",
      health: "/api/healthz",
      docs: "/api",
    });
  });
}

export default app;
