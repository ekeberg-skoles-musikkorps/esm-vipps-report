import fs from "fs/promises";

const filePath = "tmp/rapport.json";

interface Order {
  date: string;
  categoryName: string;
  amount: number;
  orderId: number;
  timestamp: string;
}

export function toRow(item: any) {
  const { categoryName, timestamp, orderId, salesUnitName } = item;

  const { amount } = item.events.find(({ type }) => type === "CAPTURE");

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

async function read() {
  const raw = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(raw);

  const sales: Order[] = data.flatMap((s) =>
    s.items.map((item) => toRow(item)),
  );

  const uniqueSales = Object.values(
    sales.reduce<Record<string, Order>>((acc, item) => {
      acc[item.orderId] = item; // overwrite if duplicate
      return acc;
    }, {}),
  );

  console.log(
    uniqueSales
      .filter(
        ({ date }) =>
          new Date(date).getTime() > new Date("2025-04-04").getTime(),
      )
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map(({ date, categoryName, amount, orderId, timestamp }) =>
        [date, categoryName, amount, orderId, timestamp].join(";"),
      )
      .join("\n"),
  );
}

read().then();
