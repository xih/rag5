import sqlite3 from "sqlite3";
import { join } from "node:path";
import { open } from "sqlite";
import { fileURLToPath } from "node:url";
import csv from "csv-parser";
import fs from "fs";

// PRAGMA table_info(PropertyData) in sqlite3 REPL to find out the column info
// [5-14-2024]
// BUG: inserting 40 values into the database works but 41 gives an error:
// Error: SQLITE_ERROR: 42 values for 41 columns
// the column of suspicion is "Supervisor District 2012", but unsure of how it's erroring out - it's a normal text field
// workaround: delete that column from the database and remove it from the row. then try (ran out of time)is
// TODO: [add an id INTEGER PRIMARY KEY AUTOINCREMENT] to the sfpropertydata table

async function setupDatabase() {
  const db = await open({
    filename: join(
      fileURLToPath(import.meta.url),
      "../../data/sfPropertyTaxRolls.sqlite"
    ),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS SfPropertyData (
      ClosedRollYear TEXT,
      PropertyLocation TEXT,
      ParcelNumber TEXT,
      Block TEXT,
      Lot TEXT,
      VolumeNumber TEXT,
      UseCode TEXT,
      UseDefinition TEXT,
      PropertyClassCode TEXT,
      PropertyClassCodeDefinition TEXT,
      YearPropertyBuilt TEXT,
      NumberOfBathrooms TEXT,
      NumberOfBedrooms TEXT,
      NumberOfRooms TEXT,
      NumberOfStories TEXT,
      NumberOfUnits TEXT,
      ZoningCode TEXT,
      ConstructionType TEXT,
      LotDepth TEXT,
      LotFrontage TEXT,
      PropertyArea TEXT,
      BasementArea TEXT,
      LotArea TEXT,
      LotCode TEXT,
      TaxRateAreaCode TEXT,
      PercentOfOwnership TEXT,
      ExemptionCode TEXT,
      ExemptionCodeDefinition TEXT,
      StatusCode TEXT,
      MiscExemptionValue TEXT,
      HomeownerExemptionValue TEXT,
      CurrentSalesDate TEXT,
      AssessedFixturesValue TEXT,
      AssessedImprovementValue TEXT,
      AssessedLandValue TEXT,
      AssessedPersonalPropertyValue TEXT,
      AssessorNeighborhoodDistrict TEXT,
      AssessorNeighborhoodCode TEXT,
      AssessorNeighborhood TEXT,
      SupervisorDistrict TEXT,
      SupervisorDistrict2012 TEXT,
      AnalysisNeighborhood TEXT,
      the_geom TEXT,
      RowID TEXT,
      data_as_of TEXT,
      data_loaded_at TEXT
    )
  `);

  return db;
}

async function loadCsvData(db: sqlite3.Database) {
  let rowCount = 0; // Initialize a row counter
  const maxRows = 1000; // Set the maximum number of rows to insert

  const taxRollsFilePath = join(
    fileURLToPath(import.meta.url),
    "../../data/Assessor_Historical_Secured_Property_Tax_Rolls_20240514.csv"
  );

  console.log(taxRollsFilePath, "1. taxRollsFilePath");

  const parser = fs.createReadStream(taxRollsFilePath).pipe(csv());

  for await (const row of parser) {
    console.log("1. row", row);
    console.log("1. 41 objectvalues", Object.values(row).slice(0, 41));

    if (rowCount < maxRows) {
      // Check if the current count is less than maxRows

      const sql = `
INSERT INTO SfPropertyData (
  ClosedRollYear, PropertyLocation, ParcelNumber, Block, Lot, VolumeNumber, UseCode, UseDefinition, PropertyClassCode, PropertyClassCodeDefinition, YearPropertyBuilt, NumberOfBathrooms, NumberOfBedrooms, NumberOfRooms, NumberOfStories, NumberOfUnits, ZoningCode, ConstructionType, LotDepth, LotFrontage, PropertyArea, BasementArea, LotArea, LotCode, TaxRateAreaCode, PercentOfOwnership, ExemptionCode, ExemptionCodeDefinition, StatusCode, MiscExemptionValue, HomeownerExemptionValue, CurrentSalesDate, AssessedFixturesValue, AssessedImprovementValue, AssessedLandValue, AssessedPersonalPropertyValue, AssessorNeighborhoodDistrict, AssessorNeighborhoodCode, AssessorNeighborhood, SupervisorDistrict, SupervisorDistrict2012, AnalysisNeighborhood, the_geom, RowID, data_as_of, data_loaded_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

      const first10Sql = `INSERT INTO SfPropertyData (
      ClosedRollYear, PropertyLocation, ParcelNumber, Block, Lot, VolumeNumber, UseCode, UseDefinition, PropertyClassCode, PropertyClassCodeDefinition
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

      const first20Sql = `INSERT INTO SfPropertyData (
      ClosedRollYear, PropertyLocation, ParcelNumber, Block, Lot, VolumeNumber, UseCode, UseDefinition, PropertyClassCode, PropertyClassCodeDefinition, 
      YearPropertyBuilt, NumberOfBathrooms, NumberOfBedrooms, NumberOfRooms, NumberOfStories, NumberOfUnits, ZoningCode, ConstructionType, LotDepth, LotFrontage
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

      const first45Sql = `INSERT INTO SfPropertyData (
        ClosedRollYear, PropertyLocation, ParcelNumber, Block, Lot, VolumeNumber, UseCode, UseDefinition, PropertyClassCode, PropertyClassCodeDefinition, 
        YearPropertyBuilt, NumberOfBathrooms, NumberOfBedrooms, NumberOfRooms, NumberOfStories, NumberOfUnits, ZoningCode, ConstructionType, LotDepth, LotFrontage, 
        PropertyArea, BasementArea, LotArea, LotCode, TaxRateAreaCode, PercentOfOwnership, ExemptionCode, ExemptionCodeDefinition, StatusCode, MiscExemptionValue, 
        HomeownerExemptionValue, CurrentSalesDate, AssessedFixturesValue, AssessedImprovementValue, AssessedLandValue, AssessedPersonalPropertyValue, 
        AssessorNeighborhoodDistrict, AssessorNeighborhoodCode, AssessorNeighborhood, SupervisorDistrict, SupervisorDistrict2012, AnalysisNeighborhood, 
        the_geom, RowID, data_as_of
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

      const first40Sql = `INSERT INTO SfPropertyData (
        ClosedRollYear, PropertyLocation, ParcelNumber, Block, Lot, VolumeNumber, UseCode, UseDefinition, PropertyClassCode, PropertyClassCodeDefinition, 
        YearPropertyBuilt, NumberOfBathrooms, NumberOfBedrooms, NumberOfRooms, NumberOfStories, NumberOfUnits, ZoningCode, ConstructionType, LotDepth, LotFrontage, 
        PropertyArea, BasementArea, LotArea, LotCode, TaxRateAreaCode, PercentOfOwnership, ExemptionCode, ExemptionCodeDefinition, StatusCode, MiscExemptionValue, 
        HomeownerExemptionValue, CurrentSalesDate, AssessedFixturesValue, AssessedImprovementValue, AssessedLandValue, AssessedPersonalPropertyValue, 
        AssessorNeighborhoodDistrict, AssessorNeighborhoodCode, AssessorNeighborhood, SupervisorDistrict
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

      const first42Sql = `INSERT INTO SfPropertyData (
        ClosedRollYear, PropertyLocation, ParcelNumber, Block, Lot, VolumeNumber, UseCode, UseDefinition, PropertyClassCode, PropertyClassCodeDefinition, 
        YearPropertyBuilt, NumberOfBathrooms, NumberOfBedrooms, NumberOfRooms, NumberOfStories, NumberOfUnits, ZoningCode, ConstructionType, LotDepth, LotFrontage, 
        PropertyArea, BasementArea, LotArea, LotCode, TaxRateAreaCode, PercentOfOwnership, ExemptionCode, ExemptionCodeDefinition, StatusCode, MiscExemptionValue, 
        HomeownerExemptionValue, CurrentSalesDate, AssessedFixturesValue, AssessedImprovementValue, AssessedLandValue, AssessedPersonalPropertyValue, 
        AssessorNeighborhoodDistrict, AssessorNeighborhoodCode, AssessorNeighborhood, SupervisorDistrict, SupervisorDistrict2012, AnalysisNeighborhood
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

      const first41Sql = `INSERT INTO SfPropertyData (
        ClosedRollYear, PropertyLocation, ParcelNumber, Block, Lot, VolumeNumber, UseCode, UseDefinition, PropertyClassCode, PropertyClassCodeDefinition, 
        YearPropertyBuilt, NumberOfBathrooms, NumberOfBedrooms, NumberOfRooms, NumberOfStories, NumberOfUnits, ZoningCode, ConstructionType, LotDepth, LotFrontage, 
        PropertyArea, BasementArea, LotArea, LotCode, TaxRateAreaCode, PercentOfOwnership, ExemptionCode, ExemptionCodeDefinition, StatusCode, MiscExemptionValue, 
        HomeownerExemptionValue, CurrentSalesDate, AssessedFixturesValue, AssessedImprovementValue, AssessedLandValue, AssessedPersonalPropertyValue, 
        AssessorNeighborhoodDistrict, AssessorNeighborhoodCode, AssessorNeighborhood, SupervisorDistrict, SupervisorDistrict2012
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

      const first10Values = Object.values(row).slice(0, 10);
      const first20Values = Object.values(row).slice(0, 20);
      const first45Values = Object.values(row).slice(0, 45);
      const first40Values = Object.values(row).slice(0, 40);
      const first42Values = Object.values(row).slice(0, 42);
      const first41Values = Object.values(row).slice(0, 41);

      const completeSql = `INSERT INTO SfPropertyData (
        ClosedRollYear, PropertyLocation, ParcelNumber, Block, Lot, VolumeNumber, UseCode, UseDefinition, PropertyClassCode, PropertyClassCodeDefinition, YearPropertyBuilt, NumberOfBathrooms, NumberOfBedrooms, NumberOfRooms, NumberOfStories, NumberOfUnits, ZoningCode, ConstructionType, LotDepth, LotFrontage, PropertyArea, BasementArea, LotArea, LotCode, TaxRateAreaCode, PercentOfOwnership, ExemptionCode, ExemptionCodeDefinition, StatusCode, MiscExemptionValue, HomeownerExemptionValue, CurrentSalesDate, AssessedFixturesValue, AssessedImprovementValue, AssessedLandValue, AssessedPersonalPropertyValue, AssessorNeighborhoodDistrict, AssessorNeighborhoodCode, AssessorNeighborhood, SupervisorDistrict, AnalysisNeighborhood, the_geom, RowID, data_as_of, data_loaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const completeSqlminussup2012 = `INSERT INTO SfPropertyData (
        ClosedRollYear, PropertyLocation, ParcelNumber, Block, Lot, VolumeNumber, UseCode, UseDefinition, PropertyClassCode, PropertyClassCodeDefinition, YearPropertyBuilt, NumberOfBathrooms, NumberOfBedrooms, NumberOfRooms, NumberOfStories, NumberOfUnits, ZoningCode, ConstructionType, LotDepth, LotFrontage, PropertyArea, BasementArea, LotArea, LotCode, TaxRateAreaCode, PercentOfOwnership, ExemptionCode, ExemptionCodeDefinition, StatusCode, MiscExemptionValue, HomeownerExemptionValue, CurrentSalesDate, AssessedFixturesValue, AssessedImprovementValue, AssessedLandValue, AssessedPersonalPropertyValue, AssessorNeighborhoodDistrict, AssessorNeighborhoodCode, AssessorNeighborhood, SupervisorDistrict, AnalysisNeighborhood, the_geom, RowID, data_as_of, data_loaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const row2 = Object.assign({}, row);
      delete row2["Supervisor District 2012"];

      // console.log(`Inserting values: ${Object.values(row)}`);
      // console.log(`Inserting values: ${Object.values(row)}`);
      // console.log(`SQL Statement: ${sql}`);

      // await db.run(
      //   `
      //   INSERT INTO SfPropertyData (
      //     ClosedRollYear, PropertyLocation, ParcelNumber, Block, Lot, VolumeNumber, UseCode, UseDefinition, PropertyClassCode, PropertyClassCodeDefinition, YearPropertyBuilt, NumberOfBathrooms, NumberOfBedrooms, NumberOfRooms, NumberOfStories, NumberOfUnits, ZoningCode, ConstructionType, LotDepth, LotFrontage, PropertyArea, BasementArea, LotArea, LotCode, TaxRateAreaCode, PercentOfOwnership, ExemptionCode, ExemptionCodeDefinition, StatusCode, MiscExemptionValue, HomeownerExemptionValue, CurrentSalesDate, AssessedFixturesValue, AssessedImprovementValue, AssessedLandValue, AssessedPersonalPropertyValue, AssessorNeighborhoodDistrict, AssessorNeighborhoodCode, AssessorNeighborhood, SupervisorDistrict, SupervisorDistrict2012, AnalysisNeighborhood, the_geom, RowID, data_as_of, data_loaded_at
      //   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      // `,
      //   Object.values(row)
      // );

      // console.log(`Number of values: ${Object.values(first41Values).length}`);

      // debug statement
      // Object.values(row)
      //   .slice(1, 41)
      //   .forEach((value, index) => {
      //     console.log(`${index + 1}: ${value}`);
      //   });

      await db.run(first40Sql, first40Values);
      // await db.run(first41Sql, first41Values);
      rowCount++; // Increment the row counter
    } else {
      console.log(`Inserted first ${maxRows} rows into the database.`);
      break;
    }
  }

  // const stream = fs
  //   .createReadStream(
  //     "../data/Assessor_Historical_Secured_Property_Tax_Rolls_20231107.csv"
  //   )
  //   .pipe(csv())
  //   .on("data", async (row) => {
  //     if (rowCount < maxRows) {
  //       // Check if the current count is less than maxRows
  //       await db.run(
  //         `
  //         INSERT INTO PropertyData (
  //           ClosedRollYear, PropertyLocation, ParcelNumber, Block, Lot, VolumeNumber, UseCode, UseDefinition, PropertyClassCode, PropertyClassCodeDefinition, YearPropertyBuilt, NumberOfBathrooms, NumberOfBedrooms, NumberOfRooms, NumberOfStories, NumberOfUnits, ZoningCode, ConstructionType, LotDepth, LotFrontage, PropertyArea, BasementArea, LotArea, LotCode, TaxRateAreaCode, PercentOfOwnership, ExemptionCode, ExemptionCodeDefinition, StatusCode, MiscExemptionValue, HomeownerExemptionValue, CurrentSalesDate, AssessedFixturesValue, AssessedImprovementValue, AssessedLandValue, AssessedPersonalPropertyValue, AssessorNeighborhoodDistrict, AssessorNeighborhoodCode, AssessorNeighborhood, SupervisorDistrict, SupervisorDistrict2012, AnalysisNeighborhood, the_geom, RowID, data_as_of, data_loaded_at
  //         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  //       `,
  //         Object.values(row)
  //       );
  //       rowCount++; // Increment the row counter
  //     } else {
  //       stream.destroy(); // Stop reading the CSV file
  //       console.log("Inserted first 5 rows into the database.");
  //     }
  //   })
  //   .on("end", () => {
  //     console.log("CSV file processing completed.");
  //   });
}

async function main() {
  const db = await setupDatabase();
  // @ts-ignore unknown type error
  await loadCsvData(db);
}

main();
