"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function TargetSync() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlTarget = searchParams.get("target");
    if (urlTarget) return; // URL に既にある

    const stored = localStorage.getItem("kyujin-target");
    if (!stored) return; // localStorage にもない

    // localStorage の target を URL に反映
    const params = new URLSearchParams(searchParams.toString());
    params.set("target", stored);
    router.replace(`/?${params.toString()}`);
  }, [searchParams, router]);

  return null;
}
