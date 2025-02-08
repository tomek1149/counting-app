import { users, predefinedJobs, sessions, type Session, type InsertSession, type PredefinedJob, type InsertPredefinedJob, type User, type InsertUser } from "@shared/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export interface IStorage {
  getSessions(): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, session: Partial<InsertSession>): Promise<Session>;
  deleteSession(id: number): Promise<void>;
  getPredefinedJobs(): Promise<PredefinedJob[]>;
  createPredefinedJob(job: InsertPredefinedJob): Promise<PredefinedJob>;
  deletePredefinedJob(id: number): Promise<void>;
  createUser(user: Omit<InsertUser, "confirmPassword">): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  validateUser(email: string, password: string): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private sessions: Session[] = [];
  private predefinedJobs: PredefinedJob[] = [];
  private users: User[] = [];
  private sessionId = 1;
  private jobId = 1;
  private userId = 1;

  async getSessions(): Promise<Session[]> {
    return this.sessions;
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.find(s => s.id === id);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const session: Session = {
      id: this.sessionId++,
      jobName: insertSession.jobName,
      rate: insertSession.rate,
      startTime: insertSession.startTime,
      endTime: insertSession.endTime || null,
      isActive: insertSession.isActive || false,
      isScheduled: insertSession.isScheduled || false,
      repeatDays: insertSession.repeatDays || null,
      userId: insertSession.userId || null
    };
    this.sessions.push(session);
    return session;
  }

  async updateSession(id: number, update: Partial<InsertSession>): Promise<Session> {
    const session = await this.getSession(id);
    if (!session) {
      throw new Error("Session not found");
    }

    const updatedSession: Session = {
      ...session,
      ...update,
      endTime: update.endTime || session.endTime,
      repeatDays: update.repeatDays || session.repeatDays,
      userId: update.userId ?? session.userId
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
    const newJob: PredefinedJob = {
      id: this.jobId++,
      name: job.name,
      userId: job.userId || null
    };
    this.predefinedJobs.push(newJob);
    return newJob;
  }

  async deletePredefinedJob(id: number): Promise<void> {
    this.predefinedJobs = this.predefinedJobs.filter(j => j.id !== id);
  }

  async createUser(insertUser: Omit<InsertUser, "confirmPassword">): Promise<User> {
    const hashedPassword = await hashPassword(insertUser.password);
    const user: User = {
      id: this.userId++,
      email: insertUser.email,
      password: hashedPassword,
    };
    this.users.push(user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async validateUser(email: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) return undefined;
    const isValid = await comparePasswords(password, user.password);
    return isValid ? user : undefined;
  }
}

export const storage = new MemStorage();