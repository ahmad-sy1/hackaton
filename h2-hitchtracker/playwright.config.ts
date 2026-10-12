import { defineConfig, devices } from "@playwright/test";
import { testDatabaseUrl } from "./tests/integration/support/test-database-url";

// Playwright does not read .env itself; variables already set keep priority.
process.loadEnvFile(".env");

// Not 3000, so a running `npm run dev` can stay up during the tests.
const PORT = 3001;

export default defineConfig({
  testDir: "./tests/integration",
  // All tests share one test database, so they run one after the other.
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    // Next 16 allows one `next dev` per folder, so the tests use a production build.
    command: `npx tsx tests/integration/support/prepare-database.ts && npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    env: { DATABASE_URL: testDatabaseUrl() },
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
