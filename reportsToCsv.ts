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
}

function toRow(item: OrderReportItem): FlatOrder {
  const { categoryName, timestamp, orderId, salesUnitName } = item;

  const { amount } = item.events.find(({ type }) => type === "CAPTURE")!;

  return {
    date: new Date(timestamp).toISOString().substring(0, 10),
    categoryName:
      salesUnitName === "Ekeberg skoles musikkorps cafe"
        ? "Kafeteria"
        : categoryName && categoryName.length > 0
          ? categoryName
          : "Diverse",
    amount: amount / 100,
    orderId,
    timestamp,
  };
}

async function main() {
  const orders = (await readOrders(`tmp/rapport/`))
    .map((o) => toRow(o))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  console.log(orders.length);

  const uniqueSales = Object.values(
    orders.reduce<Record<string, FlatOrder>>((acc, item) => {
      acc[item.orderId] = item;
      return acc;
    }, {}),
  );

  const report = uniqueSales
    .map(({ date, categoryName, amount, orderId, timestamp }) =>
      [date, categoryName, amount, orderId, timestamp].join(";"),
    )
    .join("\n");

  const header = [
    "date",
    "categoryName",
    "amount",
    "orderId",
    "timestamp",
  ].join(";");

  await fs.writeFile("tmp/report.csv", header + "\n" + report, "latin1");
  console.log(`Wrote tmp/report.csv`);
}

main().then(console.log);
