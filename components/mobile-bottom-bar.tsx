"use client";

import { useSession } from "next-auth/react";
import { MobileNavBar } from "./mobile-nav-bar";
import { MobileAuthBar } from "./mobile-auth-bar";

export function MobileBottomBar() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (session?.user) {
    return <MobileNavBar />;
  }

  return <MobileAuthBar />;
}
