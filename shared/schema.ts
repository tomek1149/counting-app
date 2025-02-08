import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  rate: integer("rate").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  isActive: boolean("is_active").notNull().default(true),
  isScheduled: boolean("is_scheduled").notNull().default(false),
  repeatDays: text("repeat_days").array(), // Store days of the week for repeating sessions
});

export const insertSessionSchema = createInsertSchema(sessions)
  .pick({
    rate: true,
    startTime: true,
    endTime: true,
    isActive: true,
    isScheduled: true,
    repeatDays: true,
  })
  .extend({
    rate: z.number().min(1, "Rate must be greater than 0"),
    startTime: z.string().transform((str) => new Date(str)),
    endTime: z.string().transform((str) => new Date(str)).nullable().optional(),
    repeatDays: z.array(z.string()).optional(),
  });

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;