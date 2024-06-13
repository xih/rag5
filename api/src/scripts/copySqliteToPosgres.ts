import { open } from "sqlite";
import sqlite3 from "sqlite3";
import pg from "pg";
import { join } from "path";
import { fileURLToPath } from "url";

const { Client } = pg;

// this transfers data from the PropertyDatabase

async function openSqliteDatabase() {
  try {
    const sqliteDb = await open({
      filename: join(
        fileURLToPath(import.meta.url),
        "../../../data/sfPropertyTaxRolls.sqlite"
      ),
      driver: sqlite3.Database,
    });
    return sqliteDb;
  } catch (err) {
    console.error("Error opening SQLite database:", err);
    throw err;
  }
}

async function connectPostgres() {
  const client = new Client({
    user: "dennis",
    host: "localhost",
    password: process.env.LOCAL_POSTGRES_PASSWORD,
    database: "property_documents_db",
    port: 5432,
  });
  await client.connect();
  return client;
}

async function transferData(sqliteDb: any, pgClient: any) {
  try {
    // Example: Read data from SQLite
    const rows = await sqliteDb.all("SELECT * FROM PropertyDocuments");

    console.log("rows", rows);

    for (const row of rows) {
      // Insert data into PostgreSQL
      const numberOfPages =
        row.NumberOfPages !== "" ? parseInt(row.NumberOfPages, 10) : null;
      const totalNamesCount =
        row.TotalNamesCount !== "" ? parseInt(row.TotalNamesCount, 10) : null;

      await pgClient.query(
        `INSERT INTO propertydocuments2 (
          PrimaryDocNumber, DocumentDate, FilingCode, Names, SecondaryDocNumber,
          BookType, BookNumber, NumberOfPages, Grantor, TotalNamesCount, 
          NameInternalID, DocumentId, Grantee, Block, Lot, APN, CreatedAt, UpdatedAt
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        )`,
        [
          row.PrimaryDocNumber,
          row.DocumentDate,
          row.FilingCode,
          row.Names,
          row.SecondaryDocNumber,
          row.BookType,
          row.BookNumber,
          numberOfPages,
          row.Grantor,
          totalNamesCount,
          row.NameInternalID,
          row.DocumentId,
          row.Grantee,
          row.Block,
          row.Lot,
          row.APN,
          row.CreatedAt,
          row.UpdatedAt,
        ]
      );
    }

    console.log("Data transfer complete.");
  } catch (err) {
    console.error("Error transferring data:", err);
    throw err;
  }
}

async function main() {
  try {
    const sqliteDb = await openSqliteDatabase();
    const pgClient = await connectPostgres();

    await transferData(sqliteDb, pgClient);

    // Close the database connections
    await sqliteDb.close();
    await pgClient.end();
  } catch (err) {
    console.error("Error in data transfer:", err);
  }
}

main();
