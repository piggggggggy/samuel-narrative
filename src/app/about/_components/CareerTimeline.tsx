import type { CareerItem } from "../_data/content";

interface CareerTimelineProps {
  careers: CareerItem[];
}

export function CareerTimeline({ careers }: CareerTimelineProps) {
  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-bold text-text-primary">이력</h2>
      <div className="relative border-l-2 border-border-default pl-6">
        {careers.map((career, index) => (
          <div
            key={career.company}
            className={`relative ${index !== careers.length - 1 ? "pb-8" : ""}`}
          >
            {/* Timeline dot */}
            <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-accent-primary bg-bg-primary" />

            {/* Content */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                {career.company}
              </h3>
              <p className="mb-2 text-sm text-text-muted">{career.period}</p>
              <ul className="space-y-1">
                {career.positions.map((position) => (
                  <li
                    key={position.period}
                    className="text-sm text-text-secondary"
                  >
                    <span className="font-medium">{position.title}</span>
                    <span className="mx-2 text-text-muted">·</span>
                    <span className="text-text-muted">{position.period}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
