import { readOrders } from "./lib/readOrders";
import { writeReport } from "./lib/writeReport";
import { formatDate, startOfDay } from "date-fns";

function roundToNearest15(date: Date) {
  const minutes = 15;
  const ms = 1000 * 60 * minutes;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

async function main() {
  const orders = await readOrders("tmp/rapport/");
  const incomePerFifteenMinutes: Record<string, Record<string, number>> = {};
  const categorySet = new Set<string>();
  for (const { categoryName, amount, timestamp } of orders) {
    const time = roundToNearest15(new Date(timestamp)).toISOString();
    incomePerFifteenMinutes[time] ||= {};
    incomePerFifteenMinutes[time][categoryName] ||= 0;
    incomePerFifteenMinutes[time][categoryName] += amount;
    categorySet.add(categoryName);
  }
  const categories = [...categorySet].sort();

  const totalPerFifteenMinutes: Record<
    string,
    Record<string, Record<string, number>>
  > = {};
  let date: Date = new Date(0);

  let currentDay: Record<string, Record<string, number>> = {};
  let currentTotal: Record<string, number> = {};
  for (const time of Object.keys(incomePerFifteenMinutes).sort()) {
    if (startOfDay(time).getTime() !== date.getTime()) {
      date = startOfDay(time);
      console.log(date);
      currentDay = {};
      totalPerFifteenMinutes[formatDate(date, "yyyy-MM-dd")] = currentDay = {};
      currentTotal = Object.fromEntries(categories.map((c) => [c, 0]));
    }
    currentDay[formatDate(time, "HH:mm")] = {};
    for (const category of categories) {
      currentTotal[category] += incomePerFifteenMinutes[time][category] || 0;
      currentDay[formatDate(time, "HH:mm")][category] = currentTotal[category];
    }
  }
  const report = Object.entries(incomePerFifteenMinutes).map(
    ([time, departments]) => [
      time,
      ...categories.map((c) => departments[c] || 0),
    ],
  );
  const header = ["timestamp", ...categories];
  await writeReport(header, report, "tmp/running-totals-2026.csv");

  const report2 = Object.entries(totalPerFifteenMinutes).flatMap(
    ([day, minutes]) =>
      Object.entries(minutes).map(([minute, totals]) => [
        day,
        minute,
        ...categories.map((c) => totals[c] || 0),
      ]),
  );
  const header2 = ["day", "minute", ...categories];
  await writeReport(header2, report2, "tmp/full-totals-2026.csv");

  const report3 = Object.entries(totalPerFifteenMinutes).flatMap(
    ([day, minutes]) => {
      const times = Object.keys(minutes).sort();

      // compute "minutes since start"
      const first = times[0];

      // get final totals per category (last row)
      const lastTotals = minutes[times[times.length - 1]];

      return times.flatMap((minute) => {
        return categories.map((category) => {
          const value = minutes[minute][category] || 0;
          const finalValue = lastTotals[category] || 1;

          return [
            day,
            minute,
            category,
            value,
            value / finalValue, // normalized trend
          ];
        });
      });
    },
  );

  await writeReport(
    ["day", "minute", "category", "value", "percent"],
    report3,
    "tmp/trends.csv",
  );
}

main().then(console.log);
