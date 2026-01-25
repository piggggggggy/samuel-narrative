import type { CertificationItem } from "../_data/content";

interface CertificationSectionProps {
  certifications: CertificationItem[];
}

export function CertificationSection({
  certifications,
}: CertificationSectionProps) {
  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-bold text-text-primary">자격증</h2>
      <div className="space-y-3">
        {certifications.map((cert) => (
          <div key={cert.name} className="flex items-baseline gap-2">
            <span className="font-medium text-text-primary">{cert.name}</span>
            <span className="text-sm text-text-muted">{cert.year}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
