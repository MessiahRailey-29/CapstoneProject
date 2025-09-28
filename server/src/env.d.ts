// ===== env.d.ts =====
export interface Env {
  groceries_db: D1Database;
  GroceriesDurableObjects: DurableObjectNamespace; // Keep plural to match usage
}