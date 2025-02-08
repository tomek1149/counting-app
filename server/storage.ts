import { sessions, predefinedJobs, type Session, type InsertSession, type PredefinedJob, type InsertPredefinedJob } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private sessions: Session[] = [];
  private predefinedJobs: PredefinedJob[] = [];
  private sessionId = 1;
  private jobId = 1;

  async getSessions(): Promise<Session[]> {
    return this.sessions;
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.find(s => s.id === id);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const session = {
      id: this.sessionId++,
      ...insertSession,
    };
    this.sessions.push(session);
    return session;
  }

  async updateSession(id: number, update: Partial<InsertSession>): Promise<Session> {
    const session = await this.getSession(id);
    if (!session) {
      throw new Error("Session not found");
    }

    const updatedSession = {
      ...session,
      ...update,
    };

    this.sessions = this.sessions.map(s => 
      s.id === id ? updatedSession : s
    );

    return updatedSession;
  }

  async deleteSession(id: number): Promise<void> {
    this.sessions = this.sessions.filter(s => s.id !== id);
  }

  async getPredefinedJobs(): Promise<PredefinedJob[]> {
    return this.predefinedJobs;
  }

  async createPredefinedJob(job: InsertPredefinedJob): Promise<PredefinedJob> {
    const newJob = {
      id: this.jobId++,
      ...job,
    };
    this.predefinedJobs.push(newJob);
    return newJob;
  }

  async deletePredefinedJob(id: number): Promise<void> {
    this.predefinedJobs = this.predefinedJobs.filter(j => j.id !== id);
  }
}

export const storage = new MemStorage();