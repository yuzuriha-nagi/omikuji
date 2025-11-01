"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Fortune } from "@/types/fortune";

type OmikujiBoardProps = {
  fortunes: Fortune[];
};

function pickRandomIndex(length: number, exclude: number): number {
  if (length <= 1) {
    return 0;
  }

  let candidate = exclude;

  while (candidate === exclude) {
    candidate = Math.floor(Math.random() * length);
  }

  return candidate;
}

export default function OmikujiBoard({ fortunes }: OmikujiBoardProps) {
  const [currentIndex, setCurrentIndex] = useState(() =>
    fortunes.length > 0 ? 0 : -1
  );

  useEffect(() => {
    setCurrentIndex(
      fortunes.length > 0 ? Math.floor(Math.random() * fortunes.length) : -1
    );
  }, [fortunes]);

  const handleDraw = useCallback(() => {
    if (fortunes.length === 0) {
      return;
    }

    setCurrentIndex((prev) => pickRandomIndex(fortunes.length, prev));
  }, [fortunes.length]);

  const activeFortune = useMemo(
    () => (currentIndex >= 0 ? fortunes[currentIndex] : undefined),
    [currentIndex, fortunes]
  );

  const detailLines = useMemo(() => {
    if (!activeFortune || activeFortune.details.length === 0) {
      return "";
    }

    return activeFortune.details.join("\n");
  }, [activeFortune]);

  const luckyItemValue = activeFortune?.luckyItem ?? "";
  const loveValue = activeFortune?.love ?? "";
  const studyValue = activeFortune?.study ?? "";

  const luckyLabel = "ラッキー\nアイテム";
  const loveLabel = "恋愛";
  const studyLabel = "勉学";
  const trimmedTitle = activeFortune?.title?.trim();
  const tightenTitle = trimmedTitle === "吉" || trimmedTitle === "凶";

  return (
    <section className="flex flex-col items-center gap-8">
      <button
        type="button"
        onClick={handleDraw}
        disabled={fortunes.length === 0}
        className="rounded-full bg-[#ff0000] px-10 py-3 text-sm tracking-[0.35em] text-white shadow-[0_6px_12px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:bg-[#ff0000]/40 disabled:shadow-none"
      >
        おみくじを引く
      </button>

      {fortunes.length > 0 && activeFortune ? (
        <article className="flex h-[520px] w-full max-w-[240px] flex-col items-center rounded-[32px] border border-[#ff0000] bg-white px-7 py-5 shadow-[0_10px_24px_rgba(0,0,0,0.12)] sm:h-[560px]">
          <div className="flex flex-1 flex-col items-center justify-start">
            <p
              className={`${
                tightenTitle
                  ? "mt-0 sm:mt-1 tracking-[0.46em]"
                  : "mt-1.5 sm:mt-2.5 tracking-[0.52em]"
              } text-[2.8rem] text-[#ff0000] [text-orientation:upright] [writing-mode:vertical-rl] sm:text-[3.15rem]`}
            >
              {activeFortune.title}
            </p>
          </div>
          <div className="mt-auto flex w-full justify-center gap-1.5 sm:gap-2">
            <CategoryColumn label={studyLabel} value={studyValue} />
            <CategoryColumn label={loveLabel} value={loveValue} />
            <CategoryColumn
              label={luckyLabel}
              value={luckyItemValue}
              forceTwoLines
            />
          </div>
          {detailLines ? (
            <p className="mt-5 whitespace-pre-line text-sm text-[#ff0000]/80 [text-orientation:upright] [writing-mode:vertical-rl] tracking-[0.22em] sm:text-base">
              {detailLines}
            </p>
          ) : null}
        </article>
      ) : (
        <div className="w-full rounded-[32px] border border-dashed border-[#ff0000]/50 bg-white/80 px-8 py-10 text-center text-sm leading-7 text-[#ff0000]/80">
          <p className="font-semibold tracking-[0.3em]">準備中</p>
          <p className="mt-3">
            `data/fortunes.csv` に
            <span className="font-semibold">
              {" "}
              id,title,genre1 (ラッキーアイテム),genre2 (恋愛),genre3 (勉学),detail1～5
            </span>
            の形式でおみくじを追加すると、ここに縦書きで表示されます。
          </p>
        </div>
      )}
    </section>
  );
}

type CategoryColumnProps = {
  label: string;
  value: string;
  forceTwoLines?: boolean;
};

function CategoryColumn({ label, value, forceTwoLines }: CategoryColumnProps) {
  const formatted = formatCategoryValue(value, forceTwoLines);
  const isLucky = forceTwoLines;

  return (
    <div className="flex flex-col items-center [text-orientation:upright] [writing-mode:vertical-rl]">
      <p className="whitespace-pre-line text-lg font-semibold tracking-[0.22em] text-[#ff0000]/80 sm:text-xl">
        {label}
      </p>
      <p
        className={`mt-1 whitespace-pre-line text-[#ff0000] ${
          isLucky
            ? "text-base tracking-[0.3em] sm:text-lg max-w-[3.2em] sm:max-w-[3.8em]"
            : "text-xl tracking-[0.26em] sm:text-2xl"
        }`}
      >
        {formatted}
      </p>
    </div>
  );
}

function formatCategoryValue(value: string, forceTwoLines?: boolean): string {
  if (!value) {
    return "";
  }

  const base = value.includes("\n") ? value : value.replace(/\s*、\s*/g, "\n");
  const trimmed = base.trim();

  if (!forceTwoLines) {
    return trimmed;
  }

  if (trimmed.includes("\n")) {
    return trimmed;
  }

  const compact = trimmed.replace(/\s+/g, "");
  if (compact.length <= 2) {
    return compact;
  }

  const midpoint = Math.ceil(compact.length / 2);
  return `${compact.slice(0, midpoint)}\n${compact.slice(midpoint)}`;
}
