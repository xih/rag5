// [5-21-2024] Rewrite the script from scratch
// 1. get the secure key, getOneBlock
// 2. get a list of searchResultIds and call the documentAPI with that
// [5-22-2024]
// 3. combine the document with blocklotData and write it as a row in the database
// 4. make a separate table that has a list of all the property owners that has a many to one relationship
// to documents
// 5. block - 0001, lot - 001 -> APN: 0001001 (add this as a column to the database)
// 6. [todo: ] reverse engineer this:
// https://recorder.sfgov.org/SearchService/api/search/GetDocumentDetails/5703079
// 7. bug on fetch [fixed]
// 8. [todo] - scrape on block, lots, not processed yet
// 8. [todo] - save to database

// 9. [5-24-2024]
// 1. save specific owners to propertyOwners table
// 2. save to document_owners table too

// [5-28-2024]
// 11. use https://github.com/luminati-io/proxy-scrape-nodejs?tab=readme-ov-file to proxy the cookies
// 12. curl "https://recorder.sfgov.org" \
// --proxy brd.superproxy.io:22225 \
// --proxy-user brd-customer-hl_6d74fc42-zone-residential_proxy4:812qoxo6po44
// 13. THE ABOVE CURL COMMAND WORKS
// 14. but doing it with puppeteer doesn't work.

import sqlite3 from "sqlite3";
import { blockLotSearchResultsSchema } from "../schemas/blockLotSchema";
import { accessorRecorderEncryptedKeySchema } from "../schemas/encryptedKeySchema";
import { NamesForPaginationSchema } from "../schemas/namesForPaginationSchema";
import { open } from "sqlite";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import fetch from "node-fetch";
import { HttpProxyAgent } from "http-proxy-agent";
import axios from "axios";

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
// const cookie =
// "googtrans=/en/en; BIGipServerASR-102_recorder.sfgov.org_PRD_EXT_pool=2160622032.20480.0000; HideDetails=0";

const db = await open({
  filename: join(
    fileURLToPath(import.meta.url),
    "../../data/sfPropertyTaxRolls.sqlite"
  ),
  driver: sqlite3.Database,
});

async function getCookie() {
  const proxyServer = "brd.superproxy.io:22225";
  const username = "brd-customer-hl_c8eb54f7-zone-residential_proxy1";
  const password = "i7mqpfyngau4";
  const proxyAuth = `${username}:${password}`;

  const browser = await puppeteer.launch({
    headless: false,
    // args: ["--proxy-server=http://localhost:8080"], getting Error: net::ERR_CERT_AUTHORITY_INVALID at https://recorder.sfgov.org/
    args: [
      `--proxy-server=${proxyServer}`,
      // `--proxy-auth=${proxyAuth}`,
      // "--no-sandbox",
      // "--disable-setuid-sandbox",
      // "--disable-dev-shm-usage",
      // "--ignore-certificate-errors",
    ],
    defaultViewport: { width: 1280, height: 800 },
    userDataDir: "./tmp",
    // ignoreHTTPSErrors: true, // This helps with certificate errors
  });

  const page = await browser.newPage();

  // Authenticate the proxy
  await page.authenticate({
    username: username,
    password: password,
  });

  console.log("succesfully authenticated the proxy! :)");
  await page.goto("https://google.com", { waitUntil: "networkidle2" });
  // await page.goto("https://recorder.sfgov.org/", { waitUntil: "networkidle2" });
  await page.screenshot({ path: "example.png" });

  console.log("what is the error here?");

  // Get the cookies from the page
  const cookies = await page.cookies();

  const cookie = `googtrans=/en/en; ${cookies[0].name}=${cookies[0].value}; HideDetails=0`;

  await browser.close();
  return cookie;
}

async function getCookieWithPuppeteer() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
    userDataDir: "./tmp",
  });

  const page = await browser.newPage();

  await page.goto("https://recorder.sfgov.org/", { waitUntil: "networkidle2" });

  const cookies = await page.cookies();

  const cookie = `googtrans=/en/en; ${cookies[0].name}=${cookies[0].value}; HideDetails=0`;

  await browser.close();
  return cookie;
}

async function getSecureKeyWithProxy(cookie: string) {
  const proxyOptions = {
    proxy: {
      host: "brd.superproxy.io",
      port: 22225,
      auth: {
        username: "brd-customer-hl_c8eb54f7-zone-residential_proxy1",
        password: "i7mqpfyngau4",
      },
    },
    headers: {
      Accept: "application/json, text/plain, */*",
      Authorization: "Bearer",
      Connection: "keep-alive",
      Referer: "https://recorder.sfgov.org/",
      "User-Agent": userAgent,
      Cookie: cookie,
    },
  };

  const headerOptions = {
    Accept: "application/json, text/plain, */*",
    Authorization: "Bearer",
    Connection: "keep-alive",
    Referer: "https://recorder.sfgov.org/",
    "User-Agent": userAgent,
    Cookie: cookie,
  };

  const url = `https://recorder.sfgov.org/SearchService/api/SearchConfiguration/GetSecureKey`;

  try {
    // connect to the target page
    // and log the server response
    const response = await axios.get(url, proxyOptions);

    const data = await response.data;

    console.log(data);
    console.log(response.data, "~~~ response");
  } catch (error) {
    console.error("Error:", error);
  }
}

// const cookie = await getCookie();
// console.log("1.... does it work??");
// await getSecureKeyWithProxy(cookie);
// console.log("does it work??");

async function getSecureKey(cookie: string) {
  const res = await fetch(
    `https://recorder.sfgov.org/SearchService/api/SearchConfiguration/GetSecureKey`,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        Authorization: "Bearer",
        Connection: "keep-alive",
        Referer: "https://recorder.sfgov.org/",
        "User-Agent": userAgent,
        Cookie: cookie,
      },
    }
  );

  const data = await res.json();

  console.log("secure key", data);

  const secureKey = accessorRecorderEncryptedKeySchema.parse(data);

  return {
    encryptedKey: secureKey.EncryptedKey,
    password: secureKey.Password,
  };
}

type SecureKey = {
  encryptedKey: string;
  password: string;
};

async function getOneBlockLot(
  { block, lot }: { block: string; lot: string },
  secureKey: SecureKey,
  cookie: string
) {
  const res = await fetch(
    // `https://recorder.sfgov.org/SearchService/api/Search/GetSearchResults?APN=&Acres=&AddressLineOne=&AddressLineTwo=&AreaCode=&Block=${encodeURIComponent(
    //   block
    // )}&BookNo=&BookType=&Building=&BuildingHigh=&BuildingLow=&ChildDocumentGlobalID=&City=&CityArea=&CityPhase=&CityVillageCode=&Code=&CornerLetter=&CornerNumber=&CountryCode=&County=&CountyCode=&Division=&DocNumberFrom=&DocNumberTo=&DocumentClass=OfficialRecords&EventDateFrom=&EventDateTo=&FilingCode=001&FilingCodeGroupID=&FilingCodeRefiners=&FirstName=&FirstQtrSect=&FrameNumberFrom=&FrameNumberThrough=&GarageHigh=&GarageLow=&GovernmentUnit=&HighLot=&Info=&IsBasicSearch=false&IsExactMatch=&LastName=&LegalDescription=&LotTract=&LotType=&LowLot=${encodeURIComponent(
    //   lot
    // )}&MaxRecordedDate=${encodeURIComponent(
    //   "05/22/2024"
    // )}&MiddleName=&MinRecordedDate=${encodeURIComponent(
    //   "12/28/1989"
    // )}&Name=&NameRefiners=&NameTypeID=0&NotInSidwellFl=&NumAcres=&OneHalfCode=&PageNo=&PageNumberFrom=&PageNumberThrough=&ParentDocumentGlobalID=&PartOneCode=&PartTwoCode=&Pin=&PlatName=&PrimaryFirstName=&PrimaryLastName=&PrimaryMiddleName=&ProfileID=Public&PropertyID=&PropertyPhase=&PropertyUnit=&Range=&RangeDirection=&RefinementTokens=&RollNumber=&RollType=&Rows=20&SearchText=&SecDocNumberFrom=&SecDocNumberTo=&SecondQtrSect=&SecondaryFirstName=&SecondaryLastName=&SecondaryMiddleName=&Section=&SectionHalf=&SectionLot=&SectionQuarters=&SheetNumberFrom=&SheetNumberThrough=&SortFields=&SortOrders=&SplitUnit=&StartRow=0&State=&Suffix=&TertiaryFirstName=&TertiaryLastName=&TertiaryMiddleName=&ThirdQtrSect=&TownCode=&TownDirection=&TownhomeID=&Township=&UnderPin=&YearRefiners=&ZipCode=&ZipCodeFour=`,
    `https://recorder.sfgov.org/SearchService/api/Search/GetSearchResults?APN=&Acres=&AddressLineOne=&AddressLineTwo=&AreaCode=&Block=${encodeURIComponent(
      block
    )}&BookNo=&BookType=&Building=&BuildingHigh=&BuildingLow=&ChildDocumentGlobalID=&City=&CityArea=&CityPhase=&CityVillageCode=&Code=&CornerLetter=&CornerNumber=&CountryCode=&County=&CountyCode=&Division=&DocNumberFrom=&DocNumberTo=&DocumentClass=OfficialRecords&EventDateFrom=&EventDateTo=&FilingCode=&FilingCodeGroupID=&FilingCodeRefiners=&FirstName=&FirstQtrSect=&FrameNumberFrom=&FrameNumberThrough=&GarageHigh=&GarageLow=&GovernmentUnit=&HighLot=&Info=&IsBasicSearch=false&IsExactMatch=&LastName=&LegalDescription=&LotTract=&LotType=&LowLot=${encodeURIComponent(
      lot
    )}&MaxRecordedDate=05%2F22%2F2024&MiddleName=&MinRecordedDate=12%2F28%2F1989&Name=&NameRefiners=&NameTypeID=0&NotInSidwellFl=&NumAcres=&OneHalfCode=&PageNo=&PageNumberFrom=&PageNumberThrough=&ParentDocumentGlobalID=&PartOneCode=&PartTwoCode=&Pin=&PlatName=&PrimaryFirstName=&PrimaryLastName=&PrimaryMiddleName=&ProfileID=Public&PropertyID=&PropertyPhase=&PropertyUnit=&Range=&RangeDirection=&RefinementTokens=&RollNumber=&RollType=&Rows=10&SearchText=&SecDocNumberFrom=&SecDocNumberTo=&SecondQtrSect=&SecondaryFirstName=&SecondaryLastName=&SecondaryMiddleName=&Section=&SectionHalf=&SectionLot=&SectionQuarters=&SheetNumberFrom=&SheetNumberThrough=&SortFields=&SortOrders=&SplitUnit=&StartRow=0&State=&Suffix=&TertiaryFirstName=&TertiaryLastName=&TertiaryMiddleName=&ThirdQtrSect=&TownCode=&TownDirection=&TownhomeID=&Township=&UnderPin=&YearRefiners=&ZipCode=&ZipCodeFour=`,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        Authorization: "Bearer",
        Connection: "keep-alive",
        Referer: "https://recorder.sfgov.org/",
        "User-Agent": userAgent,
        Cookie: cookie,
        EncryptedKey: secureKey.encryptedKey,
        Password: secureKey.password,
      },
    }
  );

  const data = await res.json();

  console.log("whats data", data);

  const blockLotData = blockLotSearchResultsSchema.parse(data);

  console.log("number of documents:", blockLotData.SearchResults.length);

  // console.log(blockLotData);
  return blockLotData;
}

async function getNamesOnDocumentFromSearchResultId(
  searchResultId: string,
  secureKey: SecureKey,
  cookie: string
) {
  const res = await fetch(
    `https://recorder.sfgov.org/SearchService/api/search/GetNamesForPagination/${encodeURIComponent(
      searchResultId
    )}/1/20`,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        Authorization: "Bearer",
        Connection: "keep-alive",
        Referer: "https://recorder.sfgov.org/",
        "User-Agent": userAgent,
        Cookie: cookie,
        EncryptedKey: secureKey.encryptedKey,
        Password: secureKey.password,
      },
    }
  );

  const data = await res.json();

  console.log("NamesForPaginationSchema data", data);

  const namesOnDocument = NamesForPaginationSchema.parse(data);

  return namesOnDocument;
}

interface ResultObject {
  Grantor: string;
  Grantee: string;
  TotalNamesCount?: number;
  NameInternalID?: string;
  DocumentId?: string;
}

interface DataObject {
  NameTypeDesc: string;
  FirstName: null | string;
  MiddleName: null | string;
  LastName: null | string;
  DocumentStatus: null | string;
  ReturnedDate: string;
  CorrectionDate: string;
  CrossRefDocNumber: string;
  DocInternalID: null | string;
  NDReturnedDate: null | string;
  Fullname: string;
  NameInternalID: string;
  TotalNamesCount: number;
}

async function loadMissingNames(
  block: string,
  lot: string,
  db: sqlite3.Database,
  limit: number
): Promise<{ block: string; lot: string }[]> {
  // make a new table: PropertyDocuments
  const result = await db.all(
    `SELECT DISTINCT AssessorHistoricalPropertyTaxRolls2.block AS block, AssessorHistoricalPropertyTaxRolls2.lot AS lot\
    FROM AssessorHistoricalPropertyTaxRolls2 LEFT JOIN PropertyDocuments \
    ON AssessorHistoricalPropertyTaxRolls2.block = PropertyDocuments.block AND\
    AssessorHistoricalPropertyTaxRolls2.lot = AssessorHistoricalPropertyTaxRolls2.lot \
    WHERE (AssessorHistoricalPropertyTaxRolls2.block, AssessorHistoricalPropertyTaxRolls2.lot) > (?,?)\
    AND PropertyDocuments.id is NULL ORDER BY AssessorHistoricalPropertyTaxRolls2.block ASC,
    AssessorHistoricalPropertyTaxRolls2.lot ASC LIMIT ?`,
    block,
    lot,
    limit
  );

  return result;
}

interface PropertyDocument {
  PrimaryDocNumber: string;
  DocumentDate: string;
  FilingCode: string;
  Names: string;
  SecondaryDocNumber: string;
  BookType: string;
  BookNumber: string;
  NumberOfPages: string;
  Grantor: string;
  TotalNamesCount: number;
  NameInternalID: string;
  DocumentId: string;
  Grantee: string;
  Block: string;
  Lot: string;
  APN: string;
}

async function checkTheVisibilityOfBatch(batch: ResultObject[][]) {
  const randomIndex = Math.floor(Math.random() * batch.length);
  const randomArray = batch[randomIndex];
  const randomObjectIndex = Math.floor(Math.random() * randomArray.length);
  console.log("first object of the batch:", batch[0][0]);
  console.log("random object of the batch:", randomArray[randomObjectIndex]);
}

async function iterateThroughAllBlocksLots(block: string, lot: string) {
  let completed = 0;
  let count = 0;
  let maxPropertyRecords = 100000;

  const db = await open({
    filename: join(
      fileURLToPath(import.meta.url),
      "../../data/sfPropertyTaxRolls.sqlite"
    ),
    driver: sqlite3.Database,
  });

  while (count < maxPropertyRecords) {
    const missingBlockAndLots = await loadMissingNames(block, lot, db, 5);

    if (missingBlockAndLots.length === 0) {
      break;
    }

    // const cookie = await getCookie();
    const cookie = await getCookieWithPuppeteer();

    console.log(cookie, "!!!!!__cookie");

    const key = await getSecureKey(cookie);
    const batch = await Promise.all(
      missingBlockAndLots.map(async ({ block, lot }) => {
        const propertyRecords = await getTenLatestPropertyDocuments(
          block,
          lot,
          key,
          cookie
        );

        return propertyRecords;
      })
    );

    checkTheVisibilityOfBatch(batch);

    // batch is a group of 5 unique block lots's top 10 recent documents

    for (const documentsOfOneBlockLot of batch) {
      if (!documentsOfOneBlockLot) {
        console.log(`No results for block`); // TODO: add metadata to take of [] empty case
        continue;
      }
      await db.run("BEGIN TRANSACTION");
      for (const document of documentsOfOneBlockLot) {
        const cursor1 = await db.run(
          `INSERT INTO PropertyDocuments (
        PrimaryDocNumber,
        DocumentDate,
        FilingCode,
        Names,
        SecondaryDocNumber,
        BookType,
        BookNumber,
        NumberOfPages,
        Grantor,
        TotalNamesCount,
        NameInternalID,
        DocumentId,
        Grantee,
        Block,
        Lot,
        APN
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          Object.values(document)
        );
        const propertyDocumentId = cursor1.lastID;

        const grantorNames = document.Grantor.split(",").map((name) =>
          name.trim()
        );
        const granteeNames = document.Grantee.split(",").map((name) =>
          name.trim()
        );

        // Combine grantor and grantee arrays
        const allPropertyOwnerNames = [...grantorNames, ...granteeNames];

        for (const ownerName of allPropertyOwnerNames) {
          const cursor = await db.run(
            `INSERT INTO PropertyOwners (
            Name
            ) VALUES (?)`,
            ownerName
          );
          const ownerId = cursor.lastID;

          // insert into a jointable
          db.run(
            `INSERT INTO document_owners (
              document_id,
              owner_id,
              role
            ) VALUES (?, ?, ?)`,
            propertyDocumentId,
            ownerId,
            document.Grantor.includes(ownerName) ? "grantor" : "grantee"
          );
        }
      }
      await db.run("COMMIT");

      block = missingBlockAndLots[missingBlockAndLots.length - 1].block;
      lot = missingBlockAndLots[missingBlockAndLots.length - 1].lot;
      completed += missingBlockAndLots.length;
      console.log(
        `Completed ${completed} properties (block ${block}, lot ${lot}))`
      );
      console.log("completed missingblock and lots:", missingBlockAndLots);
      count++;
    }
  }
}

async function getTenLatestPropertyDocuments(
  block: string,
  lot: string,
  key: SecureKey,
  cookie: string
) {
  const blockLotData = await getOneBlockLot(
    {
      block,
      lot,
    },
    key,
    cookie
  );
  if (!blockLotData) {
    console.log("no documents found~");
    return [];
  }

  const combinedResults: ResultObject[] = [];

  for (const searchResult of blockLotData.SearchResults) {
    const namesOnDocument = await getNamesOnDocumentFromSearchResultId(
      searchResult.ID,
      key,
      cookie
    );

    const result = namesOnDocument.NamesForPagination.reduce(
      (acc: ResultObject, obj: DataObject) => {
        if (obj.NameTypeDesc === "Grantor") {
          acc.Grantor = acc.Grantor
            ? acc.Grantor + ", " + obj.Fullname
            : obj.Fullname;
        } else if (obj.NameTypeDesc === "Grantee") {
          acc.Grantee = acc.Grantee
            ? acc.Grantee + ", " + obj.Fullname
            : obj.Fullname;
        }

        acc.TotalNamesCount = obj.TotalNamesCount;
        acc.NameInternalID = obj.NameInternalID;
        acc.DocumentId = searchResult.ID;

        return acc;
      },
      {} as ResultObject
    );

    const { ID, ...newSearchResultWithoutId } = searchResult;

    const searchResult2 = {
      ...newSearchResultWithoutId,
      ...result,
      Grantee: result.Grantee ? result.Grantee : "",
      Grantor: result.Grantor ? result.Grantor : "",
      block,
      lot,
      APN: `${block}${lot}`,
    }; // Spread result into searchResult

    combinedResults.push(searchResult2); // Add searchResult to the combinedResults array
  }

  return combinedResults;
}

async function main(block: string, lot: string) {
  const cookie = await getCookie();

  const key = await getSecureKey(cookie);

  const blockLotData = await getOneBlockLot(
    {
      block,
      lot,
    },
    key,
    cookie
  );

  const documentIdsOfBlockLot = blockLotData.SearchResults.map(
    (searchResult) => searchResult.ID
  );

  // console.log(documentIdsOfBlockLot, "documentIdsOfBlockLot");

  const combinedResults: ResultObject[] = [];

  for (const searchResult of blockLotData.SearchResults) {
    const namesOnDocument = await getNamesOnDocumentFromSearchResultId(
      searchResult.ID,
      key,
      cookie
    );

    const result = namesOnDocument.NamesForPagination.reduce(
      (acc: ResultObject, obj: DataObject) => {
        if (obj.NameTypeDesc === "Grantor") {
          acc.Grantor = acc.Grantor
            ? acc.Grantor + ", " + obj.Fullname
            : obj.Fullname + "";
        } else if (obj.NameTypeDesc === "Grantee") {
          acc.Grantee = acc.Grantee
            ? acc.Grantee + ", " + obj.Fullname
            : obj.Fullname + "";
        }

        acc.TotalNamesCount = obj.TotalNamesCount;
        acc.NameInternalID = obj.NameInternalID;
        acc.DocumentId = searchResult.ID;

        return acc;
      },
      {} as ResultObject
    );

    const { ID, ...newSearchResultWithoutId } = searchResult;

    const searchResult2 = {
      ...newSearchResultWithoutId,
      ...result,
      grantee: block,
      lot,
      APN: `${block}${lot}`,
    }; // Spread result into searchResult

    combinedResults.push(searchResult2); // Add searchResult to the combinedResults array
  }

  // console.log(combinedResults);
  // combinedResults is one Document
  // console.log("blockLotData", blockLotData);
}

async function main2() {
  const cookie = await getCookie();

  const key = await getSecureKey(cookie);
  const tenLatestPropertyDocuments = await getTenLatestPropertyDocuments(
    "0001",
    "001",
    key,
    cookie
  );
  // console.log(tenLatestPropertyDocuments);

  for (const documents of tenLatestPropertyDocuments) {
    if (!documents) {
      console.log(`no documents`);
      continue;
    }
    // test this insertion
    const cursor1 = await db.run(
      `INSERT INTO PropertyDocuments (
    PrimaryDocNumber,
    DocumentDate,
    FilingCode,
    Names,
    SecondaryDocNumber,
    BookType,
    BookNumber,
    NumberOfPages,
    Grantor,
    TotalNamesCount,
    NameInternalID,
    DocumentId,
    Grantee,
    Block,
    Lot,
    APN
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      Object.values(documents)
    );

    const propertyDocumentId = cursor1.lastID;
    console.log("propertyDocumentId", propertyDocumentId);

    // 1. split up grantee and grantor and add them to the names database
    // Split grantor and grantee strings by comma and trim whitespace
    const grantorNames = documents.Grantor.split(",").map((name) =>
      name.trim()
    );
    const granteeNames = documents.Grantee.split(",").map((name) =>
      name.trim()
    );

    // Combine grantor and grantee arrays
    const allPropertyOwnerNames = [...grantorNames, ...granteeNames];

    for (const ownerName of allPropertyOwnerNames) {
      console.log(ownerName, "ownerName");
      const cursor = await db.run(
        `INSERT INTO PropertyOwners (
        Name
      ) VALUES (?)`,
        ownerName
      );
      const ownerId = cursor.lastID;
      console.log(ownerId, "ownerId");

      // insert into a jointable
      db.run(
        `INSERT INTO document_owners (
      document_id,
      owner_id,
      role
    ) VALUES (?, ?, ?)`,
        propertyDocumentId,
        ownerId,
        documents.Grantor.includes(ownerName) ? "grantor" : "grantee"
      );
    }

    console.log("insert one document into database successful");
    console.log("insert document_owerns_join table database successful");
  }
  console.log("inserted all documents into database successful");
}

async function main3() {
  await iterateThroughAllBlocksLots("0001", "001");
}

await main3();
// await main2();
