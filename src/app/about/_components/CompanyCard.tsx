import { ExperienceSection } from "./ExperienceSection";
import type { CompanyExperience } from "../_data/content";

interface CompanyCardProps {
  experience: CompanyExperience;
}

export function CompanyCard({ experience }: CompanyCardProps) {
  return (
    <div className="rounded-2xl border border-border-default bg-bg-secondary shadow-sm">
      <div className="border-b border-border-default px-6 py-4">
        <h3 className="text-lg font-bold text-text-primary">
          {experience.company}
        </h3>
      </div>
      <div className="px-6">
        {experience.sections.map((section, index) => (
          <ExperienceSection
            key={section.title}
            section={section}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
