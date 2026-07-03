"use client";

import { ScanText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OcrWorkspaceAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">OCR Workspace</h1>
          <p className="text-muted-foreground mt-1">
            Extract text from images and documents automatically.
          </p>
        </div>
        <Button className="gap-2 cursor-pointer">
          <Zap className="h-4 w-4" />
          Start New Scan
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ScanText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-heading text-xl font-bold mb-2">No OCR tasks</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Upload an image containing text, and our OCR engine will extract it for you to save as a knowledge item.
        </p>
      </div>
    </div>
  );
}
