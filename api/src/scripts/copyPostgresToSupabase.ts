// import { Client as PgClient } from 'pg';
import pg from "pg";
const { Client } = pg;

// [6-8-2024] transfer 100 rows over to supabase [done]
// get the lat long from the block lot number and then render on the frontend

// import { createClient as supabaseClient } from "@supabase/supabase-js";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";

const env = process.env.NODE_ENV || "development";
config({ path: `.env.${env}.local` });
config({ path: `.env.local` });
config();

// Function to connect to the local PostgreSQL database
async function connectLocalPostgres() {
  const localClient = new Client({
    user: "dennis",
    host: "localhost",
    database: "property_documents_db",
    password: process.env.LOCAL_POSTGRES_PASSWORD,
    port: 5432,
  });
  await localClient.connect();
  return localClient;
}

// Function to connect to the Supabase PostgreSQL database
async function connectSupabase() {
  const supabaseConfig = {
    user: "postgres.dimmbajebuxcomgzbzrj",
    host: "aws-0-us-west-1.pooler.supabase.com",
    database: "postgres",
    password: process.env.SUPABASE_PASSWORD,
    port: 5432, // or your Supabase PostgreSQL port
  };

  const supabaseUrl = "https://dimmbajebuxcomgzbzrj.supabase.co"; // Your Supabase Project URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Your Supabase Key

  const supabaseClient = createSupabaseClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

// Function to transfer data from local PostgreSQL to Supabase
async function transferData(localClient: pg.Client, supabaseClient) {
  try {
    // const batchSize = 10000;
    // let offset = 0;
    // let continueFetching = true;

    // while (continueFetching) {
    // Read data from local PostgreSQL in batches
    // const query = `SELECT * FROM PropertyDocuments2 LIMIT ${batchSize} OFFSET ${offset}`;
    const query = `SELECT * FROM PropertyDocuments2 LIMIT 100`;
    const res = await localClient.query(query);

    console.log(`Fetched ${res.rows.length} rows`);

    console.log(res.rows[0]);

    if (res.rows.length > 0) {
      const rows = res.rows;

      const db = await supabaseClient.from("propertydocuments2");

      console.log(db, "db");

      const { data, error } = await supabaseClient
        .from("propertydocuments2")
        .insert(
          rows.map((row) => ({
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
            createdat: row.createdat,
            updatedat: row.updatedat,
          }))
        );

      if (error) {
        console.error("Error inserting data into Supabase:", error);
        throw error;
      }

      // Prepare for the next batch
      // offset += batchSize;
    } else {
      // continueFetching = false; // Stop if there are no more rows to fetch
      console.log("whats going on?");
    }
    // }

    console.log("Data transfer complete.");
  } catch (err) {
    console.error("Error transferring data:", err);
    throw err;
  }
}

async function createSupabaseTable(supabaseClient) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS PropertyDocuments2 (
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

  try {
    const { data, error } = await supabaseClient.rpc("pg_catalog.pg_query", {
      query: createTableQuery,
    });

    if (error) {
      console.error("Error creating table in Supabase:", error);
      throw error;
    }
    console.log("Table PropertyDocuments2 created successfully in Supabase.");
  } catch (err) {
    console.error("Error executing table creation in Supabase:", err);
    throw err;
  }
}

// Main function to orchestrate the process
async function main() {
  try {
    const localClient = await connectLocalPostgres();
    const supabaseClient = await connectSupabase();

    // await createSupabaseTable(supabaseClient); // doesn't work but just ran it in the sqleditor
    // console.log("yesss??");

    // Transfer data
    await transferData(localClient, supabaseClient);

    // Close the database connections
    await localClient.end();
    // await supabaseClient.end();
  } catch (err) {
    console.error("Error in data transfer:", err);
  }
}

main();
