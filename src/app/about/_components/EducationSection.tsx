import type { EducationItem } from "../_data/content";

interface EducationSectionProps {
  educations: EducationItem[];
}

export function EducationSection({ educations }: EducationSectionProps) {
  return (
    <section aria-labelledby="education-heading">
      <h2 id="education-heading" className="mb-6 heading-5 text-text-primary">
        교육
      </h2>
      <div className="flex flex-col gap-4">
        {educations.map((education) => (
          <div key={education.institution}>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h3 className="body-2 text-text-primary">
                {education.institution}
              </h3>
              <span className="caption-2 text-text-muted">
                {education.period}
              </span>
            </div>
            <p className="body-6 text-text-secondary">
              {education.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
