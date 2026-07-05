"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  FolderOpen,
  Tags,
  Image as ImageIcon,
  ScanText,
  Library,
  Search,
  FileEdit,
  BarChart3,
  Settings,
  Database,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const sidebarItems = [
  {
    group: "Overview",
    items: [
      { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/knowledge", icon: BookOpen, label: "Knowledge Library" },
      { href: "/admin/knowledge/create", icon: PlusCircle, label: "Create Knowledge" },
      { href: "/admin/categories", icon: FolderOpen, label: "Categories" },
    ],
  },
  {
    group: "Management",
    items: [
      { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/admin/messages", icon: Mail, label: "Inbox" },
      { href: "/admin/settings", icon: Settings, label: "Settings" },
      { href: "/admin/trash", icon: Trash2, label: "Trash" },
    ],
  },
];

function SidebarContent({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5"
            >
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden">
                <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="font-heading text-sm font-bold">
                Admin Panel
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 shrink-0 cursor-pointer hidden lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Nav items */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-6 px-3">
          {sidebarItems.map((group) => (
            <div key={group.group}>
              {!collapsed && (
                <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  {group.group}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" &&
                      pathname.startsWith(item.href + "/"));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      } ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-4.5 w-4.5 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          <ThemeToggle />
          {!collapsed && (
            <div className="flex flex-col gap-2 w-full">
              <Link href="/" className="w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer"
                >
                  <Library className="h-4 w-4" />
                  Exit Admin
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SessionProvider>
  );
}

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated" && !pathname.includes("/admin/login") && !pathname.includes("/admin/signup")) {
      router.push("/admin/login");
    }
  }, [status, pathname, router]);

  if (status === "loading" || (status === "unauthenticated" && !pathname.includes("/admin/login") && !pathname.includes("/admin/signup"))) {
    return <div className="min-h-screen bg-background"></div>;
  }

  // Allow rendering just the children for login/signup pages without sidebar
  if (pathname.includes("/admin/login") || pathname.includes("/admin/signup")) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:block shrink-0 h-full"
      >
        <SidebarContent
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </motion.aside>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger
            className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 inline-flex items-center justify-center rounded-md bg-card shadow-card cursor-pointer hover:bg-accent transition-colors"
          >
            <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[260px]">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <SidebarContent collapsed={false} onToggle={() => {}} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="admin-width py-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
