import type { SQLiteDatabase } from "expo-sqlite";
import { SEED_REPORT } from "../domain/seed";
import { migrate, SQLiteRepository } from "./sqlite";
import type { Repository } from "./repository";

/**
 * Backend selection lives here. To use a different backend, return a different
 * `Repository` implementation. Nothing else in the app needs to change.
 */
export function createRepository(db: SQLiteDatabase): Repository {
  return new SQLiteRepository(db);
}

/** Run once when the database opens: apply migrations and seed the first record on fresh installs. */
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  const fresh = await migrate(db);
  if (fresh) await createRepository(db).saveReport(SEED_REPORT);
}
