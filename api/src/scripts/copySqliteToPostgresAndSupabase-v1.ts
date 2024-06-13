import pg from "pg";
const { Client } = pg;
import { join } from "path";
import { fileURLToPath } from "url";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const env = process.env.NODE_ENV || "development";
config({ path: `.env.${env}.local` });
config({ path: `.env.local` });

const createDatabase = async () => {
  const client = new Client({
    user: "dennis",
    host: "localhost",
    password: process.env.LOCAL_POSTGRES_PASSWORD,
    port: 5432,
  });

  try {
    await client.connect();

    // Create the new database
    await client.query("CREATE DATABASE property_documents_db");
    console.log("Database property_documents_db created successfully.");

    await client.end();
  } catch (error) {
    console.error("Error creating database:", error);
    await client.end();
    process.exit(1);
  }
};

const createTable = async () => {
  const client = new Client({
    user: "dennis",
    host: "localhost",
    password: process.env.LOCAL_POSTGRES_PASSWORD,
    database: "property_documents_db",
    port: 5432,
  });

  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS PostgresPropertyDocuments3 (
    ID SERIAL PRIMARY KEY,
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
    latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
  `;

  try {
    await client.connect();

    // Create the table
    await client.query(createTableQuery);
    console.log("Table PropertyDocuments3 created successfully.");

    await client.end();
  } catch (error) {
    console.error("Error creating table:", error);
    await client.end();
    process.exit(1);
  }
};

// copy 1 row from sqlite to postgres
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

/**
 * Transfers the data from sqlite3 to posttgres
 * @param sqliteDb
 * @param pgClient
 */
async function transferDataPropertyDocuments3ToPostgres(
  sqliteDb: any,
  pgClient: any
) {
  try {
    // Example: Read data from SQLite
    const rows = await sqliteDb.all("SELECT * FROM PropertyDocuments2");
    const batchSize = 10000;
    let batchCount = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);

      // Start transaction
      await pgClient.query("BEGIN");

      for (const row of batch) {
        const numberOfPages =
          row.NumberOfPages !== "" ? parseInt(row.NumberOfPages, 10) : null;
        const totalNamesCount =
          row.TotalNamesCount !== "" ? parseInt(row.TotalNamesCount, 10) : null;

        await pgClient.query(
          `INSERT INTO postgrespropertydocuments3 (
            PrimaryDocNumber, DocumentDate, FilingCode, Names, SecondaryDocNumber,
            BookType, BookNumber, NumberOfPages, Grantor, TotalNamesCount, 
            NameInternalID, DocumentId, Grantee, Block, Lot, APN, latitude, longitude, CreatedAt, UpdatedAt
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
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
            row.latitude,
            row.longitude,
            row.CreatedAt,
            row.UpdatedAt,
          ]
        );
      }

      // Commit transaction
      await pgClient.query("COMMIT");

      batchCount++;
      console.log(`Batch ${batchCount} processed.`);
    }

    console.log("Data transfer complete.");
  } catch (err) {
    console.error("Error transferring data:", err);
    await pgClient.query("ROLLBACK"); // Rollback in case of an error
    throw err;
  }
}

async function copySqliteToPostgres() {
  try {
    const sqliteDb = await openSqliteDatabase();
    const pgClient = await connectPostgres();

    await transferDataPropertyDocuments3ToPostgres(sqliteDb, pgClient);

    // Close the database connections
    await sqliteDb.close();
    await pgClient.end();
  } catch (err) {
    console.error("Error in data transfer:", err);
  }
}

/**
 * Supabase config
 * @returns
 */
// Function to connect to the Supabase PostgreSQL database
async function connectSupabase() {
  const supabaseConfig = {
    user: "postgres.dimmbajebuxcomgzbzrj",
    host: "aws-0-us-west-1.pooler.supabase.com",
    database: "postgres",
    password: process.env.SUPABASE_PASSWORD,
    port: 5432, // or your Supabase PostgreSQL port
  };

  console.log(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );

  const supabaseUrl = "https://dimmbajebuxcomgzbzrj.supabase.co"; // Your Supabase Project URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Your Supabase Key

  const supabaseClient = createSupabaseClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

// Function to transfer data from local PostgreSQL to Supabase
async function transferData(
  localClient: pg.Client,
  supabaseClient: SupabaseClient<any, "public", any>
) {
  try {
    const batchSize = 10000;
    let offset = 0;
    let totalRowsProcessed = 0;

    while (true) {
      // Loop until break
      const query = `SELECT * FROM postgrespropertydocuments3 LIMIT ${batchSize} OFFSET ${offset}`;
      const res = await localClient.query(query);

      if (res.rows.length === 0) {
        console.log("No more rows to fetch.");
        break; // Exit the loop if no rows are fetched
      }

      console.log(`Fetched ${res.rows.length} rows from offset ${offset}.`);

      const { data, error } = await supabaseClient
        .from("postgrespropertydocuments4")
        .insert(
          res.rows.map((row) => ({
            primarydocnumber: row.primarydocnumber,
            documentdate: row.documentdate,
            filingcode: row.filingcode,
            names: row.names,
            secondarydocnumber: row.secondarydocnumber,
            booktype: row.booktype,
            booknumber: row.booknumber,
            numberofpages: row.numberofpages,
            grantor: row.grantor,
            totalnamescount: row.totalnamescount,
            nameinternalid: row.nameinternalid,
            documentid: row.documentid,
            grantee: row.grantee,
            block: row.block,
            lot: row.lot,
            apn: row.apn,
            latitude: row.latitude,
            longitude: row.longitude,
            createdat: row.createdat,
            updatedat: row.updatedat,
          }))
        );

      if (error) {
        console.error("Error inserting data into Supabase:", error);
        throw error;
      }

      totalRowsProcessed += res.rows.length;
      console.log(`${totalRowsProcessed} rows have been processed so far.`);

      offset += batchSize; // Prepare for the next batch
    }

    console.log("Data transfer complete.");
  } catch (err) {
    console.error("Error transferring data:", err);
    throw err;
  }
}

/**
 * copy data from postgres to supabase
 */
async function copyPostgresToSupabase() {
  try {
    const localClient = await connectPostgres();
    const supabaseClient = await connectSupabase();

    // await createSupabaseTable(supabaseClient); // doesn't work but just ran it in the sqleditor

    // Transfer data
    await transferData(localClient, supabaseClient);

    // Close the database connections
    await localClient.end();
    // await supabaseClient.end();
  } catch (err) {
    console.error("Error in data transfer:", err);
  }
}

const main = async () => {
  // await createDatabase(); // used for creating the postgres database
  // await createTable(); // used for creating a table in the database
  // await copySqliteToPostgres(); // used for copying data from sqlite to postgres

  // await createTestTableForSupabase(); // used for testing a supabase creating
  // creating a table in supabase doesn't work like this
  // use supabase CLI to create a table
  await copyPostgresToSupabase();
};

main().catch(console.error);
