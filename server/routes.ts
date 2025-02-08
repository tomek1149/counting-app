import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema, insertPredefinedJobSchema } from "@shared/schema";
import { setupAuth } from "./auth";

export function registerRoutes(app: Express): Server {
  // Set up auth routes and get middleware
  const requireAuth = setupAuth(app);

  // Protected routes
  app.get("/api/sessions", requireAuth, async (req, res) => {
    const sessions = await storage.getSessions();
    res.json(sessions);
  });

  app.post("/api/sessions", requireAuth, async (req, res) => {
    const parsed = insertSessionSchema.parse(req.body);
    const session = await storage.createSession(parsed);
    res.json(session);
  });

  app.patch("/api/sessions/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = insertSessionSchema.partial().parse(req.body);
    const session = await storage.updateSession(id, parsed);
    res.json(session);
  });

  app.delete("/api/sessions/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteSession(id);
    res.status(204).end();
  });

  app.get("/api/predefined-jobs", requireAuth, async (req, res) => {
    const jobs = await storage.getPredefinedJobs();
    res.json(jobs);
  });

  app.post("/api/predefined-jobs", requireAuth, async (req, res) => {
    const parsed = insertPredefinedJobSchema.parse(req.body);
    const job = await storage.createPredefinedJob(parsed);
    res.json(job);
  });

  app.delete("/api/predefined-jobs/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deletePredefinedJob(id);
    res.status(204).end();
  });

  const httpServer = createServer(app);
  return httpServer;
}