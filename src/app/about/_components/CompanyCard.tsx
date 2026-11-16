import { ExperienceSection } from "./ExperienceSection";
import type { CompanyExperience } from "../_data/content";

interface CompanyCardProps {
  experience: CompanyExperience;
}

export function CompanyCard({ experience }: CompanyCardProps) {
  return (
    <div className="rounded-2xl border border-border-default bg-bg-secondary">
      <div className="px-6 py-4">
        <h3 className="title-1 text-text-primary">{experience.company}</h3>
      </div>
      <div className="h-px bg-border-default" />
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
