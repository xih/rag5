// write a script that scrapes SF housing data
// use normal requests that can get the key needed
// 1. get the block and lot number
// 2. go through all block and lots to find the grantor and grantee
// 3. site: https://recorder.sfgov.org/#!/simple
// 4. site: https://sfplanninggis.org/pim/?pub=true to find the block/lot numbers
// 5. site: https://data.sfgov.org/Housing-and-Buildings/Assessor-Historical-Secured-Property-Tax-Rolls/wv5m-vpq2/data_preview
// 6. get the secureKey
// 7. get oneBlockAndLot
// 8. [TODO]: get back names for results
// 9. [TODO]: getNames
// 10. [TODO]: store the assessor-historical-secured-property-tax-rolls into a database and load the missing ones
// 11. [TODO]: write to sqlite database, then write to supabase database
// 5-14-2024
// 12. https://gist.github.com/blakeembrey/a848f0ab00018ea6b8be1679b73da927 [blake's gist]
// 13. load assesor_historical_secured_into sqlite [done] 3,000,000 rows
// 5-16-2024
// 14. create a table for scraped output
// 15. write the json to a file, then ask chatGPT the best way to store this in SQL
// 16. for MVP just store "SearchResults" array into the database first
// 17. create a new table called propertyNames that has all the results
// 18. first create a new table called NamesForPagination that is a 1:1 to the API query
// 19. make a table for output names and then use that to measure the difference between the two
// 20. create a function called load missing names that checks betrween the two tables
// AssessorHistoricalPropertyTaxRolls2 and PropertyNames and gives back the new block and lot numbers by batch of 5

import z from "zod";
import { blockLotSearchResultsSchema } from "../schemas/blockLotSchema";
import _ from "underscore";
// import writeJSONtoFile from "fs/promises";
import { writeFile } from "fs/promises";
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";
import { join } from "node:path";
import { open } from "sqlite";
import { NamesForPaginationSchema } from "../schemas/namesForPaginationSchema";

const userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36`;
const cookie = `googtrans=/en/en; BIGipServerASR-102_recorder.sfgov.org_PRD_EXT_pool=2160622032.20480.0000; HideDetails=0`;

interface encryptedKeyAndPassword {
  encryptedKey: string;
  password: string;
}

const encryptedKeySchema = z.object({
  Password: z.string(),
  EncryptedKey: z.string(),
});

/**
 *
 * @returns encryptedKey and password
 */
async function getSecureKey() {
  // curl 'https://recorder.sfgov.org/SearchService/api/SearchConfiguration/GetSecureKey' \
  // -H 'Accept: application/json, text/plain, */*' \
  // -H 'Accept-Language: en-US,en;q=0.9' \
  // -H 'Authorization: Bearer' \
  // -H 'Connection: keep-alive' \
  // -H 'Cookie: googtrans=/en/en; BIGipServerASR-102_recorder.sfgov.org_PRD_EXT_pool=2160622032.20480.0000; HideDetails=0' \
  // -H 'EncryptedKey: Fg+dsulekH5mTaRd3g1E5GbPazmaSsQwk8l4jmBaMYnfgk6yheV57QhfpVBlfhr4KYiiPVUNqd3sfeBa5zSdlaRJkeDOUWRCMIM1KH1oBhfkT+/+oYG0HfgHt/Yb/ltK28Eyxc5b0aiw9J+tfWHgYxR30KymL7qaXN7Egpf+BFk=' \
  // -H 'Password: ODc2Njk1MjI=' \
  // -H 'Referer: https://recorder.sfgov.org/' \
  // -H 'Sec-Fetch-Dest: empty' \
  // -H 'Sec-Fetch-Mode: cors' \
  // -H 'Sec-Fetch-Site: same-origin' \
  // -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' \
  // -H 'sec-ch-ua: "Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"' \
  // -H 'sec-ch-ua-mobile: ?0' \
  // -H 'sec-ch-ua-platform: "macOS"'
  const res = await fetch(
    `https://recorder.sfgov.org/SearchService/api/SearchConfiguration/GetSecureKey`,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        Authorization: "Bearer",
        "User-Agent": userAgent,
        Referer: "https://recorder.sfgov.org/",
        Cookie: cookie,
      },
    }
  );

  const data = await res.json();

  const { EncryptedKey: encryptedKey, Password: password } =
    encryptedKeySchema.parse(data);

  return {
    encryptedKey,
    password,
  };
}

async function getOneBlockLot(
  { block, lot }: { block: string; lot: string },
  key: encryptedKeyAndPassword
) {
  // fetch(
  //   "https://recorder.sfgov.org/SearchService/api/Search/GetSearchResults?APN=&Acres=&AddressLineOne=&AddressLineTwo=&AreaCode=&Block=0001&BookNo=&BookType=&Building=&BuildingHigh=&BuildingLow=&ChildDocumentGlobalID=&City=&CityArea=&CityPhase=&CityVillageCode=&Code=&CornerLetter=&CornerNumber=&CountryCode=&County=&CountyCode=&Division=&DocNumberFrom=&DocNumberTo=&DocumentClass=OfficialRecords&EventDateFrom=&EventDateTo=&FilingCode=&FilingCodeGroupID=&FilingCodeRefiners=&FirstName=&FirstQtrSect=&FrameNumberFrom=&FrameNumberThrough=&GarageHigh=&GarageLow=&GovernmentUnit=&HighLot=&Info=&IsBasicSearch=false&IsExactMatch=&LastName=&LegalDescription=&LotTract=&LotType=&LowLot=001&MaxRecordedDate=05%2F13%2F2024&MiddleName=&MinRecordedDate=12%2F28%2F1989&Name=&NameRefiners=&NameTypeID=0&NotInSidwellFl=&NumAcres=&OneHalfCode=&PageNo=&PageNumberFrom=&PageNumberThrough=&ParentDocumentGlobalID=&PartOneCode=&PartTwoCode=&Pin=&PlatName=&PrimaryFirstName=&PrimaryLastName=&PrimaryMiddleName=&ProfileID=Public&PropertyID=&PropertyPhase=&PropertyUnit=&Range=&RangeDirection=&RefinementTokens=&RollNumber=&RollType=&Rows=10&SearchText=&SecDocNumberFrom=&SecDocNumberTo=&SecondQtrSect=&SecondaryFirstName=&SecondaryLastName=&SecondaryMiddleName=&Section=&SectionHalf=&SectionLot=&SectionQuarters=&SheetNumberFrom=&SheetNumberThrough=&SortFields=&SortOrders=&SplitUnit=&StartRow=0&State=&Suffix=&TertiaryFirstName=&TertiaryLastName=&TertiaryMiddleName=&ThirdQtrSect=&TownCode=&TownDirection=&TownhomeID=&Township=&UnderPin=&YearRefiners=&ZipCode=&ZipCodeFour=",
  //   {
  //     headers: {
  //       accept: "application/json, text/plain, */*",
  //       "accept-language": "en-US,en;q=0.9",
  //       authorization: "Bearer",
  //       encryptedkey:
  //         "VBdnaiUBTpGZapAKGiLz1sd2oG9TOPw8fxRIWcJgWJnDh3cXXY89HbxtHf/xvDSky7AL/3rbuPHFpO15rLSZyC/bYFvOE922a7uponbag00pphILCTMBE2Ga+D6UC9+jjQwXmbHZTfpnDEn6Db1pZktlKMCDlDqw3Sn/wpSM4JI=",
  //       password: "MTIwMDMxMDA4OA==",
  //       "sec-ch-ua":
  //         '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  //       "sec-ch-ua-mobile": "?0",
  //       "sec-ch-ua-platform": '"macOS"',
  //       "sec-fetch-dest": "empty",
  //       "sec-fetch-mode": "cors",
  //       "sec-fetch-site": "same-origin",
  //       cookie:
  //         "googtrans=/en/en; BIGipServerASR-102_recorder.sfgov.org_PRD_EXT_pool=2160622032.20480.0000; HideDetails=0",
  //       Referer: "https://recorder.sfgov.org/",
  //       "Referrer-Policy": "strict-origin-when-cross-origin",
  //     },
  //     body: null,
  //     method: "GET",
  //   }
  // );
  const res = await fetch(
    `https://recorder.sfgov.org/SearchService/api/Search/GetSearchResults?APN=&Acres=&AddressLineOne=&AddressLineTwo=&AreaCode=&\
      Block=${block}&BookNo=&BookType=&Building=&BuildingHigh=&BuildingLow=&ChildDocumentGlobalID=&City=&CityArea=&CityPhase=&CityVillageCode=&Code=&CornerLetter=&CornerNumber=&CountryCode=&County=&CountyCode=&Division=&DocNumberFrom=&DocNumberTo=&DocumentClass=OfficialRecords&EventDateFrom=&EventDateTo=&FilingCode=&FilingCodeGroupID=&FilingCodeRefiners=&FirstName=&FirstQtrSect=&FrameNumberFrom=&FrameNumberThrough=&GarageHigh=&GarageLow=&GovernmentUnit=&HighLot=&Info=&IsBasicSearch=false&IsExactMatch=&LastName=&LegalDescription=&LotTract=&LotType=&\
      LowLot=${lot}&MaxRecordedDate=05%2F13%2F2024&MiddleName=&MinRecordedDate=12%2F28%2F1989&Name=&NameRefiners=&NameTypeID=0&NotInSidwellFl=&NumAcres=&OneHalfCode=&PageNo=&PageNumberFrom=&PageNumberThrough=&ParentDocumentGlobalID=&PartOneCode=&PartTwoCode=&Pin=&PlatName=&PrimaryFirstName=&PrimaryLastName=&PrimaryMiddleName=&ProfileID=Public&PropertyID=&PropertyPhase=&PropertyUnit=&Range=&RangeDirection=&RefinementTokens=&RollNumber=&RollType=&Rows=10&SearchText=&SecDocNumberFrom=&SecDocNumberTo=&SecondQtrSect=&SecondaryFirstName=&SecondaryLastName=&SecondaryMiddleName=&Section=&SectionHalf=&SectionLot=&SectionQuarters=&SheetNumberFrom=&SheetNumberThrough=&SortFields=&SortOrders=&SplitUnit=&StartRow=0&State=&Suffix=&TertiaryFirstName=&TertiaryLastName=&TertiaryMiddleName=&ThirdQtrSect=&TownCode=&TownDirection=&TownhomeID=&Township=&UnderPin=&YearRefiners=&ZipCode=&ZipCodeFour=`,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        Authorization: "Bearer",
        "User-Agent": userAgent,
        Referer: "https://recorder.sfgov.org/",
        Cookie: cookie,
        EncryptedKey: key.encryptedKey,
        Password: key.password,
      },
    }
  );

  const data = await res.json();

  const blockLotSearchResults = blockLotSearchResultsSchema.parse(data);

  if (blockLotSearchResults.SearchResults.length === 0) {
    return null;
  }

  const firstResult = _.first(blockLotSearchResults.SearchResults);

  return {
    latestResult: {
      firstResult,
    },
    ...blockLotSearchResults,
  };
}

async function writeJSONtoFileFunc(data) {
  console.log(data);
  try {
    writeFile("output.json", JSON.stringify(data, null, 2));
    console.log("JSON data has been written to output.json");
  } catch (err) {
    console.error(err);
  }
}

async function writeSearchResultToSql(data) {
  const db = await open({
    filename: join(
      fileURLToPath(import.meta.url),
      "../../data/sfPropertyTaxRolls.sqlite"
    ),
    driver: sqlite3.Database,
  });

  await db.run("BEGIN TRANSACTION");
  console.log("beginning transation");

  // console.log("what is data", data);

  // bug: have to iterate through data.searchresults and insert each object into the database

  for (const searchResultRow of data.SearchResults) {
    const newSearchRow = {
      id: searchResultRow.ID,
      block: data.block,
      lot: data.lot,
      ...searchResultRow,
    };

    console.log(newSearchRow, "1. new search row");

    await db.run(
      `INSERT INTO SearchResults (PropertyTaxId, Block, Lot, AccessorCountyId, PrimaryDocNumber, DocumentDate, FilingCode, Names, SecondaryDocNumber, BookType, BookNumber, NumberOfPages)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?);`,
      Object.values(newSearchRow)
    );
  }

  // variables i need to pass:
  // 1. block, lot, accessor county ID

  // await db.run(
  //   `INSERT INTO SearchResults (PropertyTaxId, Block, Lot, AccessorCountyId, PrimaryDocNumber, DocumentDate, FilingCode, Names, SecondaryDocNumber, BookType, BookNumber, NumberOfPages)
  // VALUES (?,?,?,?,?,?,?,?,?,?,?,?);`,
  //   Object.values(data)
  // );

  await db.run("COMMIT");
  console.log("commited to the database");
}

async function getNamesForPagination(
  searchResultId: string,
  key: encryptedKeyAndPassword
) {
  // searchResultsId is 5703079 and that is the id that is needed to get this query working
  // example query: https://recorder.sfgov.org/SearchService/api/search/GetNamesForPagination/5703079/1/20
  const res = await fetch(
    `https://recorder.sfgov.org/SearchService/api/search/GetNamesForPagination/${searchResultId}/1/20`,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        Authorization: "Bearer",
        "User-Agent": userAgent,
        Referer: "https://recorder.sfgov.org/",
        Cookie: cookie,
        EncryptedKey: key.encryptedKey,
        Password: key.password,
      },
    }
  );
  console.log("fetched from the recorder's office");

  const data = await res.json();

  const namesForPagaginationForOneDocument =
    NamesForPaginationSchema.parse(data);

  return namesForPagaginationForOneDocument;
}

async function loadMissingNames(
  block: string,
  lot: string,
  limit: number,
  db: sqlite3.Database
): Promise<{ block: string; lot: string }[]> {
  const result = await db.all(
    `SELECT DISTINCT AssessorHistoricalPropertyTaxRolls2.block AS block, AssessorHistoricalPropertyTaxRolls2.lot \
    AS lot FROM AssessorHistoricalPropertyTaxRolls2 LEFT JOIN PropertyNames \
    ON AssessorHistoricalPropertyTaxRolls2.block = PropertyNames.block AND\
     AssessorHistoricalPropertyTaxRolls2.lot = PropertyNames.lot \
     WHERE (AssessorHistoricalPropertyTaxRolls2.block, AssessorHistoricalPropertyTaxRolls2.lot) > (?,?) \
     AND PropertyNames.id IS NULL ORDER BY AssessorHistoricalPropertyTaxRolls2.block ASC, \
     AssessorHistoricalPropertyTaxRolls2.lot ASC LIMIT ?`,
    block,
    lot,
    limit
  );

  return result;
}

// async function loadMissingNames(
//   block: string,
//   lot: string,
//   limit: number
// ): Promise<{ block: string; lot: string }[]> {
//   const result = await db.all(
//     "SELECT sres_properties.block AS block, sres_properties.lot AS lot FROM sres_properties LEFT JOIN property_names ON sres_properties.block = property_names.block AND sres_properties.lot = property_names.lot WHERE (sres_properties.block, sres_properties.lot) > (?, ?) AND property_names.id IS NULL ORDER BY sres_properties.block ASC, sres_properties.lot ASC LIMIT ?",
//     block,
//     lot,
//     limit
//   );

//   return result;
// }

async function main() {
  const key = await getSecureKey();

  const block = "0001";
  const lot = "001";

  const result = await getOneBlockLot({ block: block, lot: lot }, key);

  // writeJSONtoFileFunc(result);
  console.log(result?.latestResult);

  // pass the block and lot to result
  const resultWithBlockLot = {
    block,
    lot,
    ...result,
  };

  writeSearchResultToSql(resultWithBlockLot);
  // console.log(result);

  // instead of writing result to json, write this to the sqliteDatabase
}

async function writeNamesForPaginationTable(data) {
  const db = await open({
    filename: join(
      fileURLToPath(import.meta.url),
      "../../data/sfPropertyTaxRolls.sqlite"
    ),
    driver: sqlite3.Database,
  });

  console.log("does db open");

  await db.run("BEGIN TRANSACTION");
  console.log("beginning transation");

  for (const nameRow of data.NamesForPagination) {
    const newNameRow = {
      ...nameRow,
    };

    console.log(newNameRow, "1. new search row");

    await db.run(
      `INSERT INTO NamesForPagination (NameTypeDesc, FirstName, MiddleName, LastName, DocumentStatus, ReturnedDate, CorrectionDate, CrossRefDocNumber, DocInternalID, NDReturnedDate, Fullname, NameInternalID, TotalNamesCount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      Object.values(newNameRow)
    );
  }

  await db.run("COMMIT");
  console.log("commited to NamesForPagination table in the database");
}

async function main2() {
  // const key = await getSecureKey();
  // console.log("got the key");

  // const paginationNames = await getNamesForPagination("11068544", key);
  // // console.log(paginationNames, "paginationNames");

  // writeNamesForPaginationTable(paginationNames);

  const db = await open({
    filename: join(
      fileURLToPath(import.meta.url),
      "../../data/sfPropertyTaxRolls.sqlite"
    ),
    driver: sqlite3.Database,
  });

  const result = await loadMissingNames("0001", "001", 100, db);
  console.log(result, "result");
}

main2();
