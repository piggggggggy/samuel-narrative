import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr/GithubLogo";
import { LinkedinLogoIcon } from "@phosphor-icons/react/dist/ssr/LinkedinLogo";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
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
    icon: <GithubLogoIcon aria-hidden="true" className="h-5 w-5" />,
  },
  {
    name: "LinkedIn",
    href: siteConfig.social.linkedin,
    icon: <LinkedinLogoIcon aria-hidden="true" className="h-5 w-5" />,
  },
  {
    name: "Email",
    href: `mailto:${siteConfig.social.email}`,
    icon: <EnvelopeSimpleIcon aria-hidden="true" className="h-5 w-5" />,
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-16 px-4 pb-24 pt-16">
      <HeroSection paragraphs={introduction.paragraphs} />

      <CareerTimeline careers={careers} />

      <section aria-labelledby="experience-heading">
        <h2
          id="experience-heading"
          className="mb-6 heading-5 text-text-primary"
        >
          주요 경험
        </h2>
        <div className="flex flex-col gap-10">
          {experiences.map((experience) => (
            <CompanyCard key={experience.company} experience={experience} />
          ))}
        </div>
      </section>

      <CertificationSection certifications={certifications} />

      <EducationSection educations={educations} />

      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="mb-3 heading-5 text-text-primary">
          연락처
        </h2>
        <div className="-ml-3 flex gap-1">
          {socialLinks.map((link) => {
            const external = link.href.startsWith("http");
            return (
              <a
                key={link.name}
                href={link.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="p-3 text-text-muted transition-colors hover:text-text-primary"
                aria-label={link.name}
              >
                {link.icon}
              </a>
            );
          })}
        </div>
      </section>

      <Link
        href="/"
        className="inline-flex min-h-11 items-center self-start body-5 text-text-muted transition-colors hover:text-text-primary"
      >
        포스트 보러가기
      </Link>
    </div>
  );
}
