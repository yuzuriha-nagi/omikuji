"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [isSaving, setIsSaving] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);

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

  const handleClear = useCallback(() => {
    setCurrentIndex(-1);
  }, []);

  const activeFortune = useMemo(
    () => (currentIndex >= 0 ? fortunes[currentIndex] : undefined),
    [currentIndex, fortunes]
  );

  const handleSaveImage = useCallback(async () => {
    if (!activeFortune || !cardRef.current) {
      return;
    }

    setIsSaving(true);

    try {
      const [{ toPng }] = await Promise.all([
        import("html-to-image"),
        new Promise((resolve) => setTimeout(resolve, 0)),
      ]);
      const scale = Math.min(3, window.devicePixelRatio > 1 ? 2 : 1.5);
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: "#ffffff",
        cacheBust: true,
        pixelRatio: scale,
      });

      const timestamp = new Date()
        .toISOString()
        .replaceAll("-", "")
        .replaceAll(":", "")
        .split(".")[0];
      const baseName = activeFortune.id ? `omikuji-${activeFortune.id}` : "omikuji";
      const link = document.createElement("a");
      link.download = `${baseName}-${timestamp}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("おみくじ画像の保存に失敗しました", error);
    } finally {
      setIsSaving(false);
    }
  }, [activeFortune]);

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
        className="omikuji-draw-button rounded-full px-10 py-3 text-sm tracking-[0.35em] transition-transform duration-150 hover:-translate-y-0.5"
      >
        おみくじを引く
      </button>

      {fortunes.length > 0 && activeFortune ? (
        <>
          <article
            ref={cardRef}
            className="omikuji-card flex h-[520px] w-full max-w-[240px] flex-col items-center rounded-[32px] px-7 py-5 shadow-[0_10px_24px_rgba(0,0,0,0.12)] sm:h-[560px]"
          >
            <div className="flex flex-1 flex-col items-center justify-start">
              <button
                type="button"
                onClick={handleClear}
                className={`${
                  tightenTitle
                    ? "mt-0 sm:mt-1 tracking-[0.46em]"
                    : "mt-1.5 sm:mt-2.5 tracking-[0.52em]"
                } omikuji-title text-[2.8rem] [text-orientation:upright] [writing-mode:vertical-rl] sm:text-[3.15rem] transition-opacity duration-150 hover:opacity-80 focus:opacity-80 focus:outline-none`}
                aria-label="表示中のおみくじを閉じる"
              >
                {activeFortune.title}
              </button>
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
              <p
                className="omikuji-card-details mt-5 whitespace-pre-line text-sm [text-orientation:upright] [writing-mode:vertical-rl] tracking-[0.22em] sm:text-base"
              >
                {detailLines}
              </p>
            ) : null}
          </article>

          <button
            type="button"
            onClick={handleSaveImage}
            disabled={isSaving}
            className="omikuji-save-button rounded-full px-8 py-2 text-sm tracking-[0.25em] transition-colors duration-150"
            aria-label="表示中のおみくじを画像として保存する"
          >
            {isSaving ? "保存中..." : "画像を保存"}
          </button>
        </>
      ) : null}
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
      <p
        className="omikuji-category-label whitespace-pre-line text-lg font-semibold tracking-[0.22em] sm:text-xl"
      >
        {label}
      </p>
      <p
        className={`omikuji-category-value mt-1 whitespace-pre-line ${
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
