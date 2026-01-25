import { parseText } from "../_utils/parseText";

interface HeroSectionProps {
  paragraphs: string[];
}

export function HeroSection({ paragraphs }: HeroSectionProps) {
  return (
    <section className="mb-12">
      <h1 className="mb-6 text-3xl font-bold text-text-primary">소개</h1>
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="leading-relaxed text-text-secondary">
            {parseText(paragraph)}
          </p>
        ))}
      </div>
    </section>
  );
}
