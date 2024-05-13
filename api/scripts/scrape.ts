// write a script that scrapes SF housing data
// use normal requests that can get the key needed
// 1. get the block and lot number
// 2. go through all block and lots to find the grantor and grantee
// 3. site: https://recorder.sfgov.org/#!/simple
// 4. site: https://sfplanninggis.org/pim/?pub=true to find the block/lot numbers
// 5. site: https://data.sfgov.org/Housing-and-Buildings/Assessor-Historical-Secured-Property-Tax-Rolls/wv5m-vpq2/data_preview
import z from "zod";

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

async function main() {
  const key = await getSecureKey();
  console.log(key, "key");
}

main();
