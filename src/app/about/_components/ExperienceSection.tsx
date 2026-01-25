"use client";

import { useState, useId } from "react";
import type { ExperienceSection as ExperienceSectionType } from "../_data/content";
import { parseText } from "../_utils/parseText";

interface ExperienceSectionProps {
  section: ExperienceSectionType;
  defaultOpen?: boolean;
}

export function ExperienceSection({
  section,
  defaultOpen = false,
}: ExperienceSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();
  const triggerId = useId();

  return (
    <div className="border-b border-border-default last:border-b-0">
      {/* 카테고리 아코디언 헤더 */}
      <button
        id={triggerId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-3 py-4 text-left transition-colors hover:text-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2"
      >
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-text-primary">{section.title}</h4>
          <p className="mt-0.5 text-sm text-text-muted">{section.summary}</p>
        </div>
        <svg
          className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>

      {/* 컨텐츠 목록 */}
      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pb-4">
            {section.items.map((item) => (
              <div key={item.title} className="rounded-lg bg-bg-tertiary p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h5 className="text-sm font-medium text-text-primary">
                    {item.title}
                  </h5>
                  {item.period && (
                    <span className="shrink-0 text-xs text-text-muted">
                      {item.period}
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <p className="mb-2 text-xs text-text-muted">{item.subtitle}</p>
                )}
                <ul className="space-y-1 text-sm text-text-secondary">
                  {item.description.map((desc, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="shrink-0 text-text-muted">•</span>
                      <span>{parseText(desc)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
