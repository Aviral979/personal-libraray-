"use client";

import { Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrashAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Trash</h1>
          <p className="text-muted-foreground mt-1">
            Recover deleted items or permanently remove them.
          </p>
        </div>
        <Button className="gap-2 cursor-pointer" variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          Empty Trash
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Trash2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-heading text-xl font-bold mb-2">Trash is empty</h3>
        <p className="text-muted-foreground max-w-sm">
          Any items you delete will appear here for 30 days before being permanently removed.
        </p>
      </div>
    </div>
  );
}
