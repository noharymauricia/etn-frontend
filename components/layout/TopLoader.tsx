"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";

// Declenche la barre de progression lors des changements de route.
export default function TopLoader() {
  const pathname = usePathname();
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      NProgress.done();
      return;
    }

    NProgress.start();
    NProgress.done();
  }, [pathname]);

  return null;
}
