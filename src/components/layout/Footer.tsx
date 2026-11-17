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
    <footer>
      <div className="mx-auto max-w-3xl px-4">
        <div className="h-px bg-border-default" />
        <div className="flex items-center justify-between gap-4 py-6">
          <p className="caption-2 text-text-muted">
            &copy; {currentYear} {siteConfig.name}
          </p>

          <div className="-mr-3 flex items-center">
            {socialLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center text-text-muted transition-colors hover:text-text-primary"
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
