import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr/GithubLogo";
import { LinkedinLogoIcon } from "@phosphor-icons/react/dist/ssr/LinkedinLogo";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import Link from "next/link";
import { siteConfig } from "@/lib/config/site";

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

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="caption-2 text-text-secondary">
            &copy; {currentYear} {siteConfig.name}
          </p>

          <div className="flex items-center gap-2">
            {socialLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary glass-hover hover:text-text-primary"
                aria-label={link.name}
              >
                {link.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
