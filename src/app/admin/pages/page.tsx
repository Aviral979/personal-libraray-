"use client";

import { FileEdit, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PagesAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Pages</h1>
          <p className="text-muted-foreground mt-1">
            Manage static pages like About, Privacy Policy, and Terms.
          </p>
        </div>
        <Button className="gap-2 cursor-pointer">
          <PlusCircle className="h-4 w-4" />
          Create Page
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileEdit className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-heading text-xl font-bold mb-2">No pages found</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Create standalone pages that will be linked in your header or footer.
        </p>
      </div>
    </div>
  );
}
