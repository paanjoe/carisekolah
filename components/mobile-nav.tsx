"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Menu, X } from "lucide-react";

export type NavLink = { href: string; label: string };

type MobileNavProps = {
  links: NavLink[];
  children?: React.ReactNode; // e.g. LocaleDropdown
};

export function MobileNav({ links, children }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden shrink-0"
          aria-label="Open menu"
          aria-expanded={open}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="fixed inset-0 z-50 flex h-full w-full max-h-none translate-x-0 translate-y-0 flex-col gap-0 border-0 bg-card p-0 shadow-lg data-[state=open]:zoom-in-100"
        aria-describedby={undefined}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <DialogTitle className="text-lg font-semibold">Menu</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-auto p-4" aria-label="Main">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted/60"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
        {children && (
          <div className="border-t border-border p-4">
            {children}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
