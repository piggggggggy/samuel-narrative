import React from "react";

/**
 * 마크다운 스타일 텍스트를 React 노드로 변환
 * - **text** → bold
 * - *text* → 흐린 색 강조
 */
export function parseText(text: string): React.ReactNode[] {
  // **bold** 와 *강조* 패턴 매칭
  // **는 먼저 처리해야 *와 충돌하지 않음
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**")) {
      const content = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold text-text-primary">
          {content}
        </strong>
      );
    }
    // 강조: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      const content = part.slice(1, -1);
      return (
        <em key={index} className="text-text-muted">
          {content}
        </em>
      );
    }
    return part;
  });
}
