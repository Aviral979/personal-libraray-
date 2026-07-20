import Link from "next/link";
import Image from "next/image";
import { Library, Code, AtSign, Mail, Heart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  explore: [
    { href: "/categories", label: "Categories" },
    { href: "/latest", label: "Latest" },
    { href: "/popular", label: "Popular" },
  ],
  pages: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/disclaimer", label: "Disclaimer" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="content-width py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-10 h-10 overflow-hidden">
                <Image src="/images/logo.png" alt="Personal Library Logo" fill className="object-contain" />
              </div>
              <span className="font-heading text-lg font-bold tracking-tight">
                Personal Library
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              A permanent, centralized archive for saving and organizing your
              digital knowledge from any source. Never lose important
              information again.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="mailto:aviralkumar979@gmail.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Explore links */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-foreground">
              Explore
            </h3>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Page links */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-foreground">
              Pages
            </h3>
            <ul className="space-y-3">
              {footerLinks.pages.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 opacity-50" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            <Link href="/moderator" className="cursor-default opacity-50 hover:opacity-100 transition-opacity">©</Link> {currentYear} Personal Library. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> by Personal Library
          </p>
        </div>
      </div>
    </footer>
  );
}
