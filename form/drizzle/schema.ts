import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Companies table - stores company information
 */
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  industry: varchar("industry", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

/**
 * Commissioning records table - stores commissioning information
 */
export const commissioningRecords = mysqlTable("commissioning_records", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  sheetRowId: varchar("sheetRowId", { length: 255 }).notNull().unique(), // Reference to Google Sheets row
  model: varchar("model", { length: 255 }),
  serialNumber: varchar("serialNumber", { length: 255 }),
  kw: varchar("kw", { length: 255 }),
  hz: varchar("hz", { length: 255 }),
  ampere: varchar("ampere", { length: 255 }),
  commissioningDate: timestamp("commissioningDate"),
  status: mysqlEnum("status", ["incomplete", "complete"]).default("incomplete").notNull(),
  lastUpdatedBy: int("lastUpdatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommissioningRecord = typeof commissioningRecords.$inferSelect;
export type InsertCommissioningRecord = typeof commissioningRecords.$inferInsert;

/**
 * Sync logs table - tracks Google Sheets sync operations
 */
export const syncLogs = mysqlTable("sync_logs", {
  id: int("id").autoincrement().primaryKey(),
  recordId: int("recordId").notNull(),
  action: mysqlEnum("action", ["read", "write", "update"]).notNull(),
  status: mysqlEnum("status", ["success", "failed"]).notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SyncLog = typeof syncLogs.$inferSelect;
export type InsertSyncLog = typeof syncLogs.$inferInsert;