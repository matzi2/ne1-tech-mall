"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileDropzone({
  accept,
  multiple = true,
  label,
  hint,
  onFiles,
}: {
  accept: string;
  multiple?: boolean;
  label: string;
  hint: string;
  onFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);

  function take(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length) onFiles(files);
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setActive(false);
        take(event.dataTransfer.files);
      }}
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition",
        active ? "border-sky-500 bg-sky-50" : "border-slate-300 bg-slate-50 hover:border-sky-400",
      )}
    >
      <Upload className="mb-3 size-8 text-sky-600" />
      <p className="font-semibold text-navy">{label}</p>
      <p className="mt-1 max-w-md text-sm text-slate-500">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          take(event.target.files);
          event.target.value = "";
        }}
      />
    </button>
  );
}
