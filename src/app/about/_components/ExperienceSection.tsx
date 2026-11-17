"use client";

import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
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
    <div className="group">
      {/* 카테고리 아코디언 헤더 */}
      <button
        id={triggerId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <h4 className="body-1 text-text-primary">{section.title}</h4>
          <p className="caption-2 text-text-muted">{section.summary}</p>
        </div>
        <CaretRightIcon
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-500 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>

      {/* 컨텐츠 목록 */}
      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        className={`grid transition-[grid-template-rows,opacity] duration-500 ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-6 pb-6">
            {section.items.map((item) => (
              <div key={item.title} className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="title-4 text-text-primary">{item.title}</h5>
                  {item.period && (
                    <span className="shrink-0 caption-5 text-text-muted">
                      {item.period}
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <p className="caption-5 text-text-muted">{item.subtitle}</p>
                )}
                <ul className="flex flex-col gap-1 body-6 text-text-secondary">
                  {item.description.map((desc, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-text-muted"
                      >
                        •
                      </span>
                      <span>{parseText(desc)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-px bg-border-default group-last:hidden" />
    </div>
  );
}
