import type { CareerItem } from "../_data/content";

interface CareerTimelineProps {
  careers: CareerItem[];
}

export function CareerTimeline({ careers }: CareerTimelineProps) {
  return (
    <section aria-labelledby="career-heading">
      <h2 id="career-heading" className="mb-6 heading-5 text-text-primary">
        이력
      </h2>
      <ol>
        {careers.map((career, index) => {
          const isLast = index === careers.length - 1;
          return (
            <li key={career.company} className="flex gap-4">
              {/* 점과 아래로 이어지는 선 */}
              <div aria-hidden="true" className="flex flex-col items-center">
                <span className="mt-2 h-3 w-3 shrink-0 rounded-full border-2 border-accent-decorative bg-bg-primary" />
                {!isLast && <span className="w-px flex-1 bg-border-default" />}
              </div>

              <div className={isLast ? "" : "pb-8"}>
                <h3 className="title-2 text-text-primary">{career.company}</h3>
                <p className="caption-2 text-text-muted">{career.period}</p>
                <ul className="mt-2 flex flex-col gap-1">
                  {career.positions.map((position) => (
                    <li
                      key={position.period}
                      className="flex flex-wrap items-baseline gap-x-3"
                    >
                      <span className="body-5 text-text-secondary">
                        {position.title}
                      </span>
                      <span className="caption-2 text-text-muted">
                        {position.period}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
