// [5-23-2024] - connect to the database
// [5-24-2024] - make a join table that connects propertyDocuments with ownernames
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";
import { join } from "node:path";
import { open } from "sqlite";

async function createPropertyTable() {
  const db = await open({
    filename: join(
      fileURLToPath(import.meta.url),
      "../../data/sfPropertyTaxRolls.sqlite"
    ),
    driver: sqlite3.Database,
  });

  await db.exec(`CREATE TABLE IF NOT EXISTS PropertyDocuments (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    PrimaryDocNumber TEXT,
    DocumentDate TEXT,
    FilingCode TEXT,
    Names TEXT,
    SecondaryDocNumber TEXT,
    BookType TEXT,
    BookNumber TEXT,
    NumberOfPages INTEGER,
    Grantor TEXT,
    TotalNamesCount INTEGER,
    NameInternalID TEXT,
    DocumentId TEXT,
    Grantee TEXT,
    Block TEXT,
    Lot TEXT,
    APN TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);
  console.log("table created successfully");

  return db;
}

async function createPropertyOwnersTable() {
  const db = await open({
    filename: join(
      fileURLToPath(import.meta.url),
      "../../data/sfPropertyTaxRolls.sqlite"
    ),
    driver: sqlite3.Database,
  });

  await db.exec(`CREATE TABLE IF NOT EXISTS PropertyOwners (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    NAME TEXT
    )
  `);
  console.log("PropertyOwners table created");

  // also create a join table called document_owners that combines the propertyDocument talbe with documentOwners table
  //  -- role is either "grantor" or "grantee"
  await db.exec(`CREATE TABLE IF NOT EXISTS document_owners (
    document_id INTEGER,
    owner_id INTEGER,
    role TEXT,
    FOREIGN KEY(document_id) REFERENCES propertyDocuments(id),
    FOREIGN KEY(owner_id) REFERENCES propertyOwners(id),
    PRIMARY KEY (document_id, owner_id, role)
    )
  `);
  console.log("document_owners join table created");
}

async function main() {
  // await createPropertyTable();
  await createPropertyOwnersTable();
}

main();
