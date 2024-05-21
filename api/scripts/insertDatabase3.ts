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
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

async function makeNamesAndSearchResultsTable() {
  const db = await open({
    filename: join(
      fileURLToPath(import.meta.url),
      "../../data/sfPropertyTaxRolls.sqlite"
    ),
    driver: sqlite3.Database,
  });

  // change this table up to inclue
  // PRIMARY KEY ID
  // date created at

  await db.exec(`CREATE TABLE IF NOT EXISTS NamesAndSearchResults2 (
    UID INTEGER PRIMARY KEY AUTOINCREMENT,
    GetNamesForPaginationQueryId VARCHAR(255),
    ID VARCHAR(255),
    PrimaryDocNumber VARCHAR(255),
    DocumentDate DATE,
    FilingCode VARCHAR(255),
    Names TEXT,
    SecondaryDocNumber VARCHAR(255),
    BookType VARCHAR(255),
    BookNumber VARCHAR(255),
    NumberOfPages INT,
    NameTypeDesc VARCHAR(255),
    FirstName VARCHAR(255),
    MiddleName VARCHAR(255),
    LastName VARCHAR(255),
    DocumentStatus VARCHAR(255),
    ReturnedDate DATE,
    CorrectionDate DATE,
    CrossRefDocNumber VARCHAR(255),
    DocInternalID VARCHAR(255),
    NDReturnedDate DATE,
    Fullname VARCHAR(255),
    NameInternalID VARCHAR(255),
    TotalNamesCount INT,
    Block VARCHAR(255),
    Lot VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'System',
    updated_by TEXT DEFAULT 'System',
    is_active BOOLEAN DEFAULT 1,
    version INTEGER DEFAULT 1,
    deleted_at TIMESTAMP DEFAULT NULL,
    deleted_by TEXT DEFAULT NULL,
    notes TEXT DEFAULT '',
    source_system TEXT DEFAULT 'Unknown'
);`);

  // ADD COLUMN UID INTEGER PRIMARY KEY AUTOINCREMENT;
  //   ADD COLUMN UID INTEGER;

  //   await db.exec(`
  //   ALTER TABLE NamesAndSearchResults
  //   ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  // `);

  // await db.exec(`UPDATE NamesAndSearchResults SET UID = rowid;`);

  //  ALTER TABLE NamesAndSearchResults
  // ADD COLUMN new_timestamp TIMESTAMP;

  //   UPDATE NamesAndSearchResults
  // SET new_timestamp = CURRENT_TIMESTAMP;

  // await db.exec(`
  // ALTER TABLE NamesAndSearchResults
  // ALTER COLUMN new_timestamp SET DEFAULT CURRENT_TIMESTAMP;
  // `);

  // await db.exec(
  //   `CREATE UNIQUE INDEX idx_new_id ON NamesAndSearchResults(UID);`
  // );

  console.log("table created");
}

async function main() {
  // const db = await makeNewSearchResultsTable();
  // await makeNewNamesForPaginationTable();
  // await makeNewPropertyNamesTable();
  await makeNamesAndSearchResultsTable();
}

main();
