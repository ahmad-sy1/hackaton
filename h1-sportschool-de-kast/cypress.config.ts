import { defineConfig } from "cypress";
import { Pool } from "pg";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on) {
      try {
        process.loadEnvFile();
      } catch {
        // .env ontbreekt — dan moet DATABASE_URL_TEST al in de omgeving staan.
      }

      const testDatabaseUrl = process.env.DATABASE_URL_TEST;
      if (!testDatabaseUrl) {
        throw new Error("DATABASE_URL_TEST ontbreekt. Zet hem in .env");
      }

      // De seed (en de server actions die de app zelf aanroept) lezen
      // DATABASE_URL; die wordt hier overschreven zodat tests nooit de
      // ontwikkeldatabase raken.
      process.env.DATABASE_URL = testDatabaseUrl;

      const pool = new Pool({ connectionString: testDatabaseUrl });

      on("task", {
        async seed() {
          const { seedDatabase } = await import("./src/db/seed");
          await seedDatabase();
          return null;
        },
        async query({ sql, params }: { sql: string; params?: unknown[] }) {
          const { rows } = await pool.query(sql, params ?? []);
          return rows;
        },
      });
    },
  },
});
