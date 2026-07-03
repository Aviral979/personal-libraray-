"use client";

import { Library, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CollectionsAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Collections</h1>
          <p className="text-muted-foreground mt-1">
            Group your knowledge items into curated collections.
          </p>
        </div>
        <Button className="gap-2 cursor-pointer">
          <PlusCircle className="h-4 w-4" />
          New Collection
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Library className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-heading text-xl font-bold mb-2">No collections yet</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Collections allow you to group related knowledge items together into a series or course-like structure.
        </p>
        <Button variant="outline">Create First Collection</Button>
      </div>
    </div>
  );
}
