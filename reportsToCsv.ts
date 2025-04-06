import fs from "fs/promises";
import path from "path";
import { OrderReport, OrderReportItem } from "./orderReport";
import { PathLike } from "node:fs";

async function readOrders(rootDir: PathLike) {
  const orders = [];
  for (const dir of await fs.readdir(rootDir, { withFileTypes: true })) {
    const dirPath = path.join(dir.parentPath, dir.name);
    if (dir.isDirectory()) {
      for (const file of await fs.readdir(dirPath, { withFileTypes: true })) {
        const filePath = path.join(file.parentPath, file.name);
        if (file.isFile()) {
          const fileContent = await fs.readFile(filePath, "utf8");
          const jsonData = JSON.parse(fileContent) as OrderReport;
          orders.push(...jsonData.items);
        }
      }
    }
  }
  return orders;
}

export interface FlatOrder {
  orderId: string;
  date: string;
  categoryName: string;
  amount: number;
  timestamp: string;
  customerHash: string;
}

const salt = Math.random().toString(36);

function simpleHash(values: string[]): string {
  const input = salt + values.join("|");
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function toRow(item: OrderReportItem): FlatOrder {
  const { timestamp, orderId, salesUnitName } = item;
  const date = new Date(timestamp).toISOString().substring(0, 10);

  const { amount } = item.events.find(({ type }) => type === "CAPTURE")!;

  let categoryName =
    salesUnitName === "Ekeberg skoles musikkorps cafe"
      ? "Kafeteria"
      : item.categoryName && item.categoryName.length > 0
        ? item.categoryName
        : "Diverse";

  if (date === "2025-04-05" && categoryName === "Auksjon")
    categoryName = "Nytt/Ubrukt";

  return {
    date,
    categoryName,
    amount: amount / 100,
    orderId,
    timestamp,
    customerHash: simpleHash([item.phoneNumber, item.senderName]),
  };
}

async function main() {
  const orders = (await readOrders(`tmp/rapport/`))
    .map((o) => toRow(o))
    .filter(
      (o) => new Date(o.timestamp).getTime() > new Date(2025, 1, 1).getTime(),
    )
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  console.log(orders.length);

  const uniqueSales = Object.values(
    orders.reduce<Record<string, FlatOrder>>((acc, item) => {
      acc[item.orderId] = item;
      return acc;
    }, {}),
  );

  const report = uniqueSales
    .map(({ date, categoryName, amount, orderId, timestamp, customerHash }) =>
      [date, categoryName, amount, orderId, timestamp, customerHash].join(";"),
    )
    .join("\n");

  const header = [
    "date",
    "categoryName",
    "amount",
    "orderId",
    "timestamp",
    "customerHash",
  ].join(";");

  await fs.writeFile("tmp/report-2025.csv", header + "\n" + report, "latin1");
  console.log(`Wrote tmp/report-2025.csv`);
}

main().then(console.log);
