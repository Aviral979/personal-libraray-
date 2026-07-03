"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-destructive/10 text-destructive mx-auto mb-6">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="font-heading text-4xl font-bold mb-3">
          Access Denied
        </h1>
        <p className="text-muted-foreground mb-8">
          You don&apos;t have permission to access this page. Please contact an
          administrator if you believe this is a mistake.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="outline" className="gap-2 cursor-pointer">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link href="/admin/login">
            <Button className="gap-2 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
