import { PathLike } from "node:fs";
import fs from "fs/promises";

export async function writeReport(
  header: string[],
  report: (string | number)[][],
  file: PathLike,
) {
  await fs.writeFile(
    file,
    header.join(",") + "\n" + report.map((r) => r.join(",")).join("\n"),
    "latin1",
  );
  console.log(`Wrote ${file} with ${report.length} lines`);
}
