import { parseText } from "../_utils/parseText";

interface HeroSectionProps {
  paragraphs: string[];
}

export function HeroSection({ paragraphs }: HeroSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="heading-4 text-text-primary md:heading-3">소개</h1>
      <div className="flex flex-col gap-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="body-3 text-pretty text-text-secondary">
            {parseText(paragraph)}
          </p>
        ))}
      </div>
    </section>
  );
}
