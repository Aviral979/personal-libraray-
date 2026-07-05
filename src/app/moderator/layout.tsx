"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { Loader2, LogOut, ShieldAlert, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ModeratorLayoutContent>{children}</ModeratorLayoutContent>
    </SessionProvider>
  );
}

function ModeratorLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/moderator/login") {
      router.push("/moderator/login");
    }
    if (status === "authenticated" && session?.user?.role !== "MODERATOR" && session?.user?.role !== "SUPER_ADMIN") {
      // Not a moderator, kick them out
      router.push("/");
    }
  }, [status, pathname, router, session]);

  if (status === "loading" || (status === "unauthenticated" && pathname !== "/moderator/login")) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (pathname === "/moderator/login") {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  if (session?.user?.role !== "MODERATOR" && session?.user?.role !== "SUPER_ADMIN") {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/20 flex flex-col">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="h-10 w-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold font-heading">Moderator</h2>
            <p className="text-xs text-muted-foreground">Control Panel</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/moderator">
            <Button variant={pathname === "/moderator" ? "secondary" : "ghost"} className="w-full justify-start gap-3">
              <Users className="h-4 w-4" /> Users
            </Button>
          </Link>
          <Link href="/moderator/content">
            <Button variant={pathname === "/moderator/content" ? "secondary" : "ghost"} className="w-full justify-start gap-3">
              <BookOpen className="h-4 w-4" /> Content
            </Button>
          </Link>
        </nav>
        <div className="p-4 border-t">
          <Button variant="destructive" className="w-full gap-2" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="h-4 w-4" /> Exit
          </Button>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
