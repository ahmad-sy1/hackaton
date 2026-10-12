/**
 * The test database is emptied before every test, so it must never be the
 * development database.
 */
export function testDatabaseUrl(): string {
  const url = process.env.DATABASE_URL_TEST;
  if (!url) {
    throw new Error("DATABASE_URL_TEST ontbreekt. Zet hem in .env");
  }
  if (url === process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL_TEST moet naar een andere database wijzen dan DATABASE_URL",
    );
  }
  return url;
}
