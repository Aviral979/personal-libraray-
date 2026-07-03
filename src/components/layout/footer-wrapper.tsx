"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

export function FooterWrapper() {
  const pathname = usePathname();
  
  // Hide footer on knowledge detail pages
  if (pathname.startsWith("/knowledge/")) {
    return null;
  }
  
  return <Footer />;
}
