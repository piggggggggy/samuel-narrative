import type { CompanyExperience } from "../_data/content";
import { ExperienceSection } from "./ExperienceSection";

interface CompanyCardProps {
  experience: CompanyExperience;
}

export function CompanyCard({ experience }: CompanyCardProps) {
  return (
    <div>
      <h3 className="pb-2 title-1 text-text-primary">{experience.company}</h3>
      <div className="h-px bg-border-default" />
      {experience.sections.map((section, index) => (
        <ExperienceSection
          key={section.title}
          section={section}
          defaultOpen={index === 0}
        />
      ))}
    </div>
  );
}
