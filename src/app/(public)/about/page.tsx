"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles, Globe, Shield, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="content-width py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-6">
          About Knowledge Archive
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground text-lg leading-relaxed">
            Knowledge Archive is a personal knowledge operating system designed
            to be your permanent, centralized archive for saving and organizing
            information from any source on the internet.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            In a world where content disappears — social media posts get
            deleted, websites go offline, videos are removed — Knowledge Archive
            ensures that the information you care about is preserved forever, in
            your own searchable library.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
          {[
            {
              icon: Globe,
              title: "Save from Anywhere",
              description:
                "Archive content from Instagram, YouTube, websites, PDFs, and any digital source.",
            },
            {
              icon: Shield,
              title: "Permanent Archive",
              description:
                "Even if original content disappears, your copy remains forever.",
            },
            {
              icon: Zap,
              title: "Powerful Search",
              description:
                "Full-text search across all your knowledge including OCR-extracted text.",
            },
            {
              icon: Sparkles,
              title: "Beautiful & Fast",
              description:
                "Premium, modern interface that makes organizing knowledge a joy.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="p-6">
                <item.icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-heading font-semibold mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
