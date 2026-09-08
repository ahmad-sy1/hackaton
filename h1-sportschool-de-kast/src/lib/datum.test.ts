import assert from "node:assert/strict";
import { test } from "node:test";
import { laatsteMaandag } from "./datum";

test("woensdag levert de maandag van dezelfde week om middernacht", () => {
  const maandag = laatsteMaandag(new Date(2026, 8, 9, 14, 30, 15, 500));
  assert.equal(maandag.getFullYear(), 2026);
  assert.equal(maandag.getMonth(), 8);
  assert.equal(maandag.getDate(), 7);
  assert.equal(maandag.getHours(), 0);
  assert.equal(maandag.getMinutes(), 0);
  assert.equal(maandag.getSeconds(), 0);
  assert.equal(maandag.getMilliseconds(), 0);
});

test("zondag telt terug naar de maandag ervoor, niet vooruit", () => {
  const maandag = laatsteMaandag(new Date(2026, 8, 13, 23, 59));
  assert.equal(maandag.getMonth(), 8);
  assert.equal(maandag.getDate(), 7);
});

test("maandag blijft dezelfde dag", () => {
  assert.equal(laatsteMaandag(new Date(2026, 8, 7, 9, 0)).getDate(), 7);
});

test("nogmaals toepassen verandert de uitkomst niet", () => {
  const eerste = laatsteMaandag(new Date(2026, 8, 10, 12));
  const tweede = laatsteMaandag(eerste);
  assert.equal(eerste.getTime(), tweede.getTime());
});

test("de meegegeven datum wordt niet gemuteerd", () => {
  const invoer = new Date(2026, 8, 10, 12);
  const voor = invoer.getTime();
  laatsteMaandag(invoer);
  assert.equal(invoer.getTime(), voor);
});
