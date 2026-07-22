"use client";

import { matchProfile, type ProfileMatch } from "@/lib/match";
import type { Facets } from "@/lib/types";
import { useRef, useState } from "react";

interface ResumeUploadProps {
  onMatch: (match: ProfileMatch) => void;
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;

  let text = "";
  for (let page = 1; page <= doc.numPages; page++) {
    const content = await (await doc.getPage(page)).getTextContent();
    text +=
      content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ") + "\n";
  }
  return text;
}

type Status =
  | { kind: "idle" }
  | { kind: "reading"; name: string }
  | { kind: "done"; match: ProfileMatch }
  | { kind: "error"; message: string };

export function ResumeUpload({ onMatch }: ResumeUploadProps) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setStatus({ kind: "error", message: "Please upload a PDF resume." });
      return;
    }

    setStatus({ kind: "reading", name: file.name });
    try {
      const text = await extractPdfText(file);
      if (text.replace(/\s/g, "").length < 40) {
        setStatus({
          kind: "error",
          message:
            "Couldn't read text from that PDF — it may be scanned/image-only. Try a text-based resume.",
        });
        return;
      }

      // Pull the full, unfiltered option lists to match against.
      const res = await fetch("/api/facets");
      const facets: Facets = res.ok
        ? await res.json()
        : { roles: [], skills: [], industries: [] };

      const match = matchProfile(text, {
        skills: facets.skills,
        industries: facets.industries,
      });

      if (!match.role && !match.skill && !match.industry) {
        setStatus({
          kind: "error",
          message:
            "Couldn't find matching roles or skills in that resume. Try setting the filters manually.",
        });
        return;
      }

      onMatch(match);
      setStatus({ kind: "done", match });
    } catch {
      setStatus({
        kind: "error",
        message: "Something went wrong reading that PDF. Please try again.",
      });
    }
  }

  const matched =
    status.kind === "done"
      ? [status.match.role, status.match.skill, status.match.industry].filter(
          Boolean
        )
      : [];

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className={`glow-field flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 transition ${
          dragging ? "border-orange-400 bg-orange-50/50" : "border-stone-300 bg-white/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#f6a256] to-[#f5c15a] text-stone-900">
          <svg viewBox="0 0 20 20" fill="none" className="size-4">
            <path
              d="M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5M4 14v1.5A1.5 1.5 0 005.5 17h9a1.5 1.5 0 001.5-1.5V14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-stone-800">
            {status.kind === "reading"
              ? `Reading ${status.name}…`
              : "Match from your resume"}
          </span>
          <span className="block text-xs text-stone-500">
            Drop a PDF or click to upload — it’s read in your browser and never
            uploaded.
          </span>
        </span>
      </label>

      {status.kind === "done" && (
        <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
          <span>Matched to</span>
          {matched.map((m) => (
            <span
              key={m}
              className="rounded-full bg-orange-100 px-2 py-0.5 font-medium text-orange-700"
            >
              {m}
            </span>
          ))}
          <span>— tweak below and search.</span>
        </p>
      )}
      {status.kind === "error" && (
        <p className="mt-2 text-xs text-red-600">{status.message}</p>
      )}
    </div>
  );
}
