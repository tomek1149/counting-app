import { type Session, type InsertSession } from "@shared/schema";

export interface IStorage {
  getSessions(): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, session: Partial<InsertSession>): Promise<Session>;
  deleteSession(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private sessions: Map<number, Session>;
  private currentId: number;

  constructor() {
    this.sessions = new Map();
    this.currentId = 1;
  }

  async getSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentId++;
    const session: Session = { ...insertSession, id };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: number, update: Partial<InsertSession>): Promise<Session> {
    const existing = await this.getSession(id);
    if (!existing) {
      throw new Error("Session not found");
    }
    const updated = { ...existing, ...update };
    this.sessions.set(id, updated);
    return updated;
  }

  async deleteSession(id: number): Promise<void> {
    this.sessions.delete(id);
  }
}

export const storage = new MemStorage();
