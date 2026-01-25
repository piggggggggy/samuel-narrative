import type { EducationItem } from "../_data/content";

interface EducationSectionProps {
  educations: EducationItem[];
}

export function EducationSection({ educations }: EducationSectionProps) {
  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-bold text-text-primary">교육</h2>
      <div className="space-y-3">
        {educations.map((education) => (
          <div key={education.institution}>
            <div className="flex items-baseline gap-2">
              <h3 className="font-medium text-text-primary">
                {education.institution}
              </h3>
              <span className="text-sm text-text-muted">{education.period}</span>
            </div>
            <p className="text-sm text-text-secondary">
              {education.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
