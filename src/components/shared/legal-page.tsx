"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Shield, Scale, Cookie, AlertTriangle } from "lucide-react";

const pageConfig: Record<string, { title: string; icon: typeof Shield }> = {
  "/privacy-policy": { title: "Privacy Policy", icon: Shield },
  "/terms": { title: "Terms of Service", icon: Scale },
  "/disclaimer": { title: "Disclaimer", icon: AlertTriangle },
  "/cookie-policy": { title: "Cookie Policy", icon: Cookie },
};

export default function LegalPage() {
  const pathname = usePathname();
  const config = pageConfig[pathname] || {
    title: "Legal",
    icon: Shield,
  };

  return (
    <div className="content-width py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
            <config.icon className="h-5 w-5" />
          </div>
          <h1 className="font-heading text-3xl font-bold">{config.title}</h1>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-muted-foreground">
            This page is editable from the admin panel. Content will be loaded from the database once configured.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
