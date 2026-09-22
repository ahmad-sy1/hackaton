import { defineConfig } from "cypress";
import { Pool, types } from "pg";

// DATE-kolommen (oid 1082) anders dan de pg-standaard: als kale "YYYY-MM-DD"
// string teruggeven in plaats van een JS Date. Zo komt de waarde onveranderd
// aan de specs door (geen tijdzoneshift, geen JSON-ronde die er een volledig
// ISO-tijdstip van maakt) — precies zoals Drizzle het aan de app teruggeeft.
types.setTypeParser(1082, (waarde) => waarde);

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
