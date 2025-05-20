import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("user"),
  passwordChangeRequired: boolean("password_change_required").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person").notNull(),
  contactFunction: text("contact_function"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  industry: text("industry"),
  status: text("status").notNull().default("active"), // active or inactive
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

// Candidates table
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  location: text("location"),
  currentPosition: text("current_position"),
  profile: text("profile"), // Manual Tester, Automation Tester, or Performance Tester
  experience: jsonb("experience"),
  education: jsonb("education"),
  skills: jsonb("skills").$type<string[]>(),
  languages: jsonb("languages"),
  certifications: jsonb("certifications"),
  hobbies: text("hobbies"),
  birthDate: text("birth_date"),
  summary: text("summary"),
  availability: text("availability"),
  linkedinUrl: text("linkedin_url"),
  status: text("status").notNull().default("active"), // active, interviewing, placed, inactive
  notes: text("notes"),
  resumePath: text("resume_path"), // path to stored resume file
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
});

// Applications table (for public form submissions)
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  currentPosition: text("current_position"),
  profile: text("profile"), // Manual Tester, Automation Tester, or Performance Tester
  experience: jsonb("experience"),
  education: jsonb("education"),
  skills: jsonb("skills").$type<string[]>(),
  languages: jsonb("languages"),
  certifications: jsonb("certifications"),
  hobbies: text("hobbies"),
  birthDate: text("birth_date"),
  summary: text("summary"),
  availability: text("availability"),
  coverLetter: text("cover_letter"),
  resumePath: text("resume_path"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Create Zod schemas for each insert type
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

// Login schema for validation
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
