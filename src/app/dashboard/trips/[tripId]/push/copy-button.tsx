"use client";

import { useState } from "react";

// Only client-side piece in FEAT-005: clipboard access has no server
// equivalent. No fetch, no navigation, no URL construction — the message
// text is passed in fully rendered from the server (FR-007, NF-7).
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "Copied!" : "Copy message"}
    </button>
  );
}
