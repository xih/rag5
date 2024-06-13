import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { join } from "path";
import { fileURLToPath } from "url";

async function setupDatabase() {
  const db = await open({
    filename: join(
      fileURLToPath(import.meta.url),
      "../../../data/sfPropertyTaxRolls.sqlite"
    ),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS PropertyDocuments2 (
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
      latitude REAL,
      longitude REAL,
      CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const batchSize = 10000;
  let offset = 0;
  let continueFetching = true;

  while (continueFetching) {
    const rows = await db.all(`
      SELECT DISTINCT pd.*, ahp.the_geom
      FROM PropertyDocuments pd
      LEFT JOIN AssessorHistoricalPropertyTaxRolls2 ahp ON pd.Block = ahp.Block AND pd.Lot = ahp.Lot
      LIMIT ${batchSize} OFFSET ${offset}
    `);

    if (rows.length > 0) {
      const transformedRows = rows.map((row) => ({
        ...row,
        ...parseGeom(row.the_geom),
      }));

      await db.run(`BEGIN TRANSACTION`);
      console.log("begin transaction");
      for (const row of transformedRows) {
        await db.run(
          `
          INSERT INTO PropertyDocuments2 (
            PrimaryDocNumber, DocumentDate, FilingCode, Names, SecondaryDocNumber,
            BookType, BookNumber, NumberOfPages, Grantor, TotalNamesCount, 
            NameInternalID, DocumentId, Grantee, Block, Lot, APN, latitude, longitude,
            CreatedAt, UpdatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            row.PrimaryDocNumber,
            row.DocumentDate,
            row.FilingCode,
            row.Names,
            row.SecondaryDocNumber,
            row.BookType,
            row.BookNumber,
            row.NumberOfPages,
            row.Grantor,
            row.TotalNamesCount,
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
      await db.run(`COMMIT`);
      offset += rows.length; // Ensure offset is increased by the number of rows actually fetched
      console.log(`current offset: ${offset}. db commited`);
    } else {
      continueFetching = false;
    }
  }

  console.log("Database and table setup complete, and data transfer done.");
}

function parseGeom(geom: string | null): {
  latitude: number | null;
  longitude: number | null;
} {
  if (!geom) {
    console.log("No geometry data available.");
    return { latitude: null, longitude: null };
  }

  const match = geom.match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/);
  if (match && match.length >= 3) {
    return {
      longitude: parseFloat(match[1]),
      latitude: parseFloat(match[2]),
    };
  } else {
    console.log("Invalid geometry format:", geom);
    return { latitude: null, longitude: null };
  }
}

setupDatabase().catch(console.error);
