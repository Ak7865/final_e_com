"use client";
import { useState, useEffect } from "react";

export function FormattedDate({ date }: { date: string | Date }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="opacity-0">12/12/2026</span>; // invisible placeholder of same length to prevent layout shift
  }

  return <span>{new Date(date).toLocaleDateString()}</span>;
}
