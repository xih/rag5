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

/**
 * this will be used to keep track of all the names scrapped and we select between this table and the tax table to
 * track all block, lots already scraped
 * @returns
 */
async function makeNewPropertyNamesTable() {
  const db = await open({
    filename: join(
      fileURLToPath(import.meta.url),
      "../../data/sfPropertyTaxRolls.sqlite"
    ),
    driver: sqlite3.Database,
  });

  await db.exec(`
  CREATE TABLE IF NOT EXISTS PropertyNames (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    block TEXT,
    lot TEXT,
    name TEXT,
    documentId TEXT,
    FOREIGN KEY(documentId) REFERENCES SearchResults(PropertyTaxId) 
);`);
  // not finished

  console.log("table created successfully");

  return db;
}

async function makeNewNamesForPaginationTable() {
  const db = await open({
    filename: join(
      fileURLToPath(import.meta.url),
      "../../data/sfPropertyTaxRolls.sqlite"
    ),
    driver: sqlite3.Database,
  });

  await db.exec(`
  CREATE TABLE IF NOT EXISTS NamesForPagination (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    NameTypeDesc TEXT,
    FirstName TEXT,
    MiddleName TEXT,
    LastName TEXT,
    DocumentStatus TEXT,
    ReturnedDate TEXT,
    CorrectionDate TEXT,
    CrossRefDocNumber TEXT,
    DocInternalID TEXT,
    NDReturnedDate TEXT,
    Fullname TEXT,
    NameInternalID TEXT,
    TotalNamesCount INTEGER,
    Block TEXT,
    Lot TEXT,
    FOREIGN KEY(NameInternalID) REFERENCES SearchResults(PropertyTaxId) 
    FOREIGN KEY(Block, Lot) REFERENCES AssessorHistoricalPropertyTaxRolls2(Block, Lot)
);`);

  console.log("table created");
}

async function main() {
  // const db = await makeNewSearchResultsTable();
  // await makeNewNamesForPaginationTable();
  await makeNewPropertyNamesTable();
}

main();
