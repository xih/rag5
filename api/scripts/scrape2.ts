// [5-21-2024] Rewrite the script from scratch
// 1. get the secure key
// 2. call the

import { accessorRecorderEncryptedKeySchema } from "../schemas/encryptedKeySchema";

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const cookie =
  "googtrans=/en/en; BIGipServerASR-102_recorder.sfgov.org_PRD_EXT_pool=2160622032.20480.0000; HideDetails=0";

// curl 'https://recorder.sfgov.org/SearchService/api/SearchConfiguration/GetSecureKey' \
// -H 'Accept: application/json, text/plain, */*' \
// -H 'Accept-Language: en-US,en;q=0.9' \
// -H 'Authorization: Bearer' \
// -H 'Connection: keep-alive' \
// -H 'Cookie: googtrans=/en/en; BIGipServerASR-102_recorder.sfgov.org_PRD_EXT_pool=2160622032.20480.0000; HideDetails=0' \
// -H 'EncryptedKey: TlDWDwNq/IAmFKB1jDKraS99S4qn34WxuRoK5Zq+uacbflB8smU7siLEh1IQ8JSfbq2qDZpwZP8JDDP19kjqD7CHREGcHKvBit3t7xKQkOMkpRWVD3Wq5WJVbTnCLm4k/FqB7xvFjo7SF0cZDyYi94dyAB+RmLP2jdC1XYiQa+M=' \
// -H 'Password: ODM2MDg2Mjg3' \
// -H 'Referer: https://recorder.sfgov.org/' \
// -H 'Sec-Fetch-Dest: empty' \
// -H 'Sec-Fetch-Mode: cors' \
// -H 'Sec-Fetch-Site: same-origin' \
// -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' \
// -H 'sec-ch-ua: "Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"' \
// -H 'sec-ch-ua-mobile: ?0' \
// -H 'sec-ch-ua-platform: "macOS"'

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

async function main() {
  const data = await getSecureKey();
  console.log(data);
}

main();
