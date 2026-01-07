"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

interface UtterancesProps {
  repo?: string;
}

export function Utterances({
  repo = "your-username/your-repo",
}: UtterancesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !ref.current) return;

    const theme = resolvedTheme === "light" ? "github-light" : "github-dark";

    // Check if utterances iframe already exists
    const existingIframe = ref.current.querySelector<HTMLIFrameElement>(
      "iframe.utterances-frame"
    );

    if (existingIframe) {
      // Update theme via postMessage instead of recreating
      existingIframe.contentWindow?.postMessage(
        { type: "set-theme", theme },
        "https://utteranc.es"
      );
      return;
    }

    // Create utterances script only once
    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.async = true;
    script.setAttribute("repo", repo);
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", theme);
    script.setAttribute("crossorigin", "anonymous");

    ref.current.appendChild(script);
  }, [mounted, resolvedTheme, repo]);

  if (!mounted) {
    return (
      <section className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          댓글
        </h2>
        <div className="h-32 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
      </section>
    );
  }

  return (
    <section className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        댓글
      </h2>
      <div ref={ref} />
    </section>
  );
}
