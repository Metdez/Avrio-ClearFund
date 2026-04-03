"use client";

import type { ReactNode } from "react";

import { DealsProvider } from "./_components/deals-provider";

export default function DealsLayout({ children }: { children: ReactNode }) {
  return <DealsProvider>{children}</DealsProvider>;
}
