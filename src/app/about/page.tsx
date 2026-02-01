import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import { getDefaultOgImageUrl } from "@/lib/og";
import {
  HeroSection,
  CareerTimeline,
  CompanyCard,
  CertificationSection,
  EducationSection,
} from "./_components";
import {
  introduction,
  careers,
  experiences,
  certifications,
  educations,
} from "./_data/content";

const aboutDescription = `${siteConfig.author.name}에 대해 알아보세요. 웹 개발자로서의 여정과 기술 스택을 소개합니다.`;

export const metadata: Metadata = {
  title: "About",
  description: aboutDescription,
  openGraph: {
    title: `About - ${siteConfig.name}`,
    description: aboutDescription,
    url: `${siteConfig.url}/about`,
    images: [
      {
        url: getDefaultOgImageUrl(),
        width: 1200,
        height: 630,
        alt: `About ${siteConfig.author.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `About - ${siteConfig.name}`,
    description: aboutDescription,
    images: [getDefaultOgImageUrl()],
  },
};

const socialLinks = [
  {
    name: "GitHub",
    href: siteConfig.social.github,
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: siteConfig.social.linkedin,
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Email",
    href: `mailto:${siteConfig.social.email}`,
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Introduction */}
      <HeroSection paragraphs={introduction.paragraphs} />

      {/* Career Timeline */}
      <CareerTimeline careers={careers} />

      {/* Company Experiences */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-text-primary">
          주요 경험
        </h2>
        <div className="space-y-6">
          {experiences.map((experience) => (
            <CompanyCard key={experience.company} experience={experience} />
          ))}
        </div>
      </section>

      {/* Certifications */}
      <CertificationSection certifications={certifications} />

      {/* Education */}
      <EducationSection educations={educations} />

      {/* Contact Section */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          연락처
        </h2>
        <div className="flex gap-4">
          {socialLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary transition-colors hover:text-text-primary"
              aria-label={link.name}
            >
              {link.icon}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-lg bg-bg-secondary p-6 text-center">
        <p className="text-text-secondary">
          블로그 글이 마음에 드셨다면, 최신 포스트도 확인해보세요!
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-accent-primary px-6 py-2 text-text-inverted transition-colors hover:bg-accent-hover"
        >
          포스트 보러가기
        </Link>
      </section>
    </div>
  );
}
