"use client";

import { useTransition } from "react";
import { approveInvalidRequest, rejectInvalidRequest } from "@/app/actions/admin/invalid";

export function InvalidRequestActions({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => approveInvalidRequest(requestId))}
        className="rounded-[6px] bg-[#059669] px-3 py-1 text-[11px] font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        承認
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => rejectInvalidRequest(requestId))}
        className="rounded-[6px] bg-[#dc2626] px-3 py-1 text-[11px] font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        否認
      </button>
    </div>
  );
}
