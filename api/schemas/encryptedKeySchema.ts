import { z } from "zod";

export const accessorRecorderEncryptedKeySchema = z.object({
  EncryptedKey: z.string(),
  Password: z.string(),
});
