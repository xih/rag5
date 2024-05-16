// [5-16-2024] make a new talbe in sfPropertyTaxRolls  that is all searchResultNames
// with a foreignkey that is linked to the propertyTaxRolls database by ID and block/lot number
//

import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";
import { join } from "node:path";
import { open } from "sqlite";

async function makeNewSearchResultsTable() {
  const db = await open({
    filename: join(
      fileURLToPath(import.meta.url),
      "../../data/sfPropertyTaxRolls.sqlite"
    ),
    driver: sqlite3.Database,
  });

  await db.exec(`
  CREATE TABLE SearchResults (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    PropertyTaxId INTEGER,
    Block INTEGER,
    Lot INTEGER, 
    AccessorCountyId VARCHAR(20),
    PrimaryDocNumber VARCHAR(20),
    DocumentDate DATE,
    FilingCode VARCHAR(50),
    Names VARCHAR(255),
    SecondaryDocNumber VARCHAR(20),
    BookType VARCHAR(50),
    BookNumber VARCHAR(20),
    NumberOfPages INT,
    FOREIGN KEY(PropertyTaxId) REFERENCES AssessorHistoricalPropertyTaxRolls2(id),
    FOREIGN KEY(Block, Lot) REFERENCES AssessorHistoricalPropertyTaxRolls2(Block, Lot)
);`);

  console.log("table created successfully");

  return db;
}

async function main() {
  const db = await makeNewSearchResultsTable();
}

main();
