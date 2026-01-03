"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface UtterancesProps {
  repo?: string;
}

export function Utterances({
  repo = "your-username/your-repo",
}: UtterancesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!ref.current) return;

    // Clear previous utterances
    ref.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.async = true;
    script.setAttribute("repo", repo);
    script.setAttribute("issue-term", "pathname");
    script.setAttribute(
      "theme",
      resolvedTheme === "dark" ? "github-dark" : "github-light"
    );
    script.setAttribute("crossorigin", "anonymous");

    ref.current.appendChild(script);
  }, [resolvedTheme, repo]);

  return (
    <section className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        댓글
      </h2>
      <div ref={ref} />
    </section>
  );
}
