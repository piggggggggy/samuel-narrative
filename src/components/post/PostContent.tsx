import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { CodeBlock } from "./CodeBlock";
import { slugify } from "@/lib/utils/toc";

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <article className="prose prose-gray max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-accent-primary hover:prose-a:text-accent-hover prose-code:before:content-none prose-code:after:content-none prose-code:bg-bg-code-inline prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-bg-code prose-pre:text-gray-100 prose-pre:border prose-pre:border-border-code [&_pre_code]:bg-transparent [&_pre_code]:p-0 prose-img:rounded-lg">
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
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
