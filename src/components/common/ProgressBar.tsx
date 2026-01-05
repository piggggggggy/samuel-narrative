"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

NProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 500,
  showSpinner: false,
});

export function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor) {
        const href = anchor.getAttribute("href");
        const targetAttr = anchor.getAttribute("target");

        // Skip external links or links that open in new tab
        if (
          targetAttr === "_blank" ||
          !href ||
          href.startsWith("http") ||
          href.startsWith("#") ||
          href.startsWith("mailto:")
        ) {
          return;
        }

        // Check if it's a same-page navigation
        const currentPath = window.location.pathname + window.location.search;
        if (href !== currentPath) {
          NProgress.start();
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      NProgress.done();
    };
  }, []);

  return null;
}
