import fs from "fs/promises";
import path from "path";

const currentSecond = new Date()
  .toISOString()
  .replace(/:/g, "-")
  .replace(/\..+/, "");
const dirPath = `tmp/rapport/${currentSecond}`;

async function main() {
  await fs.mkdir(dirPath, { recursive: true });

  const res = await fetch(
    "https://portal.vippsmobilepay.com/api/v0/merchants/9084/report/internal/orders",
    {
      headers: {
        "x-csrf-token":
          "ZNGIoxr3yKGosif2/2KLzwwUgCM9DzzPhliStUD1BWyltrfK6/TxzTLE9r4izPBJnV8Iix8z1/saI7cdxKHEWA==",
        cookie:
          "session_id=49364cf1-3b85-4154-a8c3-6629f60569ce; csrf=MTc0Mzg4NDU4N3xJbmRYWXk5aFprVkVUMWQ1WVdSMFJra3pZVFUzYUhCR1RHbExaMmxRVDNNd2JraHpiSEZKVWxWM1ZGRTlJZ289fHOGkL-mjgiAn_aeaoR0wbfT8VxupJ-k2AwxV5mgrOBd; mp_4117611c5aaa780903a42882838d157b_mixpanel=%7B%22distinct_id%22%3A%20%22%24device%3A7c6977fb-a414-4ae0-a728-1387d74e8beb%22%2C%22%24device_id%22%3A%20%227c6977fb-a414-4ae0-a728-1387d74e8beb%22%2C%22%24initial_referrer%22%3A%20%22https%2F%2Fvippsmobilepay.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22vippsmobilepay.com%22%2C%22__mps%22%3A%20%7B%7D%2C%22__mpso%22%3A%20%7B%22%24initial_referrer%22%3A%20%22https%2F%2Fvippsmobilepay.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22vippsmobilepay.com%22%7D%2C%22__mpus%22%3A%20%7B%7D%2C%22__mpa%22%3A%20%7B%7D%2C%22__mpu%22%3A%20%7B%7D%2C%22__mpr%22%3A%20%5B%5D%2C%22__mpap%22%3A%20%5B%5D%7D; mp_no_token_mixpanel=%7B%22distinct_id%22%3A%20%22%24device%3A195d4860f752c0-0591a3735b26a3-26011d51-1fa400-195d4860f752c1%22%2C%22%24device_id%22%3A%20%22195d4860f752c0-0591a3735b26a3-26011d51-1fa400-195d4860f752c1%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fvipps.no%2F%22%2C%22%24initial_referring_domain%22%3A%20%22vipps.no%22%2C%22__mps%22%3A%20%7B%7D%2C%22__mpso%22%3A%20%7B%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fvipps.no%2F%22%2C%22%24initial_referring_domain%22%3A%20%22vipps.no%22%7D%2C%22__mpus%22%3A%20%7B%7D%2C%22__mpa%22%3A%20%7B%7D%2C%22__mpu%22%3A%20%7B%7D%2C%22__mpr%22%3A%20%5B%5D%2C%22__mpap%22%3A%20%5B%5D%2C%22source%22%3A%20%22MerchantPortal%22%2C%22usingBedriftApp%22%3A%20false%2C%22User%20Selected%20Nationality%22%3A%20%22NO%22%2C%22User%20Role%22%3A%20%5B%0A%20%20%20%20%22Merchant.Admin%22%0A%5D%2C%22Has%20Active%20Merchant%22%3A%20true%2C%22Sales%20Unit%20Types%22%3A%20%5B%0A%20%20%20%20%22ECOMMERCE%22%2C%0A%20%20%20%20%22P2B%22%0A%5D%2C%22Merchant%20ID%22%3A%20%225c6f01a98a18544be3636b1ea75408b23c2af3c42504ad6808ffb7078ff03eef%22%2C%22Organization%20Number%22%3A%20%222c3e11e2ee8303d5a3a532b0f8381d9cad1dad1c8d58db34c746ab265e0fde46%22%2C%22Country%20Code%22%3A%20%22NO%22%7D",
      },
      body: '{"fromDate":"2025-04-03T22:00:00.000Z","toDate":"2025-04-04T21:59:59.999Z"}',
      method: "POST",
    },
  );
  if (res.ok) {
    const report = await res.json();
    const filePath = path.join(dirPath, `report-${0}.json`);
    await fs.writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
    console.log(`Wrote ${filePath}`);
  } else {
    console.error(`Error: ${res.status}`);
  }
}

main().then(console.log);
