"use client";

import { Database, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackupAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Backup & Restore</h1>
          <p className="text-muted-foreground mt-1">
            Export or import your entire knowledge archive.
          </p>
        </div>
        <Button className="gap-2 cursor-pointer text-white bg-brand-success hover:bg-brand-success/90">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Database className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-heading text-xl font-bold mb-2">No backups available</h3>
        <p className="text-muted-foreground max-w-sm">
          You haven't generated any manual backups yet. Your data is currently empty.
        </p>
      </div>
    </div>
  );
}
