// [5-23-2024] - connect to the database
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

  await db.exec(`CREATE TABLE PropertyDocuments (
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

async function main() {
  await createPropertyTable();
}

main();
