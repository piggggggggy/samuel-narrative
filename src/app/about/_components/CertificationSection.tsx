import type { CertificationItem } from "../_data/content";

interface CertificationSectionProps {
  certifications: CertificationItem[];
}

export function CertificationSection({
  certifications,
}: CertificationSectionProps) {
  return (
    <section aria-labelledby="cert-heading">
      <h2 id="cert-heading" className="mb-6 heading-5 text-text-primary">
        자격증
      </h2>
      <div className="flex flex-col gap-3">
        {certifications.map((cert) => (
          <div key={cert.name} className="flex items-baseline gap-3">
            <span className="body-2 text-text-primary">{cert.name}</span>
            <span className="caption-2 text-text-muted">{cert.year}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
