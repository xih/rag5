import { parse } from "csv-parse";
import fs from "fs";
import path from "path";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import { join } from "node:path";
import { config } from "dotenv";

const env = process.env.NODE_ENV || "development";
config({ path: `.env.${env}.local` });
// config({ path: `.env.local` });

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

  const supabaseUrl = "https://dimmbajebuxcomgzbzrj.supabase.co"; // Your Supabase Project URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Your Supabase Key

  const supabaseClient = createSupabaseClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

// Path to your CSV file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, "../../data");

const csvFilePath = path.resolve(
  dataPath,
  "Parcels___Active_and_Retired_20240623.csv"
);

console.log(csvFilePath, "csvFilePath");

// Read and parse the CSV file
const csvData = fs.readFileSync(csvFilePath);
const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true,
});

function logSampleRecords(records: any[], sampleSize: number = 5) {
  const sampledRecords = [];
  const totalRecords = records.length;

  // Ensure we do not exceed the number of available records
  const effectiveSampleSize = Math.min(sampleSize, totalRecords);

  for (let i = 0; i < effectiveSampleSize; i++) {
    // Randomly pick an index without replacement
    const index = Math.floor(Math.random() * (totalRecords - i));
    // Swap the picked element to the end (shrink the pool)
    [records[index], records[totalRecords - 1 - i]] = [
      records[totalRecords - 1 - i],
      records[index],
    ];
    // Add the randomly picked record to the sample
    sampledRecords.push(records[index]);
  }

  console.log("Sampled Records for Inspection:", sampledRecords);
}

// Function to insert data into Supabase with batching and transaction
async function insertData(records: any[]) {
  const supabaseClient = await connectSupabase();

  const batchSize = 1;
  let batchCount = 0;

  // for (let i = 0; i < records.length; i += batchSize) {
  for (let i = 0; i < 1; i += batchSize) {
    console.log(records[i], "records[i]");
    const batch = records.slice(i, i + batchSize).map((record) => ({
      ...record,
      centroid: `SRID=4326;POINT(${record.centroid_longitude} ${record.centroid_latitude})`,
      date_rec_add: records[0].date_rec_add || null, // Convert empty string to null
      date_rec_drop: records[0].date_rec_drop || null,
      date_map_add: records[0].date_map_add || null,
      date_map_drop: records[0].date_map_drop || null,
      date_map_alt: records[0].date_map_alt || null,
    }));

    console.log(batch, "batch");

    // Start a transaction
    const { data, error } = await supabaseClient
      .from("parcels")
      .insert(batch)
      .single();

    if (error) {
      console.error("Error inserting data:", error);
      break; // Stop the loop if there is an error
    } else {
      batchCount++;
      console.log(`${batchCount * batchSize} records inserted successfully.`);
    }
  }
}

async function insertData1(records: any[]) {
  const supabaseClient = await connectSupabase();

  if (records.length === 0) {
    console.log("No records to insert.");
    return;
  }

  // Prepare the first record for insertion
  const record = {
    ...records[0],
    centroid: `SRID=4326;POINT(${records[0].centroid_longitude} ${records[0].centroid_latitude})`,
    date_rec_add: records[0].date_rec_add || null, // Convert empty string to null
    date_rec_drop: records[0].date_rec_drop || null,
    date_map_add: records[0].date_map_add || null,
    date_map_drop: records[0].date_map_drop || null,
    date_map_alt: records[0].date_map_alt || null,
  };

  // Insert the record
  const { data, error } = await supabaseClient
    .from("parcels")
    .insert(record)
    .single();

  if (error) {
    console.error("Error inserting data:", error);
  } else {
    console.log("Record inserted successfully.");
  }
}
async function insertData2(records: any[]) {
  const supabaseClient = await connectSupabase();

  const batchSize = 10000;
  let batchCount = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const record = records[i];

    // Check if the record already exists
    const { data: existingData, error: existingError } = await supabaseClient
      .from("parcels")
      .select("mapblklot")
      .eq("mapblklot", record.mapblklot)
      .single();

    if (existingError && existingError.message !== "Item not found") {
      console.error("Error checking existing data:", existingError);
      continue; // Skip to the next record if there's an error other than "not found"
    }

    if (existingData) {
      console.log(
        `Record with mapblklot ${record.mapblklot} already exists. Skipping.`
      );
      continue; // Skip this record as it already exists
    }

    // Prepare the record for insertion
    const preparedRecord = {
      ...record,
      centroid: `SRID=4326;POINT(${record.centroid_longitude} ${record.centroid_latitude})`,
      date_rec_add: record.date_rec_add || null,
      date_rec_drop: record.date_rec_drop || null,
      date_map_add: record.date_map_add || null,
      date_map_drop: record.date_map_drop || null,
      date_map_alt: record.date_map_alt || null,
    };

    logSampleRecords(preparedRecord);

    // Insert the record
    const { data, error } = await supabaseClient
      .from("parcels")
      .insert(preparedRecord)
      .single();

    if (error) {
      console.error("Error inserting data:", error);
      continue; // Optionally handle the error, e.g., by logging or retrying
    } else {
      batchCount++;
      console.log(`${batchCount * batchSize} records inserted successfully.`);
    }
  }
}

async function insertData3(records: any[]) {
  const supabaseClient = await connectSupabase();

  const batchSize = 10000;
  let batchCount = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize).map((record) => ({
      ...record,
      centroid: `SRID=4326;POINT(${record.centroid_longitude} ${record.centroid_latitude})`,
      date_rec_add: record.date_rec_add || null,
      date_rec_drop: record.date_rec_drop || null,
      date_map_add: record.date_map_add || null,
      date_map_drop: record.date_map_drop || null,
      date_map_alt: record.date_map_alt || null,
    }));

    // Log a sample of records from the current batch
    logSampleRecords(batch, 5); // Assuming you want to sample 5 records from each batch

    // Insert the batch
    const { data, error } = await supabaseClient
      .from("parcels")
      .insert(batch)
      .select("mapblklot"); // Assuming 'mapblklot' is the primary key or a unique identifier
    // .ignore(); // This will ignore the batch if there's a conflict
    // .onConflict("mapblklot") // This handles the conflict by skipping or updating

    if (error) {
      console.error("Error inserting batch:", error);
      continue; // Optionally handle the error, e.g., by logging or retrying
    } else {
      batchCount++;
      console.log(`${batchCount * batchSize} records inserted successfully.`);
    }
  }
}

/**
 * add database transactions to this
 * @param records
 */
async function insertData4(records: any[]) {
  const supabaseClient = await connectSupabase();

  const batchSize = 100;
  let batchCount = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    let batch = records.slice(i, i + batchSize).map((record) => ({
      ...record,
      centroid: `SRID=4326;POINT(${record.centroid_longitude} ${record.centroid_latitude})`,
      date_rec_add: record.date_rec_add || null,
      date_rec_drop: record.date_rec_drop || null,
      date_map_add: record.date_map_add || null,
      date_map_drop: record.date_map_drop || null,
      date_map_alt: record.date_map_alt || null,
      block_num: record.block_num || null,
      lot_num: record.lot_num || null,
      from_address_num: record.from_address_num || null,
      to_address_num: record.to_address_num || null,
      supervisor_district: record.supervisor_district || null,
      planning_district_number: record.planning_district_number || null,
    }));

    // Log a sample of records from the current batch
    // logSampleRecords(batch, 5); // Assuming you want to sample 5 records from each batch
    batch = batch.filter(
      (v, i, a) => a.findIndex((t) => t.mapblklot === v.mapblklot) === i
    );

    // Start a transaction
    const { data: transaction, error: transactionError } = await supabaseClient
      .from("parcels")
      .upsert(batch, { onConflict: "mapblklot" });

    if (transactionError) {
      console.error("Error starting transaction:", transactionError);
      continue; // Optionally handle the error, e.g., by logging or retrying
    }

    // Attempt to commit the transaction
    // const { error: commitError } = await supabaseClient.rpc(
    //   "commit_transaction"
    // );

    // if (commitError) {
    //   console.error("Error committing transaction:", commitError);
    //   continue; // Optionally handle the error, e.g., by logging or retrying
    // } else {
    batchCount++;
    console.log(`${batchCount * batchSize} records inserted successfully.`);
    // }
  }
}

async function processCSV(filePath: string) {
  const batchSize = 10000; // Number of rows per batch

  const records = [];
  const parser = fs.createReadStream(filePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
    })
  );

  for await (const record of parser) {
    records.push(record);
    if (records.length >= batchSize) {
      await insertData4(records); // Process the batch
      records.length = 0; // Clear the array
    }
  }

  if (records.length > 0) {
    await insertData(records); // Process any remaining records
  }

  console.log("CSV file has been processed successfully.");
}

processCSV(csvFilePath).catch((err) => {
  console.error("Error processing CSV file:", err);
});

// Execute the function
// insertData4(records).catch(console.error);
