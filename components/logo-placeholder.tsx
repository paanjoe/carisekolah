/** Placeholder logo – replace with final asset later */
export function LogoPlaceholder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="40" height="40" rx="8" fill="currentColor" fillOpacity="0.1" />
      <rect x="8" y="8" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
    </svg>
  );
}
