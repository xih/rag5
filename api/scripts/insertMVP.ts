import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs";
import csv from "csv-parser";

const db = await open({
  filename: join(
    fileURLToPath(import.meta.url),
    "../../data/sfPropertyTaxRolls.sqlite"
  ),
  driver: sqlite3.Database,
});

/**
 * create the property Tax Rolls database
 */
async function setupDatabase() {
  console.log(
    join(
      fileURLToPath(import.meta.url),
      "../../data/sfPropertyTaxRolls.sqlite"
    ),
    "what is this?"
  );

  await db.exec(`
    CREATE TABLE IF NOT EXISTS PropertyData (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      ClosedRollYear TEXT,
      PropertyLocation TEXT,
      ParcelNumber TEXT,
      Block TEXT,
      Lot TEXT,
      UseCode TEXT,
      UseDefinition TEXT,
      PropertyClassCode TEXT,
      PropertyClassCodeDefinition TEXT,
      YearPropertyBuilt TEXT,
      NumberOfBathrooms TEXT,
      NumberOfBedrooms TEXT,
      NumberOfRooms TEXT,
      NumberOfStories TEXT,
      NumberOfUnits TEXT,
      ZoningCode TEXT,
      ConstructionType TEXT,
      LotDepth TEXT,
      LotFrontage TEXT,
      PropertyArea TEXT,
      BasementArea TEXT,
      LotArea TEXT,
      TaxRateAreaCode TEXT,
      PercentOfOwnership TEXT,
      ExemptionCode TEXT,
      ExemptionCodeDefinition TEXT,
      StatusCode TEXT,
      MiscExemptionValue TEXT,
      HomeownerExemptionValue TEXT,
      CurrentSalesDate TEXT,
      AssessedFixturesValue TEXT,
      AssessedImprovementValue TEXT,
      AssessedLandValue TEXT,
      AssessedPersonalPropertyValue TEXT
    )
  `);

  console.log("Database and table created.");
  await db.close();
}

async function setupDatabase2() {
  const dbFilePath = join(
    fileURLToPath(import.meta.url),
    "../../data/sfPropertyTaxRolls.sqlite"
  );

  console.log(dbFilePath, "1. what is this path");
  const db = await open({
    filename: dbFilePath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS TestData (
      Column1 TEXT,
      Column2 TEXT,
      Column3 TEXT
    )
  `);

  return db;
}

async function saveCsvToDatabase(db) {
  const csvFilePath = join(fileURLToPath(import.meta.url), "../test.csv");

  // const dbFilePath = join();

  const parser = fs.createReadStream(csvFilePath).pipe(csv());

  // console.log(parser, "parser");

  for await (const row of parser) {
    console.log(row.test, "what is this?");
    console.log(row.test1, "what is this?");
    console.log(row.test2, "what is this?");
    console.log(row, "what is this?");
    await db.run(
      `INSERT INTO TestData (Column1, Column2, Column3) VALUES (?, ?, ?)`,
      [row.test, row.test1, row.test2]
    );
  }

  console.log("Data inserted into database");

  // db.commit();
}

async function main() {
  const db = await setupDatabase2();
  await saveCsvToDatabase(db);
  await db.close();
}

main();
