import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, companies, commissioningRecords, InsertCompany, InsertCommissioningRecord } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Upsert a company into the database
 */
export async function upsertCompany(company: InsertCompany): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert company: database not available");
    return;
  }

  try {
    await db.insert(companies).values(company).onDuplicateKeyUpdate({
      set: {
        industry: company.industry,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[Database] Failed to upsert company:", error);
    throw error;
  }
}

/**
 * Get all companies
 */
export async function getAllCompanies() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get companies: database not available");
    return [];
  }

  try {
    return await db.select().from(companies).orderBy(companies.name);
  } catch (error) {
    console.error("[Database] Failed to get companies:", error);
    return [];
  }
}

/**
 * Get company by name
 */
export async function getCompanyByName(name: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get company: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(companies).where(eq(companies.name, name)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get company:", error);
    return undefined;
  }
}

/**
 * Upsert a commissioning record
 */
export async function upsertCommissioningRecord(
  record: InsertCommissioningRecord
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert record: database not available");
    return;
  }

  try {
    await db.insert(commissioningRecords).values(record).onDuplicateKeyUpdate({
      set: {
        hz: record.hz,
        ampere: record.ampere,
        commissioningDate: record.commissioningDate,
        status: record.status,
        lastUpdatedBy: record.lastUpdatedBy,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[Database] Failed to upsert commissioning record:", error);
    throw error;
  }
}

/**
 * Get incomplete records for a company
 */
export async function getIncompleteRecordsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get records: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(commissioningRecords)
      .where(
        and(
          eq(commissioningRecords.companyId, companyId),
          eq(commissioningRecords.status, "incomplete")
        )
      );
  } catch (error) {
    console.error("[Database] Failed to get incomplete records:", error);
    return [];
  }
}

/**
 * Get all commissioning records
 */
export async function getAllCommissioningRecords() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get records: database not available");
    return [];
  }

  try {
    return await db.select().from(commissioningRecords).orderBy(commissioningRecords.updatedAt);
  } catch (error) {
    console.error("[Database] Failed to get commissioning records:", error);
    return [];
  }
}
