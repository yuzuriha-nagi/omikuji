import fs from "node:fs/promises";
import path from "node:path";
import OmikujiBoard from "@/components/OmikujiBoard";
import type { Fortune } from "@/types/fortune";

async function loadFortunes(): Promise<Fortune[]> {
  const csvPath = path.join(process.cwd(), "data", "fortunes.csv");

  try {
    const raw = await fs.readFile(csvPath, "utf8");
    return parseFortunes(raw);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

function parseFortunes(raw: string): Fortune[] {
  const rows = parseCsv(raw);

  if (rows.length === 0) {
    return [];
  }

  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const headerMap = new Map<string, number>();
  header.forEach((label, index) => {
    if (label.length > 0) {
      headerMap.set(label, index);
    }
  });

  if (!headerMap.has("id") || !headerMap.has("title")) {
    return [];
  }

  const access = (cells: string[], key: string) => {
    const index = headerMap.get(key.toLowerCase());
    return index === undefined ? "" : cells[index]?.trim() ?? "";
  };

  return rows
    .slice(1)
    .filter((cells) => cells.some((cell) => cell.trim().length > 0))
    .map((cells) => {
      const details: string[] = [];

      for (let i = 1; i <= 5; i += 1) {
        const value = access(cells, `detail${i}`);
        if (value) {
          details.push(value);
        }
      }

      return {
        id: access(cells, "id"),
        title: access(cells, "title"),
        luckyItem: access(cells, "genre1"),
        love: access(cells, "genre2"),
        study: access(cells, "genre3"),
        details,
      };
    })
    .filter((fortune) => fortune.id && fortune.title);
}

function parseCsv(source: string): string[][] {
  const sanitized = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < sanitized.length; i += 1) {
    const char = sanitized[i];
    const nextChar = sanitized[i + 1];

    if (char === '"' && nextChar === '"') {
      currentCell += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (char === "\n" && !insideQuotes) {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  if (insideQuotes) {
    throw new Error("CSV に不正な引用符があります。");
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows;
}

export default async function Home() {
  const fortunes = await loadFortunes();

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-10 sm:px-8 sm:py-14">
      <div className="w-full max-w-xl space-y-8">
        <header className="text-center">
          <h1 className="text-3xl tracking-[0.6em] text-[#ff0000] sm:text-4xl">
            おみくじ
          </h1>
          <p className="omikuji-lede mt-4 text-sm leading-relaxed sm:text-base"></p>
        </header>

        <OmikujiBoard fortunes={fortunes} />
      </div>
    </main>
  );
}
