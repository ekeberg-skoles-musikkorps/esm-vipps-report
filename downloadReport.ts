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

async function dowloadReport(query: { fromDate: string; toDate: string }) {
  const res = await fetch(
    "https://portal.vippsmobilepay.com/api/v0/merchants/9084/report/internal/orders",
    {
      headers: {
        "x-csrf-token": csrfToken,
        cookie: `session_id=${sessionId}; csrf=${csrf}`,
      },
      body: JSON.stringify(query),
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

async function main() {
  await fs.mkdir(dirPath, { recursive: true });
  await dowloadReport({
    fromDate: "2025-04-03T22:00:00.000Z",
    toDate: "2025-04-04T21:59:59.999Z",
  });
}

main().then(console.log);
