import { fileURLToPath } from "node:url";
import sqlite3, { Database as sqliteDatabase } from "sqlite3";
import { join } from "node:path";
import { open } from "sqlite";
// import { Client } from "pg";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

const env = process.env.NODE_ENV || "development";
config({ path: `.env.${env}.local` });
config({ path: `.env.local` });
config();

console.log(env, "env");

// config({ path: "../.env.development.local" });
// config();

// console.log(process.env, "process.env");
console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Supabase Anon Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// console.log();

// console.log(Client, "client");

// import { Database, open } from 'sqlite';
// import sqlite3 from 'sqlite3';

// Function to copy SQLite database to Supabase
async function exportSqliteToSupabase() {
  // Open SQLite database
  const sqliteDb = await open({
    filename: join(
      fileURLToPath(import.meta.url),
      "../../../data/sfPropertyTaxRolls.sqlite"
    ),
    driver: sqlite3.Database,
  });

  // console.log(process.env, "process.env");

  console.log(process.env.NEXT_PUBLIC_SUPABASE_URL, "process.env.SUPABASE_URL");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!apiKey || !supabaseUrl) {
    throw new Error("missing supabase credentials");
  }

  const supabase = createClient(supabaseUrl, apiKey);

  // console.log(supabase, "supabase");

  const createTableQuery2 = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `;

  const { data, error } = await supabase.rpc("execute_sql", {
    query: createTableQuery2,
  });

  if (error) {
    console.error("Error creating table:", error);
    return;
  }

  console.log("Table created successfully:", data);

  // Connect to Supabase (PostgreSQL)
  // const supabaseClient = new createClient({
  //   user: supabaseConfig.user,
  //   host: supabaseConfig.host,
  //   database: supabaseConfig.database,
  //   password: supabaseConfig.password,
  //   port: supabaseConfig.port,
  // });
  // await supabase.connect();

  // Table creation query
  const createTableQuery = `
        CREATE TABLE IF NOT EXISTS PropertyDocuments (
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
            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

  // Execute table creation query
  await supabase.query(createTableQuery);

  // Fetch all data from SQLite table
  const rows = await sqliteDb.all(`SELECT * FROM PropertyDocuments LIMIT 1`);

  console.log(rows, "rows");

  // Prepare insert query
  const insertQuery = `
        INSERT INTO PropertyDocuments (
            PrimaryDocNumber, DocumentDate, FilingCode, Names, SecondaryDocNumber,
            BookType, BookNumber, NumberOfPages, Grantor, TotalNamesCount,
            NameInternalID, DocumentId, Grantee, Block, Lot, APN, CreatedAt, UpdatedAt
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        );
    `;

  // Insert data into Supabase table
  // for (const row of rows) {
  //   const values = [
  //     row.PrimaryDocNumber,
  //     row.DocumentDate,
  //     row.FilingCode,
  //     row.Names,
  //     row.SecondaryDocNumber,
  //     row.BookType,
  //     row.BookNumber,
  //     row.NumberOfPages,
  //     row.Grantor,
  //     row.TotalNamesCount,
  //     row.NameInternalID,
  //     row.DocumentId,
  //     row.Grantee,
  //     row.Block,
  //     row.Lot,
  //     row.APN,
  //     row.CreatedAt,
  //     row.UpdatedAt,
  //   ];
  //   await supabaseClient.query(insertQuery, values);
  // }

  // Close connections
  await sqliteDb.close();
  await supabase.end();
}

// Define SQLite path and Supabase configuration
// const sqlitePath = "path/to/your/sqlite.db";
const supabaseConfig = {
  user: "your_supabase_user",
  host: "your_supabase_host",
  database: "your_supabase_dbname",
  password: "your_supabase_password",
  port: 5432, // or your Supabase PostgreSQL port
};

// Run the export function

async function main() {
  // console.log(db, "db");
  exportSqliteToSupabase()
    .then(() => console.log("Data transfer complete."))
    .catch((err) => console.error("Error transferring data:", err));
}

main();
