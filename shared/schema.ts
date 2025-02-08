import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  rate: integer("rate").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertSessionSchema = createInsertSchema(sessions)
  .pick({
    rate: true,
    startTime: true,
    endTime: true,
    isActive: true,
  })
  .extend({
    rate: z.number().min(1, "Rate must be greater than 0"),
  });

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
