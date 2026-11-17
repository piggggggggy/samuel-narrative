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
      <section aria-labelledby="comments-heading" className="mt-16">
        <h2 id="comments-heading" className="mb-6 heading-6 text-text-primary">
          댓글
        </h2>
        <div className="h-32 animate-pulse rounded-2xl bg-bg-secondary" />
      </section>
    );
  }

  return (
    <section aria-labelledby="comments-heading" className="mt-16">
      <h2 id="comments-heading" className="mb-6 heading-6 text-text-primary">
        댓글
      </h2>
      <div ref={ref} />
    </section>
  );
}
