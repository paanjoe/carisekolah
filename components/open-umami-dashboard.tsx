"use client";

import { useEffect } from "react";

const shareUrl = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL;

type Props = {
  openInNewTabLabel: string;
};

export function OpenUmamiDashboard({ openInNewTabLabel }: Props) {
  useEffect(() => {
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  }, []);

  if (!shareUrl) return null;

  return (
    <a
      href={shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/30 bg-primary/10 px-6 py-4 text-base font-semibold text-primary hover:bg-primary/20 hover:border-primary/50 transition-colors"
    >
      {openInNewTabLabel} →
    </a>
  );
}
