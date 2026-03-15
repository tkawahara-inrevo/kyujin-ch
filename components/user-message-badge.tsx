"use client";

import { useEffect, useState } from "react";

type Props = {
  className?: string;
};

export function UserMessageBadge({ className = "" }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadUnreadCount() {
      try {
        const response = await fetch("/api/user/unread-count");
        const data = await response.json();
        if (isMounted) {
          setCount(data.count || 0);
        }
      } catch {
        // noop
      }
    }

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={`flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#ff3158] px-1.5 text-[11px] font-bold text-white ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
