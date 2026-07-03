import Link from "next/link";

interface Props {
  href: string;
  label: string;
}

export default function BackButton({ href, label }: Props) {
  return (
    <Link
      href={href}
      className="btn-ios touch-target mb-0.5 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[var(--guinda)]/20 bg-[var(--guinda-muted)] px-3 py-2 text-sm font-semibold text-[var(--guinda)] transition-colors hover:bg-[var(--guinda)] hover:text-white"
    >
      ← {label}
    </Link>
  );
}
