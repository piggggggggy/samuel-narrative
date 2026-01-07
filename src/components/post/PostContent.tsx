import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Image from "next/image";
import { CodeBlock } from "./CodeBlock";
import { slugify } from "@/lib/utils/toc";

/**
 * URL fragment에서 width/height 메타데이터 추출
 * 형식: url#w=1200&h=630
 */
function parseImageMetadata(src: string): {
  url: string;
  width?: number;
  height?: number;
} {
  const hashIndex = src.indexOf("#");
  if (hashIndex === -1) {
    return { url: src };
  }

  const url = src.slice(0, hashIndex);
  const fragment = src.slice(hashIndex + 1);
  const params = new URLSearchParams(fragment);

  const width = params.get("w");
  const height = params.get("h");

  return {
    url,
    width: width ? parseInt(width, 10) : undefined,
    height: height ? parseInt(height, 10) : undefined,
  };
}

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <article className="prose prose-gray max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-accent-primary hover:prose-a:text-accent-hover prose-code:before:content-none prose-code:after:content-none prose-code:glass-inline-code prose-code:text-sm prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-none [&_pre_code]:bg-transparent [&_pre_code]:p-0 prose-img:rounded-lg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h2({ children }) {
            const text = String(children);
            const id = slugify(text);
            return (
              <h2 id={id} className="scroll-mt-24">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            const text = String(children);
            const id = slugify(text);
            return (
              <h3 id={id} className="scroll-mt-24">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            const text = String(children);
            const id = slugify(text);
            return (
              <h4 id={id} className="scroll-mt-24">
                {children}
              </h4>
            );
          },
          pre({ children, className, ...props }) {
            return (
              <CodeBlock className={className} {...props}>
                {children}
              </CodeBlock>
            );
          },
          img({ src, alt }) {
            if (!src || typeof src !== "string") return null;

            const { url, width, height } = parseImageMetadata(src);

            // width/height가 있으면 next/image 사용 (CLS 방지)
            if (width && height) {
              return (
                <Image
                  src={url}
                  alt={alt || ""}
                  width={width}
                  height={height}
                  className="rounded-lg"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              );
            }

            // 메타데이터 없으면 기본 img 태그 사용 (기존 이미지 호환)
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={alt || ""} className="rounded-lg" />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
