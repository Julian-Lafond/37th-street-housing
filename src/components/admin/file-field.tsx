"use client";

import { useId, useState } from "react";

const MAX_BYTES = 10 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Photo picker with a local preview (nothing is uploaded until the form is submitted).
 * Wrong types and files over 10 MB are flagged here so the browser explains the
 * problem: larger requests are cut off before reaching the server's own checks
 * (uploadPhoto re-checks type and size and re-encodes every photo regardless).
 */
export function FileField({ label, name }: { label: string; name: string }) {
  const id = useId();
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label} <span className="font-normal text-ink-soft">(required)</span>
      </label>
      <p id={`${id}-hint`} className="-mt-0.5 mb-2 text-xs text-ink-soft">
        JPEG, PNG or WebP, up to 10 MB. Location data from the camera is removed automatically.
      </p>
      <input
        id={id}
        name={name}
        type="file"
        required
        accept={TYPES.join(",")}
        aria-describedby={`${id}-hint`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.setCustomValidity(
            !file
              ? ""
              : !TYPES.includes(file.type)
                ? "Choose a JPEG, PNG or WebP photo."
                : file.size > MAX_BYTES
                  ? "That photo is over 10 MB. Please use a smaller one."
                  : "",
          );
          setPreview((old) => {
            if (old) URL.revokeObjectURL(old);
            return file ? URL.createObjectURL(file) : null;
          });
        }}
        className="block w-full text-sm file:mr-4 file:min-h-11 file:rounded-full file:border-0 file:bg-ink file:px-5 file:font-semibold file:text-plaster"
      />
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not optimizable
        <img src={preview} alt="Preview of the selected photo" className="mt-3 max-h-48 rounded-lg object-cover" />
      )}
    </div>
  );
}
