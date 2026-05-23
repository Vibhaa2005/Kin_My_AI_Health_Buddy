"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, Image as ImageIcon, Loader2, CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";
import imageCompression from "browser-image-compression";
import type { ExtractedData } from "@/lib/types";

interface Props {
  onExtracted: (data: ExtractedData, fileName: string) => void;
}

type UploadState = "idle" | "compressing" | "uploading" | "success" | "error";

const MAX_SIZE_BYTES = 3.8 * 1024 * 1024; // keep under Groq's 4MB limit

export default function DocumentUpload({ onExtracted }: Props) {
  const [state, setState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      setState("idle");
      setErrorMsg("");

      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";

      if (!isImage && !isPdf) {
        setErrorMsg("Please upload an image (JPG, PNG, HEIC) or PDF file.");
        setState("error");
        return;
      }

      try {
        let base64: string | null = null;
        let mimeType = file.type;

        if (isImage) {
          setState("compressing");
          let compressed = file;
          if (file.size > MAX_SIZE_BYTES) {
            compressed = await imageCompression(file, {
              maxSizeMB: 3.5,
              maxWidthOrHeight: 4096,
              useWebWorker: true,
            });
          }
          mimeType = compressed.type || "image/jpeg";
          const buf = await compressed.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let binary = "";
          for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
          base64 = btoa(binary);
        }

        setState("uploading");
        const body = isImage
          ? JSON.stringify({ imageBase64: base64, mimeType })
          : JSON.stringify({
              text: `[PDF document: ${file.name}. Extract all medical information from this document filename and context.]`,
            });

        const res = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });

        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error ?? "Extraction failed");

        setState("success");
        onExtracted(json.data as ExtractedData, file.name);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Upload failed");
        setState("error");
      }
    },
    [onExtracted]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const isLoading = state === "compressing" || state === "uploading";

  return (
    <div>
      <label
        htmlFor="doc-upload"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={clsx(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all",
          dragging
            ? "border-sage-400 bg-sage-50"
            : "border-sand-300 bg-sand-50 hover:border-sage-300 hover:bg-sage-50/50",
          isLoading && "pointer-events-none opacity-70"
        )}
      >
        <input
          id="doc-upload"
          type="file"
          accept="image/*,.pdf"
          className="sr-only"
          onChange={onInputChange}
          disabled={isLoading}
        />

        {isLoading ? (
          <>
            <Loader2 className="w-10 h-10 text-sage-400 animate-spin" />
            <p className="text-base font-medium text-gray-700">
              {state === "compressing" ? "Compressing image…" : "Extracting with AI…"}
            </p>
            <p className="text-sm text-gray-500">This takes 5–15 seconds</p>
          </>
        ) : state === "success" ? (
          <>
            <CheckCircle2 className="w-10 h-10 text-sage-500" />
            <p className="text-base font-medium text-gray-700">Document added!</p>
            <p className="text-sm text-gray-500">Upload another document</p>
          </>
        ) : (
          <>
            <Upload className="w-10 h-10 text-gray-400" />
            <p className="text-base font-medium text-gray-700">
              Drag & drop or click to upload
            </p>
            <p className="text-sm text-gray-500">Photo or PDF of prescription, discharge summary, or lab report</p>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <ImageIcon className="w-3.5 h-3.5" /> JPG, PNG, HEIC
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <FileText className="w-3.5 h-3.5" /> PDF
              </span>
            </div>
          </>
        )}
      </label>

      {state === "error" && (
        <div className="mt-3 flex items-center gap-2 text-sm text-rose-500 bg-rose-50 px-4 py-3 rounded-xl border border-rose-200">
          <XCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}
    </div>
  );
}
