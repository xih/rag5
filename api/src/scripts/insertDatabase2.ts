import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";
import { join } from "node:path";
import { open } from "sqlite";
import csv from "csv-parser";
import fs from "fs";

// 5/16/2024

async function setUpDatabase() {
  const db = await open({
    filename: join(
      fileURLToPath(import.meta.url),
      "../../data/sfPropertyTaxRolls.sqlite"
    ),
    driver: sqlite3.Database,
  });

  await db.exec(`
  CREATE TABLE IF NOT EXISTS AssessorHistoricalPropertyTaxRolls2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ClosedRollYear INTEGER,
    PropertyLocation TEXT,
    ParcelNumber TEXT,
    Block TEXT,
    Lot TEXT,
    VolumeNumber INTEGER,
    UseCode TEXT,
    UseDefinition TEXT,
    PropertyClassCode TEXT,
    PropertyClassCodeDefinition TEXT,
    YearPropertyBuilt INTEGER,
    NumberOfBathrooms INTEGER,
    NumberOfBedrooms INTEGER,
    NumberOfRooms INTEGER,
    NumberOfStories INTEGER,
    NumberOfUnits INTEGER,
    ZoningCode TEXT,
    ConstructionType TEXT,
    LotDepth REAL,
    LotFrontage REAL,
    PropertyArea INTEGER,
    BasementArea INTEGER,
    LotArea INTEGER,
    LotCode TEXT,
    TaxRateAreaCode INTEGER,
    PercentOfOwnership REAL,
    ExemptionCode TEXT,
    ExemptionCodeDefinition TEXT,
    StatusCode TEXT,
    MiscExemptionValue INTEGER,
    HomeownerExemptionValue INTEGER,
    CurrentSalesDate TEXT,
    AssessedFixturesValue INTEGER,
    AssessedImprovementValue INTEGER,
    AssessedLandValue INTEGER,
    AssessedPersonalPropertyValue INTEGER,
    AssessorNeighborhoodDistrict REAL,
    AssessorNeighborhoodCode TEXT,
    AssessorNeighborhood TEXT,
    SupervisorDistrict INTEGER,
    SupervisorDistrict2012 INTEGER,
    AnalysisNeighborhood TEXT,
    the_geom TEXT,
    RowID TEXT,
    data_as_of TEXT,
    data_loaded_at TEXT
);
  `);

  console.log("table created successfully");

  return db;
}

async function loadCSVData(db: sqlite3.Database) {
  const taxRollsFilePath = join(
    fileURLToPath(import.meta.url),
    "../../data/Assessor_Historical_Secured_Property_Tax_Rolls_20240514.csv"
  );

  let rowCount = 0;
  const maxRows = 10;

  const parser = fs.createReadStream(taxRollsFilePath).pipe(csv());

  const hardcodedInsert = `INSERT INTO AssessorHistoricalPropertyTaxRolls2 (
    ClosedRollYear, PropertyLocation, ParcelNumber, Block, Lot, VolumeNumber, UseCode, UseDefinition, 
    PropertyClassCode, PropertyClassCodeDefinition, YearPropertyBuilt, NumberOfBathrooms, NumberOfBedrooms, 
    NumberOfRooms, NumberOfStories, NumberOfUnits, ZoningCode, ConstructionType, LotDepth, LotFrontage, 
    PropertyArea, BasementArea, LotArea, LotCode, TaxRateAreaCode, PercentOfOwnership, ExemptionCode, 
    ExemptionCodeDefinition, StatusCode, MiscExemptionValue, HomeownerExemptionValue, CurrentSalesDate, 
    AssessedFixturesValue, AssessedImprovementValue, AssessedLandValue, AssessedPersonalPropertyValue, 
    AssessorNeighborhoodDistrict, AssessorNeighborhoodCode, AssessorNeighborhood, SupervisorDistrict, 
    SupervisorDistrict2012, AnalysisNeighborhood, the_geom, RowID, data_as_of, data_loaded_at
) VALUES (
    '2017', '0000 0000                       0000', '0001001', '0001', '001', '1', 'COMM', 'Commercial Misc', 'G', 'Garages (Commercial)', 
    '1900', '0', '0', '0', '0', '0', 'P', 'NA', '0', '0', '0', '0', '27965', 'NA', '1000', '1', 'NA', '', 'N', '0', '0', '', '0', '0', '0', '0', 
    '8.0', '8H', 'North Waterfront', '2', '2', 'Russian Hill', 'POINT (-122.4215566958585 37.80865755842123)', '20170001001', '2023/10/02 12:14:02 PM', '2023/10/04 09:38:21 AM'
);`;

  const insertWithNamedParameters = `INSERT INTO AssessorHistoricalPropertyTaxRolls2 (
  ClosedRollYear, PropertyLocation, ParcelNumber, Block, Lot, VolumeNumber, UseCode, UseDefinition, 
  PropertyClassCode, PropertyClassCodeDefinition, YearPropertyBuilt, NumberOfBathrooms, NumberOfBedrooms, 
  NumberOfRooms, NumberOfStories, NumberOfUnits, ZoningCode, ConstructionType, LotDepth, LotFrontage, 
  PropertyArea, BasementArea, LotArea, LotCode, TaxRateAreaCode, PercentOfOwnership, ExemptionCode, 
  ExemptionCodeDefinition, StatusCode, MiscExemptionValue, HomeownerExemptionValue, CurrentSalesDate, 
  AssessedFixturesValue, AssessedImprovementValue, AssessedLandValue, AssessedPersonalPropertyValue, 
  AssessorNeighborhoodDistrict, AssessorNeighborhoodCode, AssessorNeighborhood, SupervisorDistrict, 
  SupervisorDistrict2012, AnalysisNeighborhood, the_geom, RowID, data_as_of, data_loaded_at
) VALUES (
  :ClosedRollYear, :PropertyLocation, :ParcelNumber, :Block, :Lot, :VolumeNumber, :UseCode, :UseDefinition, 
  :PropertyClassCode, :PropertyClassCodeDefinition, :YearPropertyBuilt, :NumberOfBathrooms, :NumberOfBedrooms, 
  :NumberOfRooms, :NumberOfStories, :NumberOfUnits, :ZoningCode, :ConstructionType, :LotDepth, :LotFrontage, 
  :PropertyArea, :BasementArea, :LotArea, :LotCode, :TaxRateAreaCode, :PercentOfOwnership, :ExemptionCode, 
  :ExemptionCodeDefinition, :StatusCode, :MiscExemptionValue, :HomeownerExemptionValue, :CurrentSalesDate, 
  :AssessedFixturesValue, :AssessedImprovementValue, :AssessedLandValue, :AssessedPersonalPropertyValue, 
  :AssessorNeighborhoodDistrict, :AssessorNeighborhoodCode, :AssessorNeighborhood, :SupervisorDistrict, 
  :SupervisorDistrict2012, :AnalysisNeighborhood, :the_geom, :RowID, :data_as_of, :data_loaded_at
);`;

  const insertWithPositionalPlaceholders = `INSERT INTO AssessorHistoricalPropertyTaxRolls2 (
  ClosedRollYear, PropertyLocation, ParcelNumber, Block, Lot, VolumeNumber, UseCode, UseDefinition, 
  PropertyClassCode, PropertyClassCodeDefinition, YearPropertyBuilt, NumberOfBathrooms, NumberOfBedrooms, 
  NumberOfRooms, NumberOfStories, NumberOfUnits, ZoningCode, ConstructionType, LotDepth, LotFrontage, 
  PropertyArea, BasementArea, LotArea, LotCode, TaxRateAreaCode, PercentOfOwnership, ExemptionCode, 
  ExemptionCodeDefinition, StatusCode, MiscExemptionValue, HomeownerExemptionValue, CurrentSalesDate, 
  AssessedFixturesValue, AssessedImprovementValue, AssessedLandValue, AssessedPersonalPropertyValue, 
  AssessorNeighborhoodDistrict, AssessorNeighborhoodCode, AssessorNeighborhood, SupervisorDistrict, 
  SupervisorDistrict2012, AnalysisNeighborhood, the_geom, RowID, data_as_of, data_loaded_at, ID
) VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
);`;

  let totalRowsInserted = 0;
  const insertAll = true;

  for await (const row of parser) {
    if (insertAll || rowCount < maxRows) {
      // await db.run(hardcodedInsert);
      await db.run(insertWithPositionalPlaceholders, Object.values(row));
      rowCount++;
      totalRowsInserted++;

      if (totalRowsInserted % 100000 === 0) {
        console.log(`Inserted ${totalRowsInserted} records into the database.`);
      }
    } else {
      console.log(`Inserted first ${maxRows} rows into the database.`);
      break;
    }
  }

  if (insertAll) {
    console.log(
      `Inserted a total of ${totalRowsInserted} rows into the database.`
    );
  }
}

async function main() {
  const db = await setUpDatabase();
  // @ts-ignore unknown type error
  await loadCSVData(db);
}

main();
