"use client";

import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { useState, KeyboardEvent } from "react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = "태그 입력 후 Enter",
}: TagInputProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = input.trim().toLowerCase();
      if (tag && !value.includes(tag)) {
        onChange([...value, tag]);
      }
      setInput("");
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="field flex flex-wrap items-center gap-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-primary">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-tag-bg py-0.5 pl-3 pr-1 caption-1 text-tag-text"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`${tag} 태그 지우기`}
            className="rounded-full p-1 text-text-muted transition-colors hover:bg-tag-bg-hover hover:text-text-primary"
          >
            <XIcon aria-hidden="true" className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        aria-label="태그"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-32 flex-1 border-none bg-transparent p-0 body-6 text-text-primary outline-none placeholder:text-text-muted"
      />
    </div>
  );
}
