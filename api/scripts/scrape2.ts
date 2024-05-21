// [5-21-2024] Rewrite the script from scratch
// 1. get the secure key, getOneBlock
// 2. get a list of searchResultIds and call the documentAPI with that

import { blockLotSearchResultsSchema } from "../schemas/blockLotSchema";
import { accessorRecorderEncryptedKeySchema } from "../schemas/encryptedKeySchema";
import { NamesForPaginationSchema } from "../schemas/namesForPaginationSchema";

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const cookie =
  "googtrans=/en/en; BIGipServerASR-102_recorder.sfgov.org_PRD_EXT_pool=2160622032.20480.0000; HideDetails=0";

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
    `https://recorder.sfgov.org/SearchService/api/Search/GetSearchResults?APN=&Acres=&AddressLineOne=&AddressLineTwo=&AreaCode=&\
  Block=${block}&BookNo=&BookType=&Building=&BuildingHigh=&BuildingLow=&ChildDocumentGlobalID=&City=&CityArea=&CityPhase=&CityVillageCode=&Code=&CornerLetter=&CornerNumber=&CountryCode=&County=&CountyCode=&Division=&DocNumberFrom=&DocNumberTo=&DocumentClass=OfficialRecords&EventDateFrom=&EventDateTo=&FilingCode=&FilingCodeGroupID=&FilingCodeRefiners=&FirstName=&FirstQtrSect=&FrameNumberFrom=&FrameNumberThrough=&GarageHigh=&GarageLow=&GovernmentUnit=&HighLot=&Info=&IsBasicSearch=false&IsExactMatch=&LastName=&LegalDescription=&LotTract=&LotType=&\
  LowLot=${lot}&MaxRecordedDate=05%2F21%2F2024&MiddleName=&MinRecordedDate=12%2F28%2F1989&Name=&NameRefiners=&NameTypeID=0&NotInSidwellFl=&NumAcres=&OneHalfCode=&PageNo=&PageNumberFrom=&PageNumberThrough=&ParentDocumentGlobalID=&PartOneCode=&PartTwoCode=&Pin=&PlatName=&PrimaryFirstName=&PrimaryLastName=&PrimaryMiddleName=&ProfileID=Public&PropertyID=&PropertyPhase=&PropertyUnit=&Range=&RangeDirection=&RefinementTokens=&RollNumber=&RollType=&Rows=10&SearchText=&SecDocNumberFrom=&SecDocNumberTo=&SecondQtrSect=&SecondaryFirstName=&SecondaryLastName=&SecondaryMiddleName=&Section=&SectionHalf=&SectionLot=&SectionQuarters=&SheetNumberFrom=&SheetNumberThrough=&SortFields=&SortOrders=&SplitUnit=&StartRow=0&State=&Suffix=&TertiaryFirstName=&TertiaryLastName=&TertiaryMiddleName=&ThirdQtrSect=&TownCode=&TownDirection=&TownhomeID=&Township=&UnderPin=&YearRefiners=&ZipCode=&ZipCodeFour=`,
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

  // console.log(blockLotData);
  return blockLotData;
}

async function getNamesOnDocumentFromSearchResultId(
  searchResultId: string,
  secureKey: SecureKey
) {
  const res = await fetch(
    `https://recorder.sfgov.org/SearchService/api/search/GetNamesForPagination/11070863/1/20`,
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

async function main() {
  const key = await getSecureKey();

  const blockLotData = await getOneBlockLot(
    {
      block: "0001",
      lot: "001",
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

    const searchResult2 = { ...newSearchResultWithoutId, ...result }; // Spread result into searchResult

    combinedResults.push(searchResult2); // Add searchResult to the combinedResults array
  }

  console.log(combinedResults);
  // combinedResults is one Document
}

main();
