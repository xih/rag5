// this is the schema for fetching this url
// https://recorder.sfgov.org/SearchService/api/Search/GetSearchResults?APN=&Acres=&AddressLineOne=&AddressLineTwo=&AreaCode=&Block=0001&BookNo=&BookType=&Building=&BuildingHigh=&BuildingLow=&ChildDocumentGlobalID=&City=&CityArea=&CityPhase=&CityVillageCode=&Code=&CornerLetter=&CornerNumber=&CountryCode=&County=&CountyCode=&Division=&DocNumberFrom=&DocNumberTo=&DocumentClass=OfficialRecords&EventDateFrom=&EventDateTo=&FilingCode=&FilingCodeGroupID=&FilingCodeRefiners=&FirstName=&FirstQtrSect=&FrameNumberFrom=&FrameNumberThrough=&GarageHigh=&GarageLow=&GovernmentUnit=&HighLot=&Info=&IsBasicSearch=false&IsExactMatch=&LastName=&LegalDescription=&LotTract=&LotType=&LowLot=001&MaxRecordedDate=05%2F13%2F2024&MiddleName=&MinRecordedDate=12%2F28%2F1989&Name=&NameRefiners=&NameTypeID=0&NotInSidwellFl=&NumAcres=&OneHalfCode=&PageNo=&PageNumberFrom=&PageNumberThrough=&ParentDocumentGlobalID=&PartOneCode=&PartTwoCode=&Pin=&PlatName=&PrimaryFirstName=&PrimaryLastName=&PrimaryMiddleName=&ProfileID=Public&PropertyID=&PropertyPhase=&PropertyUnit=&Range=&RangeDirection=&RefinementTokens=&RollNumber=&RollType=&Rows=10&SearchText=&SecDocNumberFrom=&SecDocNumberTo=&SecondQtrSect=&SecondaryFirstName=&SecondaryLastName=&SecondaryMiddleName=&Section=&SectionHalf=&SectionLot=&SectionQuarters=&SheetNumberFrom=&SheetNumberThrough=&SortFields=&SortOrders=&SplitUnit=&StartRow=0&State=&Suffix=&TertiaryFirstName=&TertiaryLastName=&TertiaryMiddleName=&ThirdQtrSect=&TownCode=&TownDirection=&TownhomeID=&Township=&UnderPin=&YearRefiners=&ZipCode=&ZipCodeFour=

import { z } from "zod";

const searchResultSchema = z.object({
  ID: z.string(),
  PrimaryDocNumber: z.string(),
  DocumentDate: z.string(),
  FilingCode: z.string(),
  Names: z.string(),
  SecondaryDocNumber: z.string(),
  BookType: z.string(),
  BookNumber: z.string(),
  NumberOfPages: z.string(),
});

const yearSchema = z.object({
  Key: z.string(),
  Value: z.number(),
  ID: z.string(),
  RefinementToken: z.null().optional(),
});

const filingCodeSchema = z.object({
  Key: z.string(),
  Value: z.number(),
  ID: z.string(),
  RefinementToken: z.null().optional(),
});

const nameSchema = z.object({
  Key: z.string(),
  Value: z.number(),
  ID: z.string(),
  RefinementToken: z.null().optional(),
});

const refinementPanelDataSchema = z.object({
  Years: z.union([z.array(yearSchema), z.null()]),
  FilingCodes: z.union([z.array(filingCodeSchema), z.null()]),
  Names: z.union([z.array(nameSchema), z.null()]),
});

export const blockLotSearchResultsSchema = z.object({
  ResultCount: z.number(),
  SearchResults: z.array(searchResultSchema),
  RefinementPanelData: z
    .union([refinementPanelDataSchema, z.null()])
    .optional(),
});
// added because of this zoderror
//ZodError: [
//   {
//     "code": "invalid_type",
//     "expected": "object",
//     "received": "null",
//     "path": [
//       "RefinementPanelData"
//     ],
//     "message": "Expected object, received null"
//   }
// ]
