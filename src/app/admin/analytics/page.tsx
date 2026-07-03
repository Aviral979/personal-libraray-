"use client";

import { LineChart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalyticsAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track views, popular content, and search terms.
          </p>
        </div>
        <Button className="gap-2 cursor-pointer" variant="outline">
          <Calendar className="h-4 w-4" />
          Last 30 Days
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <LineChart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-heading text-xl font-bold mb-2">Not enough data</h3>
        <p className="text-muted-foreground max-w-sm">
          Analytics will populate once your knowledge base receives traffic.
        </p>
      </div>
    </div>
  );
}
