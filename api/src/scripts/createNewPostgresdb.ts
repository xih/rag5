import pg from "pg";
const { Client } = pg;

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
    await client.connect();

    // Create the table
    await client.query(createTableQuery);
    console.log("Table PropertyDocuments2 created successfully.");

    await client.end();
  } catch (error) {
    console.error("Error creating table:", error);
    await client.end();
    process.exit(1);
  }
};

const main = async () => {
  // await createDatabase();
  await createTable();
};

main().catch(console.error);
