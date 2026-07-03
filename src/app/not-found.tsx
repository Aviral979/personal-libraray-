import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <Image
            src="/images/404 page illustration.png"
            alt="Page not found"
            width={300}
            height={300}
            className="w-full max-w-xs mx-auto"
          />
        </div>
        <h1 className="font-heading text-4xl font-bold mb-3">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="outline" className="gap-2 cursor-pointer">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link href="/search">
            <Button className="gap-2 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Search Archive
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
