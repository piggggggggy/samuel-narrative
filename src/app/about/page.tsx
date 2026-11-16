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
        <div className="flex flex-col gap-6">
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
                className="rounded-full p-3 text-text-secondary glass-hover hover:text-text-primary"
                aria-label={link.name}
              >
                {link.icon}
              </a>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col items-center gap-4 rounded-2xl border border-border-default bg-bg-secondary p-6 text-center">
        <p className="body-3 text-text-secondary">
          블로그 글이 마음에 드셨다면, 최신 포스트도 확인해보세요!
        </p>
        <Link href="/" className="button-primary button-md">
          포스트 보러가기
        </Link>
      </section>
    </div>
  );
}
