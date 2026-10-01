"use client";

import { useState, useSyncExternalStore } from "react";

// The origin is only known in the browser; the server renders the path alone.
const subscribe = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => "";

export function CopyLink({ path }: { path: string }) {
  const origin = useSyncExternalStore(subscribe, getOrigin, getServerOrigin);
  const [copied, setCopied] = useState(false);
  const link = `${origin}${path}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      // Clipboard can be blocked; the link stays visible to copy by hand.
      setCopied(false);
    }
  }

  return (
    <div>
      <p className="text-zinc-800">
        Bewaar deze link om je rit later terug te vinden.
      </p>
      <div className="mt-3 flex gap-3">
        <code className="flex-1 truncate rounded-lg border-2 border-dashed border-zinc-300 px-4 py-3 text-sm">
          {link}
        </code>
        <button
          type="button"
          onClick={copy}
          className="rounded-lg border-2 border-zinc-300 px-4 py-3 font-semibold hover:bg-zinc-50"
        >
          {copied ? "Gekopieerd" : "Kopiëren"}
        </button>
      </div>
    </div>
  );
}
