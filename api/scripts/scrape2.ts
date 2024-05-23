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

import sqlite3 from "sqlite3";
import { blockLotSearchResultsSchema } from "../schemas/blockLotSchema";
import { accessorRecorderEncryptedKeySchema } from "../schemas/encryptedKeySchema";
import { NamesForPaginationSchema } from "../schemas/namesForPaginationSchema";
import { open } from "sqlite";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const cookie =
  "googtrans=/en/en; BIGipServerASR-102_recorder.sfgov.org_PRD_EXT_pool=2160622032.20480.0000; HideDetails=0";

const db = await open({
  filename: join(
    fileURLToPath(import.meta.url),
    "../../data/sfPropertyTaxRolls.sqlite"
  ),
  driver: sqlite3.Database,
});

async function getSecureKey() {
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
  secureKey: SecureKey
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

  const blockLotData = blockLotSearchResultsSchema.parse(data);

  console.log(
    blockLotData.SearchResults.length,
    "22. What is the length here?"
  );

  // console.log(blockLotData);
  return blockLotData;
}

async function getNamesOnDocumentFromSearchResultId(
  searchResultId: string,
  secureKey: SecureKey
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

  const namesOnDocument = NamesForPaginationSchema.parse(data);

  return namesOnDocument;
}

interface ResultObject {
  Grantor?: string;
  Grantee?: string;
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
) {
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

async function main(block: string, lot: string) {
  const key = await getSecureKey();

  const blockLotData = await getOneBlockLot(
    {
      block,
      lot,
    },
    key
  );

  const documentIdsOfBlockLot = blockLotData.SearchResults.map(
    (searchResult) => searchResult.ID
  );

  console.log(documentIdsOfBlockLot, "documentIdsOfBlockLot");

  const combinedResults: ResultObject[] = [];

  for (const searchResult of blockLotData.SearchResults) {
    const namesOnDocument = await getNamesOnDocumentFromSearchResultId(
      searchResult.ID,
      key
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
      block,
      lot,
      APN: `${block}${lot}`,
    }; // Spread result into searchResult

    combinedResults.push(searchResult2); // Add searchResult to the combinedResults array
  }

  console.log(combinedResults);
  // combinedResults is one Document
  // console.log("blockLotData", blockLotData);
}

// main("0001", "001");

console.log(await loadMissingNames("0001", "001", db, 5));
