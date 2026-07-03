"use client";

import { BarChart3, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SeoAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">SEO Configurations</h1>
          <p className="text-muted-foreground mt-1">
            Manage metadata, canonical URLs, and OpenGraph images.
          </p>
        </div>
        <Button className="gap-2 cursor-pointer" variant="outline">
          <RefreshCcw className="h-4 w-4" />
          Generate Sitemap
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <BarChart3 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-heading text-xl font-bold mb-2">No SEO configurations yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Once you start publishing content, you can optimize their SEO metadata here.
        </p>
      </div>
    </div>
  );
}
