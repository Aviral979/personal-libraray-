"use client";

import { Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchManagerAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Search Manager</h1>
          <p className="text-muted-foreground mt-1">
            Configure how your knowledge base is searched and indexed.
          </p>
        </div>
        <Button className="gap-2 cursor-pointer">
          <PlusCircle className="h-4 w-4" />
          Reindex All
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-heading text-xl font-bold mb-2">Search is Optimized</h3>
        <p className="text-muted-foreground max-w-sm">
          Your full-text search index is currently empty since there are no knowledge items.
        </p>
      </div>
    </div>
  );
}
