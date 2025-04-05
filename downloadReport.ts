import fs from "fs/promises";
import path from "path";

const sessionId = process.env.VIPPS_SESSION_ID!;
const csrfToken = process.env.VIPPS_CSRF_TOKEN!;
const csrf = process.env.VIPPS_CSRF!;

const currentSecond = new Date()
  .toISOString()
  .replace(/:/g, "-")
  .replace(/\..+/, "");
const dirPath = `tmp/rapport/${currentSecond}`;

const URL =
  "https://portal.vippsmobilepay.com/api/v0/merchants/9084/report/internal/orders";

interface OrderReport {
  cursor: string;
}

async function postJSON(url: string, bodyJSON: object) {
  const headers = {
    "x-csrf-token": csrfToken,
    cookie: `session_id=${sessionId}; csrf=${csrf}`,
  };
  const body = JSON.stringify(bodyJSON);
  const res = await fetch(url, { headers, body: body, method: "POST" });
  if (!res.ok) {
    throw Error(`Failed to fetch: ${res.url}: ${res.status}`);
  }
  return res;
}

async function writeToFile(report: object, number: number) {
  const filePath = path.join(dirPath, `report-${number}.json`);
  await fs.writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
  console.log(`Wrote ${filePath}`);
}

async function downloadReport(query: { fromDate: string; toDate: string }) {
  let index = 0;
  const res = await postJSON(URL, query);
  let report = (await res.json()) as OrderReport;
  await writeToFile(report, index++);

  while (report.cursor.length > 0) {
    const res = await postJSON(URL, { cursor: report.cursor });
    report = (await res.json()) as OrderReport;
    await writeToFile(report, index++);
  }
}

async function main() {
  await fs.mkdir(dirPath, { recursive: true });
  await downloadReport({
    fromDate: "2025-04-04T22:00:00.000Z",
    toDate: "2025-04-05T21:59:59.999Z",
  });
}

main().then(console.log);
