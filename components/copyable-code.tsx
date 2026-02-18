"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

type CopyableCodeBlockProps = {
  content: string;
  copyLabel: string;
  copiedLabel: string;
};

export function CopyableCodeBlock({ content, copyLabel, copiedLabel }: CopyableCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [content]);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="absolute right-2 top-2 z-10 gap-1.5"
        aria-label={copied ? copiedLabel : copyLabel}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" aria-hidden />
            {copiedLabel}
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" aria-hidden />
            {copyLabel}
          </>
        )}
      </Button>
      <pre className="overflow-x-auto rounded-xl border border-border bg-muted/30 p-4 pr-28 pt-12 text-xs sm:text-sm">
        <code className="text-foreground">{content}</code>
      </pre>
    </div>
  );
}
