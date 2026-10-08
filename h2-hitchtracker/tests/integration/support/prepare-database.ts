import { execFileSync } from "node:child_process";
import { Client } from "pg";

/**
 * First step of the test server command in playwright.config.ts, where
 * DATABASE_URL already points to the test database (checked there): creates
 * the database if it does not exist yet and applies the migrations. The data
 * itself is reset per test.
 */
async function prepareDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL ontbreekt. Start de tests met npm run test:integration",
    );
  }
  const url = new URL(process.env.DATABASE_URL);
  const name = url.pathname.slice(1);

  // CREATE DATABASE has to run from another database on the same server.
  const maintenance = new URL(url);
  maintenance.pathname = "/postgres";
  const client = new Client({ connectionString: maintenance.toString() });
  await client.connect();
  const existing = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [name],
  );
  if (existing.rowCount === 0) {
    // Identifiers cannot be query parameters; the name comes from .env, not from input.
    await client.query(`CREATE DATABASE "${name}"`);
  }
  await client.end();

  execFileSync("npx", ["drizzle-kit", "migrate"], { stdio: "inherit" });
}

prepareDatabase().catch((err) => {
  console.error(err);
  process.exit(1);
});
