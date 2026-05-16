import { OrderReport, OrderReportItem } from "../orderReport";
import { PathLike } from "node:fs";
import fs from "fs/promises";
import path from "path";

export interface FlatOrder {
  orderId: string;
  date: string;
  categoryName: string;
  amount: number;
  timestamp: Date;
  customerHash: string;
}

async function readOrderFiles(rootDir: PathLike) {
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

const salt = Math.random().toString(36);

function simpleHash(values: string[]): string {
  const input = salt + values.join("|");
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function getFormattedDate(date: Date) {
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");

  return `${day}.${month}.${year}`;
}

function toRow(item: OrderReportItem): FlatOrder {
  const { orderId, salesUnitName } = item;
  const timestamp = new Date(item.timestamp);
  const date = getFormattedDate(timestamp);

  const { amount } = item.events.find(({ type }) => type === "CAPTURE")!;

  let categoryName =
    salesUnitName === "Ekeberg skoles musikkorps cafe"
      ? "Kafeteria"
      : item.categoryName && item.categoryName.length > 0
        ? item.categoryName
        : "Diverse";

  if (date === "11.04.2026" && categoryName === "Auksjon") {
    categoryName = "Ansiktsmaling";
  }

  return {
    date,
    categoryName,
    amount: amount / 100,
    orderId,
    timestamp,
    customerHash: simpleHash([item.phoneNumber, item.senderName]),
  };
}

export async function readOrders(rootDir: PathLike): Promise<FlatOrder[]> {
  const orders = (await readOrderFiles(rootDir))
    .map((o) => toRow(o))
    .filter(
      (o) => new Date(o.timestamp).getTime() > new Date(2025, 1, 1).getTime(),
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const uniqueSales = Object.values(
    orders.reduce<Record<string, FlatOrder>>((acc, item) => {
      acc[item.orderId] = item;
      return acc;
    }, {}),
  );
  return uniqueSales;
}
