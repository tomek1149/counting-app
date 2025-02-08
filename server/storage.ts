import { sessions, predefinedJobs, type Session, type InsertSession, type PredefinedJob, type InsertPredefinedJob } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getSessions(): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, session: Partial<InsertSession>): Promise<Session>;
  deleteSession(id: number): Promise<void>;
  getPredefinedJobs(): Promise<PredefinedJob[]>;
  createPredefinedJob(job: InsertPredefinedJob): Promise<PredefinedJob>;
  deletePredefinedJob(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getSessions(): Promise<Session[]> {
    return await db.select().from(sessions);
  }

  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateSession(id: number, update: Partial<InsertSession>): Promise<Session> {
    const [session] = await db
      .update(sessions)
      .set(update)
      .where(eq(sessions.id, id))
      .returning();

    if (!session) {
      throw new Error("Session not found");
    }

    return session;
  }

  async deleteSession(id: number): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  async getPredefinedJobs(): Promise<PredefinedJob[]> {
    return await db.select().from(predefinedJobs);
  }

  async createPredefinedJob(job: InsertPredefinedJob): Promise<PredefinedJob> {
    const [createdJob] = await db
      .insert(predefinedJobs)
      .values(job)
      .returning();
    return createdJob;
  }

  async deletePredefinedJob(id: number): Promise<void> {
    await db.delete(predefinedJobs).where(eq(predefinedJobs.id, id));
  }
}

export const storage = new DatabaseStorage();