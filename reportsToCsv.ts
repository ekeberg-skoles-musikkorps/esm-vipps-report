import { readOrders } from "./lib/readOrders";
import { writeReport } from "./lib/writeReport";
import { formatISO, isAfter } from "date-fns";

function getFormattedDate(date: Date) {
  const year = date.getFullYear();
  const month = (1 + date.getMonth()).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${day}.${month}.${year}`;
}

async function main() {
  const orders = await readOrders("tmp/rapport/");
  const startDate = new Date("2026-04-01");
  const report = orders
    .filter(o => isAfter(o.date, startDate))
    .map(
    ({ categoryName, amount, orderId, timestamp, customerHash }) => [
      getFormattedDate(timestamp),
      categoryName,
      amount,
      orderId,
      formatISO(timestamp),
      customerHash,
    ],
  );

  const header = [
    "date",
    "categoryName",
    "amount",
    "orderId",
    "timestamp",
    "customerHash",
  ];
  await writeReport(header, report, "tmp/report-2026.csv");
}

main().then(console.log);
