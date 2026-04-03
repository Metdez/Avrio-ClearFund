"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FollowUpsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/emails?tab=follow-ups");
  }, [router]);
  return null;
}
