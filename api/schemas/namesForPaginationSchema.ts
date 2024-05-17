import { z } from "zod";

export const NamesForPaginationSchema = z.object({
  NamesForPagination: z.array(
    z.object({
      NameTypeDesc: z.string(),
      FirstName: z.string().nullable(),
      MiddleName: z.string().nullable(),
      LastName: z.string().nullable(),
      DocumentStatus: z.string().nullable(),
      ReturnedDate: z.string(),
      CorrectionDate: z.string(),
      CrossRefDocNumber: z.string(),
      DocInternalID: z.string().nullable(),
      NDReturnedDate: z.string().nullable(),
      Fullname: z.string(),
      NameInternalID: z.string(),
      TotalNamesCount: z.number(),
    })
  ),
});
