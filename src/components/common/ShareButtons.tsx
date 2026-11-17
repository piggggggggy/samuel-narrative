"use client";

import { XLogoIcon } from "@phosphor-icons/react/dist/ssr/XLogo";
import { FacebookLogoIcon } from "@phosphor-icons/react/dist/ssr/FacebookLogo";
import { LinkedinLogoIcon } from "@phosphor-icons/react/dist/ssr/LinkedinLogo";
import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check";
import { LinkSimpleIcon } from "@phosphor-icons/react/dist/ssr/LinkSimple";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <span className="mr-1 caption-2 text-text-muted">공유</span>

      {/* Twitter/X */}
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 text-text-muted transition-colors hover:text-text-primary"
        aria-label="X에 공유"
      >
        <XLogoIcon aria-hidden="true" className="h-5 w-5" />
      </a>

      {/* Facebook */}
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 text-text-muted transition-colors hover:text-text-primary"
        aria-label="Facebook에 공유"
      >
        <FacebookLogoIcon aria-hidden="true" className="h-5 w-5" />
      </a>

      {/* LinkedIn */}
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 text-text-muted transition-colors hover:text-text-primary"
        aria-label="LinkedIn에 공유"
      >
        <LinkedinLogoIcon aria-hidden="true" className="h-5 w-5" />
      </a>

      {/* Copy Link */}
      <button
        type="button"
        onClick={copyToClipboard}
        className="p-3 text-text-muted transition-colors hover:text-text-primary"
        aria-label={copied ? "링크 복사됨" : "링크 복사"}
      >
        {copied ? (
          <CheckIcon
            aria-hidden="true"
            className="h-5 w-5 text-accent-primary"
          />
        ) : (
          <LinkSimpleIcon aria-hidden="true" className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
