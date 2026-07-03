"use client";

import { ImageIcon, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MediaLibraryAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground mt-1">
            Manage your uploaded images, PDFs, and assets.
          </p>
        </div>
        <Button className="gap-2 cursor-pointer">
          <UploadCloud className="h-4 w-4" />
          Upload Files
        </Button>
      </div>

      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-heading text-xl font-bold mb-2">Media Library Empty</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Upload images, videos, and documents to use them in your knowledge items.
        </p>
        <Button variant="outline">Browse Files</Button>
      </div>
    </div>
  );
}
