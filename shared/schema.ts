import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const predefinedJobs = pgTable("predefined_jobs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  jobName: text("job_name").notNull().default(""),
  rate: integer("rate").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  isActive: boolean("is_active").notNull().default(true),
  isScheduled: boolean("is_scheduled").notNull().default(false),
  repeatDays: text("repeat_days").array(),
  userId: integer("user_id").references(() => users.id),
});

// Updated validation rules for user registration
export const insertUserSchema = createInsertSchema(users)
  .extend({
    email: z.string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z.string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password is too long"),
    confirmPassword: z.string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string()
    .min(1, "Password is required"),
});

export const insertPredefinedJobSchema = createInsertSchema(predefinedJobs)
  .pick({
    name: true,
    userId: true
  });

export const insertSessionSchema = createInsertSchema(sessions)
  .pick({
    jobName: true,
    rate: true,
    startTime: true,
    endTime: true,
    isActive: true,
    isScheduled: true,
    repeatDays: true,
    userId: true
  })
  .extend({
    jobName: z.string().default(""),
    rate: z.number().min(1, "Rate must be greater than 0"),
    startTime: z.string().transform((str) => new Date(str)),
    endTime: z.string().transform((str) => new Date(str)).nullable().optional(),
    repeatDays: z.array(z.string()).optional(),
  });

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type PredefinedJob = typeof predefinedJobs.$inferSelect;
export type InsertPredefinedJob = z.infer<typeof insertPredefinedJobSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;